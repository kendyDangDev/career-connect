import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  async connect(baseUrl: string): Promise<Socket> {
    if (this.socket?.connected) {
      return this.socket;
    }

    try {
      // Get chat token from storage
      const chatToken = await AsyncStorage.getItem("chat_token");

      if (!chatToken) {
        throw new Error("No chat token found. Please authenticate first.");
      }

      const socketUrl = baseUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

      this.socket = io(`https://${socketUrl}`, {
        path: "/api/socket/io",
        auth: {
          token: chatToken,
        },
        transports: ["websocket", "polling"],
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: this.maxReconnectAttempts,
      });

      this.setupEventListeners();

      return new Promise((resolve, reject) => {
        if (!this.socket) {
          reject(new Error("Socket initialization failed"));
          return;
        }

        this.socket.once("connect", () => {
          console.log("[SocketManager] Connected to chat server");
          this.reconnectAttempts = 0;
          resolve(this.socket!);
        });

        this.socket.once("connect_error", (error) => {
          console.error("[SocketManager] Connection error:", error);
          reject(error);
        });
      });
    } catch (error) {
      console.error("[SocketManager] Failed to connect:", error);
      throw error;
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("[SocketManager] Socket connected");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[SocketManager] Socket disconnected:", reason);

      // Auto-reconnect for certain disconnect reasons
      if (reason === "io server disconnect") {
        // Server initiated disconnect - don't auto-reconnect
        console.log("[SocketManager] Server initiated disconnect");
      } else {
        // Client-side disconnect - attempt to reconnect
        this.scheduleReconnect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("[SocketManager] Connection error:", error);
      this.scheduleReconnect();
    });

    this.socket.on("error", (error) => {
      console.error("[SocketManager] Socket error:", error);
    });

    this.socket.on("message_error", (error) => {
      console.error("[SocketManager] Message error:", error);
    });
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("[SocketManager] Max reconnection attempts reached");
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    console.log(
      `[SocketManager] Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`
    );

    this.reconnectTimeout = setTimeout(() => {
      if (this.socket && !this.socket.connected) {
        console.log("[SocketManager] Attempting to reconnect...");
        this.socket.connect();
      }
    }, delay);
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      console.log("[SocketManager] Disconnecting socket...");
      this.socket.disconnect();
      this.socket = null;
    }

    this.reconnectAttempts = 0;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Convenience methods for common socket operations
  joinConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit("join_conversation", conversationId);
    }
  }

  leaveConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit("leave_conversation", conversationId);
    }
  }

  sendMessage(data: {
    conversationId: string;
    content: string;
    type: string;
    replyToId?: string;
  }) {
    if (this.socket?.connected) {
      this.socket.emit("message:send", data);
    } else {
      throw new Error("Socket not connected");
    }
  }

  sendTyping(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit("user:typing", { conversationId });
    }
  }

  sendStopTyping(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit("user:stop-typing", { conversationId });
    }
  }

  // Event listener helpers
  onMessage(callback: (message: any) => void) {
    this.socket?.on("message:new", callback);
  }

  onTyping(callback: (data: any) => void) {
    this.socket?.on("user:typing", callback);
  }

  onStopTyping(callback: (data: any) => void) {
    this.socket?.on("user:stop-typing", callback);
  }

  onUserOnline(callback: (data: any) => void) {
    this.socket?.on("user:online", callback);
  }

  onUserOffline(callback: (data: any) => void) {
    this.socket?.on("user:offline", callback);
  }

  onUsersOnline(callback: (users: any) => void) {
    this.socket?.on("users:online", callback);
  }

  // Remove event listeners
  offMessage(callback?: (message: any) => void) {
    this.socket?.off("message:new", callback);
  }

  offTyping(callback?: (data: any) => void) {
    this.socket?.off("user:typing", callback);
  }

  offStopTyping(callback?: (data: any) => void) {
    this.socket?.off("user:stop-typing", callback);
  }

  offUserOnline(callback?: (data: any) => void) {
    this.socket?.off("user:online", callback);
  }

  offUserOffline(callback?: (data: any) => void) {
    this.socket?.off("user:offline", callback);
  }

  offUsersOnline(callback?: (users: any) => void) {
    this.socket?.off("users:online", callback);
  }
}

// Export singleton instance
export const socketManager = new SocketManager();

// Helper function to get chat token from API
export const getChatToken = async (): Promise<string> => {
  try {
    // Get user session token
    const sessionToken = await AsyncStorage.getItem("user_token");

    if (!sessionToken) {
      throw new Error("No session token found");
    }

    const response = await fetch("/api/chat/token", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get chat token: ${response.statusText}`);
    }

    const data = await response.json();

    // Store chat token for socket connection
    await AsyncStorage.setItem("chat_token", data.token);

    return data.token;
  } catch (error) {
    console.error("[getChatToken] Error:", error);
    throw error;
  }
};

export default socketManager;

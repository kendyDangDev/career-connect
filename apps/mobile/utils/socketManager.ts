import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { getSocketConfig } from "./apiConfig";

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  private async getStoredToken(key: string): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
      } else {
        const value = await SecureStore.getItemAsync(key, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED,
        });
        if (value) return value;
        try {
          return await AsyncStorage.getItem(key);
        } catch {
          return null;
        }
      }
    } catch (error) {
      // Fallback to AsyncStorage on native if SecureStore/localStorage fails
      if (Platform.OS !== "web") {
        try {
          return await AsyncStorage.getItem(key);
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  async connect(baseUrl: string): Promise<Socket> {
    if (this.socket?.connected) {
      console.log("[SocketManager] Already connected, returning existing socket");
      return this.socket;
    }

    try {
      // Get chat token from storage (SecureStore on native, localStorage on web, fallback to AsyncStorage)
      const chatToken = await this.getStoredToken("chat_token");

      if (!chatToken) {
        console.warn("[SocketManager] No chat token found, attempting without auth");
        // Continue without token for testing - backend may allow anonymous connections
      }

      // Respect the protocol provided by baseUrl (http -> ws, https -> wss)
      const socketUrl = baseUrl.replace(/\/$/, "");
      
      // Get platform-specific socket configuration
      const socketConfig = getSocketConfig();
      const finalSocketUrl = socketConfig.url;
      
      console.log(`[SocketManager] Attempting connection to ${finalSocketUrl}`);
      console.log(`[SocketManager] Platform: ${Platform.OS}, withCredentials: ${socketConfig.withCredentials}`);
      
      this.socket = io(finalSocketUrl, {
        path: "/socket.io", // Backend uses default Socket.IO path
        auth: chatToken ? {
          token: chatToken,
        } : undefined,
        transports: socketConfig.transports,
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        // Additional options for better compatibility
        upgrade: true, // Allow transport upgrade from polling to websocket
        rememberUpgrade: true,
        rejectUnauthorized: false, // For self-signed certificates in dev
        withCredentials: socketConfig.withCredentials, // Dynamic based on platform
        autoConnect: true,
      });

      this.setupEventListeners();

      return new Promise((resolve, reject) => {
        if (!this.socket) {
          reject(new Error("Socket initialization failed"));
          return;
        }

        const connectTimeout = setTimeout(() => {
          console.error("[SocketManager] Connection timeout after 10s");
          reject(new Error("Connection timeout"));
        }, 10000);

        this.socket.once("connect", () => {
          clearTimeout(connectTimeout);
          console.log("[SocketManager] Successfully connected to chat server!");
          this.reconnectAttempts = 0;
          resolve(this.socket!);
        });

        this.socket.once("connect_error", (error) => {
          clearTimeout(connectTimeout);
          console.error("[SocketManager] Connection error:", error.message, "Type:", error.type);
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

    // Remove all previous listeners to avoid duplicates
    this.socket.removeAllListeners();

    this.socket.on("connect", () => {
      console.log("[SocketManager] Socket connected, transport:", this.socket?.io?.engine?.transport?.name);
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
      console.error("[SocketManager] Connection error:", error.message, "Type:", error.type);
      // Only schedule reconnect if not already in initial connection attempt
      if (this.socket?.active) {
        this.scheduleReconnect();
      }
    });

    this.socket.on("error", (error) => {
      console.error("[SocketManager] Socket error:", error);
    });

    this.socket.on("message_error", (error) => {
      console.error("[SocketManager] Message error:", error);
    });
    
    // Debug events
    this.socket.io.on("reconnect", (attempt) => {
      console.log("[SocketManager] Reconnected after", attempt, "attempts");
    });
    
    this.socket.io.on("reconnect_attempt", (attempt) => {
      console.log("[SocketManager] Reconnection attempt", attempt);
    });
    
    this.socket.io.on("reconnect_error", (error) => {
      console.error("[SocketManager] Reconnection error:", error.message);
    });
    
    this.socket.io.on("reconnect_failed", () => {
      console.error("[SocketManager] Reconnection failed after max attempts");
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

// Test connection helper
export const testSocketConnection = async (baseUrl: string): Promise<{
  success: boolean;
  error?: string;
  details?: any;
}> => {
  try {
    console.log("[testSocketConnection] Testing connection to:", baseUrl);
    
    // Try a simple HTTP request first
    const response = await fetch(`${baseUrl}/socket.io/?EIO=4&transport=polling`, {
      method: "GET",
      headers: {
        "Accept": "*/*",
      },
    });
    
    if (response.ok) {
      const text = await response.text();
      console.log("[testSocketConnection] Polling test successful, response length:", text.length);
      return { success: true, details: { transport: "polling", status: response.status } };
    } else {
      console.error("[testSocketConnection] Polling test failed:", response.status, response.statusText);
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: { transport: "polling", status: response.status }
      };
    }
  } catch (error: any) {
    console.error("[testSocketConnection] Connection test failed:", error);
    return { 
      success: false, 
      error: error.message || "Network error",
      details: { error }
    };
  }
};

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

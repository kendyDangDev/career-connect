import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import {
  ChatTokenResponse,
  Conversation,
  ConversationsResponse,
  ConversationType,
  CreateConversationPayload,
  Message,
  MessagesResponse,
} from "@/types/chat.types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

class ChatService {
  private async getSecureItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        // Fallback to localStorage for web
        return localStorage.getItem(key);
      } else {
        // Try SecureStore first
        const value = await SecureStore.getItemAsync(key, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED,
        });
        if (value) return value;

        // Fallback to AsyncStorage if SecureStore returns null
        try {
          const asyncValue = await AsyncStorage.getItem(key);
          return asyncValue;
        } catch {
          return null;
        }
      }
    } catch (error) {
      console.error(`[ChatService] Error getting secure item ${key}:`, error);
      // Try AsyncStorage as fallback
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

  private async setSecureItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        // Fallback to localStorage for web
        localStorage.setItem(key, value);
      } else {
        // For physical devices, use WHEN_UNLOCKED for better compatibility
        await SecureStore.setItemAsync(key, value, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED,
        });
      }
    } catch (error) {
      console.error(`[ChatService] Error setting secure item ${key}:`, error);
      // Fallback to AsyncStorage if SecureStore fails
      if (Platform.OS !== "web") {
        try {
          await AsyncStorage.setItem(key, value);
        } catch (fallbackError) {
          console.error(
            `[ChatService] AsyncStorage fallback also failed:`,
            fallbackError
          );
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  private async getAuthHeader(): Promise<HeadersInit> {
    const token = await this.getSecureItem("authToken");
    if (!token) {
      throw new Error("No authentication token found");
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Get chat token for socket authentication
   */
  async getChatToken(): Promise<ChatTokenResponse> {
    try {
      console.log("[ChatService] Getting auth headers...");
      const headers = await this.getAuthHeader();
      console.log("[ChatService] Auth headers obtained");

      const url = `${API_BASE_URL}/api/chat/token`;
      console.log("[ChatService] Requesting chat token from:", url);

      const response = await fetch(url, {
        method: "POST",
        headers,
      });

      console.log("[ChatService] Chat token response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[ChatService] Chat token error response:", errorText);
        throw new Error(`Failed to get chat token: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(
        "[ChatService] Chat token received:",
        data.token ? "Present" : "Missing"
      );

      // Store chat token for socket connection
      await this.setSecureItem("chat_token", data.token);
      console.log("[ChatService] Chat token stored successfully");

      return data;
    } catch (error) {
      console.error("[ChatService] getChatToken error:", error);
      throw error;
    }
  }

  /**
   * Get list of conversations
   */
  async getConversations(params?: {
    page?: number;
    limit?: number;
    type?: ConversationType;
  }): Promise<ConversationsResponse> {
    try {
      const headers = await this.getAuthHeader();
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.type) queryParams.append("type", params.type);

      const url = `${API_BASE_URL}/api/chat/conversations?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch conversations: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("[ChatService] Conversations response:", data);

      // Handle different response structures from API
      if (data.success && data.conversations) {
        // Current API structure: { success: true, conversations: [], pagination: {} }
        return {
          conversations: data.conversations,
          pagination: data.pagination,
        };
      } else if (data.conversations) {
        // Direct structure: { conversations: [], pagination: {} }
        return data;
      } else {
        console.error(
          "[ChatService] Unexpected conversations response structure:",
          data
        );
        throw new Error("Invalid conversations response structure");
      }
    } catch (error) {
      console.error("[ChatService] getConversations error:", error);
      throw error;
    }
  }

  /**
   * Get single conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(
        `${API_BASE_URL}/api/chat/conversations/${conversationId}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch conversation: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("[ChatService] getConversation error:", error);
      throw error;
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(
    payload: CreateConversationPayload
  ): Promise<{ conversation: Conversation }> {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to create conversation: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("[ChatService] Create conversation response:", data);

      // Handle different response structures from API
      if (data.success && data.conversation) {
        // Current API structure: { success: true, conversation: {} }
        return { conversation: data.conversation };
      } else if (data.conversation) {
        // Direct structure: { conversation: {} }
        return data;
      } else {
        console.error(
          "[ChatService] Unexpected create conversation response structure:",
          data
        );
        throw new Error("Invalid create conversation response structure");
      }
    } catch (error) {
      console.error("[ChatService] createConversation error:", error);
      throw error;
    }
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(
    conversationId: string,
    params?: {
      page?: number;
      limit?: number;
      cursor?: string;
    }
  ): Promise<MessagesResponse> {
    try {
      const headers = await this.getAuthHeader();
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.cursor) queryParams.append("cursor", params.cursor);

      const url = `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages?${queryParams.toString()}`;
      console.log("[ChatService] Fetching messages from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[ChatService] Messages error response:", errorText);
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("[ChatService] Messages response:", data);

      // Handle different response structures from API
      if (data.success && data.data) {
        // New API structure: { success: true, data: { messages: [], pagination: {} } }
        return data.data;
      } else if (data.messages) {
        // Direct structure: { messages: [], pagination: {} }
        return data;
      } else {
        console.error("[ChatService] Unexpected response structure:", data);
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("[ChatService] getMessages error:", error);
      throw error;
    }
  }

  /**
   * Send a message (REST fallback, primary method should be via socket)
   */
  async sendMessage(
    conversationId: string,
    payload: {
      content: string;
      messageType?: "TEXT" | "IMAGE" | "FILE" | "AUDIO";
      replyToId?: string;
    }
  ): Promise<{ message: Message }> {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(
        `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            ...payload,
            messageType: payload.messageType || "TEXT",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("[ChatService] Send message response:", data);

      // Handle different response structures from API
      if (data.success && data.data && data.data.message) {
        // New API structure: { success: true, data: { message: {} } }
        return { message: data.data.message };
      } else if (data.message) {
        // Direct structure: { message: {} }
        return data;
      } else {
        console.error(
          "[ChatService] Unexpected send message response structure:",
          data
        );
        throw new Error("Invalid send message response structure");
      }
    } catch (error) {
      console.error("[ChatService] sendMessage error:", error);
      throw error;
    }
  }

  /**
   * Upload file attachment for message
   */
  async uploadAttachment(
    file: File | Blob
  ): Promise<{ url: string; id: string }> {
    try {
      const headers = await this.getAuthHeader();
      delete (headers as any)["Content-Type"]; // Remove content-type for FormData

      const formData = new FormData();
      formData.append("file", file as any);

      const response = await fetch(`${API_BASE_URL}/api/chat/upload`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload attachment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("[ChatService] uploadAttachment error:", error);
      throw error;
    }
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(
    conversationId: string,
    messageId: string
  ): Promise<{ success: boolean }> {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(
        `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages/${messageId}/read`,
        {
          method: "POST",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to mark message as read: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("[ChatService] markMessageAsRead error:", error);
      throw error;
    }
  }

  /**
   * Mark all messages in a conversation as read
   */
  async markConversationAsRead(
    conversationId: string
  ): Promise<{ success: boolean }> {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(
        `${API_BASE_URL}/api/chat/conversations/${conversationId}/read`,
        {
          method: "POST",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to mark conversation as read: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("[ChatService] markConversationAsRead error:", error);
      throw error;
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(
    conversationId: string,
    messageId: string
  ): Promise<{ success: boolean }> {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(
        `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages/${messageId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete message: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("[ChatService] deleteMessage error:", error);
      throw error;
    }
  }

  /**
   * Edit a message
   */
  async editMessage(
    conversationId: string,
    messageId: string,
    content: string
  ): Promise<{ message: Message }> {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(
        `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages/${messageId}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to edit message: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("[ChatService] editMessage error:", error);
      throw error;
    }
  }

  /**
   * Leave a conversation (for group chats)
   */
  async leaveConversation(
    conversationId: string
  ): Promise<{ success: boolean }> {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(
        `${API_BASE_URL}/api/chat/conversations/${conversationId}/leave`,
        {
          method: "POST",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to leave conversation: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("[ChatService] leaveConversation error:", error);
      throw error;
    }
  }

  /**
   * Add participants to a group conversation
   */
  async addParticipants(
    conversationId: string,
    userIds: string[]
  ): Promise<{ success: boolean }> {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(
        `${API_BASE_URL}/api/chat/conversations/${conversationId}/participants`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ userIds }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add participants: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("[ChatService] addParticipants error:", error);
      throw error;
    }
  }

  /**
   * Remove participant from a group conversation
   */
  async removeParticipant(
    conversationId: string,
    userId: string
  ): Promise<{ success: boolean }> {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(
        `${API_BASE_URL}/api/chat/conversations/${conversationId}/participants/${userId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to remove participant: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("[ChatService] removeParticipant error:", error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
export default chatService;

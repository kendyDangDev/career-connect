import { create } from "zustand";
import { devtools } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import {
  Conversation,
  Message,
  ChatState,
  ConversationType,
  CreateConversationPayload,
  TypingData,
  UserStatusData,
  OnlineUsersData,
} from "@/types/chat.types";
import chatService from "@/services/chatService";
import { socketManager } from "@/utils/socketManager";

interface ChatStore {
  // State
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: { [conversationId: string]: Message[] };
  typingUsers: { [conversationId: string]: string[] };
  onlineUsers: string[];
  isConnected: boolean;
  isLoading: boolean;
  isLoadingMessages: boolean;
  isLoadingMore: boolean;
  isSendingMessage: boolean;
  error: string | null;
  currentUserId: string | null;

  // Pagination
  conversationsPagination: {
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
  messagesPagination: {
    [conversationId: string]: {
      page: number;
      hasMore: boolean;
      nextCursor?: string;
    };
  };

  // Actions
  initializeChat: () => Promise<void>;
  connectSocket: () => Promise<void>;
  disconnectSocket: () => void;

  // Conversations
  fetchConversations: (params?: {
    page?: number;
    limit?: number;
    type?: ConversationType;
  }) => Promise<void>;
  fetchMoreConversations: () => Promise<void>;
  createConversation: (
    payload: CreateConversationPayload
  ) => Promise<Conversation>;
  setActiveConversation: (conversationId: string | null) => void;
  getActiveConversation: () => Conversation | undefined;
  updateConversation: (
    conversationId: string,
    updates: Partial<Conversation>
  ) => void;

  // Messages
  fetchMessages: (
    conversationId: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ) => Promise<void>;
  fetchMoreMessages: (conversationId: string) => Promise<void>;
  sendMessage: (payload: {
    conversationId: string;
    content: string;
    type?: "TEXT" | "IMAGE" | "FILE" | "AUDIO";
    replyToId?: string;
  }) => Promise<void>;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (
    conversationId: string,
    messageId: string,
    updates: Partial<Message>
  ) => void;
  deleteMessage: (conversationId: string, messageId: string) => Promise<void>;
  markAsRead: (conversationId: string, messageId?: string) => Promise<void>;

  // Real-time events handlers
  handleNewMessage: (message: Message) => void;
  handleMessageUpdate: (message: Message) => void;
  handleMessageDelete: (data: {
    conversationId: string;
    messageId: string;
  }) => void;
  handleUserTyping: (data: TypingData) => void;
  handleUserStopTyping: (data: TypingData) => void;
  handleUserOnline: (data: UserStatusData) => void;
  handleUserOffline: (data: UserStatusData) => void;
  handleUsersOnline: (data: OnlineUsersData) => void;

  // Typing indicators
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;

  // Utility
  clearError: () => void;
  resetState: () => void;
  setCurrentUserId: (userId: string) => void;
}

const initialState = {
  conversations: [],
  activeConversationId: null,
  messages: {},
  typingUsers: {},
  onlineUsers: [],
  isConnected: false,
  isLoading: false,
  isLoadingMessages: false,
  isLoadingMore: false,
  isSendingMessage: false,
  error: null,
  currentUserId: null,
  conversationsPagination: {
    page: 1,
    totalPages: 1,
    hasMore: false,
  },
  messagesPagination: {},
};

// Helper function for secure storage
const getSecureItem = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    } else {
      // Try SecureStore first
      const value = await SecureStore.getItemAsync(key, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
      if (value) return value;

      // Fallback to AsyncStorage
      try {
        return await AsyncStorage.getItem(key);
      } catch {
        return null;
      }
    }
  } catch (error) {
    console.error(`[ChatStore] Error getting secure item ${key}:`, error);
    if (Platform.OS !== "web") {
      try {
        return await AsyncStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return null;
  }
};

export const useChatStore = create<ChatStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Initialize chat system
      initializeChat: async () => {
        try {
          // Get current user data from AuthService
          const userDataString = await getSecureItem("userData");
          if (userDataString) {
            const userData = JSON.parse(userDataString);
            if (userData && userData.id) {
              set({ currentUserId: userData.id });
            }
          }

          // Get chat token
          try {
            console.log("[ChatStore] Getting chat token...");
            const tokenResponse = await chatService.getChatToken();
            console.log("[ChatStore] Chat token obtained successfully");
          } catch (tokenError) {
            console.error("[ChatStore] Failed to get chat token:", tokenError);
            throw tokenError;
          }

          // Connect socket
          console.log("[ChatStore] Connecting socket...");
          await get().connectSocket();

          // Fetch initial conversations
          await get().fetchConversations();
        } catch (error) {
          console.error("[ChatStore] initializeChat error:", error);
          set({ error: "Failed to initialize chat" });
        }
      },

      // Socket connection
      connectSocket: async () => {
        try {
          const { getApiUrl } = await import("@/utils/apiConfig");
          const baseUrl = getApiUrl();

          console.log(
            "[ChatStore] Connecting to socket with baseUrl:",
            baseUrl
          );

          // Test connection first
          const { testSocketConnection } = await import(
            "@/utils/socketManager"
          );
          const testResult = await testSocketConnection(baseUrl);

          if (!testResult.success) {
            console.error(
              "[ChatStore] Socket connection test failed:",
              testResult.error
            );
            // Continue anyway, socket.io may still work
          }

          await socketManager.connect(baseUrl);

          // Set up socket event listeners (remove existing ones first)
          const socket = socketManager.getSocket();
          if (socket) {
            // Remove existing listeners to prevent duplicates
            socket.removeAllListeners("connect");
            socket.removeAllListeners("disconnect");

            // Connection events
            socket.on("connect", () => {
              console.log("[ChatStore] Socket connected");
              set({ isConnected: true, error: null });
            });

            socket.on("disconnect", () => {
              console.log("[ChatStore] Socket disconnected");
              set({ isConnected: false });
            });

            // Message events
            socketManager.onMessage((message: Message) => {
              console.log(
                "[ChatStore] Received new message via socket:",
                message
              );
              get().handleNewMessage(message);
            });

            socketManager.onTyping((data: TypingData) => {
              get().handleUserTyping(data);
            });

            socketManager.onStopTyping((data: TypingData) => {
              get().handleUserStopTyping(data);
            });

            // User status events
            socketManager.onUserOnline((data: UserStatusData) => {
              get().handleUserOnline(data);
            });

            socketManager.onUserOffline((data: UserStatusData) => {
              get().handleUserOffline(data);
            });

            socketManager.onUsersOnline((data: OnlineUsersData) => {
              get().handleUsersOnline(data);
            });
          }

          set({ isConnected: socketManager.isConnected() });
        } catch (error) {
          console.error("[ChatStore] connectSocket error:", error);
          set({
            error: "Failed to connect to chat server",
            isConnected: false,
          });
        }
      },

      disconnectSocket: () => {
        socketManager.disconnect();
        set({ isConnected: false });
      },

      // Fetch conversations
      fetchConversations: async (params) => {
        console.log("[ChatStore] Fetching conversations with params:", params);
        set({ isLoading: true, error: null });
        try {
          const response = await chatService.getConversations({
            page: params?.page || 1,
            limit: params?.limit || 20,
            type: params?.type,
          });

          console.log("[ChatStore] Conversations response:", response);
          console.log(
            "[ChatStore] Conversations count:",
            response.conversations?.length || 0
          );

          set({
            conversations: response.conversations,
            conversationsPagination: {
              page: response.pagination.page,
              totalPages: response.pagination.totalPages,
              hasMore:
                response.pagination.page < response.pagination.totalPages,
            },
            isLoading: false,
          });
        } catch (error) {
          console.error("[ChatStore] fetchConversations error:", error);
          set({ error: "Failed to fetch conversations", isLoading: false });
        }
      },

      fetchMoreConversations: async () => {
        const { conversationsPagination, isLoadingMore } = get();
        if (isLoadingMore || !conversationsPagination.hasMore) return;

        set({ isLoadingMore: true });
        try {
          const response = await chatService.getConversations({
            page: conversationsPagination.page + 1,
            limit: 20,
          });

          set((state) => ({
            conversations: [...state.conversations, ...response.conversations],
            conversationsPagination: {
              page: response.pagination.page,
              totalPages: response.pagination.totalPages,
              hasMore:
                response.pagination.page < response.pagination.totalPages,
            },
            isLoadingMore: false,
          }));
        } catch (error) {
          console.error("[ChatStore] fetchMoreConversations error:", error);
          set({ isLoadingMore: false });
        }
      },

      // Create conversation
      createConversation: async (payload) => {
        try {
          const response = await chatService.createConversation(payload);

          set((state) => ({
            conversations: [response.conversation, ...state.conversations],
          }));

          return response.conversation;
        } catch (error) {
          console.error("[ChatStore] createConversation error:", error);
          throw error;
        }
      },

      // Set active conversation
      setActiveConversation: (conversationId) => {
        set({ activeConversationId: conversationId });

        if (conversationId && socketManager.isConnected()) {
          // Join conversation room
          socketManager.joinConversation(conversationId);
        }
      },

      getActiveConversation: () => {
        const { conversations, activeConversationId } = get();
        return conversations.find((c) => c.id === activeConversationId);
      },

      updateConversation: (conversationId, updates) => {
        set((state) => ({
          conversations: state.conversations?.map((conv) =>
            conv.id === conversationId ? { ...conv, ...updates } : conv
          ),
        }));
      },

      // Fetch messages
      fetchMessages: async (conversationId, params) => {
        console.log(
          `[ChatStore] Fetching messages for conversation: ${conversationId}`
        );
        set({ isLoadingMessages: true, error: null });
        try {
          const response = await chatService.getMessages(conversationId, {
            page: params?.page || 1,
            limit: params?.limit || 20,
          });

          console.log(
            `[ChatStore] Fetched ${response.messages?.length || 0} messages`
          );

          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: response.messages.sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              ),
            },
            messagesPagination: {
              ...state.messagesPagination,
              [conversationId]: {
                page: response.pagination.page || 1,
                hasMore: response.pagination.hasMore || false,
                nextCursor: response.pagination.nextCursor,
              },
            },
            isLoadingMessages: false,
          }));

          // Mark conversation as read
          await get().markAsRead(conversationId);
        } catch (error) {
          console.error("[ChatStore] fetchMessages error:", error);
          set({ error: "Failed to fetch messages", isLoadingMessages: false });
        }
      },

      fetchMoreMessages: async (conversationId) => {
        const { messagesPagination, isLoadingMore } = get();
        const pagination = messagesPagination[conversationId];

        if (isLoadingMore || !pagination?.hasMore) return;

        set({ isLoadingMore: true });
        try {
          const response = await chatService.getMessages(conversationId, {
            page: (pagination.page || 1) + 1,
            limit: 20,
            cursor: pagination.nextCursor,
          });

          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: [
                ...(state.messages[conversationId] || []),
                ...response.messages,
              ].sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              ),
            },
            messagesPagination: {
              ...state.messagesPagination,
              [conversationId]: {
                page: response.pagination.page || pagination.page + 1,
                hasMore: response.pagination.hasMore || false,
                nextCursor: response.pagination.nextCursor,
              },
            },
            isLoadingMore: false,
          }));
        } catch (error) {
          console.error("[ChatStore] fetchMoreMessages error:", error);
          set({ isLoadingMore: false });
        }
      },

      // Send message
      sendMessage: async (payload) => {
        const { currentUserId } = get();
        if (!currentUserId) {
          throw new Error("User not authenticated");
        }

        set({ isSendingMessage: true, error: null });
        try {
          // Send via socket for real-time delivery
          if (socketManager.isConnected()) {
            socketManager.sendMessage({
              conversationId: payload.conversationId,
              content: payload.content,
              type: payload.type || "TEXT",
              replyToId: payload.replyToId,
            });
          } else {
            // Fallback to REST API
            const response = await chatService.sendMessage(
              payload.conversationId,
              {
                content: payload.content,
                messageType: payload.type || "TEXT",
                replyToId: payload.replyToId,
              }
            );

            // Add message to state
            get().addMessage(payload.conversationId, response.message);
          }

          set({ isSendingMessage: false });
        } catch (error) {
          console.error("[ChatStore] sendMessage error:", error);
          set({ error: "Failed to send message", isSendingMessage: false });
          throw error;
        }
      },

      addMessage: (conversationId, message) => {
        set((state) => {
          const conversationMessages = state.messages[conversationId] || [];

          // Check if message already exists
          const existingIndex = conversationMessages.findIndex(
            (m) => m.id === message.id
          );

          if (existingIndex >= 0) {
            // Update existing message
            conversationMessages[existingIndex] = message;
          } else {
            // Add new message and sort by creation time
            conversationMessages.push(message);
            conversationMessages.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
          }

          // Update last message in conversation
          const conversations = state.conversations?.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                lastMessage: message,
                lastMessageAt: message.createdAt,
                unreadCount:
                  conv.unreadCount +
                  (message.senderId !== state.currentUserId ? 1 : 0),
              };
            }
            return conv;
          });

          return {
            messages: {
              ...state.messages,
              [conversationId]: conversationMessages,
            },
            conversations,
          };
        });
      },

      updateMessage: (conversationId, messageId, updates) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: (state.messages[conversationId] || []).map(
              (msg) => (msg.id === messageId ? { ...msg, ...updates } : msg)
            ),
          },
        }));
      },

      deleteMessage: async (conversationId, messageId) => {
        try {
          await chatService.deleteMessage(conversationId, messageId);

          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: (state.messages[conversationId] || []).map(
                (msg) =>
                  msg.id === messageId
                    ? {
                        ...msg,
                        isDeleted: true,
                        content: "This message has been deleted",
                      }
                    : msg
              ),
            },
          }));
        } catch (error) {
          console.error("[ChatStore] deleteMessage error:", error);
          throw error;
        }
      },

      markAsRead: async (conversationId, messageId) => {
        try {
          if (messageId) {
            await chatService.markMessageAsRead(conversationId, messageId);
          } else {
            // await chatService.markConversationAsRead(conversationId);
          }

          // Update unread count
          set((state) => ({
            conversations: state.conversations?.map((conv) =>
              conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
            ),
          }));
        } catch (error) {
          console.error("[ChatStore] markAsRead error:", error);
        }
      },

      // Real-time event handlers
      handleNewMessage: (message) => {
        console.log("[ChatStore] New message received:", message);
        get().addMessage(message.conversationId, message);
      },

      handleMessageUpdate: (message) => {
        get().updateMessage(message.conversationId, message.id, message);
      },

      handleMessageDelete: (data) => {
        get().updateMessage(data.conversationId, data.messageId, {
          isDeleted: true,
          content: "This message has been deleted",
        });
      },

      handleUserTyping: (data) => {
        if (!data.userId || data.userId === get().currentUserId) return;

        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [data.conversationId]: [
              ...(state.typingUsers[data.conversationId] || []).filter(
                (id) => id !== data.userId
              ),
              data.userId!,
            ],
          },
        }));

        // Auto clear typing after 3 seconds
        setTimeout(() => {
          get().handleUserStopTyping(data);
        }, 3000);
      },

      handleUserStopTyping: (data) => {
        if (!data.userId) return;

        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [data.conversationId]: (
              state.typingUsers[data.conversationId] || []
            ).filter((id) => id !== data.userId),
          },
        }));
      },

      handleUserOnline: (data) => {
        set((state) => ({
          onlineUsers: [...new Set([...state.onlineUsers, data.userId])],
        }));
      },

      handleUserOffline: (data) => {
        set((state) => ({
          onlineUsers: state.onlineUsers.filter((id) => id !== data.userId),
        }));
      },

      handleUsersOnline: (data) => {
        set({ onlineUsers: data.users?.map((u) => u.userId) });
      },

      // Typing indicators
      startTyping: (conversationId) => {
        socketManager.sendTyping(conversationId);
      },

      stopTyping: (conversationId) => {
        socketManager.sendStopTyping(conversationId);
      },

      // Utility
      clearError: () => {
        set({ error: null });
      },

      resetState: () => {
        socketManager.disconnect();
        set(initialState);
      },

      setCurrentUserId: (userId) => {
        set({ currentUserId: userId });
      },
    }),
    {
      name: "chat-store",
    }
  )
);

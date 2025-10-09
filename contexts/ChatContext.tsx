import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { ChatContextType } from '@/types/chat.types';
import ChatErrorBoundary from '@/components/chat/ChatErrorBoundary';

const ChatContext = createContext<ChatContextType | null>(null);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const store = useChatStore();

  // Initialize chat when provider mounts
  useEffect(() => {
    const initializeChat = async () => {
      try {
        await store.initializeChat();
      } catch (error) {
        console.error('[ChatProvider] Failed to initialize chat:', error);
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      store.disconnectSocket();
    };
  }, []);

  const contextValue: ChatContextType = {
    // State
    conversations: store.conversations,
    activeConversation: store.getActiveConversation(),
    messages: store.messages,
    typingUsers: store.typingUsers,
    onlineUsers: store.onlineUsers,
    isConnected: store.isConnected,
    isLoading: store.isLoading,
    error: store.error,

    // Actions
    connect: store.connectSocket,
    disconnect: store.disconnectSocket,
    fetchConversations: store.fetchConversations,
    createConversation: store.createConversation,
    setActiveConversation: (conversation) => {
      store.setActiveConversation(conversation.id);
    },
    fetchMessages: store.fetchMessages,
    sendMessage: store.sendMessage,
    markAsRead: store.markAsRead,
    handleNewMessage: store.handleNewMessage,
    handleUserTyping: store.handleUserTyping,
    handleUserStopTyping: store.handleUserStopTyping,
    handleUserStatusChange: (data) => {
      if (data.isOnline) {
        store.handleUserOnline(data);
      } else {
        store.handleUserOffline(data);
      }
    },
    clearError: store.clearError,
    resetState: store.resetState,
  };

  return (
    <ChatErrorBoundary>
      <ChatContext.Provider value={contextValue}>
        {children}
      </ChatContext.Provider>
    </ChatErrorBoundary>
  );
};

export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const useSafeChatContext = (): ChatContextType | null => {
  return useContext(ChatContext);
};
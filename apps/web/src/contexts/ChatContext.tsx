'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useChatToken } from '@/hooks/useChatToken';

// Types
interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  createdAt: Date | string;
  sender: {
    id: string;
    name: string | null;
    avatar?: string | null;
  };
  attachments?: MessageAttachment[];
}

interface MessageAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
}

interface Conversation {
  id: string;
  name?: string | null;
  type: 'DIRECT' | 'GROUP' | 'APPLICATION_RELATED';
  lastMessageAt?: Date | string | null;
  createdAt: Date | string;
  participants: ConversationParticipant[];
  messages: Message[];
  unreadCount?: number;
  application?: {
    id: string;
    job?: {
      id: string;
      title: string;
      company?: {
        id?: string;
        companyName: string;
        logoUrl?: string | null;
      } | null;
    } | null;
  } | null;
  job?: {
    id: string;
    title: string;
    company?: {
      id?: string;
      companyName: string;
      logoUrl?: string | null;
    } | null;
  } | null;
  _count: {
    messages: number;
  };
}

interface ConversationParticipant {
  id: string;
  userId: string;
  conversationId: string;
  joinedAt: Date | string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    avatarUrl?: string | null;
  };
}

interface OnlineUser {
  userId: string;
  socketId: string;
  userInfo: {
    name: string | null;
    avatar?: string | null;
  };
}

interface TypingUser {
  userId: string;
  conversationId: string;
  userInfo: {
    name: string | null;
  };
}

interface ChatContextType {
  // Socket connection
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  isChatEnabled: boolean;

  // Conversations
  conversations: Conversation[];
  activeConversation: Conversation | null;
  setActiveConversation: (conversation: Conversation | null) => void;

  // Messages
  messages: Message[];
  sendMessage: (conversationId: string, content: string, type?: 'TEXT' | 'IMAGE' | 'FILE') => void;

  // Real-time features
  onlineUsers: OnlineUser[];
  typingUsers: TypingUser[];
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Functions
  initializeChat: () => void; // New: manually initialize chat
  disconnectChat: () => void; // New: manually disconnect chat
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  createConversation: (
    participantIds: string[],
    type?: 'DIRECT' | 'GROUP' | 'APPLICATION_RELATED',
    name?: string,
    payload?: { applicationId?: string; jobId?: string }
  ) => Promise<Conversation | null>;
}

function getDisplayName(
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
    email?: string | null;
  } | null
) {
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  return fullName || user?.name || user?.email || null;
}

function normalizeMessage(rawMessage: any): Message {
  return {
    ...rawMessage,
    attachments: rawMessage?.attachments ?? [],
    sender: {
      id: rawMessage?.sender?.id ?? '',
      name: getDisplayName(rawMessage?.sender),
      avatar: rawMessage?.sender?.avatar ?? rawMessage?.sender?.avatarUrl ?? null,
    },
  };
}

function normalizeConversation(rawConversation: any): Conversation {
  return {
    ...rawConversation,
    name: rawConversation?.name ?? null,
    messages: Array.isArray(rawConversation?.messages)
      ? rawConversation.messages.map(normalizeMessage)
      : [],
    participants: Array.isArray(rawConversation?.participants) ? rawConversation.participants : [],
    _count: {
      messages: rawConversation?._count?.messages ?? rawConversation?.messages?.length ?? 0,
    },
    unreadCount: rawConversation?.unreadCount ?? 0,
  };
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { data: session } = useSession();
  const { token: chatToken, isLoading: tokenLoading } = useChatToken();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isChatEnabled, setIsChatEnabled] = useState(false); // New: track if chat is enabled
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection - only when chat is enabled
  useEffect(() => {
    if (!chatToken || tokenLoading || !isChatEnabled) return;

    setIsConnecting(true);
    console.log('Attempting to connect to Socket.IO server...');

    const newSocket = io('http://localhost:3000', {
      auth: {
        token: chatToken,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to chat server with socket ID:', newSocket.id);
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      toast.success('Connected to chat server');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from chat server:', reason);
      setIsConnected(false);
      toast.warning(`Disconnected from chat server: ${reason}`);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setError(`Failed to connect to chat server: ${error.message}`);
      setIsConnected(false);
      setIsConnecting(false);
      toast.error(`Connection failed: ${error.message}`);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to chat server after', attemptNumber, 'attempts');
      setIsConnected(true);
      setError(null);
      toast.success('Reconnected to chat server');
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('Reconnection failed:', error);
      setError(`Reconnection failed: ${error.message}`);
      toast.error('Reconnection failed');
    });

    newSocket.on('reconnect_failed', () => {
      console.error('Failed to reconnect to chat server');
      setError('Failed to reconnect to chat server');
      setIsConnected(false);
      toast.error('Failed to reconnect to chat server');
    });

    // Message events
    newSocket.on('message:new', (message: Message) => {
      const normalizedMessage = normalizeMessage(message);
      console.log('New message received:', normalizedMessage);

      // Add message to current conversation if it matches
      if (activeConversation && normalizedMessage.conversationId === activeConversation.id) {
        setMessages((prev) => {
          // Check if message already exists to avoid duplicates
          const messageExists = prev.some((m) => m.id === normalizedMessage.id);
          if (messageExists) {
            console.log('Message already exists, skipping:', normalizedMessage.id);
            return prev;
          }

          // Remove any temporary/optimistic messages from the same sender with similar timestamp
          const filteredMessages = prev.filter((m) => {
            if (!m.id.startsWith('temp_')) return true;
            if (m.senderId !== normalizedMessage.senderId) return true;

            // Remove temp message if real message is from same sender and within 5 seconds
            const tempTime = new Date(m.createdAt).getTime();
            const realTime = new Date(normalizedMessage.createdAt).getTime();
            const timeDiff = Math.abs(realTime - tempTime);
            return timeDiff > 5000; // Keep temp messages older than 5 seconds
          });

          console.log('Adding new message to conversation:', normalizedMessage.id);
          return [...filteredMessages, normalizedMessage];
        });
      }

      // Update conversation list with new message
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === normalizedMessage.conversationId) {
            return {
              ...conv,
              lastMessageAt: normalizedMessage.createdAt,
              messages: [normalizedMessage],
              // _count: {
              //   messages: conv._count.messages + 1,
              // },
            };
          }
          return conv;
        })
      );

      // Show notification if message is not from current user
      if (session?.user && normalizedMessage.senderId !== session.user.id) {
        const content = normalizedMessage.content || '';
        toast.info(`New message from ${normalizedMessage.sender?.name || 'Unknown User'}`, {
          description: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        });
      }
    });

    // Typing events
    newSocket.on(
      'user:typing',
      (data: { userId: string; conversationId: string; userInfo: any }) => {
        if (session?.user && data.userId !== session.user.id) {
          setTypingUsers((prev) => {
            const exists = prev.find(
              (u) => u.userId === data.userId && u.conversationId === data.conversationId
            );
            if (!exists) {
              return [...prev, data];
            }
            return prev;
          });
        }
      }
    );

    newSocket.on('user:stop-typing', (data: { userId: string; conversationId: string }) => {
      setTypingUsers((prev) =>
        prev.filter((u) => !(u.userId === data.userId && u.conversationId === data.conversationId))
      );
    });

    // Online status events
    newSocket.on('users:online', (users: OnlineUser[]) => {
      setOnlineUsers(users);
    });

    newSocket.on('user:online', (user: OnlineUser) => {
      setOnlineUsers((prev) => {
        const exists = prev.find((u) => u.userId === user.userId);
        if (!exists) {
          return [...prev, user];
        }
        return prev;
      });
    });

    newSocket.on('user:offline', (data: { userId: string }) => {
      setOnlineUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    // Error events
    newSocket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
      toast.error(`Chat error: ${error.message}`);
      setError(error.message);
    });

    setSocket(newSocket);
    socketRef.current = newSocket;

    return () => {
      console.log('Cleaning up socket connection');
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [chatToken, tokenLoading, isChatEnabled]);

  // Load conversations
  const loadConversations = React.useCallback(async () => {
    if (!session || !chatToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat/conversations', {
        headers: {
          Authorization: `Bearer ${chatToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load conversations');
      }

      const data = await response.json();
      setConversations((data.conversations || []).map(normalizeConversation));
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations');
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [chatToken, session]);

  // Load messages for a conversation
  const loadMessages = React.useCallback(async (conversationId: string) => {
    if (!session || !chatToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        headers: {
          Authorization: `Bearer ${chatToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const data = await response.json();
      setMessages((data.data.messages || []).map(normalizeMessage));
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [chatToken, session]);

  // Send message
  const sendMessage = (
    conversationId: string,
    content: string,
    type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT'
  ) => {
    if (!socket || !isConnected || !content.trim()) {
      console.error('Cannot send message:', {
        socket: !!socket,
        isConnected,
        content: content.trim(),
      });
      toast.error('Cannot send message: Not connected to chat server');
      return;
    }

    const messageData = {
      conversationId,
      content: content.trim(),
      type,
    };

    console.log('Sending message:', messageData);

    // Create optimistic message for immediate UI update
    const optimisticMessage: Message = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      conversationId,
      senderId: session?.user?.id || '',
      content: content.trim(),
      type,
      createdAt: new Date(),
      sender: {
        id: session?.user?.id || '',
        name: session?.user?.firstName
          ? `${session.user.firstName} ${session.user.lastName || ''}`.trim()
          : session?.user?.name || 'You',
        avatar: session?.user?.avatarUrl,
      },
      attachments: [],
    };

    // Add optimistic message to UI immediately
    if (activeConversation && conversationId === activeConversation.id) {
      console.log('Adding optimistic message to UI:', optimisticMessage.id);
      setMessages((prev) => [...prev, optimisticMessage]);
    }

    // Add timeout for message sending
    const timeout = setTimeout(() => {
      console.error('Message sending timed out');
      toast.error('Message sending timed out');
      // Remove optimistic message on timeout
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
    }, 10000);

    // Send message with acknowledgment
    socket.emit('message:send', messageData, (response?: any) => {
      clearTimeout(timeout);
      console.log('Message send response:', response);

      if (response?.error) {
        console.error('Failed to send message:', response.error);
        toast.error(`Failed to send message: ${response.error}`);
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      } else if (response?.success) {
        // Message sent successfully - server will send back the real message
        console.log('Message sent successfully, real message will arrive via socket');
        if (response.warning) {
          toast.warning(response.warning);
        }
      }
    });
  };

  // Create new conversation
  const createConversation = async (
    participantIds: string[],
    type: 'DIRECT' | 'GROUP' | 'APPLICATION_RELATED' = 'DIRECT',
    name?: string,
    payload?: { applicationId?: string; jobId?: string }
  ): Promise<Conversation | null> => {
    if (!session || !chatToken) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${chatToken}`,
        },
        body: JSON.stringify({
          participantIds,
          type,
          name,
          ...payload,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const { conversation } = await response.json();
      const normalizedConversation = normalizeConversation(conversation);

      // Add to conversations list
      setConversations((prev) => [
        normalizedConversation,
        ...prev.filter(
          (existingConversation) => existingConversation.id !== normalizedConversation.id
        ),
      ]);

      return normalizedConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      setError('Failed to create conversation');
      toast.error('Failed to create conversation');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Typing indicators
  const startTyping = (conversationId: string) => {
    if (!socket || !isConnected) return;

    socket.emit('user:typing', { conversationId });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(conversationId);
    }, 3000);
  };

  const stopTyping = (conversationId: string) => {
    if (!socket || !isConnected) return;

    socket.emit('user:stop-typing', { conversationId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  // Load conversations on mount - only when chat is enabled
  useEffect(() => {
    if (session && isChatEnabled && chatToken) {
      void loadConversations();
    }
  }, [chatToken, isChatEnabled, loadConversations, session]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation && chatToken) {
      void loadMessages(activeConversation.id);
      // Auto-join conversation room
      if (socket && isConnected) {
        socket.emit('join_conversation', activeConversation.id);
        console.log('Joined conversation room:', activeConversation.id);
      }
    } else {
      setMessages([]);
    }
  }, [activeConversation, chatToken, isConnected, loadMessages, socket]);

  // Initialize chat - enable socket connection and load conversations
  const initializeChat = () => {
    if (!isChatEnabled) {
      console.log('Initializing chat...');
      setIsChatEnabled(true);
    }
  };

  // Disconnect chat - cleanup socket and conversations
  const disconnectChat = () => {
    if (isChatEnabled) {
      console.log('Disconnecting chat...');
      setIsChatEnabled(false);

      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      // Clear state
      setSocket(null);
      setIsConnected(false);
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
      setOnlineUsers([]);
      setTypingUsers([]);
    }
  };

  const value: ChatContextType = {
    socket,
    isConnected,
    isConnecting,
    isChatEnabled,
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    sendMessage,
    onlineUsers,
    typingUsers,
    startTyping,
    stopTyping,
    isLoading,
    error,
    initializeChat,
    disconnectChat,
    loadConversations,
    loadMessages,
    createConversation,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

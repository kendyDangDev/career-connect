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
  createdAt: Date;
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
  lastMessageAt?: Date | null;
  createdAt: Date;
  participants: ConversationParticipant[];
  messages: Message[];
  _count: {
    messages: number;
  };
}

interface ConversationParticipant {
  id: string;
  userId: string;
  conversationId: string;
  joinedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar?: string | null;
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
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  createConversation: (
    participantIds: string[],
    type?: 'DIRECT' | 'GROUP',
    name?: string
  ) => Promise<Conversation | null>;
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!chatToken || tokenLoading) return;

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
      console.log('New message received:', message);

      // Add message to current conversation if it matches
      if (activeConversation && message.conversationId === activeConversation.id) {
        setMessages((prev) => {
          // Check if message already exists to avoid duplicates
          const messageExists = prev.some((m) => m.id === message.id);
          if (messageExists) {
            console.log('Message already exists, skipping:', message.id);
            return prev;
          }

          // Remove any temporary/optimistic messages from the same sender with similar timestamp
          const filteredMessages = prev.filter((m) => {
            if (!m.id.startsWith('temp_')) return true;
            if (m.senderId !== message.senderId) return true;

            // Remove temp message if real message is from same sender and within 5 seconds
            const tempTime = new Date(m.createdAt).getTime();
            const realTime = new Date(message.createdAt).getTime();
            const timeDiff = Math.abs(realTime - tempTime);
            return timeDiff > 5000; // Keep temp messages older than 5 seconds
          });

          console.log('Adding new message to conversation:', message.id);
          return [...filteredMessages, message];
        });
      }

      // Update conversation list with new message
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessageAt: message.createdAt,
              messages: [message],
              // _count: {
              //   messages: conv._count.messages + 1,
              // },
            };
          }
          return conv;
        })
      );

      // Show notification if message is not from current user
      if (session?.user && message.senderId !== session.user.id) {
        toast.info(`New message from ${message.sender.name}`, {
          description: message.content.slice(0, 50) + (message.content.length > 50 ? '...' : ''),
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

    return () => {
      newSocket.disconnect();
    };
  }, [chatToken, tokenLoading]);

  // Load conversations
  const loadConversations = async () => {
    if (!session) return;

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
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations');
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    if (!session) return;

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
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

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
    type: 'DIRECT' | 'GROUP' = 'DIRECT',
    name?: string
  ): Promise<Conversation | null> => {
    if (!session) return null;

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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const { conversation } = await response.json();

      // Add to conversations list
      setConversations((prev) => [conversation, ...prev]);

      return conversation;
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

  // Load conversations on mount
  useEffect(() => {
    if (session) {
      loadConversations();
    }
  }, [session]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
      // Auto-join conversation room
      if (socket && isConnected) {
        socket.emit('join_conversation', activeConversation.id);
        console.log('Joined conversation room:', activeConversation.id);
      }
    } else {
      setMessages([]);
    }
  }, [activeConversation, socket, isConnected]);

  const value: ChatContextType = {
    socket,
    isConnected,
    isConnecting,
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
    loadConversations,
    loadMessages,
    createConversation,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

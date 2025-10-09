export type ConversationType = 'DIRECT' | 'GROUP' | 'APPLICATION_RELATED';
export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'SYSTEM';
export type UserType = 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
export type ParticipantRole = 'MEMBER' | 'ADMIN' | 'MODERATOR';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  userType: UserType;
  email?: string;
}

export interface Participant {
  id: string;
  userId: string;
  user: User;
  role: ParticipantRole;
  lastSeenAt: string;
  joinedAt: string;
}

export interface MessageReadStatus {
  userId: string;
  readAt: string;
  user?: User;
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  content: string;
  messageType: MessageType;
  replyToId?: string;
  replyTo?: Message;
  attachments: MessageAttachment[];
  readBy: MessageReadStatus[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  name?: string;
  type: ConversationType;
  applicationId?: string;
  jobId?: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationPayload {
  type: ConversationType;
  participantIds: string[];
  title?: string;
  applicationId?: string;
  jobId?: string;
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
  type?: MessageType;
  replyToId?: string;
  attachments?: File[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore?: boolean;
  nextCursor?: string;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  pagination: PaginationInfo;
}

export interface MessagesResponse {
  messages: Message[];
  pagination: PaginationInfo;
}

export interface ChatTokenResponse {
  token: string;
  expiresIn: string;
}

// Socket.IO Event Types
export interface SocketMessageData {
  conversationId: string;
  content: string;
  type: MessageType;
  replyToId?: string;
}

export interface TypingData {
  conversationId: string;
  userId?: string;
  userInfo?: {
    name: string;
    avatarUrl?: string;
  };
}

export interface UserStatusData {
  userId: string;
  isOnline: boolean;
  lastSeenAt?: string;
}

export interface OnlineUsersData {
  users: {
    userId: string;
    userInfo: User;
  }[];
}

// Chat State Management Types
export interface ChatState {
  conversations: Conversation[];
  activeConversation?: Conversation;
  messages: { [conversationId: string]: Message[] };
  typingUsers: { [conversationId: string]: string[] };
  onlineUsers: string[];
  isConnected: boolean;
  isLoading: boolean;
  error?: string;
}

export interface ChatActions {
  // Connection
  connect: () => Promise<void>;
  disconnect: () => void;
  
  // Conversations
  fetchConversations: (params?: { page?: number; limit?: number; type?: ConversationType }) => Promise<void>;
  createConversation: (payload: CreateConversationPayload) => Promise<Conversation>;
  setActiveConversation: (conversation: Conversation) => void;
  
  // Messages
  fetchMessages: (conversationId: string, params?: { page?: number; limit?: number }) => Promise<void>;
  sendMessage: (payload: SendMessagePayload) => Promise<void>;
  markAsRead: (conversationId: string, messageId: string) => Promise<void>;
  
  // Real-time events
  handleNewMessage: (message: Message) => void;
  handleUserTyping: (data: TypingData) => void;
  handleUserStopTyping: (data: TypingData) => void;
  handleUserStatusChange: (data: UserStatusData) => void;
  
  // Utility
  clearError: () => void;
  resetState: () => void;
}

export type ChatContextType = ChatState & ChatActions;
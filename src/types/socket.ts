import { Socket } from 'socket.io-client';

export interface SocketUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  sender: SocketUser;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO' | 'SYSTEM';
  replyToId?: string;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  title?: string;
  type: 'DIRECT' | 'GROUP' | 'APPLICATION' | 'SUPPORT';
  participants: ConversationParticipant[];
  lastMessage?: ChatMessage;
  lastMessageAt?: Date;
  unreadCount: number;
}

export interface ConversationParticipant {
  id: string;
  userId: string;
  user: SocketUser;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  joinedAt: Date;
  lastSeenAt?: Date;
  isActive: boolean;
}

export interface MessageRead {
  messageId: string;
  userId: string;
  readAt: Date;
}

export interface TypingUser {
  userId: string;
  user: SocketUser;
}

export interface UserStatus {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
}

// Socket Events
export interface ServerToClientEvents {
  new_message: (message: ChatMessage) => void;
  message_read: (data: MessageRead) => void;
  user_typing: (data: TypingUser) => void;
  user_stop_typing: (data: { userId: string }) => void;
  user_status_change: (data: UserStatus) => void;
  conversation_updated: (conversation: Conversation) => void;
  error: (error: { message: string; code?: string }) => void;
}

export interface ClientToServerEvents {
  join_conversation: (conversationId: string) => void;
  leave_conversation: (conversationId: string) => void;
  send_message: (data: {
    conversationId: string;
    content: string;
    messageType: string;
    replyToId?: string;
  }) => void;
  typing_start: (conversationId: string) => void;
  typing_stop: (conversationId: string) => void;
  mark_message_read: (data: { messageId: string; conversationId: string }) => void;
  update_online_status: (status: 'online' | 'away' | 'offline') => void;
}

export type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

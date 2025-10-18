import { io, Socket } from 'socket.io-client';
import { ChatSocket, ClientToServerEvents, ServerToClientEvents } from '@/types/socket';

class SocketManager {
  private socket: ChatSocket | null = null;
  private token: string | null = null;

  connect(token: string): Promise<ChatSocket> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      this.token = token;
      const socketUrl =
        process.env.NODE_ENV === 'production'
          ? process.env.NEXT_PUBLIC_SOCKET_URL || ''
          : 'http://localhost:3000';

      this.socket = io(socketUrl, {
        path: '/api/socket/io',
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
      }) as ChatSocket;

      this.socket.on('connect', () => {
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        // Handle disconnection if needed
      });

      // Handle authentication errors
      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
        if (error.message === 'Authentication failed') {
          this.disconnect();
          reject(new Error('Authentication failed'));
        }
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): ChatSocket | null {
    return this.socket;
  }

  // Conversation methods
  joinConversation(conversationId: string): void {
    this.socket?.emit('join_conversation', conversationId);
  }

  leaveConversation(conversationId: string): void {
    this.socket?.emit('leave_conversation', conversationId);
  }

  // Message methods
  sendMessage(data: {
    conversationId: string;
    content: string;
    messageType?: string;
    replyToId?: string;
  }): void {
    this.socket?.emit('send_message', {
      messageType: 'TEXT',
      ...data,
    });
  }

  markMessageRead(messageId: string, conversationId: string): void {
    this.socket?.emit('mark_message_read', { messageId, conversationId });
  }

  // Typing indicators
  startTyping(conversationId: string): void {
    this.socket?.emit('typing_start', conversationId);
  }

  stopTyping(conversationId: string): void {
    this.socket?.emit('typing_stop', conversationId);
  }

  // Status methods
  updateOnlineStatus(status: 'online' | 'away' | 'offline'): void {
    this.socket?.emit('update_online_status', status);
  }

  // Event listeners
  onNewMessage(callback: (message: any) => void): void {
    this.socket?.on('new_message', callback);
  }

  onMessageRead(callback: (data: any) => void): void {
    this.socket?.on('message_read', callback);
  }

  onUserTyping(callback: (data: any) => void): void {
    this.socket?.on('user_typing', callback);
  }

  onUserStopTyping(callback: (data: any) => void): void {
    this.socket?.on('user_stop_typing', callback);
  }

  onUserStatusChange(callback: (data: any) => void): void {
    this.socket?.on('user_status_change', callback);
  }

  // Remove listeners
  removeAllListeners(): void {
    this.socket?.removeAllListeners();
  }
}

export const socketManager = new SocketManager();

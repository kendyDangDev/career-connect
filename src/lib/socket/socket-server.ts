import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO, Socket } from 'socket.io';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { verifyChatToken } from '@/lib/auth/chat-jwt';
import { connectionManager } from './connection-manager';
import { notificationService } from '@/lib/services/notification-service';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export interface SocketUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType: string;
}

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: SocketUser;
}

export const initSocketIO = (server: NetServer) => {
  const io = new ServerIO(server, {
    path: '/api/socket/io',
    addTrailingSlash: false,
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? process.env.NEXTAUTH_URL
          : ['http://localhost:3000', 'http://192.168.1.100:3000'], // Cho mobile app
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Middleware xác thực
  io.use(async (socket: any, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        throw new Error('No token provided');
      }

      // Verify JWT token
      const decoded = verifyChatToken(token);

      if (!decoded.userId) {
        throw new Error('Invalid token');
      }

      socket.userId = decoded.userId;
      socket.user = {
        id: decoded.userId,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        userType: decoded.userType,
      };

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket: any) => {
    console.log(`User ${socket.user?.email} connected with socket ${socket.id}`);

    // Add to connection manager
    connectionManager.addConnection(socket.userId, socket.id);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle sending messages
    socket.on(
      'send_message',
      async (data: {
        conversationId: string;
        content: string;
        messageType: string;
        replyToId?: string;
      }) => {
        try {
          // Rate limiting
          if (!connectionManager.checkRateLimit(`message:${socket.userId}`)) {
            socket.emit('message_error', { error: 'Rate limit exceeded' });
            return;
          }
          // Import prisma dynamically to avoid circular dependencies
          const { prisma } = await import('@/lib/prisma');

          // Verify user is participant
          const participant = await prisma.conversationParticipant.findFirst({
            where: {
              conversationId: data.conversationId,
              userId: socket.userId,
              isActive: true,
            },
          });

          if (!participant) {
            socket.emit('message_error', { error: 'Access denied' });
            return;
          }

          // Create message in database
          const message = await prisma.message.create({
            data: {
              conversationId: data.conversationId,
              senderId: socket.userId,
              content: data.content,
              messageType: data.messageType as any,
              replyToId: data.replyToId,
            },
            include: {
              sender: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                  userType: true,
                },
              },
              replyTo: {
                select: {
                  id: true,
                  content: true,
                  sender: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          });

          // Update conversation's lastMessageAt
          await prisma.conversation.update({
            where: { id: data.conversationId },
            data: { lastMessageAt: new Date() },
          });

          // Mark message as read by sender
          await prisma.messageRead.create({
            data: {
              messageId: message.id,
              userId: socket.userId,
            },
          });

          // Get conversation participants for notifications
          const conversation = await prisma.conversation.findUnique({
            where: { id: data.conversationId },
            include: {
              participants: {
                where: { isActive: true },
                include: { user: true },
              },
            },
          });

          // Broadcast to all users in the conversation
          socket.to(`conversation:${data.conversationId}`).emit('new_message', message);

          // Send notifications to offline participants
          if (conversation) {
            const offlineParticipants = conversation.participants.filter(
              (p) => p.userId !== socket.userId && !connectionManager.isUserOnline(p.userId)
            );

            for (const participant of offlineParticipants) {
              await notificationService.sendMessageNotification({
                recipientId: participant.userId,
                senderId: socket.userId,
                senderName:
                  `${socket.user.firstName || ''} ${socket.user.lastName || ''}`.trim() ||
                  socket.user.email,
                conversationId: data.conversationId,
                messageContent: data.content,
                conversationType: conversation.type as any,
              });
            }
          }

          // Send confirmation to sender
          socket.emit('message_sent', { success: true, message });
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('message_error', { error: 'Failed to send message' });
        }
      }
    );

    // Handle typing indicators
    socket.on('typing_start', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        user: socket.user,
      });
    });

    socket.on('typing_stop', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user_stop_typing', {
        userId: socket.userId,
      });
    });

    // Handle message read status
    socket.on('mark_message_read', async (data: { messageId: string; conversationId: string }) => {
      try {
        const { prisma } = await import('@/lib/prisma');

        // Verify user is participant
        const participant = await prisma.conversationParticipant.findFirst({
          where: {
            conversationId: data.conversationId,
            userId: socket.userId,
            isActive: true,
          },
        });

        if (!participant) {
          return;
        }

        // Mark message as read
        await prisma.messageRead.upsert({
          where: {
            messageId_userId: {
              messageId: data.messageId,
              userId: socket.userId,
            },
          },
          update: {
            readAt: new Date(),
          },
          create: {
            messageId: data.messageId,
            userId: socket.userId,
            readAt: new Date(),
          },
        });

        // Broadcast read status to conversation
        socket.to(`conversation:${data.conversationId}`).emit('message_read', {
          messageId: data.messageId,
          userId: socket.userId,
          readAt: new Date(),
        });
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Handle online status
    socket.on('update_online_status', (status: 'online' | 'away' | 'offline') => {
      // Broadcast to all conversations this user is part of
      socket.broadcast.emit('user_status_change', {
        userId: socket.userId,
        status,
        lastSeen: new Date(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user?.email} disconnected from socket ${socket.id}`);

      // Remove from connection manager
      connectionManager.removeConnection(socket.id);

      // Only broadcast offline if user has no other connections
      if (!connectionManager.isUserOnline(socket.userId)) {
        socket.broadcast.emit('user_status_change', {
          userId: socket.userId,
          status: 'offline',
          lastSeen: new Date(),
        });
      }
    });
  });

  return io;
};

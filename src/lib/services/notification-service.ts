import { prisma } from '@/lib/prisma';
import { connectionManager } from '@/lib/socket/connection-manager';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  userId: string;
}

export class NotificationService {
  async createNotification(data: {
    userId: string;
    type: 'MESSAGE' | 'APPLICATION_STATUS' | 'NEW_JOB_MATCH' | 'SYSTEM';
    title: string;
    message: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
  }) {
    try {
      const notificationData: any = {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        isRead: false,
      };

      // Store additional data in JSON field
      if (data.relatedEntityId || data.relatedEntityType) {
        notificationData.data = {
          relatedEntityId: data.relatedEntityId,
          relatedEntityType: data.relatedEntityType,
        };
      }

      const notification = await prisma.notification.create({
        data: notificationData,
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async sendMessageNotification(data: {
    recipientId: string;
    senderId: string;
    senderName: string;
    conversationId: string;
    messageContent: string;
    conversationType: 'DIRECT' | 'GROUP' | 'APPLICATION' | 'SUPPORT';
  }) {
    try {
      // Check if recipient is online
      const isOnline = connectionManager.isUserOnline(data.recipientId);

      if (isOnline) {
        // User is online, no need for push notification
        return;
      }

      // Create in-app notification
      const title =
        data.conversationType === 'DIRECT'
          ? `New message from ${data.senderName}`
          : `New message in conversation`;

      await this.createNotification({
        userId: data.recipientId,
        type: 'MESSAGE',
        title,
        message:
          data.messageContent.length > 100
            ? data.messageContent.substring(0, 100) + '...'
            : data.messageContent,
        relatedEntityId: data.conversationId,
        relatedEntityType: 'conversation',
      });

      // Send push notification if user has push tokens
      await this.sendPushNotification({
        userId: data.recipientId,
        title,
        body: data.messageContent,
        data: {
          type: 'message',
          conversationId: data.conversationId,
          senderId: data.senderId,
        },
      });
    } catch (error) {
      console.error('Error sending message notification:', error);
    }
  }

  async sendPushNotification(payload: PushNotificationPayload) {
    try {
      // Get user's push tokens (you would store these in your database)
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          // Add push token fields if you have them
          // pushTokens: true,
        },
      });

      if (!user) {
        return;
      }

      // Here you would integrate with your push notification service
      // Examples: Firebase Cloud Messaging, Apple Push Notifications, etc.

      // For now, we'll just log the notification
      console.log('Push notification to send:', {
        userId: payload.userId,
        title: payload.title,
        body: payload.body,
        data: payload.data,
      });

      // TODO: Implement actual push notification sending
      // Example with Firebase:
      // await admin.messaging().send({
      //   token: userPushToken,
      //   notification: {
      //     title: payload.title,
      //     body: payload.body,
      //   },
      //   data: payload.data,
      // });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  async markNotificationsAsRead(userId: string, notificationIds: string[]) {
    try {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId,
        },
        data: {
          isRead: true,
        },
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }

  async getUserNotifications(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
    } = {}
  ) {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = options;
      const skip = (page - 1) * limit;

      const where: any = { userId };
      if (unreadOnly) {
        where.isRead = false;
      }

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      const total = await prisma.notification.count({ where });
      const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false },
      });

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        unreadCount,
      };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();

import { prisma } from '@/lib/prisma';
import { connectionManager } from '@/lib/socket/connection-manager';
import { NotificationType, Prisma } from '@/generated/prisma';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  userId: string;
}

export interface NewActiveJobNotificationEvent {
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
}

export interface CandidateCvViewedNotificationEvent {
  applicationId: string;
  candidateUserId: string;
  companyId: string;
  companyName: string;
  jobId: string;
  jobTitle: string;
}

type NotificationDbClient = typeof prisma | Prisma.TransactionClient;
const COMPANY_NEW_JOB_KIND = 'COMPANY_NEW_JOB';

function isCompanyNewJobEnumMissingError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes('invalid input value for enum "NotificationType": "COMPANY_NEW_JOB"')
  );
}

export class NotificationService {
  private buildFollowerNotifications(
    events: NewActiveJobNotificationEvent[],
    followersByCompany: Map<string, string[]>,
    type: NotificationType
  ) {
    const notifications: Prisma.NotificationCreateManyInput[] = [];

    for (const event of events) {
      const followerIds = followersByCompany.get(event.companyId) ?? [];
      for (const userId of followerIds) {
        const payload: Record<string, unknown> = {
          jobId: event.jobId,
          companyId: event.companyId,
          url: `/candidate/jobs/${event.jobId}`,
        };

        if (type !== NotificationType.COMPANY_NEW_JOB) {
          payload.notificationKind = COMPANY_NEW_JOB_KIND;
        }

        notifications.push({
          userId,
          type,
          title: `Việc làm mới từ ${event.companyName}`,
          message: event.jobTitle,
          data: payload as Prisma.InputJsonValue,
        });
      }
    }

    return notifications;
  }

  async createNotification(data: {
    userId: string;
    type: NotificationType;
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

  async notifyFollowersOfNewActiveJobs(
    events: NewActiveJobNotificationEvent[],
    db: NotificationDbClient = prisma
  ) {
    try {
      const uniqueEvents = Array.from(
        new Map(
          events
            .filter(
              (event) =>
                event.jobId && event.jobTitle && event.companyId && event.companyName
            )
            .map((event) => [event.jobId, event])
        ).values()
      );

      if (uniqueEvents.length === 0) {
        return { createdCount: 0 };
      }

      const followers = await db.companyFollower.findMany({
        where: {
          companyId: {
            in: uniqueEvents.map((event) => event.companyId),
          },
        },
        select: {
          companyId: true,
          candidate: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (followers.length === 0) {
        return { createdCount: 0 };
      }

      const followersByCompany = new Map<string, string[]>();
      for (const follower of followers) {
        const userIds = followersByCompany.get(follower.companyId) ?? [];
        userIds.push(follower.candidate.userId);
        followersByCompany.set(follower.companyId, userIds);
      }

      const companyNotifications = this.buildFollowerNotifications(
        uniqueEvents,
        followersByCompany,
        NotificationType.COMPANY_NEW_JOB
      );

      if (companyNotifications.length === 0) {
        return { createdCount: 0, usedFallbackType: false };
      }

      try {
        await db.notification.createMany({
          data: companyNotifications,
        });

        return {
          createdCount: companyNotifications.length,
          usedFallbackType: false,
        };
      } catch (error) {
        if (!isCompanyNewJobEnumMissingError(error)) {
          throw error;
        }

        console.warn(
          'NotificationType.COMPANY_NEW_JOB is missing in the current database. Falling back to NEW_JOB_MATCH. Apply migration 20260405120000_add_company_job_push_notifications to enable the dedicated enum value.'
        );

        const fallbackNotifications = this.buildFollowerNotifications(
          uniqueEvents,
          followersByCompany,
          NotificationType.NEW_JOB_MATCH
        );

        await db.notification.createMany({
          data: fallbackNotifications,
        });

        return {
          createdCount: fallbackNotifications.length,
          usedFallbackType: true,
        };
      }

      /*

      const notifications: Prisma.NotificationCreateManyInput[] = [];

      for (const event of uniqueEvents) {
        const followerIds = followersByCompany.get(event.companyId) ?? [];
        for (const userId of followerIds) {
          notifications.push({
            userId,
            type: NotificationType.COMPANY_NEW_JOB,
            title: `Việc làm mới từ ${event.companyName}`,
            message: event.jobTitle,
            data: {
              jobId: event.jobId,
              companyId: event.companyId,
              url: `/candidate/jobs/${event.jobId}`,
            } as Prisma.InputJsonValue,
          });
        }
      }

      if (notifications.length === 0) {
        return { createdCount: 0 };
      }

      await db.notification.createMany({
        data: notifications,
      });

      return { createdCount: notifications.length };
      */
    } catch (error) {
      console.error('Error notifying company followers about new active jobs:', error);
      return { createdCount: 0, usedFallbackType: false };
    }
  }

  async notifyCandidateCvViewed(
    event: CandidateCvViewedNotificationEvent,
    db: NotificationDbClient = prisma
  ) {
    try {
      const existingNotification = await db.notification.findFirst({
        where: {
          userId: event.candidateUserId,
          type: NotificationType.SYSTEM,
          AND: [
            {
              data: {
                path: ['notificationKind'],
                equals: 'CV_VIEWED',
              },
            },
            {
              data: {
                path: ['applicationId'],
                equals: event.applicationId,
              },
            },
          ],
        },
        select: {
          id: true,
        },
      });

      if (existingNotification) {
        return { created: false, skipped: true };
      }

      const notification = await db.notification.create({
        data: {
          userId: event.candidateUserId,
          type: NotificationType.SYSTEM,
          title: 'CV của bạn đã được xem',
          message: `${event.companyName} vừa xem CV bạn nộp cho vị trí ${event.jobTitle}.`,
          data: {
            notificationKind: 'CV_VIEWED',
            applicationId: event.applicationId,
            companyId: event.companyId,
            companyName: event.companyName,
            jobId: event.jobId,
            jobTitle: event.jobTitle,
            url: '/candidate/applications',
          } as Prisma.InputJsonValue,
        },
        select: {
          id: true,
        },
      });

      return { created: true, skipped: false, notificationId: notification.id };
    } catch (error) {
      console.error('Error notifying candidate about CV view:', error);
      return { created: false, skipped: false };
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

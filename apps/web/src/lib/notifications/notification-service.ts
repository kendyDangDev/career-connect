// import { prisma } from '@/lib/prisma';
// import { connectionManager } from '@/lib/socket/connection-manager';

// export interface NotificationPayload {
//   userId: string;
//   title: string;
//   body: string;
//   data?: Record<string, any>;
//   type: 'NEW_MESSAGE' | 'CONVERSATION_CREATED' | 'PARTICIPANT_ADDED';
// }

// export class NotificationService {
//   // Send push notification to user
//   static async sendPushNotification(payload: NotificationPayload) {
//     try {
//       // Check if user is online
//       const isOnline = connectionManager.isUserOnline(payload.userId);

//       if (isOnline) {
//         // User is online, notification will be handled by socket
//         return;
//       }

//       // User is offline, send push notification
//       await this.createNotificationRecord(payload);

//       // Here you would integrate with push notification services like:
//       // - Firebase Cloud Messaging (FCM) for mobile apps
//       // - Web Push API for web browsers
//       // - Apple Push Notification Service (APNs) for iOS

//       console.log('Push notification sent:', payload);
//     } catch (error) {
//       console.error('Error sending push notification:', error);
//     }
//   }

//   // Create notification record in database
//   static async createNotificationRecord(payload: NotificationPayload) {
//     try {
//       await prisma.notification.create({
//         data: {
//           userId: payload.userId,
//           title: payload.title,
//           message: payload.body,
//           type: payload.type === 'NEW_MESSAGE' ? 'MESSAGE' : 'SYSTEM',
//           data: payload.data ? JSON.stringify(payload.data) : null,
//           isRead: false,
//         },
//       });
//     } catch (error) {
//       console.error('Error creating notification record:', error);
//     }
//   }

//   // Send notification for new message
//   static async notifyNewMessage(
//     messageId: string,
//     conversationId: string,
//     senderId: string,
//     content: string
//   ) {
//     try {
//       // Get conversation participants (excluding sender)
//       const participants = await prisma.conversationParticipant.findMany({
//         where: {
//           conversationId,
//           isActive: true,
//           userId: { not: senderId },
//         },
//         include: {
//           user: {
//             select: {
//               id: true,
//               firstName: true,
//               lastName: true,
//             },
//           },
//         },
//       });

//       // Get sender info
//       const sender = await prisma.user.findUnique({
//         where: { id: senderId },
//         select: {
//           firstName: true,
//           lastName: true,
//         },
//       });

//       const senderName = sender
//         ? `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'Someone'
//         : 'Someone';

//       // Get conversation info
//       const conversation = await prisma.conversation.findUnique({
//         where: { id: conversationId },
//         select: {
//           title: true,
//           type: true,
//           relatedJob: {
//             select: {
//               title: true,
//             },
//           },
//           relatedApplication: {
//             select: {
//               job: {
//                 select: {
//                   title: true,
//                 },
//               },
//             },
//           },
//         },
//       });

//       const conversationTitle =
//         conversation?.title ||
//         conversation?.relatedJob?.title ||
//         conversation?.relatedApplication?.job?.title ||
//         (conversation?.type === 'DIRECT' ? senderName : 'Group Chat');

//       // Send notifications to all participants
//       const notifications = participants.map((participant) => ({
//         userId: participant.userId,
//         title: `New message from ${senderName}`,
//         body:
//           conversation?.type === 'DIRECT'
//             ? content.length > 50
//               ? `${content.substring(0, 50)}...`
//               : content
//             : `In ${conversationTitle}: ${content.length > 40 ? `${content.substring(0, 40)}...` : content}`,
//         data: {
//           messageId,
//           conversationId,
//           senderId,
//           conversationType: conversation?.type,
//         },
//         type: 'NEW_MESSAGE' as const,
//       }));

//       // Send all notifications
//       await Promise.all(
//         notifications.map((notification) => this.sendPushNotification(notification))
//       );
//     } catch (error) {
//       console.error('Error sending new message notifications:', error);
//     }
//   }

//   // Send notification for new conversation
//   static async notifyConversationCreated(
//     conversationId: string,
//     creatorId: string,
//     participantIds: string[]
//   ) {
//     try {
//       const creator = await prisma.user.findUnique({
//         where: { id: creatorId },
//         select: {
//           firstName: true,
//           lastName: true,
//         },
//       });

//       const creatorName = creator
//         ? `${creator.firstName || ''} ${creator.lastName || ''}`.trim() || 'Someone'
//         : 'Someone';

//       const conversation = await prisma.conversation.findUnique({
//         where: { id: conversationId },
//         select: {
//           title: true,
//           type: true,
//         },
//       });

//       const notifications = participantIds
//         .filter((id) => id !== creatorId)
//         .map((userId) => ({
//           userId,
//           title: 'New conversation',
//           body:
//             conversation?.type === 'GROUP'
//               ? `${creatorName} added you to ${conversation?.title || 'a group chat'}`
//               : `${creatorName} started a conversation with you`,
//           data: {
//             conversationId,
//             creatorId,
//             conversationType: conversation?.type,
//           },
//           type: 'CONVERSATION_CREATED' as const,
//         }));

//       await Promise.all(
//         notifications.map((notification) => this.sendPushNotification(notification))
//       );
//     } catch (error) {
//       console.error('Error sending conversation created notifications:', error);
//     }
//   }

//   // Mark notifications as read
//   static async markNotificationsRead(userId: string, conversationId?: string) {
//     try {
//       const where: any = {
//         userId,
//         isRead: false,
//       };

//       if (conversationId) {
//         where.data = {
//           contains: `"conversationId":"${conversationId}"`,
//         };
//       }

//       await prisma.notification.updateMany({
//         where,
//         data: { isRead: true },
//       });
//     } catch (error) {
//       console.error('Error marking notifications as read:', error);
//     }
//   }
// }

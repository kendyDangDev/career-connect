import { NextRequest, NextResponse } from 'next/server';
import {
  withAuth,
  successResponse,
  errorResponse,
  serverErrorResponse,
  AuthenticatedRequest,
} from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const messageQuerySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(50),
  before: z.string().nullish(), // cursor-based pagination - accepts null, undefined, or string
});

const sendMessageSchema = z.object({
  content: z.string().min(1),
  messageType: z.enum(['TEXT', 'IMAGE', 'FILE', 'AUDIO', 'VIDEO']).default('TEXT'),
  replyToId: z.string().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Apply authentication middleware
  const authResult = await withAuth(async (authReq: AuthenticatedRequest) => {
    try {
      const { id } = await params;
      const conversationId = id;
      const { searchParams } = new URL(authReq.url);
      const query = messageQuerySchema.parse({
        page: searchParams.get('page') || '1',
        limit: searchParams.get('limit') || '50',
        before: searchParams.get('before'),
      });

      // Check if user is participant in conversation
      const participant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId,
          userId: authReq.user!.id,
          leftAt: null,
        },
      });

      if (!participant) {
        return errorResponse('Access denied - You are not a participant in this conversation', 403);
      }

      const where: any = {
        conversationId,
        isDeleted: false,
      };

      if (query.before) {
        where.createdAt = {
          lt: new Date(query.before),
        };
      }

      const messages = await prisma.message.findMany({
        where,
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
          attachments: true,
          readBy: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: query.limit,
      });

      // Mark messages as read for current user
      const unreadMessageIds = messages
        .filter(
          (msg) =>
            msg.senderId !== authReq.user!.id &&
            !msg.readBy.some((read) => read.userId === authReq.user!.id)
        )
        .map((msg) => msg.id);

      if (unreadMessageIds.length > 0) {
        await prisma.messageRead.createMany({
          data: unreadMessageIds.map((messageId) => ({
            messageId,
            userId: authReq.user!.id,
          })),
          skipDuplicates: true,
        });
      }

      const hasMore = messages.length === query.limit;
      const nextCursor = hasMore ? messages[messages.length - 1]?.createdAt : null;

      return successResponse(
        {
          messages: messages.reverse(), // Reverse to show oldest first
          pagination: {
            hasMore,
            nextCursor: nextCursor?.toISOString(),
          },
        },
        'Messages retrieved successfully'
      );
    } catch (error) {
      console.error('Error fetching messages:', error);
      return serverErrorResponse('Failed to fetch messages', error);
    }
  })(request as AuthenticatedRequest);

  return authResult;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Apply authentication middleware
  const authResult = await withAuth(async (authReq: AuthenticatedRequest) => {
    try {
      const { id } = await params;
      const conversationId = id;
      const body = await authReq.json();

      const data = sendMessageSchema.parse(body);

      // Check if user is participant in conversation
      const participant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId,
          userId: authReq.user!.id,
          leftAt: null,
        },
      });

      if (!participant) {
        return errorResponse('Access denied - You are not a participant in this conversation', 403);
      }

      // Validate reply-to message if provided
      if (data.replyToId) {
        const replyToMessage = await prisma.message.findFirst({
          where: {
            id: data.replyToId,
            conversationId,
            isDeleted: false,
          },
        });

        if (!replyToMessage) {
          return errorResponse('Reply-to message not found', 400);
        }
      }

      // Create message
      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId: authReq.user!.id,
          content: data.content,
          type: data.messageType,
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
          attachments: true,
        },
      });

      // Update conversation's lastMessageAt
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
        },
      });

      // Mark message as read by sender
      await prisma.messageRead.create({
        data: {
          messageId: message.id,
          userId: authReq.user!.id,
        },
      });

      return successResponse({ message }, 'Message sent successfully', 201);
    } catch (error) {
      console.error('Error sending message:', error);

      if (error instanceof z.ZodError) {
        return errorResponse('Invalid request data', 400, error.issues);
      }

      return serverErrorResponse('Failed to send message', error);
    }
  })(request as AuthenticatedRequest);

  return authResult;
}

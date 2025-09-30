import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

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
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const conversationId = id;
    const { searchParams } = new URL(request.url);
    const query = messageQuerySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '50',
      before: searchParams.get('before'),
    });

    // Check if user is participant in conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: session.user.id,
        leftAt: null,
      },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
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
          msg.senderId !== session.user.id &&
          !msg.readBy.some((read) => read.userId === session.user.id)
      )
      .map((msg) => msg.id);

    if (unreadMessageIds.length > 0) {
      await prisma.messageRead.createMany({
        data: unreadMessageIds.map((messageId) => ({
          messageId,
          userId: session.user.id,
        })),
        skipDuplicates: true,
      });
    }

    const hasMore = messages.length === query.limit;
    const nextCursor = hasMore ? messages[messages.length - 1]?.createdAt : null;

    return NextResponse.json({
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        hasMore,
        nextCursor: nextCursor?.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');

    let userId: string;
    let userInfo: any;

    // Try JWT token first (from Socket.IO)
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;

        userId = decoded.userId;
        userInfo = decoded;
      } catch (jwtError) {
        // Fallback to session-based auth
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        userId = session.user.id;
        userInfo = session.user;
      }
    } else {
      // Use session-based auth
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      userId = session.user.id;
      userInfo = session.user;
    }

    const { id } = await params;
    const conversationId = id;
    const body = await request.json();

    const data = sendMessageSchema.parse(body);

    // Check if user is participant in conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: userId,
        leftAt: null,
      },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
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
        return NextResponse.json({ error: 'Reply-to message not found' }, { status: 400 });
      }
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
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
        userId: userId,
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

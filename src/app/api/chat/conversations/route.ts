import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const createConversationSchema = z.object({
  type: z.enum(['DIRECT', 'GROUP', 'APPLICATION_RELATED']),
  title: z.string().optional(),
  participantIds: z.array(z.string()),
  applicationId: z.string().optional(),
  jobId: z.string().optional(),
});

const conversationQuerySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
  type: z.enum(['DIRECT', 'GROUP', 'APPLICATION_RELATED']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = conversationQuerySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      type: searchParams.get('type') || undefined,
    });

    const skip = (query.page - 1) * query.limit;

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
            leftAt: null,
          },
        },
        ...(query.type && { type: query.type }),
      },
      include: {
        participants: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                userType: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
            readBy: {
              where: { userId: session.user.id },
            },
          },
        },
        application: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    companyName: true,
                    logoUrl: true,
                  },
                },
              },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                companyName: true,
                logoUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
      skip,
      take: query.limit,
    });

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: session.user.id },
            readBy: {
              none: {
                userId: session.user.id,
              },
            },
          },
        });

        return {
          ...conversation,
          unreadCount,
          lastMessage: conversation.messages[0] || null,
        };
      })
    );

    const total = await prisma.conversation.count({
      where: {
        participants: {
          some: {
            userId: session.user.id,
            leftAt: null,
          },
        },
        ...(query.type && { type: query.type }),
      },
    });

    return NextResponse.json({
      conversations: conversationsWithUnread,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    console.log('Create Conversation Request Body:', body);
    const data = createConversationSchema.parse(body);

    // Validate participants
    if (!data.participantIds.includes(session.user.id)) {
      data.participantIds.push(session.user.id);
    }

    const participants = await prisma.user.findMany({
      where: {
        id: { in: data.participantIds },
      },
      select: { id: true },
    });

    if (participants.length !== data.participantIds.length) {
      return NextResponse.json({ error: 'Some participants not found' }, { status: 400 });
    }

    // For DIRECT conversations, check if one already exists
    if (data.type === 'DIRECT' && data.participantIds.length === 2) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: 'DIRECT',
          participants: {
            every: {
              userId: { in: data.participantIds },
            },
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                  userType: true,
                },
              },
            },
          },
        },
      });

      if (existingConversation) {
        return NextResponse.json({ conversation: existingConversation });
      }
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        type: data.type,
        name: data.title,
        applicationId: data.applicationId,
        jobId: data.jobId,
        participants: {
          create: data.participantIds.map((userId, index) => ({
            userId,
            role: userId === session.user.id ? 'ADMIN' : 'MEMBER',
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                userType: true,
              },
            },
          },
        },
        application: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    companyName: true,
                    logoUrl: true,
                  },
                },
              },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                companyName: true,
                logoUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

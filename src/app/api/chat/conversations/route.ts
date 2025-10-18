import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken, extractBearerToken } from '@/lib/jwt-utils';
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
  const origin = request.headers.get('origin');

  try {
    let userId = null;

    // First, try to get user from Bearer token (React Native)
    const authHeader = request.headers.get('authorization');
    const token = extractBearerToken(authHeader);

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        // Verify user still exists and is active
        const dbUser = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, status: true },
        });

        if (dbUser && dbUser.status === 'ACTIVE') {
          userId = dbUser.id;
        }
      }
    }

    // If no Bearer token or invalid, try NextAuth session (Web)
    if (!userId) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        userId = session.user.id;
      }
    }

    if (!userId) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      // Add CORS headers for React Native
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }

      return response;
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
            userId: userId,
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
              where: { userId: userId },
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
            senderId: { not: userId },
            readBy: {
              none: {
                userId: userId,
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
            userId: userId,
            leftAt: null,
          },
        },
        ...(query.type && { type: query.type }),
      },
    });

    const response = NextResponse.json({
      success: true,
      conversations: conversationsWithUnread,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });

    // Add CORS headers for React Native
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
  } catch (error) {
    console.error('Error fetching conversations:', error);

    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });

    // Add CORS headers for React Native
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
  }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');

  try {
    let userId = null;

    // First, try to get user from Bearer token (React Native)
    const authHeader = request.headers.get('authorization');
    const token = extractBearerToken(authHeader);

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        // Verify user still exists and is active
        const dbUser = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, status: true },
        });

        if (dbUser && dbUser.status === 'ACTIVE') {
          userId = dbUser.id;
        }
      }
    }

    // If no Bearer token or invalid, try NextAuth session (Web)
    if (!userId) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        userId = session.user.id;
      }
    }

    if (!userId) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      // Add CORS headers for React Native
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }

      return response;
    }

    const body = await request.json();

    console.log('Create Conversation Request Body:', body);
    const data = createConversationSchema.parse(body);

    // Validate participants
    if (!data.participantIds.includes(userId)) {
      data.participantIds.push(userId);
    }

    const participants = await prisma.user.findMany({
      where: {
        id: { in: data.participantIds },
      },
      select: { id: true },
    });

    if (participants.length !== data.participantIds.length) {
      const response = NextResponse.json({ error: 'Some participants not found' }, { status: 400 });

      // Add CORS headers for React Native
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }

      return response;
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
        const response = NextResponse.json({ success: true, conversation: existingConversation });

        // Add CORS headers for React Native
        if (origin) {
          response.headers.set('Access-Control-Allow-Origin', origin);
          response.headers.set('Access-Control-Allow-Credentials', 'true');
        }

        return response;
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
          create: data.participantIds.map((participantId, index) => ({
            userId: participantId,
            role: participantId === userId ? 'ADMIN' : 'MEMBER',
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

    const response = NextResponse.json({ success: true, conversation }, { status: 201 });

    // Add CORS headers for React Native
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
  } catch (error) {
    console.error('Error creating conversation:', error);

    let response;
    if (error instanceof z.ZodError) {
      response = NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    } else {
      response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Add CORS headers for React Native
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');

  const response = new NextResponse(null, { status: 200 });

  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
}

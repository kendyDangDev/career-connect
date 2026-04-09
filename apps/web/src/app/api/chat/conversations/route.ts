export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken, extractBearerToken } from '@/lib/jwt-utils';
import { z } from 'zod';

// Validation schemas
const createConversationSchema = z.object({
  type: z.enum(['DIRECT', 'GROUP', 'APPLICATION_RELATED']),
  name: z.string().optional(),
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

async function getConversationResponse(conversationId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
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
        orderBy: {
          joinedAt: 'asc',
        },
      },
      messages: {
        take: 1,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
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
                  id: true,
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
              id: true,
              companyName: true,
              logoUrl: true,
            },
          },
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  if (!conversation) {
    return null;
  }

  return {
    ...conversation,
    lastMessage: conversation.messages[0] || null,
  };
}

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

    let participantIds = Array.from(new Set([...data.participantIds, userId]));
    let applicationId = data.applicationId;
    let jobId = data.jobId;
    const conversationName = data.name ?? data.title;

    if (data.type === 'APPLICATION_RELATED') {
      if (!data.applicationId && !data.jobId) {
        const response = NextResponse.json(
          { error: 'Application-related conversations require applicationId or jobId' },
          { status: 400 }
        );

        if (origin) {
          response.headers.set('Access-Control-Allow-Origin', origin);
          response.headers.set('Access-Control-Allow-Credentials', 'true');
        }

        return response;
      }

      let resolvedCompanyId: string | null = null;

      if (data.applicationId) {
        const linkedApplication = await prisma.application.findUnique({
          where: { id: data.applicationId },
          select: {
            id: true,
            userId: true,
            jobId: true,
            job: {
              select: {
                companyId: true,
              },
            },
          },
        });

        if (!linkedApplication) {
          const response = NextResponse.json({ error: 'Application not found' }, { status: 404 });

          if (origin) {
            response.headers.set('Access-Control-Allow-Origin', origin);
            response.headers.set('Access-Control-Allow-Credentials', 'true');
          }

          return response;
        }

        const isApplicationOwner = linkedApplication.userId === userId;
        const hasCompanyAccess = isApplicationOwner
          ? true
          : Boolean(
              await prisma.companyUser.findFirst({
                where: {
                  userId,
                  companyId: linkedApplication.job.companyId,
                },
                select: {
                  id: true,
                },
              })
            );

        if (!isApplicationOwner && !hasCompanyAccess) {
          const response = NextResponse.json(
            { error: 'You do not have permission to create a chat for this application' },
            { status: 403 }
          );

          if (origin) {
            response.headers.set('Access-Control-Allow-Origin', origin);
            response.headers.set('Access-Control-Allow-Credentials', 'true');
          }

          return response;
        }

        if (data.jobId && data.jobId !== linkedApplication.jobId) {
          const response = NextResponse.json(
            { error: 'applicationId and jobId do not match' },
            { status: 400 }
          );

          if (origin) {
            response.headers.set('Access-Control-Allow-Origin', origin);
            response.headers.set('Access-Control-Allow-Credentials', 'true');
          }

          return response;
        }

        applicationId = linkedApplication.id;
        jobId = linkedApplication.jobId;
        resolvedCompanyId = linkedApplication.job.companyId;
        participantIds = Array.from(new Set([linkedApplication.userId, userId]));
      } else if (data.jobId) {
        const linkedApplication = await prisma.application.findFirst({
          where: {
            jobId: data.jobId,
            userId,
          },
          orderBy: {
            appliedAt: 'desc',
          },
          select: {
            id: true,
            jobId: true,
            job: {
              select: {
                companyId: true,
              },
            },
          },
        });

        if (!linkedApplication) {
          const response = NextResponse.json(
            { error: 'You can only start a chat for jobs you have applied to' },
            { status: 403 }
          );

          if (origin) {
            response.headers.set('Access-Control-Allow-Origin', origin);
            response.headers.set('Access-Control-Allow-Credentials', 'true');
          }

          return response;
        }

        applicationId = linkedApplication.id;
        jobId = linkedApplication.jobId;
        resolvedCompanyId = linkedApplication.job.companyId;
        participantIds = Array.from(new Set([userId]));
      }

      if (!resolvedCompanyId || !applicationId || !jobId) {
        const response = NextResponse.json(
          { error: 'Unable to resolve company for this conversation' },
          { status: 400 }
        );

        if (origin) {
          response.headers.set('Access-Control-Allow-Origin', origin);
          response.headers.set('Access-Control-Allow-Credentials', 'true');
        }

        return response;
      }

      const companyUsers = await prisma.companyUser.findMany({
        where: {
          companyId: resolvedCompanyId,
        },
        select: {
          userId: true,
        },
      });

      participantIds = Array.from(
        new Set([...participantIds, ...companyUsers.map((companyUser) => companyUser.userId)])
      );

      const existingApplicationConversation = await prisma.conversation.findFirst({
        where: {
          type: 'APPLICATION_RELATED',
          applicationId,
          participants: {
            some: {
              userId,
              leftAt: null,
            },
          },
        },
        include: {
          participants: {
            where: { leftAt: null },
            select: {
              userId: true,
            },
          },
        },
      });

      if (existingApplicationConversation) {
        const activeParticipantIds = new Set(
          existingApplicationConversation.participants.map((participant) => participant.userId)
        );
        const missingParticipantIds = participantIds.filter(
          (participantId) => !activeParticipantIds.has(participantId)
        );

        if (missingParticipantIds.length > 0) {
          await Promise.all(
            missingParticipantIds.map((participantId) =>
              prisma.conversationParticipant.upsert({
                where: {
                  conversationId_userId: {
                    conversationId: existingApplicationConversation.id,
                    userId: participantId,
                  },
                },
                update: {
                  leftAt: null,
                },
                create: {
                  conversationId: existingApplicationConversation.id,
                  userId: participantId,
                  role: participantId === userId ? 'ADMIN' : 'MEMBER',
                },
              })
            )
          );
        }

        const existingConversation = await getConversationResponse(
          existingApplicationConversation.id
        );
        const response = NextResponse.json({ success: true, conversation: existingConversation });

        if (origin) {
          response.headers.set('Access-Control-Allow-Origin', origin);
          response.headers.set('Access-Control-Allow-Credentials', 'true');
        }

        return response;
      }
    }

    const participants = await prisma.user.findMany({
      where: {
        id: { in: participantIds },
      },
      select: { id: true },
    });

    if (participants.length !== participantIds.length) {
      const response = NextResponse.json({ error: 'Some participants not found' }, { status: 400 });

      // Add CORS headers for React Native
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }

      return response;
    }

    // For DIRECT conversations, check if one already exists
    if (data.type === 'DIRECT' && participantIds.length === 2) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: 'DIRECT',
          AND: [
            {
              participants: {
                some: {
                  userId: participantIds[0],
                  leftAt: null,
                },
              },
            },
            {
              participants: {
                some: {
                  userId: participantIds[1],
                  leftAt: null,
                },
              },
            },
            {
              participants: {
                none: {
                  userId: {
                    notIn: participantIds,
                  },
                  leftAt: null,
                },
              },
            },
          ],
        },
        select: {
          id: true,
        },
      });

      if (existingConversation) {
        const preparedConversation = await getConversationResponse(existingConversation.id);
        const response = NextResponse.json({ success: true, conversation: preparedConversation });

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
        name: conversationName,
        applicationId,
        jobId,
        participants: {
          create: participantIds.map((participantId) => ({
            userId: participantId,
            role: participantId === userId ? 'ADMIN' : 'MEMBER',
          })),
        },
      },
      select: {
        id: true,
      },
    });

    const preparedConversation = await getConversationResponse(conversation.id);
    const response = NextResponse.json(
      { success: true, conversation: preparedConversation },
      { status: 201 }
    );

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

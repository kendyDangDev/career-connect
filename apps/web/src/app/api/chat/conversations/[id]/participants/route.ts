import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const addParticipantsSchema = z.object({
  userIds: z.array(z.string()),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId } = await params;

    // Check if user is participant
    const userParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: session.user.id,
      },
    });

    if (!userParticipant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const participants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            userType: true,
            profile: {
              select: {
                city: true,
                country: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    return NextResponse.json({ participants });
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const body = await request.json();
    const data = addParticipantsSchema.parse(body);

    // Check if user has admin/moderator rights
    const userParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: session.user.id,
        role: { in: ['ADMIN', 'MODERATOR'] },
      },
    });

    if (!userParticipant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if conversation allows new participants (GROUP only)
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { type: true },
    });

    if (conversation?.type !== 'GROUP') {
      return NextResponse.json(
        { error: 'Cannot add participants to this conversation type' },
        { status: 400 }
      );
    }

    // Validate users exist
    const users = await prisma.user.findMany({
      where: {
        id: { in: data.userIds },
      },
      select: { id: true },
    });

    if (users.length !== data.userIds.length) {
      return NextResponse.json({ error: 'Some users not found' }, { status: 400 });
    }

    // Filter out users who are already participants
    const existingParticipants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: { in: data.userIds },
      },
      select: { userId: true },
    });

    const existingUserIds = existingParticipants.map((p) => p.userId);
    const newUserIds = data.userIds.filter((id) => !existingUserIds.includes(id));

    if (newUserIds.length === 0) {
      return NextResponse.json({ error: 'All users are already participants' }, { status: 400 });
    }

    // Add new participants
    const newParticipants = await prisma.conversationParticipant.createMany({
      data: newUserIds.map((userId) => ({
        conversationId,
        userId,
        role: 'MEMBER',
      })),
    });

    // Get the created participants with user data
    const participants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: { in: newUserIds },
      },
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
    });

    return NextResponse.json({ participants }, { status: 201 });
  } catch (error) {
    console.error('Error adding participants:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

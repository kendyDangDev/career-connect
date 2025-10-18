import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateParticipantSchema = z.object({
  role: z.enum(['ADMIN', 'MODERATOR', 'MEMBER']).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId, participantId } = await params;
    const body = await request.json();
    const data = updateParticipantSchema.parse(body);

    // Check if user has admin rights
    const userParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: session.user.id,
        leftAt: null,
        role: 'ADMIN',
      },
    });

    if (!userParticipant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update participant
    const updatedParticipant = await prisma.conversationParticipant.update({
      where: {
        id: participantId,
        conversationId,
      },
      data,
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

    return NextResponse.json({ participant: updatedParticipant });
  } catch (error) {
    console.error('Error updating participant:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId, participantId } = await params;

    // Get the participant to be removed
    const targetParticipant = await prisma.conversationParticipant.findUnique({
      where: { id: participantId },
      select: { userId: true, role: true },
    });

    if (!targetParticipant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    // Check permissions: users can remove themselves, or admins can remove others
    const canRemove =
      targetParticipant.userId === session.user.id || // Self removal
      (await prisma.conversationParticipant.findFirst({
        where: {
          conversationId,
          userId: session.user.id,
          leftAt: null,
          role: 'ADMIN',
        },
      }));

    if (!canRemove) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Cannot remove the last admin
    if (targetParticipant.role === 'ADMIN') {
      const adminCount = await prisma.conversationParticipant.count({
        where: {
          conversationId,
          leftAt: null,
          role: 'ADMIN',
        },
      });

      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot remove the last admin' }, { status: 400 });
      }
    }

    // Remove participant
    await prisma.conversationParticipant.update({
      where: { id: participantId },
      data: { leftAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing participant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

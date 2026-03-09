import { NextRequest } from 'next/server';
import { getCurrentUser, handleApiError } from '@/lib/api-utils';
import { successResponse, errorResponse } from '@/utils/api-response';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/interview/practice-sessions/[sessionId]
 * Get session details including all answers.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return errorResponse('Authentication required', 401);
    }

    const { sessionId } = await params;

    const session = await prisma.practiceSession.findFirst({
      where: { id: sessionId, userId: user.id },
      include: {
        questionSet: {
          include: { questions: { orderBy: { orderIndex: 'asc' } } },
        },
        answers: {
          include: { question: true },
          orderBy: { answeredAt: 'asc' },
        },
      },
    });

    if (!session) {
      return errorResponse('Practice session not found', 404);
    }

    return successResponse(session, 'Practice session retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/interview/practice-sessions/[sessionId]
 * Update session status (e.g. mark as COMPLETED).
 * Body: { status: 'COMPLETED' | 'ABANDONED' }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return errorResponse('Authentication required', 401);
    }

    const { sessionId } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !['COMPLETED', 'ABANDONED'].includes(status)) {
      return errorResponse('status must be COMPLETED or ABANDONED', 400);
    }

    const session = await prisma.practiceSession.findFirst({
      where: { id: sessionId, userId: user.id },
    });

    if (!session) {
      return errorResponse('Practice session not found', 404);
    }

    // Calculate overall score from answers when completing
    let overallScore: number | undefined;
    if (status === 'COMPLETED') {
      const answers = await prisma.practiceAnswer.findMany({
        where: { sessionId },
        select: { score: true },
      });
      const scored = answers.filter((a) => a.score !== null);
      if (scored.length > 0) {
        overallScore = scored.reduce((sum, a) => sum + (a.score ?? 0), 0) / scored.length;
      }
    }

    const updated = await prisma.practiceSession.update({
      where: { id: sessionId },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
        ...(overallScore !== undefined ? { overallScore } : {}),
      },
    });

    return successResponse(updated, 'Practice session updated');
  } catch (error) {
    return handleApiError(error);
  }
}

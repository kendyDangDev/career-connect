import { NextRequest } from 'next/server';
import { getCurrentUser, handleApiError } from '@/lib/api-utils';
import { successResponse, errorResponse } from '@/utils/api-response';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/interview-sets/[id]/practice/[sessionId]
 * Get session detail with all answers
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return errorResponse('Authentication required', 401);
    }

    const { id, sessionId } = await params;

    const session = await prisma.practiceSession.findFirst({
      where: { id: sessionId, questionSetId: id, userId: user.id },
      include: {
        answers: {
          include: { question: true },
          orderBy: { answeredAt: 'asc' },
        },
        questionSet: {
          include: {
            questions: { orderBy: { orderIndex: 'asc' } },
          },
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
 * PATCH /api/interview-sets/[id]/practice/[sessionId]
 * Mark session as completed + save overall score/feedback
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return errorResponse('Authentication required', 401);
    }

    const { id, sessionId } = await params;

    // Verify session exists and belongs to user
    const existingSession = await prisma.practiceSession.findFirst({
      where: { id: sessionId, questionSetId: id, userId: user.id },
      include: {
        answers: true,
        questionSet: { include: { questions: true } },
      },
    });

    if (!existingSession) {
      return errorResponse('Practice session not found', 404);
    }

    // Calculate overall score from individual answers
    const answeredQuestions = existingSession.answers.filter((a) => a.score !== null);
    const overallScore =
      answeredQuestions.length > 0
        ? answeredQuestions.reduce((sum, a) => sum + (a.score || 0), 0) / answeredQuestions.length
        : 0;

    const updatedSession = await prisma.practiceSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        overallScore: Math.round(overallScore * 10) / 10,
        overallFeedback: `Đã hoàn thành ${answeredQuestions.length}/${existingSession.questionSet.questions.length} câu hỏi. Điểm trung bình: ${(overallScore).toFixed(1)}/10.`,
      },
      include: {
        answers: {
          include: { question: true },
          orderBy: { answeredAt: 'asc' },
        },
      },
    });

    return successResponse(updatedSession, 'Practice session completed');
  } catch (error) {
    return handleApiError(error);
  }
}

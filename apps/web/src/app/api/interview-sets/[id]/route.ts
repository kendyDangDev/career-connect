import { NextRequest } from 'next/server';
import { getCurrentUser, handleApiError } from '@/lib/api-utils';
import { successResponse, errorResponse } from '@/utils/api-response';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/interview-sets/[id]
 * Get a specific question set with all questions
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return errorResponse('Authentication required', 401);
    }

    const { id } = await params;

    const questionSet = await prisma.interviewQuestionSet.findFirst({
      where: { id, userId: user.id },
      include: {
        questions: { orderBy: { orderIndex: 'asc' } },
        practiceSessions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            _count: { select: { answers: true } },
          },
        },
        _count: { select: { questions: true, practiceSessions: true } },
      },
    });

    if (!questionSet) {
      return errorResponse('Question set not found', 404);
    }

    return successResponse(questionSet, 'Question set retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

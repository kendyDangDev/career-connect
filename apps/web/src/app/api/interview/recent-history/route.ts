import { getCurrentUser, handleApiError } from '@/lib/api-utils';
import { successResponse, errorResponse } from '@/utils/api-response';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/interview/recent-history
 * Returns the 5 most recently updated question sets for the current user,
 * each with their latest practice session and completion progress.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return errorResponse('Authentication required', 401);
    }

    const sets = await prisma.interviewQuestionSet.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        status: true,
        totalQuestions: true,
        createdAt: true,
        updatedAt: true,
        practiceSessions: {
          select: {
            id: true,
            status: true,
            overallScore: true,
            completedAt: true,
            _count: { select: { answers: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    const history = sets.map((set) => ({
      id: set.id,
      title: set.title,
      setStatus: set.status,
      totalQuestions: set.totalQuestions,
      createdAt: set.createdAt,
      updatedAt: set.updatedAt,
      latestSession: set.practiceSessions[0]
        ? {
            id: set.practiceSessions[0].id,
            status: set.practiceSessions[0].status,
            answeredCount: set.practiceSessions[0]._count.answers,
            overallScore: set.practiceSessions[0].overallScore,
            completedAt: set.practiceSessions[0].completedAt,
          }
        : null,
    }));

    return successResponse(history, 'Recent history retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}

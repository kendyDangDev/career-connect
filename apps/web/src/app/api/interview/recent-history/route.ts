import { getCurrentUser, handleApiError } from '@/lib/api-utils';
import { successResponse, errorResponse } from '@/utils/api-response';
import { prisma } from '@/lib/prisma';

function sortEntriesByCount(entries: Map<string, number>) {
  return [...entries.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0], 'vi');
  });
}

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
        difficulty: true,
        totalQuestions: true,
        createdAt: true,
        updatedAt: true,
        questions: {
          select: {
            category: true,
            difficulty: true,
            sampleAnswer: true,
          },
        },
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

    const history = sets.map((set) => {
      const categoryCounts = new Map<string, number>();
      const difficultyCounts = new Map<string, number>();
      let sampleAnswerCount = 0;

      for (const question of set.questions) {
        const normalizedCategory = question.category.trim();
        if (normalizedCategory) {
          categoryCounts.set(normalizedCategory, (categoryCounts.get(normalizedCategory) ?? 0) + 1);
        }

        difficultyCounts.set(
          question.difficulty,
          (difficultyCounts.get(question.difficulty) ?? 0) + 1
        );

        if (question.sampleAnswer?.trim()) {
          sampleAnswerCount += 1;
        }
      }

      const topCategories = sortEntriesByCount(categoryCounts)
        .slice(0, 3)
        .map(([category]) => category);
      const dominantDifficulty =
        sortEntriesByCount(difficultyCounts)[0]?.[0] ?? set.difficulty ?? null;

      return {
        id: set.id,
        title: set.title,
        setStatus: set.status,
        totalQuestions: set.totalQuestions,
        createdAt: set.createdAt,
        updatedAt: set.updatedAt,
        primaryCategory: topCategories[0] ?? null,
        topCategories,
        dominantDifficulty,
        sampleAnswerCount,
        latestSession: set.practiceSessions[0]
          ? {
              id: set.practiceSessions[0].id,
              status: set.practiceSessions[0].status,
              answeredCount: set.practiceSessions[0]._count.answers,
              overallScore: set.practiceSessions[0].overallScore,
              completedAt: set.practiceSessions[0].completedAt,
            }
          : null,
      };
    });

    return successResponse(history, 'Recent history retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}

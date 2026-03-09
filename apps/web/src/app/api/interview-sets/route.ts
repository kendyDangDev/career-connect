import { NextRequest } from 'next/server';
import { getCurrentUser, handleApiError } from '@/lib/api-utils';
import { paginatedResponse, errorResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { QuestionSetStatus, QuestionDifficulty } from '@/generated/prisma';

/**
 * GET /api/interview-sets
 * List all question sets for the current user (paginated)
 * Query params: page, limit, search, difficulty (EASY|MEDIUM|HARD), status (GENERATING|READY|FAILED)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return errorResponse('Authentication required', 401);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search')?.trim() || undefined;
    const difficultyParam = searchParams.get('difficulty') || undefined;
    const statusParam = searchParams.get('status') || undefined;

    const where = {
      userId: user.id,
      ...(search && { title: { contains: search, mode: 'insensitive' as const } }),
      ...(difficultyParam &&
        Object.values(QuestionDifficulty).includes(difficultyParam as QuestionDifficulty) && {
          difficulty: difficultyParam as QuestionDifficulty,
        }),
      ...(statusParam &&
        Object.values(QuestionSetStatus).includes(statusParam as QuestionSetStatus) && {
          status: statusParam as QuestionSetStatus,
        }),
    };

    const [sets, total] = await Promise.all([
      prisma.interviewQuestionSet.findMany({
        where,
        include: {
          _count: { select: { questions: true, practiceSessions: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.interviewQuestionSet.count({ where }),
    ]);

    return paginatedResponse(sets, total, page, limit, 'Question sets retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest } from 'next/server';
import { getCurrentUser, handleApiError } from '@/lib/api-utils';
import { successResponse, errorResponse } from '@/utils/api-response';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/interview/practice-sessions
 * Create a new practice session for a given questionSetId.
 * Body: { questionSetId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return errorResponse('Authentication required', 401);
    }

    const body = await req.json();
    const { questionSetId } = body;

    if (!questionSetId) {
      return errorResponse('questionSetId is required', 400);
    }

    // Verify the question set belongs to this user and is ready
    const questionSet = await prisma.interviewQuestionSet.findFirst({
      where: { id: questionSetId, userId: user.id, status: 'READY' },
    });

    if (!questionSet) {
      return errorResponse('Question set not found or not ready', 404);
    }

    // Create the practice session
    const session = await prisma.practiceSession.create({
      data: {
        questionSetId,
        userId: user.id,
        status: 'IN_PROGRESS',
      },
    });

    return successResponse(session, 'Practice session created', 201);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/interview/practice-sessions
 * List all practice sessions for the current user.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return errorResponse('Authentication required', 401);
    }

    const { searchParams } = new URL(req.url);
    const questionSetId = searchParams.get('questionSetId');

    const sessions = await prisma.practiceSession.findMany({
      where: {
        userId: user.id,
        ...(questionSetId ? { questionSetId } : {}),
      },
      include: {
        _count: { select: { answers: true } },
        questionSet: { select: { title: true, totalQuestions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(sessions, 'Practice sessions retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}

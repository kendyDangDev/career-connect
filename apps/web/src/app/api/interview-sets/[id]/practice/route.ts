import { NextRequest } from 'next/server';
import { getCurrentUser, handleApiError } from '@/lib/api-utils';
import { successResponse, errorResponse } from '@/utils/api-response';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/interview-sets/[id]/practice
 * Start a new practice session for a question set
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return errorResponse('Authentication required', 401);
    }

    const { id } = await params;

    // Verify the question set exists and belongs to the user
    const questionSet = await prisma.interviewQuestionSet.findFirst({
      where: { id, userId: user.id, status: 'READY' },
    });

    if (!questionSet) {
      return errorResponse('Question set not found or not ready', 404);
    }

    // Create a new practice session
    const session = await prisma.practiceSession.create({
      data: {
        questionSetId: id,
        userId: user.id,
        status: 'IN_PROGRESS',
      },
      include: {
        questionSet: {
          include: {
            questions: { orderBy: { orderIndex: 'asc' } },
          },
        },
      },
    });

    return successResponse(session, 'Practice session started', 201);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/interview-sets/[id]/practice
 * List practice sessions for this question set
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

    const sessions = await prisma.practiceSession.findMany({
      where: { questionSetId: id, userId: user.id },
      include: {
        _count: { select: { answers: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(sessions, 'Practice sessions retrieved');
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest } from 'next/server';
import { getCurrentUser, handleApiError } from '@/lib/api-utils';
import { successResponse, errorResponse } from '@/utils/api-response';
import { prisma } from '@/lib/prisma';
import { AIInterviewService } from '@/services/ai-interview.service';

/**
 * POST /api/interview/evaluate-answer
 * Evaluate a candidate's answer for a practice question using AI.
 * Body: { sessionId: string; questionId: string; answer: string }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return errorResponse('Authentication required', 401);
    }

    const body = await req.json();
    const { sessionId, questionId, answer } = body;

    if (!sessionId || !questionId || !answer) {
      return errorResponse('sessionId, questionId, and answer are required', 400);
    }

    // Verify the session belongs to the user and is active
    const session = await prisma.practiceSession.findFirst({
      where: { id: sessionId, userId: user.id, status: 'IN_PROGRESS' },
      include: { questionSet: true },
    });

    if (!session) {
      return errorResponse('Active practice session not found', 404);
    }

    // Verify the question belongs to the same question set
    const question = await prisma.interviewQuestion.findFirst({
      where: { id: questionId, questionSetId: session.questionSetId },
    });

    if (!question) {
      return errorResponse('Question not found in this set', 404);
    }

    // Prevent duplicate answers for the same question in this session
    const existing = await prisma.practiceAnswer.findFirst({
      where: { sessionId, questionId },
    });

    if (existing) {
      // Return the existing evaluation rather than erroring
      return successResponse(
        {
          score: existing.score,
          feedback: existing.feedback,
          strengths: existing.strengths,
          weaknesses: existing.weaknesses,
          sampleAnswer: question.sampleAnswer,
        },
        'Answer already evaluated'
      );
    }

    // Call AI evaluation
    const evaluation = await AIInterviewService.evaluateSingleAnswer(
      question.question,
      answer,
      session.questionSet.cvText,
      session.questionSet.jdText
    );

    // Persist the answer
    await prisma.practiceAnswer.create({
      data: {
        sessionId,
        questionId,
        answer,
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
      },
    });

    return successResponse(
      {
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        sampleAnswer: question.sampleAnswer,
      },
      'Answer evaluated successfully',
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}

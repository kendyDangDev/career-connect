import { NextRequest } from 'next/server';
import { getCurrentUser, handleApiError } from '@/lib/api-utils';
import { successResponse, errorResponse } from '@/utils/api-response';
import { prisma } from '@/lib/prisma';
import { AIInterviewService } from '@/services/ai-interview.service';

/**
 * POST /api/interview-sets/[id]/practice/[sessionId]/answer
 * Submit an answer for evaluation
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return errorResponse('Authentication required', 401);
    }

    const { id, sessionId } = await params;
    const body = await req.json();
    const { questionId, answer } = body;

    if (!questionId || !answer) {
      return errorResponse('questionId and answer are required', 400);
    }

    // Verify the session exists and is in progress
    const session = await prisma.practiceSession.findFirst({
      where: { id: sessionId, questionSetId: id, userId: user.id, status: 'IN_PROGRESS' },
      include: {
        questionSet: true,
      },
    });

    if (!session) {
      return errorResponse('Active practice session not found', 404);
    }

    // Get the question
    const question = await prisma.interviewQuestion.findFirst({
      where: { id: questionId, questionSetId: id },
    });

    if (!question) {
      return errorResponse('Question not found in this set', 404);
    }

    // Check if already answered
    const existingAnswer = await prisma.practiceAnswer.findFirst({
      where: { sessionId, questionId },
    });

    if (existingAnswer) {
      return errorResponse('This question has already been answered in this session', 400);
    }

    // Evaluate the answer using AI
    const evaluation = await AIInterviewService.evaluateSingleAnswer(
      question.question,
      answer,
      session.questionSet.cvText,
      session.questionSet.jdText
    );

    // Save the answer
    const practiceAnswer = await prisma.practiceAnswer.create({
      data: {
        sessionId,
        questionId,
        answer,
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
      },
      include: { question: true },
    });

    return successResponse(practiceAnswer, 'Answer evaluated successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}

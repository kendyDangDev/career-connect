import { NextRequest } from 'next/server';
import { AIInterviewService, ConversationMessage, InterviewContext } from '@/services/ai-interview.service';
import { successResponse, errorResponse, serverErrorResponse } from '@/utils/api-response';

/**
 * POST /api/interview/feedback
 * Generate comprehensive feedback after the interview ends.
 *
 * Body: {
 *   conversationHistory: ConversationMessage[],
 *   jobDescription: string,
 *   candidateCV: string,
 *   language?: 'vi' | 'en'
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationHistory, jobDescription, candidateCV, language = 'vi' } = body;

    if (!conversationHistory || !Array.isArray(conversationHistory) || conversationHistory.length === 0) {
      return errorResponse('conversationHistory is required and must not be empty', 400);
    }

    if (!jobDescription || !candidateCV) {
      return errorResponse('jobDescription and candidateCV are required', 400);
    }

    const context: InterviewContext = { jobDescription, candidateCV, language };

    const feedback = await AIInterviewService.generateFeedback(
      conversationHistory as ConversationMessage[],
      context
    );

    return successResponse(feedback, 'Interview feedback generated successfully');
  } catch (error) {
    return serverErrorResponse('Failed to generate interview feedback', error);
  }
}

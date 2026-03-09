import { NextRequest } from 'next/server';
import { AIInterviewService } from '@/services/ai-interview.service';
import { successResponse, errorResponse, serverErrorResponse } from '@/utils/api-response';

/**
 * POST /api/interview/start
 * Initialize an interview session — generates the first question + TTS audio.
 *
 * Body: { jobDescription: string, candidateCV: string, language?: 'vi' | 'en' }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobDescription, candidateCV, language = 'vi' } = body;

    if (!jobDescription || !candidateCV) {
      return errorResponse('jobDescription and candidateCV are required', 400);
    }

    // Generate first question using Gemini
    const { question } = await AIInterviewService.generateFirstQuestion({
      jobDescription,
      candidateCV,
      language,
    });

    // Convert question to speech using Cartesia TTS
    let audioBase64 = '';
    let mimeType = 'audio/mp3';
    try {
      const ttsResult = await AIInterviewService.textToSpeech(question, language);
      audioBase64 = ttsResult.audioBase64;
      mimeType = ttsResult.mimeType;
    } catch (ttsError) {
      console.warn('TTS failed, returning text only:', ttsError);
    }

    return successResponse(
      {
        firstQuestion: question,
        audioBase64,
        mimeType,
        conversationHistory: [{ role: 'ai', content: question }],
      },
      'Interview started successfully'
    );
  } catch (error) {
    return serverErrorResponse('Failed to start interview', error);
  }
}

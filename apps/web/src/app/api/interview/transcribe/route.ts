import { NextRequest } from 'next/server';
import { AIInterviewService } from '@/services/ai-interview.service';
import { successResponse, errorResponse } from '@/utils/api-response';

/**
 * POST /api/interview/transcribe
 * Transcribe audio recording to text using Gemini STT.
 *
 * Body: FormData with:
 *   - audio: File (webm/wav recording)
 *   - language: 'vi' | 'en' (default: 'vi')
 */
export async function POST(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formData: any = await req.formData();

    const audioFile = formData.get('audio') as unknown as File | null;
    const language = (formData.get('language') as unknown as string) || 'vi';

    if (!audioFile) {
      return errorResponse('Audio file is required', 400);
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    const transcript = await AIInterviewService.transcribeAudio(audioBuffer, language);

    if (!transcript || transcript.trim().length === 0) {
      return errorResponse('Could not transcribe audio. Please speak clearly and try again.', 422);
    }

    return successResponse({ transcript }, 'Transcription successful');
  } catch (error: any) {
    console.error('Transcribe error:', error);
    return errorResponse(error?.message || 'Transcription failed', 500);
  }
}

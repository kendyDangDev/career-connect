import { NextRequest } from 'next/server';
import { AIInterviewService, ConversationMessage, InterviewContext } from '@/services/ai-interview.service';
import { successResponse, errorResponse, serverErrorResponse } from '@/utils/api-response';

/**
 * POST /api/interview/process
 * Process a round: receive user audio → STT → LLM → TTS → return next question.
 *
 * Body: FormData with:
 *   - audio: File (webm/wav recording)
 *   - conversationHistory: JSON string of ConversationMessage[]
 *   - jobDescription: string
 *   - candidateCV: string
 *   - language: 'vi' | 'en'
 */
export async function POST(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formData: any = await req.formData();

    const audioFile = formData.get('audio') as unknown as File | null;
    const conversationHistoryStr = formData.get('conversationHistory') as unknown as string;
    const jobDescription = formData.get('jobDescription') as unknown as string;
    const candidateCV = formData.get('candidateCV') as unknown as string;
    const language = (formData.get('language') as unknown as string) || 'vi';

    if (!audioFile) {
      return errorResponse('Audio file is required', 400);
    }

    if (!conversationHistoryStr || !jobDescription || !candidateCV) {
      return errorResponse('conversationHistory, jobDescription, and candidateCV are required', 400);
    }

    let conversationHistory: ConversationMessage[];
    try {
      conversationHistory = JSON.parse(conversationHistoryStr);
    } catch {
      return errorResponse('Invalid conversationHistory JSON', 400);
    }

    const context: InterviewContext = { jobDescription, candidateCV, language };

    // Step 1: Convert audio to buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // Step 2: Transcribe with Whisper
    const userTranscript = await AIInterviewService.transcribeAudio(audioBuffer, language);

    if (!userTranscript || userTranscript.trim().length === 0) {
      return errorResponse('Could not transcribe audio. Please speak clearly and try again.', 422);
    }

    // Step 3: Add user message to history
    conversationHistory.push({ role: 'user', content: userTranscript });

    // Step 4: Process with Gemini LLM
    const llmResponse = await AIInterviewService.processAnswer(
      userTranscript,
      conversationHistory,
      context
    );

    // Step 5: If not ending, generate TTS for next question
    let audioBase64 = '';
    let mimeType = 'audio/mp3';

    if (!llmResponse.shouldEnd && llmResponse.nextQuestion) {
      // Add AI question to history
      conversationHistory.push({ role: 'ai', content: llmResponse.nextQuestion });

      try {
        const ttsResult = await AIInterviewService.textToSpeech(llmResponse.nextQuestion, language);
        audioBase64 = ttsResult.audioBase64;
        mimeType = ttsResult.mimeType;
      } catch (ttsError) {
        console.warn('TTS failed, returning text only:', ttsError);
      }
    }

    return successResponse(
      {
        userTranscript,
        aiFeedback: llmResponse.feedback,
        nextQuestion: llmResponse.nextQuestion,
        audioBase64,
        mimeType,
        shouldEnd: llmResponse.shouldEnd,
        questionNumber: llmResponse.questionNumber,
        conversationHistory,
      },
      'Answer processed successfully'
    );
  } catch (error) {
    return serverErrorResponse('Failed to process interview answer', error);
  }
}

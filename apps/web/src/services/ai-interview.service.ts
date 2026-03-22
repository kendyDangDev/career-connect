import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Gemini Client (LLM + STT) ─────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
const GEMINI_MODEL = 'gemini-3.1-flash-lite-preview';

// ─── Retry helper for rate-limited API calls ────────────────────────────────
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const is429 = error?.status === 429 || error?.message?.includes('429');
      if (is429 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 5000; // 5s, 10s, 20s
        console.warn(
          `Rate limited, retrying in ${delay / 1000}s (attempt ${attempt + 1}/${maxRetries})...`
        );
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries reached');
}

// ─── Types ──────────────────────────────────────────────────────────────────
export interface ConversationMessage {
  role: 'ai' | 'user';
  content: string;
}

export interface InterviewContext {
  jobDescription: string;
  candidateCV: string;
  language: string; // 'vi' | 'en'
}

export interface LLMResponse {
  feedback: string;
  nextQuestion: string;
  shouldEnd: boolean;
  questionNumber: number;
}

export interface FeedbackCategory {
  name: string;
  score: number;
  comment: string;
}

export interface InterviewFeedbackResult {
  overallScore: number;
  categories: FeedbackCategory[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
}

export interface GeneratedQuestion {
  question: string;
  category: string;
  difficulty: string;
  sampleAnswer: string;
}

export interface AnswerEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}

// ─── Service ────────────────────────────────────────────────────────────────
export class AIInterviewService {
  /**
   * Transcribe audio buffer using Gemini (replaces OpenAI Whisper)
   */
  static async transcribeAudio(audioBuffer: Buffer, language: string = 'vi'): Promise<string> {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const audioBase64 = audioBuffer.toString('base64');

    const langLabel = language === 'vi' ? 'Vietnamese' : 'English';

    const result = await withRetry(() =>
      model.generateContent([
        {
          inlineData: {
            mimeType: 'audio/webm',
            data: audioBase64,
          },
        },
        {
          text: `Transcribe the audio above into ${langLabel} text. Output ONLY the transcribed text, nothing else. No labels, no quotes, no markdown.`,
        },
      ])
    );

    return result.response.text().trim();
  }

  /**
   * Generate the first interview question based on JD + CV
   */
  static async generateFirstQuestion(context: InterviewContext): Promise<{ question: string }> {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const langInstruction =
      context.language === 'vi' ? 'Trả lời bằng Tiếng Việt.' : 'Respond in English.';

    const prompt = `You are a professional job interviewer. ${langInstruction}

Based on the Job Description and Candidate's CV below, generate the FIRST interview question.
The question should be an ice-breaker that helps the candidate feel comfortable while also being relevant to the position.

**Job Description:**
${context.jobDescription}

**Candidate CV:**
${context.candidateCV}

Rules:
- Output ONLY the question text, no preamble or labels.
- Keep it concise (1-2 sentences).
- Be warm and professional.`;

    const result = await withRetry(() => model.generateContent(prompt));
    const question = result.response.text().trim();

    return { question };
  }

  /**
   * Process user answer through LLM and generate next question
   */
  static async processAnswer(
    userAnswer: string,
    conversationHistory: ConversationMessage[],
    context: InterviewContext
  ): Promise<LLMResponse> {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const langInstruction =
      context.language === 'vi' ? 'Trả lời bằng Tiếng Việt.' : 'Respond in English.';

    // Build conversation transcript
    const transcript = conversationHistory
      .map((msg) => `${msg.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${msg.content}`)
      .join('\n');

    const questionCount = conversationHistory.filter((m) => m.role === 'ai').length;

    const prompt = `You are a professional job interviewer conducting a live interview. ${langInstruction}

**Job Description:**
${context.jobDescription}

**Candidate CV:**
${context.candidateCV}

**Interview Transcript So Far:**
${transcript}

**Latest Answer from Candidate:**
${userAnswer}

**Current Question Number:** ${questionCount}

Your task:
1. Briefly evaluate the candidate's latest answer (1-2 sentences of internal feedback).
2. Decide whether to continue or end the interview (end after 5-7 questions or when sufficient info collected).
3. If continuing, generate the next interview question that naturally follows from the conversation.

Respond in the following JSON format ONLY (no markdown, no code blocks):
{
  "feedback": "Brief evaluation of the last answer",
  "nextQuestion": "The next question to ask (empty string if ending)",
  "shouldEnd": false,
  "questionNumber": ${questionCount + 1}
}`;

    const result = await withRetry(() => model.generateContent(prompt));
    const text = result.response.text().trim();

    // Parse JSON — strip markdown code blocks if present
    const cleaned = text
      .replace(/```(?:json)?\s*/g, '')
      .replace(/```/g, '')
      .trim();
    try {
      return JSON.parse(cleaned) as LLMResponse;
    } catch {
      // Fallback if JSON parsing fails
      return {
        feedback: 'Good answer.',
        nextQuestion: text,
        shouldEnd: questionCount >= 6,
        questionNumber: questionCount + 1,
      };
    }
  }

  /**
   * Generate final comprehensive feedback
   */
  static async generateFeedback(
    conversationHistory: ConversationMessage[],
    context: InterviewContext
  ): Promise<InterviewFeedbackResult> {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const langInstruction =
      context.language === 'vi' ? 'Trả lời bằng Tiếng Việt.' : 'Respond in English.';

    const transcript = conversationHistory
      .map((msg) => `${msg.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${msg.content}`)
      .join('\n');

    const prompt = `You are a senior HR professional and interview coach. ${langInstruction}

**Job Description:**
${context.jobDescription}

**Candidate CV:**
${context.candidateCV}

**Full Interview Transcript:**
${transcript}

Provide a comprehensive evaluation of the candidate's interview performance.

Respond in the following JSON format ONLY (no markdown, no code blocks):
{
  "overallScore": 75,
  "categories": [
    { "name": "Communication Skills", "score": 80, "comment": "..." },
    { "name": "Technical Knowledge", "score": 70, "comment": "..." },
    { "name": "Problem Solving", "score": 75, "comment": "..." },
    { "name": "Cultural Fit", "score": 80, "comment": "..." },
    { "name": "Confidence & Presentation", "score": 70, "comment": "..." }
  ],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "summary": "Overall summary paragraph"
}

Rules:
- Scores are 0-100.
- Be constructive and encouraging.
- Give specific, actionable suggestions.`;

    const result = await withRetry(() => model.generateContent(prompt));
    const text = result.response.text().trim();

    const cleaned = text
      .replace(/```(?:json)?\s*/g, '')
      .replace(/```/g, '')
      .trim();
    try {
      return JSON.parse(cleaned) as InterviewFeedbackResult;
    } catch {
      return {
        overallScore: 0,
        categories: [],
        strengths: [],
        weaknesses: [],
        suggestions: ['Unable to generate feedback. Please try again.'],
        summary: 'Feedback generation failed.',
      };
    }
  }

  /**
   * Convert text to speech using Cartesia Sonic-3 API
   */
  static async textToSpeech(
    text: string,
    language: string = 'vi'
  ): Promise<{ audioBase64: string; mimeType: string }> {
    const apiKey = process.env.CARTESIA_API_KEY;
    if (!apiKey) {
      throw new Error('CARTESIA_API_KEY is not configured');
    }

    // Cartesia voice IDs — use appropriate voice for language
    // You can find voice IDs at https://play.cartesia.ai/
    const voiceId =
      language === 'vi'
        ? process.env.CARTESIA_VOICE_ID_VI || '00a77add-48d5-4ef6-8157-71e5437b282d' // Default Vietnamese voice
        : process.env.CARTESIA_VOICE_ID_EN || 'a0e99841-438c-4a64-b679-ae501e7d6091'; // Default English voice

    const response = await fetch('https://api.cartesia.ai/tts/bytes', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Cartesia-Version': '2025-04-16',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_id: 'sonic-3',
        transcript: text,
        voice: {
          mode: 'id',
          id: voiceId,
        },
        output_format: {
          container: 'mp3',
          bit_rate: 128000,
          sample_rate: 44100,
        },
        language: language === 'vi' ? 'vi' : 'en',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cartesia TTS failed: ${response.status} — ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(arrayBuffer).toString('base64');

    return {
      audioBase64,
      mimeType: 'audio/mp3',
    };
  }

  /**
   * Generate a structured set of interview questions from CV + JD
   */
  static async generateQuestionSet(
    cvText: string,
    jdText: string,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'MEDIUM',
    totalQuestions: number = 15
  ): Promise<GeneratedQuestion[]> {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const difficultyLabel =
      difficulty === 'EASY' ? 'Cơ bản' : difficulty === 'MEDIUM' ? 'Trung bình' : 'Nâng cao';

    const prompt = `You are a senior HR professional and interview coach. Generate exactly ${totalQuestions} interview questions based on the candidate's CV and the job description below.

**Difficulty Level:** ${difficultyLabel}

**Job Description:**
${jdText}

**Candidate CV:**
${cvText}

Rules:
- Mix question categories: "Technical", "Behavioral", "Problem Solving", "Cultural Fit", "Communication"
- Each question should be relevant to both the JD requirements and the CV experience
- For "${difficultyLabel}" difficulty: ${
      difficulty === 'EASY'
        ? 'basic knowledge questions, simple scenarios'
        : difficulty === 'MEDIUM'
          ? 'moderate complexity, requires practical experience'
          : 'deep technical questions, complex scenarios, system design'
    }
- Provide a sample answer for each question
- Output in Vietnamese

Respond with ONLY a JSON array (no markdown, no code blocks):
[
  {
    "question": "Câu hỏi phỏng vấn",
    "category": "Technical",
    "difficulty": "${difficulty}",
    "sampleAnswer": "Câu trả lời mẫu chi tiết"
  }
]`;

    const result = await withRetry(() => model.generateContent(prompt));
    const text = result.response.text().trim();

    const cleaned = text
      .replace(/```(?:json)?\s*/g, '')
      .replace(/```/g, '')
      .trim();
    try {
      const parsed = JSON.parse(cleaned) as GeneratedQuestion[];
      return parsed.slice(0, totalQuestions);
    } catch {
      console.error('Failed to parse question generation result:', cleaned);
      throw new Error('Failed to generate interview questions. Please try again.');
    }
  }

  /**
   * Generate a concise interview set title from JD only
   */
  static async generateQuestionSetTitle(jdText: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = `You are an expert recruiter. Create a short title for an interview question set based only on the job description below.

**Job Description:**
${jdText.substring(0, 4000)}

Rules:
- Output only the title text, no quotes, no labels, no markdown.
- Write in English.
- Keep it concise: 4 to 10 words.
- Infer the title only from the job description.
- Make the title specific to the target role, seniority, and core domain/tech stack when clear.
- Avoid generic titles like "Bộ câu hỏi phỏng vấn" or "Interview Set".

Good examples:
- Frontend React Developer Interview
- Senior Backend Node.js Interview
- Product Marketing Manager Interview`;

    const result = await withRetry(() => model.generateContent(prompt));
    return result.response.text().trim();
  }

  /**
   * Evaluate a single answer from a practice session
   */
  static async evaluateSingleAnswer(
    question: string,
    answer: string,
    cvText: string,
    jdText: string
  ): Promise<AnswerEvaluation> {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = `You are a senior interview coach. Evaluate the candidate's answer to the interview question below.

**Job Description (context):**
${jdText.substring(0, 1000)}

**CV (context):**
${cvText.substring(0, 1000)}

**Interview Question:**
${question}

**Candidate's Answer:**
${answer}

Evaluate the answer and respond in the following JSON format ONLY (no markdown, no code blocks):
{
  "score": 7.5,
  "feedback": "Nhận xét tổng quan về câu trả lời (2-3 câu)",
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "weaknesses": ["Điểm yếu 1", "Điểm yếu 2"]
}

Rules:
- Score is 0-10 (1 decimal)
- Be constructive and specific
- Respond in Vietnamese
- At least 1 strength and 1 weakness`;

    const result = await withRetry(() => model.generateContent(prompt));
    const text = result.response.text().trim();

    const cleaned = text
      .replace(/```(?:json)?\s*/g, '')
      .replace(/```/g, '')
      .trim();
    try {
      return JSON.parse(cleaned) as AnswerEvaluation;
    } catch {
      return {
        score: 5,
        feedback: 'Không thể đánh giá câu trả lời. Vui lòng thử lại.',
        strengths: [],
        weaknesses: [],
      };
    }
  }
}

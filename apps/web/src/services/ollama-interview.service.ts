// ─── Ollama Configuration ─────────────────────────────────────────────
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

// ─── Retry helper cho API calls ───────────────────────────────────────────
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 2000;
        console.warn(
          `Ollama call failed, retrying in ${delay / 1000}s (attempt ${attempt + 1}/${maxRetries})...`
        );
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries reached for Ollama API');
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

// ─── Hàm gọi Ollama API chung ─────────────────────────────────────────
async function callOllama(
  systemPrompt: string,
  userPrompt: string,
  requireJson = false
): Promise<string> {
  // Khởi tạo headers cơ bản
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${OLLAMA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: userPrompt },
      ],
      response_format: requireJson ? { type: 'json_object' } : undefined,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// ─── Service ────────────────────────────────────────────────────────────────
export class OllamaInterviewService {
  /**
   * Chú ý: Ollama chủ yếu chạy sinh văn bản. Để chạy STT (Speech-to-Text),
   * bạn có thể cần dùng Whisper.cpp riêng hoặc fallback lại Gemini.
   */
  static async transcribeAudio(audioBuffer: Buffer, language: string = 'vi'): Promise<string> {
    throw new Error(
      "Transcribe Audio (STT) requires a multi-modal model. Ollama doesn't natively support Audio blob input on standard text models. Please use Gemini/Whisper for STT."
    );
  }

  static async generateFirstQuestion(context: InterviewContext): Promise<{ question: string }> {
    const langInstruction =
      context.language === 'vi' ? 'Trả lời bằng Tiếng Việt.' : 'Respond in English.';

    const systemPrompt = `You are a professional job interviewer. ${langInstruction}`;
    const userPrompt = `Based on the Job Description and Candidate's CV below, generate the FIRST interview question.
The question should be an ice-breaker that helps the candidate feel comfortable while also being relevant to the position.

**Job Description:**
${context.jobDescription}

**Candidate CV:**
${context.candidateCV}

Rules:
- Output ONLY the question text, no preamble or labels.
- Keep it concise (1-2 sentences).
- Be warm and professional.`;

    const question = await withRetry(() => callOllama(systemPrompt, userPrompt));
    return { question };
  }

  static async processAnswer(
    userAnswer: string,
    conversationHistory: ConversationMessage[],
    context: InterviewContext
  ): Promise<LLMResponse> {
    const langInstruction =
      context.language === 'vi' ? 'Trả lời bằng Tiếng Việt.' : 'Respond in English.';

    const transcript = conversationHistory
      .map((msg) => `${msg.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${msg.content}`)
      .join('\n');

    const questionCount = conversationHistory.filter((m) => m.role === 'ai').length;

    const systemPrompt = `You are a professional job interviewer conducting a live interview. ${langInstruction}`;
    const userPrompt = `**Job Description:**
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
2. Decide whether to continue or end the interview (end after 5-7 questions).
3. Generate the next interview question that naturally follows.

Respond in the following JSON format ONLY (no markdown, no code blocks):
{
  "feedback": "Brief evaluation of the last answer",
  "nextQuestion": "The next question to ask (empty string if ending)",
  "shouldEnd": false,
  "questionNumber": ${questionCount + 1}
}`;

    const text = await withRetry(() => callOllama(systemPrompt, userPrompt, true));

    const cleaned = text
      .replace(/```(?:json)?\s*/g, '')
      .replace(/```/g, '')
      .trim();
    try {
      return JSON.parse(cleaned) as LLMResponse;
    } catch {
      return {
        feedback: 'Good answer.',
        nextQuestion: text, // Nếu model trả về plain text thay vì json
        shouldEnd: questionCount >= 6,
        questionNumber: questionCount + 1,
      };
    }
  }

  static async generateFeedback(
    conversationHistory: ConversationMessage[],
    context: InterviewContext
  ): Promise<InterviewFeedbackResult> {
    const langInstruction =
      context.language === 'vi' ? 'Trả lời bằng Tiếng Việt.' : 'Respond in English.';
    const transcript = conversationHistory
      .map((msg) => `${msg.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${msg.content}`)
      .join('\n');

    const systemPrompt = `You are a senior HR professional and interview coach. ${langInstruction}`;
    const userPrompt = `**Job Description:**
${context.jobDescription}

**Candidate CV:**
${context.candidateCV}

**Full Interview Transcript:**
${transcript}

Provide a comprehensive evaluation of the candidate's interview performance.
Respond in the following JSON format ONLY:
{
  "overallScore": 75,
  "categories": [
    { "name": "Communication Skills", "score": 80, "comment": "..." },
    { "name": "Technical Knowledge", "score": 70, "comment": "..." }
  ],
  "strengths": ["strength 1"],
  "weaknesses": ["weakness 1"],
  "suggestions": ["suggestion 1"],
  "summary": "Overall summary paragraph"
}`;

    const text = await withRetry(() => callOllama(systemPrompt, userPrompt, true));
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
        suggestions: ['Unable to generate feedback.'],
        summary: 'Feedback generation failed.',
      };
    }
  }

  static async generateQuestionSet(
    cvText: string,
    jdText: string,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'MEDIUM',
    totalQuestions: number = 15
  ): Promise<GeneratedQuestion[]> {
    const difficultyLabel =
      difficulty === 'EASY' ? 'Cơ bản' : difficulty === 'MEDIUM' ? 'Trung bình' : 'Nâng cao';

    const systemPrompt = `You are a senior HR professional. Produce strictly JSON output.`;
    const userPrompt = `Generate exactly ${totalQuestions} interview questions based on the CV & JD below.

**Difficulty Level:** ${difficultyLabel}
**Job Description:**
${jdText}
**Candidate CV:**
${cvText}

Provide a sample answer for each question. Output in Vietnamese.
Respond ONLY with a JSON array:
[
  {
    "question": "Câu hỏi",
    "category": "Technical",
    "difficulty": "${difficulty}",
    "sampleAnswer": "Câu trả lời mẫu"
  }
]`;

    const text = await withRetry(() => callOllama(systemPrompt, userPrompt, true));
    const cleaned = text
      .replace(/```(?:json)?\s*/g, '')
      .replace(/```/g, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned) as GeneratedQuestion[];
      return parsed.slice(0, totalQuestions);
    } catch {
      throw new Error('Failed to parse question generation result from Ollama.');
    }
  }

  static async generateQuestionSetTitle(jdText: string): Promise<string> {
    const systemPrompt = `You are an expert recruiter. Output only the title text, no quotes, no labels.`;
    const userPrompt = `Create a short title for an interview question set based only on the job description below.
Write in English, keep it concise (4-10 words).

**Job Description:**
${jdText.substring(0, 4000)}`;

    return await withRetry(() => callOllama(systemPrompt, userPrompt));
  }

  static async evaluateSingleAnswer(
    question: string,
    answer: string,
    cvText: string,
    jdText: string
  ): Promise<AnswerEvaluation> {
    const systemPrompt = `You are a senior interview coach. Strict JSON output required.`;
    const userPrompt = `Evaluate the candidate's answer for the following setup:
**JD Context:** ${jdText.substring(0, 1000)}
**CV Context:** ${cvText.substring(0, 1000)}

**Question:** ${question}
**Answer:** ${answer}

Respond in Vietnamese with the following JSON format ONLY:
{
  "score": 7.5,
  "feedback": "Nhận xét tổng quan (2-3 câu)",
  "strengths": ["Điểm mạnh"],
  "weaknesses": ["Điểm yếu"]
}`;

    const text = await withRetry(() => callOllama(systemPrompt, userPrompt, true));
    const cleaned = text
      .replace(/```(?:json)?\s*/g, '')
      .replace(/```/g, '')
      .trim();

    try {
      return JSON.parse(cleaned) as AnswerEvaluation;
    } catch {
      return {
        score: 5,
        feedback: 'Không thể đánh giá câu trả lời từ Ollama.',
        strengths: [],
        weaknesses: [],
      };
    }
  }

  static async textToSpeech(
    text: string,
    language: string = 'vi'
  ): Promise<{ audioBase64: string; mimeType: string }> {
    // Tái sử dụng lại Cartesia cho TextToSpeech như Service cũ
    const apiKey = process.env.CARTESIA_API_KEY;
    if (!apiKey) throw new Error('CARTESIA_API_KEY is not configured');

    const voiceId =
      language === 'vi'
        ? process.env.CARTESIA_VOICE_ID_VI || '00a77add-48d5-4ef6-8157-71e5437b282d'
        : process.env.CARTESIA_VOICE_ID_EN || 'a0e99841-438c-4a64-b679-ae501e7d6091';

    const response = await fetch('https://api.cartesia.ai/tts/bytes', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Cartesia-Version': '2026-04-16',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_id: 'sonic-3',
        transcript: text,
        voice: { mode: 'id', id: voiceId },
        output_format: { container: 'mp3', bit_rate: 128000, sample_rate: 44100 },
        language: language === 'vi' ? 'vi' : 'en',
      }),
    });

    if (!response.ok) throw new Error(`Cartesia TTS failed: ${response.status}`);
    const audioBase64 = Buffer.from(await response.arrayBuffer()).toString('base64');
    return { audioBase64, mimeType: 'audio/mp3' };
  }
}

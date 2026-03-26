import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

import type {
  CvOptimizationAnalysis,
  CvOptimizationSuggestion,
} from '@/types/candidate/cv-optimization.types';

const GEMINI_MODEL = 'gemini-2.5-flash-lite';

const suggestionSchema = z.object({
  title: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : value),
    z.string().min(3)
  ),
  impact: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
    z.enum(['high', 'medium', 'low'])
  ),
  description: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : value),
    z.string().min(10)
  ),
  tagType: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
    z.enum(['skill', 'keyword', 'achievement', 'structure', 'ats'])
  ),
});

const analysisSchema = z.object({
  score: z.coerce.number().min(0).max(100),
  suggestions: z.array(suggestionSchema).min(1),
});

export class CvOptimizerServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'CvOptimizerServiceError';
  }
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimited = error?.status === 429 || error?.message?.includes?.('429');
      if (!isRateLimited || attempt === maxRetries) {
        throw error;
      }

      const delay = Math.pow(2, attempt) * 3000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new CvOptimizerServiceError(
    'AI could not analyze this CV right now. Please try again.',
    502
  );
}

function getModel() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new CvOptimizerServiceError('AI CV Optimizer is not configured.', 500);
  }

  return new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: GEMINI_MODEL });
}

function normalizeSuggestion(suggestion: CvOptimizationSuggestion): CvOptimizationSuggestion {
  return {
    title: suggestion.title.trim(),
    impact: suggestion.impact,
    description: suggestion.description.trim(),
    tagType: suggestion.tagType,
  };
}

function parseAnalysisResponse(rawText: string): CvOptimizationAnalysis {
  const cleaned = rawText
    .replace(/```(?:json)?\s*/gi, '')
    .replace(/```/g, '')
    .trim();

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse CV optimizer response:', rawText, error);
    throw new CvOptimizerServiceError(
      'AI could not generate a valid optimization result. Please try again.',
      502
    );
  }

  const validated = analysisSchema.safeParse(parsed);

  if (!validated.success) {
    console.error('Invalid CV optimizer payload:', validated.error.flatten(), parsed);
    throw new CvOptimizerServiceError(
      'AI could not generate a valid optimization result. Please try again.',
      502
    );
  }

  const suggestions = validated.data.suggestions
    .map(normalizeSuggestion)
    .filter((suggestion) => suggestion.title.length > 0 && suggestion.description.length > 0)
    .slice(0, 3);

  if (!suggestions.length) {
    throw new CvOptimizerServiceError(
      'AI could not generate a valid optimization result. Please try again.',
      502
    );
  }

  return {
    score: Math.round(validated.data.score),
    suggestions,
  };
}

export class CandidateCvOptimizerService {
  static async analyzeCv(cvText: string): Promise<CvOptimizationAnalysis> {
    if (!cvText.trim()) {
      throw new CvOptimizerServiceError('Could not extract sufficient text from this PDF CV.', 422);
    }

    const model = getModel();

    const prompt = `
Bạn là chuyên gia tối ưu CV và ATS cho ứng viên công nghệ.

Nhiệm vụ:
- Phân tích nội dung CV dưới đây.
- Chỉ dựa trên dữ liệu có trong CV, không bịa thêm kinh nghiệm, dự án, công nghệ hay thành tựu.
- Trả về đúng 3 gợi ý ưu tiên nhất để cải thiện CV.
- Viết hoàn toàn bằng tiếng Việt, ngắn gọn, hành động được.

Yêu cầu đầu ra:
- Chỉ trả về JSON thuần, không markdown, không giải thích thêm.
- Schema:
{
  "score": number,
  "suggestions": [
    {
      "title": "string",
      "impact": "high" | "medium" | "low",
      "description": "string",
      "tagType": "skill" | "keyword" | "achievement" | "structure" | "ats"
    }
  ]
}

Quy tắc chấm điểm:
- "score" là điểm chất lượng CV hiện tại từ 0 đến 100 dựa trên độ rõ ràng, tính đầy đủ, mức độ cụ thể thành tựu và khả năng tương thích ATS.

Quy tắc suggestion:
- "title" phải rất ngắn, cụ thể, tối đa khoảng 8 từ.
- "description" là 1 câu giải thích vì sao nên chỉnh.
- "impact" phản ánh mức ưu tiên thực tế.
- "tagType" chỉ dùng đúng 1 trong 5 giá trị hợp lệ.

Nội dung CV:
"""
${cvText}
"""
`.trim();

    let rawText = '';

    try {
      const result = await withRetry(() => model.generateContent(prompt));
      rawText = result.response.text().trim();
    } catch (error) {
      console.error('Gemini CV optimizer failed:', error);
      throw new CvOptimizerServiceError(
        'AI could not analyze this CV right now. Please try again.',
        502
      );
    }

    return parseAnalysisResponse(rawText);
  }
}

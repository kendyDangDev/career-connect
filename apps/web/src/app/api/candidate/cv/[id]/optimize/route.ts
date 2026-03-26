import { extractText } from 'unpdf';

import { UserType } from '@/generated/prisma';
import { withRole, AuthenticatedRequest } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import {
  CandidateCvOptimizerService,
  CvOptimizerServiceError,
} from '@/services/candidate/cv-optimizer.service';
import { errorResponse, serverErrorResponse, successResponse } from '@/utils/api-response';

const MAX_CV_TEXT_LENGTH = 20_000;

interface RouteParams {
  params: {
    id: string;
  };
}

function normalizeExtractedText(rawText: string): string {
  return rawText
    .replace(/\x00/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_CV_TEXT_LENGTH);
}

/**
 * POST /api/candidate/cv/[id]/optimize
 * Analyze a PDF CV and return AI optimization suggestions.
 */
export const POST = withRole([UserType.CANDIDATE], async (
  req: AuthenticatedRequest,
  { params }: RouteParams
) => {
  try {
    const { id } = params;

    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id },
      select: { id: true },
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    const cv = await prisma.candidateCv.findFirst({
      where: {
        id,
        candidateId: candidate.id,
      },
      select: {
        fileUrl: true,
        mimeType: true,
      },
    });

    if (!cv) {
      return errorResponse('CV not found', 404);
    }

    if (cv.mimeType !== 'application/pdf') {
      return errorResponse('AI CV Optimizer currently supports PDF files only.', 400);
    }

    let pdfResponse: Response;

    try {
      pdfResponse = await fetch(cv.fileUrl);
    } catch (error) {
      console.error('Failed to download CV PDF:', error);
      return errorResponse('Could not download the CV file for analysis.', 422);
    }

    if (!pdfResponse.ok) {
      return errorResponse('Could not download the CV file for analysis.', 422);
    }

    let extractedText = '';

    try {
      const arrayBuffer = await pdfResponse.arrayBuffer();
      const { text } = await extractText(new Uint8Array(arrayBuffer), { mergePages: true });
      extractedText = Array.isArray(text) ? text.join('\n') : text;
    } catch (error) {
      console.error('Failed to extract CV PDF text:', error);
      return errorResponse('Could not extract text from this PDF CV.', 422);
    }

    const normalizedCvText = normalizeExtractedText(extractedText);

    if (normalizedCvText.length < 80) {
      return errorResponse('Could not extract sufficient text from this PDF CV.', 422);
    }

    const analysis = await CandidateCvOptimizerService.analyzeCv(normalizedCvText);

    return successResponse({ analysis }, 'CV optimized successfully');
  } catch (error) {
    if (error instanceof CvOptimizerServiceError) {
      if (error.statusCode >= 500) {
        console.error('CV optimizer service error:', error);
      }

      return errorResponse(error.message, error.statusCode);
    }

    return serverErrorResponse('Failed to optimize CV', error);
  }
});

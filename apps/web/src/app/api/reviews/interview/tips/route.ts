import { NextRequest } from 'next/server';
import { InterviewReviewService } from '@/services/interview-review.service';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  validationErrorResponse,
} from '@/utils/api-response';
import { getInterviewTipsQuerySchema } from '@/lib/validations/interview-review.validation';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/reviews/interview/tips
 * Get interview tips for a company based on previous interview experiences
 */
export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validatedParams = getInterviewTipsQuerySchema.safeParse(queryParams);
    if (!validatedParams.success) {
      return validationErrorResponse(validatedParams.error.flatten().fieldErrors);
    }

    let companyId = validatedParams.data.companyId;

    // If only slug provided, get company ID
    if (!companyId && validatedParams.data.companySlug) {
      const company = await prisma.company.findUnique({
        where: { companySlug: validatedParams.data.companySlug },
        select: { id: true },
      });

      if (!company) {
        return errorResponse('Company not found', 404);
      }

      companyId = company.id;
    }

    const tips = await InterviewReviewService.getInterviewTips(companyId!);

    return successResponse({ tips }, 'Interview tips retrieved successfully');
  } catch (error) {
    return serverErrorResponse('Failed to retrieve interview tips', error);
  }
}

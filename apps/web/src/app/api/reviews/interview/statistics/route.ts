import { NextRequest } from 'next/server';
import { InterviewReviewService } from '@/services/interview-review.service';
import { successResponse, errorResponse, serverErrorResponse } from '@/utils/api-response';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/reviews/interview/statistics
 * Get interview statistics for a company
 */
export async function GET(req: NextRequest) {
  try {
    // Get company ID from query params
    const searchParams = req.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const companySlug = searchParams.get('companySlug');

    if (!companyId && !companySlug) {
      return errorResponse('Either companyId or companySlug is required', 400);
    }

    let finalCompanyId = companyId;

    // If only slug provided, get company ID
    if (!finalCompanyId && companySlug) {
      const company = await prisma.company.findUnique({
        where: { companySlug },
        select: { id: true },
      });

      if (!company) {
        return errorResponse('Company not found', 404);
      }

      finalCompanyId = company.id;
    }

    const statistics = await InterviewReviewService.getCompanyInterviewStatistics(finalCompanyId!);

    return successResponse({ statistics }, 'Interview statistics retrieved successfully');
  } catch (error) {
    return serverErrorResponse('Failed to retrieve interview statistics', error);
  }
}

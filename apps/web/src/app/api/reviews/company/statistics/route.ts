import { NextRequest } from 'next/server';
import { CompanyReviewService } from '@/services/company-review.service';
import { successResponse, errorResponse, serverErrorResponse } from '@/utils/api-response';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/reviews/company/statistics
 * Get company review statistics
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

    const statistics = await CompanyReviewService.getCompanyStatistics(finalCompanyId!);

    return successResponse({ statistics }, 'Statistics retrieved successfully');
  } catch (error) {
    return serverErrorResponse('Failed to retrieve statistics', error);
  }
}

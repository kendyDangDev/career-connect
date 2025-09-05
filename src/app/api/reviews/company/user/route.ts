import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CompanyReviewService } from '@/services/company-review.service';
import { 
  successResponse, 
  serverErrorResponse,
  unauthorizedResponse
} from '@/utils/api-response';

/**
 * GET /api/reviews/company/user
 * Get authenticated user's company reviews
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return unauthorizedResponse();
    }

    // Get query params
    const searchParams = req.nextUrl.searchParams;
    const includeUnapproved = searchParams.get('includeUnapproved') !== 'false';

    const reviews = await CompanyReviewService.getUserReviews(
      session.user.id,
      includeUnapproved
    );

    return successResponse({ 
      reviews,
      total: reviews.length 
    }, 'User reviews retrieved successfully');

  } catch (error) {
    return serverErrorResponse('Failed to retrieve user reviews', error);
  }
}

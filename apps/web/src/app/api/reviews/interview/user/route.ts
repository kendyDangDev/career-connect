export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { InterviewReviewService } from '@/services/interview-review.service';
import { successResponse, serverErrorResponse, unauthorizedResponse } from '@/utils/api-response';

/**
 * GET /api/reviews/interview/user
 * Get authenticated user's interview reviews
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return unauthorizedResponse();
    }

    const reviews = await InterviewReviewService.getUserInterviewReviews(session.user.id);

    return successResponse(
      {
        reviews,
        total: reviews.length,
      },
      'User interview reviews retrieved successfully'
    );
  } catch (error) {
    return serverErrorResponse('Failed to retrieve user interview reviews', error);
  }
}

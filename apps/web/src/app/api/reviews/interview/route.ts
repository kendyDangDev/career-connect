import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { InterviewReviewService } from '@/services/interview-review.service';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  validationErrorResponse,
  unauthorizedResponse,
} from '@/utils/api-response';
import {
  createInterviewReviewSchema,
  getInterviewReviewsQuerySchema,
} from '@/lib/validations/interview-review.validation';
import { UserType } from '@/generated/prisma';

/**
 * GET /api/reviews/interview
 * Get interview reviews with filters and pagination
 */
export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validatedParams = getInterviewReviewsQuerySchema.safeParse(queryParams);
    if (!validatedParams.success) {
      return validationErrorResponse(validatedParams.error.flatten().fieldErrors);
    }

    // Get reviews
    const result = await InterviewReviewService.getInterviewReviews(validatedParams.data);

    // If requesting by company, also get statistics
    if (validatedParams.data.companyId || validatedParams.data.companySlug) {
      const companyId =
        validatedParams.data.companyId ||
        (
          await InterviewReviewService.getInterviewReviews({
            companySlug: validatedParams.data.companySlug,
            limit: 1,
          })
        ).reviews[0]?.companyId;

      if (companyId) {
        const statistics = await InterviewReviewService.getCompanyInterviewStatistics(companyId);
        return successResponse(
          {
            ...result,
            statistics,
          },
          'Interview reviews retrieved successfully'
        );
      }
    }

    return successResponse(result, 'Interview reviews retrieved successfully');
  } catch (error) {
    return serverErrorResponse('Failed to retrieve interview reviews', error);
  }
}

/**
 * POST /api/reviews/interview
 * Create a new interview review (requires authentication)
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return unauthorizedResponse();
    }

    // Only candidates can create interview reviews
    if (session.user.userType !== UserType.CANDIDATE) {
      return errorResponse('Only candidates can create interview reviews', 403);
    }

    // Parse request body
    const body = await req.json();

    // Validate request body
    const validated = createInterviewReviewSchema.safeParse(body);
    if (!validated.success) {
      return validationErrorResponse(validated.error.flatten().fieldErrors);
    }

    // Check if user can review this interview
    const canReviewResult = await InterviewReviewService.canReviewInterview(
      session.user.id,
      validated.data.companyId,
      validated.data.jobId ?? undefined
    );

    if (!canReviewResult.canReview) {
      return errorResponse(canReviewResult.reason || 'Cannot review this interview', 400);
    }

    try {
      const review = await InterviewReviewService.createInterviewReview(
        session.user.id,
        validated.data
      );

      return successResponse({ review }, 'Interview review created successfully', 201);
    } catch (error: any) {
      if (error.message === 'Company not found') {
        return errorResponse('Company not found', 404);
      }
      if (error.message === 'Job not found') {
        return errorResponse('Job not found', 404);
      }
      if (error.message === 'Job does not belong to the specified company') {
        return errorResponse('Job does not belong to the specified company', 400);
      }
      if (error.message === 'You have already reviewed this interview') {
        return errorResponse('You have already reviewed this interview', 409);
      }
      throw error;
    }
  } catch (error) {
    return serverErrorResponse('Failed to create interview review', error);
  }
}

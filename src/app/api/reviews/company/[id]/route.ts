import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CompanyReviewService } from '@/services/company-review.service';
import { 
  successResponse, 
  errorResponse, 
  serverErrorResponse,
  validationErrorResponse,
  unauthorizedResponse
} from '@/utils/api-response';
import { updateCompanyReviewSchema } from '@/lib/validations/company-review.validation';
import { UserType } from '@/generated/prisma';

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/reviews/company/[id]
 * Get a specific company review by ID
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if requesting unapproved review
    const searchParams = req.nextUrl.searchParams;
    const includeUnapproved = searchParams.get('includeUnapproved') === 'true';
    
    if (includeUnapproved && session?.user.userType !== UserType.ADMIN) {
      // Non-admin users can only see their own unapproved reviews
      const review = await CompanyReviewService.getCompanyReviewById(params.id, true);
      
      if (!review) {
        return errorResponse('Review not found', 404);
      }
      
      if (review.reviewerId !== session?.user.id) {
        return errorResponse('Review not found', 404);
      }
    }
    
    const review = await CompanyReviewService.getCompanyReviewById(
      params.id,
      includeUnapproved
    );

    if (!review) {
      return errorResponse('Review not found', 404);
    }

    return successResponse({ review }, 'Review retrieved successfully');

  } catch (error) {
    return serverErrorResponse('Failed to retrieve review', error);
  }
}

/**
 * PUT /api/reviews/company/[id]
 * Update a company review (only by the reviewer)
 */
export async function PUT(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return unauthorizedResponse();
    }

    // Parse and validate request body
    const body = await req.json();
    const validated = updateCompanyReviewSchema.safeParse(body);
    if (!validated.success) {
      return validationErrorResponse(validated.error.flatten().fieldErrors);
    }

    try {
      const updatedReview = await CompanyReviewService.updateCompanyReview(
        params.id,
        session.user.id,
        validated.data
      );

      return successResponse({ review: updatedReview }, 'Review updated successfully');
    } catch (error: any) {
      if (error.message === 'Review not found or you do not have permission to update it') {
        return errorResponse('Review not found or unauthorized', 404);
      }
      throw error;
    }

  } catch (error) {
    return serverErrorResponse('Failed to update review', error);
  }
}

/**
 * DELETE /api/reviews/company/[id]
 * Delete a company review (only by the reviewer)
 */
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return unauthorizedResponse();
    }

    try {
      await CompanyReviewService.deleteCompanyReview(
        params.id,
        session.user.id
      );

      return successResponse(null, 'Review deleted successfully');
    } catch (error: any) {
      if (error.message === 'Review not found or you do not have permission to delete it') {
        return errorResponse('Review not found or unauthorized', 404);
      }
      throw error;
    }

  } catch (error) {
    return serverErrorResponse('Failed to delete review', error);
  }
}

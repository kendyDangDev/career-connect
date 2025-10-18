import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { CompanyReviewService } from '@/services/company-review.service';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  validationErrorResponse,
  unauthorizedResponse,
} from '@/utils/api-response';
import { adminUpdateReviewSchema } from '@/lib/validations/company-review.validation';
import { UserType } from '@/generated/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/reviews/company/[id]/approve
 * Approve or reject a company review (Admin only)
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return unauthorizedResponse();
    }

    // Check if user is admin
    if (session.user.userType !== UserType.ADMIN) {
      return errorResponse('Admin access required', 403);
    }

    // Parse and validate request body
    const body = await req.json();
    const validated = adminUpdateReviewSchema.safeParse(body);
    if (!validated.success) {
      return validationErrorResponse(validated.error.flatten().fieldErrors);
    }

    try {
      const { id } = await params;
      const updatedReview = await CompanyReviewService.adminUpdateReview(id, validated.data);

      return successResponse(
        { review: updatedReview },
        `Review ${validated.data.isApproved ? 'approved' : 'rejected'} successfully`
      );
    } catch (error: any) {
      if (error.message === 'Review not found') {
        return errorResponse('Review not found', 404);
      }
      throw error;
    }
  } catch (error) {
    return serverErrorResponse('Failed to update review status', error);
  }
}

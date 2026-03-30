export const dynamic = 'force-dynamic';
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
import { updateInterviewReviewSchema } from '@/lib/validations/interview-review.validation';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/reviews/interview/[id]
 * Get a specific interview review by ID
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const review = await InterviewReviewService.getInterviewReviewById(id);

    if (!review) {
      return errorResponse('Interview review not found', 404);
    }

    return successResponse({ review }, 'Interview review retrieved successfully');
  } catch (error) {
    return serverErrorResponse('Failed to retrieve interview review', error);
  }
}

/**
 * PUT /api/reviews/interview/[id]
 * Update an interview review (only by the reviewer)
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return unauthorizedResponse();
    }

    // Parse and validate request body
    const body = await req.json();
    const validated = updateInterviewReviewSchema.safeParse(body);
    if (!validated.success) {
      return validationErrorResponse(validated.error.flatten().fieldErrors);
    }

    const { id } = await params;
    try {
      const updatedReview = await InterviewReviewService.updateInterviewReview(
        id,
        session.user.id,
        validated.data
      );

      return successResponse({ review: updatedReview }, 'Interview review updated successfully');
    } catch (error: any) {
      if (error.message === 'Review not found or you do not have permission to update it') {
        return errorResponse('Interview review not found or unauthorized', 404);
      }
      throw error;
    }
  } catch (error) {
    return serverErrorResponse('Failed to update interview review', error);
  }
}

/**
 * DELETE /api/reviews/interview/[id]
 * Delete an interview review (only by the reviewer)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    try {
      await InterviewReviewService.deleteInterviewReview(id, session.user.id);

      return successResponse(null, 'Interview review deleted successfully');
    } catch (error: any) {
      if (error.message === 'Review not found or you do not have permission to delete it') {
        return errorResponse('Interview review not found or unauthorized', 404);
      }
      throw error;
    }
  } catch (error) {
    return serverErrorResponse('Failed to delete interview review', error);
  }
}

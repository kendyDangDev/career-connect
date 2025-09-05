import { NextRequest } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/middleware/auth';
import { CandidateEducationService } from '@/services/candidate/candidate-education.service';
import { 
  successResponse, 
  errorResponse, 
  serverErrorResponse,
  validationErrorResponse
} from '@/utils/api-response';
import { updateCandidateEducationSchema } from '@/lib/validations/candidate/education.validation';
import { UserType } from '@/generated/prisma';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/candidate/education/[id]
 * Get a specific education record for the authenticated candidate
 */
export const GET = withRole([UserType.CANDIDATE], async (
  req: AuthenticatedRequest,
  { params }: RouteParams
) => {
  try {
    // Get candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id }
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    // Get education record
    const education = await CandidateEducationService.getCandidateEducationById(
      params.id,
      candidate.id
    );

    if (!education) {
      return errorResponse('Education record not found', 404);
    }

    return successResponse({ education }, 'Education record retrieved successfully');

  } catch (error) {
    return serverErrorResponse('Failed to retrieve education record', error);
  }
});

/**
 * PUT /api/candidate/education/[id]
 * Update a specific education record for the authenticated candidate
 */
export const PUT = withRole([UserType.CANDIDATE], async (
  req: AuthenticatedRequest,
  { params }: RouteParams
) => {
  try {
    // Get candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id }
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    // Parse and validate request body
    const body = await req.json();
    const validated = updateCandidateEducationSchema.safeParse(body);
    if (!validated.success) {
      return validationErrorResponse(validated.error.flatten().fieldErrors);
    }

    try {
      const updatedEducation = await CandidateEducationService.updateCandidateEducation(
        params.id,
        candidate.id,
        validated.data
      );

      return successResponse({ education: updatedEducation }, 'Education record updated successfully');
    } catch (error: any) {
      if (error.message === 'Education record not found or does not belong to candidate') {
        return errorResponse('Education record not found', 404);
      }
      if (error.message === 'End date must be after start date') {
        return validationErrorResponse({
          endDate: ['End date must be after start date']
        });
      }
      throw error;
    }

  } catch (error) {
    return serverErrorResponse('Failed to update education record', error);
  }
});

/**
 * DELETE /api/candidate/education/[id]
 * Delete a specific education record for the authenticated candidate
 */
export const DELETE = withRole([UserType.CANDIDATE], async (
  req: AuthenticatedRequest,
  { params }: RouteParams
) => {
  try {
    // Get candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id }
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    try {
      await CandidateEducationService.deleteCandidateEducation(
        params.id,
        candidate.id
      );

      return successResponse(null, 'Education record deleted successfully');
    } catch (error: any) {
      if (error.message === 'Education record not found or does not belong to candidate') {
        return errorResponse('Education record not found', 404);
      }
      throw error;
    }

  } catch (error) {
    return serverErrorResponse('Failed to delete education record', error);
  }
});

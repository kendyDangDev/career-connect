import { NextRequest } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/middleware/auth';
import { JobAlertService } from '@/services/job-alert.service';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse,
  serverErrorResponse,
  validationErrorResponse,
  noContentResponse
} from '@/utils/api-response';
import { 
  validateUpdateJobAlert
} from '@/lib/validations/job-alert';
import { UserType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

interface Params {
  id: string;
}

/**
 * PUT /api/candidate/job-alerts/[id]
 * Update a job alert for the authenticated candidate
 */
export const PUT = withRole([UserType.CANDIDATE], async (
  req: AuthenticatedRequest,
  { params }: { params: Promise<Params> }
) => {
  try {
    // Get the job alert ID from params
    const { id } = await params;

    if (!id) {
      return errorResponse('Job alert ID is required', 400);
    }

    // Get candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id }
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = validateUpdateJobAlert(body);

    if (!validation.success) {
      return validationErrorResponse(
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    // Validate location IDs if provided
    if (validation.data.locationIds && validation.data.locationIds.length > 0) {
      const validLocationCount = await prisma.location.count({
        where: {
          id: { in: validation.data.locationIds },
          isActive: true
        }
      });

      if (validLocationCount !== validation.data.locationIds.length) {
        return validationErrorResponse({
          locationIds: ['One or more location IDs are invalid']
        });
      }
    }

    // Validate category IDs if provided
    if (validation.data.categoryIds && validation.data.categoryIds.length > 0) {
      const validCategoryCount = await prisma.category.count({
        where: {
          id: { in: validation.data.categoryIds },
          isActive: true
        }
      });

      if (validCategoryCount !== validation.data.categoryIds.length) {
        return validationErrorResponse({
          categoryIds: ['One or more category IDs are invalid']
        });
      }
    }

    // Update the job alert
    try {
      const updatedAlert = await JobAlertService.updateJobAlert({
        id,
        candidateId: candidate.id,
        data: validation.data
      });

      return successResponse(
        updatedAlert,
        'Job alert updated successfully'
      );

    } catch (error: any) {
      // Handle specific errors
      if (error.message === 'Job alert not found') {
        return notFoundResponse('Job alert');
      }
      throw error;
    }

  } catch (error) {
    return serverErrorResponse('Failed to update job alert', error);
  }
});

/**
 * DELETE /api/candidate/job-alerts/[id]
 * Delete a job alert for the authenticated candidate
 */
export const DELETE = withRole([UserType.CANDIDATE], async (
  req: AuthenticatedRequest,
  { params }: { params: Promise<Params> }
) => {
  try {
    // Get the job alert ID from params
    const { id } = await params;

    if (!id) {
      return errorResponse('Job alert ID is required', 400);
    }

    // Get candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id }
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    // Delete the job alert
    try {
      await JobAlertService.deleteJobAlert({
        id,
        candidateId: candidate.id
      });

      return noContentResponse();

    } catch (error: any) {
      // Handle specific errors
      if (error.message === 'Job alert not found') {
        return notFoundResponse('Job alert');
      }
      throw error;
    }

  } catch (error) {
    return serverErrorResponse('Failed to delete job alert', error);
  }
});

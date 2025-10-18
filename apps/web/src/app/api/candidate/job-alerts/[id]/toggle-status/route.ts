import { NextRequest } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/lib/middleware/auth';
import { JobAlertService } from '@/services/job-alert.service';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse,
  serverErrorResponse,
  validationErrorResponse
} from '@/utils/api-response';
import { 
  validateToggleJobAlertStatus
} from '@/lib/validations/job-alert';
import { UserType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

interface Params {
  id: string;
}

/**
 * PATCH /api/candidate/job-alerts/[id]/toggle-status
 * Toggle the active status of a job alert
 */
export const PATCH = withRole([UserType.CANDIDATE], async (
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
    const validation = validateToggleJobAlertStatus(body);

    if (!validation.success) {
      return validationErrorResponse(
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    // Toggle the status
    try {
      const updatedAlert = await JobAlertService.toggleJobAlertStatus({
        id,
        candidateId: candidate.id,
        isActive: validation.data.isActive
      });

      return successResponse(
        updatedAlert,
        `Job alert ${validation.data.isActive ? 'activated' : 'deactivated'} successfully`
      );

    } catch (error: any) {
      // Handle specific errors
      if (error.message === 'Job alert not found') {
        return notFoundResponse('Job alert');
      }
      throw error;
    }

  } catch (error) {
    return serverErrorResponse('Failed to toggle job alert status', error);
  }
});

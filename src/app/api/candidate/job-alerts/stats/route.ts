import { NextRequest } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/lib/middleware/auth';
import { JobAlertService } from '@/services/job-alert.service';
import { 
  successResponse, 
  errorResponse, 
  serverErrorResponse
} from '@/utils/api-response';
import { UserType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/candidate/job-alerts/stats
 * Get job alert statistics for the authenticated candidate
 */
export const GET = withRole([UserType.CANDIDATE], async (req: AuthenticatedRequest) => {
  try {
    // Get candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id }
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    // Get statistics
    const stats = await JobAlertService.getJobAlertStats(candidate.id);

    return successResponse(
      stats,
      'Job alert statistics retrieved successfully'
    );

  } catch (error) {
    return serverErrorResponse('Failed to retrieve job alert statistics', error);
  }
});


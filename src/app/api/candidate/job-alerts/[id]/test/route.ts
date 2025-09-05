import { NextRequest } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/middleware/auth';
import { JobAlertService } from '@/services/job-alert.service';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse,
  serverErrorResponse
} from '@/utils/api-response';
import { UserType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

interface Params {
  id: string;
}

/**
 * GET /api/candidate/job-alerts/[id]/test
 * Test a job alert by finding matching jobs
 */
export const GET = withRole([UserType.CANDIDATE], async (
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

    // Test the job alert
    try {
      const testResult = await JobAlertService.testJobAlert({
        id,
        candidateId: candidate.id
      });

      return successResponse({
        alert: testResult.alert,
        matchingJobs: testResult.matchingJobs,
        totalMatches: testResult.totalMatches,
        message: `Found ${testResult.totalMatches} matching job${testResult.totalMatches !== 1 ? 's' : ''}`
      }, 'Job alert tested successfully');

    } catch (error: any) {
      // Handle specific errors
      if (error.message === 'Job alert not found') {
        return notFoundResponse('Job alert');
      }
      throw error;
    }

  } catch (error) {
    return serverErrorResponse('Failed to test job alert', error);
  }
});

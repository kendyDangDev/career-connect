import { NextRequest } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/middleware/auth';
import { SavedJobService } from '@/services/saved-job.service';
import { 
  successResponse, 
  errorResponse, 
  serverErrorResponse
} from '@/utils/api-response';
import { UserType } from '@/generated/prisma';
import {prisma} from '@/lib/prisma';

interface Params {
  jobId: string;
}

/**
 * GET /api/candidate/saved-jobs/check/[jobId]
 * Check if a job is saved by the authenticated candidate
 */
export const GET = withRole([UserType.CANDIDATE], async (
  req: AuthenticatedRequest,
  { params }: { params: Params | Promise<Params> }
) => {
  try {
    // Get the job ID from params
    const resolvedParams = await Promise.resolve(params);
    const { jobId } = resolvedParams;

    if (!jobId) {
      return errorResponse('Job ID is required', 400);
    }

    // Get candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id }
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    // Check if job is saved
    const result = await SavedJobService.checkJobSaved({
      candidateId: candidate.id,
      jobId
    });

    return successResponse(result, 'Check completed successfully');

  } catch (error) {
    return serverErrorResponse('Failed to check saved status', error);
  }
});

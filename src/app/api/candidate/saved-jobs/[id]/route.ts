import { NextRequest } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/middleware/auth';
import { SavedJobService } from '@/services/saved-job.service';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/utils/api-response';
import { UserType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

interface Params {
  id: string;
}

/**
 * DELETE /api/candidate/saved-jobs/[id]
 * Remove a saved job for the authenticated candidate
 */
export const DELETE = withRole(
  [UserType.CANDIDATE],
  async (req: AuthenticatedRequest, { params }: { params: Promise<Params> }) => {
    try {
      // Get the saved job ID from params
      const { id: savedJobId } = await params;

      if (!savedJobId) {
        return errorResponse('Saved job ID is required', 400);
      }

      // Get candidate record
      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user!.id },
      });

      if (!candidate) {
        return errorResponse('Candidate profile not found', 404);
      }

      // Delete the saved job
      try {
        await SavedJobService.unsaveJob({
          candidateId: candidate.id,
          savedJobId,
        });

        return successResponse(
          {
            message: 'Job removed from saved list successfully',
          },
          'Job removed from saved list successfully'
        );
      } catch (error: any) {
        // Handle specific errors
        if (error.message === 'Saved job not found') {
          return notFoundResponse('Saved job');
        }
        throw error;
      }
    } catch (error) {
      return serverErrorResponse('Failed to remove saved job', error);
    }
  }
);

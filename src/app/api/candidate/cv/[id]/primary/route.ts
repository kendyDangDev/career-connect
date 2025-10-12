import { NextRequest } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/lib/middleware/auth';
import { CandidateCvService } from '@/services/candidate/candidate-cv.service';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/utils/api-response';
import { UserType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * PUT /api/candidate/cv/[id]/primary
 * Set a CV as the primary CV for the candidate
 */
export const PUT = withRole([UserType.CANDIDATE], async (
  req: AuthenticatedRequest,
  { params }: RouteParams
) => {
  try {
    const { id } = params;

    // Get candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id },
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    // Set CV as primary
    const updatedCv = await CandidateCvService.setPrimaryCv(id, candidate.id);

    return successResponse(
      { cv: updatedCv },
      'CV set as primary successfully'
    );
  } catch (error: any) {
    if (error.message === 'CV not found') {
      return errorResponse('CV not found', 404);
    }
    return serverErrorResponse('Failed to set primary CV', error);
  }
});
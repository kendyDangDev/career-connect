import { withRole, AuthenticatedRequest } from '@/lib/middleware/auth';
import { UserType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/utils/api-response';
import { JobRecommendationService } from '@/services/job-recommendation.service';

export const GET = withRole([UserType.CANDIDATE], async (req: AuthenticatedRequest) => {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id },
      select: { id: true },
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    const recommendation = await JobRecommendationService.getCandidateRecommendations(req.user!.id, {
      limit: 10,
      seedLimit: 5,
    });

    return successResponse(
      recommendation,
      'Candidate recommendations retrieved successfully'
    );
  } catch (error) {
    return serverErrorResponse('Failed to retrieve candidate recommendations', error);
  }
});

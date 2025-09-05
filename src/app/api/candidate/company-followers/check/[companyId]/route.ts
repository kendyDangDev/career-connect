import { NextRequest } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/middleware/auth';
import { CompanyFollowerService } from '@/services/candidate/company-follower.service';
import { 
  successResponse, 
  errorResponse, 
  serverErrorResponse
} from '@/utils/api-response';
import { UserType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/candidate/company-followers/check/[companyId]
 * Check if the authenticated candidate is following a specific company
 */
export const GET = withRole([UserType.CANDIDATE], async (
  req: AuthenticatedRequest,
  { params }: { params: { companyId: string } }
) => {
  try {
    // Get candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id }
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    const { companyId } = params;

    // Validate company ID
    if (!companyId) {
      return errorResponse('Company ID is required', 400);
    }

    // Check if following
    const isFollowing = await CompanyFollowerService.checkCompanyFollowed({
      candidateId: candidate.id,
      companyId
    });

    return successResponse({
      companyId,
      isFollowing
    }, 'Follow status retrieved successfully');

  } catch (error) {
    return serverErrorResponse('Failed to check follow status', error);
  }
});

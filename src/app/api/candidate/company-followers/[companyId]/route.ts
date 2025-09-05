import { NextRequest } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/middleware/auth';
import { CompanyFollowerService } from '@/services/candidate/company-follower.service';
import { 
  successResponse, 
  errorResponse, 
  serverErrorResponse,
  noContentResponse
} from '@/utils/api-response';
import { UserType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/candidate/company-followers/[companyId]
 * Unfollow a company for the authenticated candidate
 */
export const DELETE = withRole([UserType.CANDIDATE], async (
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

    // Unfollow the company
    try {
      await CompanyFollowerService.unfollowCompany({
        candidateId: candidate.id,
        companyId
      });

      return noContentResponse();

    } catch (error: any) {
      // Handle specific errors
      if (error.message === 'Not following this company') {
        return errorResponse('You are not following this company', 404);
      }
      throw error;
    }

  } catch (error) {
    return serverErrorResponse('Failed to unfollow company', error);
  }
});

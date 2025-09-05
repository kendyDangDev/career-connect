import { NextRequest } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/middleware/auth';
import { CompanyFollowerService } from '@/services/candidate/company-follower.service';
import { 
  successResponse, 
  errorResponse, 
  serverErrorResponse,
  validationErrorResponse
} from '@/utils/api-response';
import { UserType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

interface BulkFollowRequest {
  companyIds: string[];
}

interface BulkUnfollowRequest {
  companyIds: string[];
}

/**
 * POST /api/candidate/company-followers/bulk
 * Bulk follow multiple companies
 */
export const POST = withRole([UserType.CANDIDATE], async (req: AuthenticatedRequest) => {
  try {
    // Get candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id }
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    // Parse request body
    const body = await req.json() as BulkFollowRequest;

    // Validate request
    if (!body.companyIds || !Array.isArray(body.companyIds)) {
      return validationErrorResponse({
        companyIds: 'Company IDs must be an array'
      });
    }

    if (body.companyIds.length === 0) {
      return validationErrorResponse({
        companyIds: 'At least one company ID is required'
      });
    }

    if (body.companyIds.length > 50) {
      return validationErrorResponse({
        companyIds: 'Cannot follow more than 50 companies at once'
      });
    }

    // Bulk follow companies
    const result = await CompanyFollowerService.bulkFollowCompanies({
      candidateId: candidate.id,
      companyIds: body.companyIds
    });

    return successResponse({
      ...result,
      summary: {
        followed: result.followed.length,
        alreadyFollowed: result.alreadyFollowed.length,
        notFound: result.notFound.length
      }
    }, 'Bulk follow operation completed');

  } catch (error) {
    return serverErrorResponse('Failed to bulk follow companies', error);
  }
});

/**
 * DELETE /api/candidate/company-followers/bulk
 * Bulk unfollow multiple companies
 */
export const DELETE = withRole([UserType.CANDIDATE], async (req: AuthenticatedRequest) => {
  try {
    // Get candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id }
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    // Parse request body
    const body = await req.json() as BulkUnfollowRequest;

    // Validate request
    if (!body.companyIds || !Array.isArray(body.companyIds)) {
      return validationErrorResponse({
        companyIds: 'Company IDs must be an array'
      });
    }

    if (body.companyIds.length === 0) {
      return validationErrorResponse({
        companyIds: 'At least one company ID is required'
      });
    }

    if (body.companyIds.length > 50) {
      return validationErrorResponse({
        companyIds: 'Cannot unfollow more than 50 companies at once'
      });
    }

    // Bulk unfollow companies
    const result = await CompanyFollowerService.bulkUnfollowCompanies({
      candidateId: candidate.id,
      companyIds: body.companyIds
    });

    return successResponse({
      ...result,
      summary: {
        unfollowed: result.unfollowed.length,
        notFollowing: result.notFollowing.length
      }
    }, 'Bulk unfollow operation completed');

  } catch (error) {
    return serverErrorResponse('Failed to bulk unfollow companies', error);
  }
});

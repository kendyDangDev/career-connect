import { NextRequest, NextResponse } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/lib/middleware';
import { CompanyFollowerService } from '@/services/candidate/company-follower.service';
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse,
  parseQueryParams,
  serverErrorResponse,
  validationErrorResponse,
  conflictResponse
} from '@/utils/api-response';
import { 
  CompanyFollowerFilters,
  FollowCompanyRequest
} from '@/types/company-follower.types';
import { UserType, CompanySize, VerificationStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';




/**
 * GET /api/candidate/company-followers
 * Get list of companies followed by the authenticated candidate
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

    // Parse query parameters
    const searchParams = new URL(req.url).searchParams;
    const params = parseQueryParams(searchParams, {
      page: 1,
      limit: 20,
      sortBy: 'followedAt',
      sortOrder: 'desc'
    });

    // Build filters
    const filters: CompanyFollowerFilters = {
      search: params.search,
      industryId: params.industryId,
      companySize: params.companySize as CompanySize[],
      verificationStatus: params.verificationStatus as VerificationStatus[],
      city: params.city,
      province: params.province,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder
    };

    // Validate pagination
    const page = Math.max(1, params.page);
    const limit = Math.min(100, Math.max(1, params.limit));

    // Get followed companies
    const { followedCompanies, total } = await CompanyFollowerService.getFollowedCompanies({
      candidateId: candidate.id,
      filters,
      pagination: { page, limit }
    });

    // Return paginated response
    return paginatedResponse(
      followedCompanies,
      page,
      limit,
      total,
      'Followed companies retrieved successfully'
    );

  } catch (error) {
    return serverErrorResponse('Failed to retrieve followed companies', error);
  }
});

/**
 * POST /api/candidate/company-followers
 * Follow a company for the authenticated candidate 
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
    const body = await req.json() as FollowCompanyRequest;

    // Validate request
    if (!body.companyId) {
      return validationErrorResponse({
        companyId: 'Company ID is required'
      });
    }

    // Follow the company
    try {
      const companyFollower = await CompanyFollowerService.followCompany({
        candidateId: candidate.id,
        companyId: body.companyId
      });

      return successResponse({
        companyFollower,
        message: 'Company followed successfully'
      }, 'Company followed successfully', 201);

    } catch (error: any) {
      // Handle specific errors
      if (error.message === 'Already following this company') {
        return conflictResponse('You are already following this company');
      }
      if (error.message === 'Company not found') {
        return errorResponse('Company not found', 404);
      }
      throw error;
    }

  } catch (error) {
    return serverErrorResponse('Failed to follow company', error);
  }
});


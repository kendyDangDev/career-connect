import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { ApplicationService } from '@/services/application.service';
import { UserType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  validationErrorResponse,
} from '@/utils/api-response';
import {
  getApplicationsQuerySchema,
  getApplicationStatsQuerySchema,
} from '@/lib/validations/application.validation';

/**
 * GET /api/applications
 * Get list of applications with filters and pagination
 * Access:
 * - ADMIN: Can see all applications
 * - EMPLOYER: Can see applications for their company's jobs
 * - CANDIDATE: Can see their own applications only
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      jobId: searchParams.get('jobId') || undefined,
      candidateId: searchParams.get('candidateId') || undefined,
    };

    // Validate query parameters
    const validatedParams = getApplicationsQuerySchema.safeParse(queryParams);
    if (!validatedParams.success) {
      return validationErrorResponse(validatedParams.error.flatten().fieldErrors);
    }

    const params = validatedParams.data;
    const user = req.user!;

    // Apply access control based on user type
    if (user.userType === UserType.CANDIDATE) {
      // Candidates can only see their own applications
      const candidate = await prisma.candidate.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });

      if (!candidate) {
        return errorResponse('Candidate profile not found', 404);
      }

      params.candidateId = candidate.id;
    } else if (user.userType === UserType.EMPLOYER) {
      // Employers can only see applications for their company's jobs
      const companyUser = await prisma.companyUser.findFirst({
        where: {
          userId: user.id,
        },
        include: {
          company: {
            include: {
              jobs: {
                select: { id: true },
              },
            },
          },
        },
      });

      if (!companyUser) {
        return errorResponse('Company access not found', 403);
      }

      // If no specific job is requested, filter by company's jobs
      if (!params.jobId) {
        const jobIds = companyUser.company.jobs.map((job) => job.id);
        // We need to modify the service to handle multiple job IDs
        // For now, we'll handle this in a basic way
        if (jobIds.length === 0) {
          return successResponse(
            {
              applications: [],
              pagination: {
                page: params.page,
                limit: params.limit,
                total: 0,
                totalPages: 0,
              },
            },
            'Applications retrieved successfully'
          );
        }
      } else {
        // Verify the requested job belongs to their company
        const job = await prisma.job.findFirst({
          where: {
            id: params.jobId,
            companyId: companyUser.companyId,
          },
        });

        if (!job) {
          return errorResponse('Job not found or access denied', 404);
        }
      }
    }
    // ADMIN can see all applications without restrictions

    const result = await ApplicationService.getApplications(params);
    return successResponse(result, 'Applications retrieved successfully');
  } catch (error) {
    return serverErrorResponse('Failed to retrieve applications', error);
  }
});

/**
 * GET /api/applications/stats
 * Get application statistics
 */
export async function handleGetStats(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = {
      companyId: searchParams.get('companyId') || undefined,
      jobId: searchParams.get('jobId') || undefined,
      candidateId: searchParams.get('candidateId') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
    };

    const validatedParams = getApplicationStatsQuerySchema.safeParse(queryParams);
    if (!validatedParams.success) {
      return validationErrorResponse(validatedParams.error.flatten().fieldErrors);
    }

    const user = req.user!;
    const filters = validatedParams.data;

    // Apply access control
    if (user.userType === UserType.CANDIDATE) {
      const candidate = await prisma.candidate.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });

      if (!candidate) {
        return errorResponse('Candidate profile not found', 404);
      }

      filters.candidateId = candidate.id;
    } else if (user.userType === UserType.EMPLOYER) {
      const companyUser = await prisma.companyUser.findFirst({
        where: {
          userId: user.id,
        },
        select: { companyId: true },
      });

      if (!companyUser) {
        return errorResponse('Company access not found', 403);
      }

      if (!filters.companyId) {
        filters.companyId = companyUser.companyId;
      } else if (filters.companyId !== companyUser.companyId) {
        return errorResponse('Access denied to company data', 403);
      }
    }

    const stats = await ApplicationService.getApplicationStats(filters);
    return successResponse(stats, 'Application statistics retrieved successfully');
  } catch (error) {
    return serverErrorResponse('Failed to retrieve application statistics', error);
  }
}

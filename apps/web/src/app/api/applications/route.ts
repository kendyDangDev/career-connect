import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { ApplicationService, type ApplicationListParams } from '@/services/application.service';
import { UserType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  validationErrorResponse,
} from '@/utils/api-response';
import { getApplicationsQuerySchema } from '@/lib/validations/application.validation';

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
    const statusArrayParams = searchParams.getAll('status[]');
    const queryParams = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
      search: searchParams.get('search') || undefined,
      status:
        statusArrayParams.length > 0
          ? statusArrayParams
          : (searchParams.get('status') ?? undefined),
      jobId: searchParams.get('jobId') || undefined,
      candidateId: searchParams.get('candidateId') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
    };

    // Validate query parameters
    const validatedParams = getApplicationsQuerySchema.safeParse(queryParams);
    if (!validatedParams.success) {
      return validationErrorResponse(validatedParams.error.flatten().fieldErrors);
    }

    const params: ApplicationListParams = {
      ...validatedParams.data,
    };
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

        params.jobIds = jobIds;
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

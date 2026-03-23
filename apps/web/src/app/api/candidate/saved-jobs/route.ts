import { NextRequest, NextResponse } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/lib/middleware/auth';
import { SavedJobService } from '@/services/saved-job.service';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  parseQueryParams,
  serverErrorResponse,
  validationErrorResponse,
  conflictResponse,
} from '@/utils/api-response';
import { SavedJobFilters, SaveJobRequest } from '@/types/saved-job.types';
import { UserType, JobType, WorkLocationType, ExperienceLevel } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/candidate/saved-jobs
 * Get list of saved jobs for the authenticated candidate
 */
export const GET = withRole([UserType.CANDIDATE], async (req: AuthenticatedRequest) => {
  try {
    // Get candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id },
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    // Parse query parameters
    const searchParams = new URL(req.url).searchParams;
    const params = parseQueryParams(searchParams, {
      page: 1,
      limit: 20,
      sortBy: 'savedAt',
      sortOrder: 'desc',
    });

    // Build filters
    const filters: SavedJobFilters = {
      search: params.search,
      applicationStatus:
        params.applicationStatus === 'open' || params.applicationStatus === 'expired'
          ? params.applicationStatus
          : undefined,
      jobType: params.jobType as JobType[],
      workLocationType: params.workLocationType as WorkLocationType[],
      experienceLevel: params.experienceLevel as ExperienceLevel[],
      salaryMin: params.salaryMin,
      salaryMax: params.salaryMax,
      locationCity: params.locationCity,
      locationProvince: params.locationProvince,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    };

    // Validate pagination
    const page = Math.max(1, params.page);
    const limit = Math.min(100, Math.max(1, params.limit));

    // Get saved jobs
    const { savedJobs, total } = await SavedJobService.getSavedJobs({
      candidateId: candidate.id,
      filters,
      pagination: { page, limit },
    });

    // Return paginated response
    return paginatedResponse(savedJobs, page, limit, total, 'Saved jobs retrieved successfully');
  } catch (error) {
    return serverErrorResponse('Failed to retrieve saved jobs', error);
  }
});

/**
 * POST /api/candidate/saved-jobs
 * Save a job for the authenticated candidate
 */
export const POST = withRole([UserType.CANDIDATE], async (req: AuthenticatedRequest) => {
  try {
    // Get candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id },
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    // Parse request body
    const body = (await req.json()) as SaveJobRequest;

    // Validate request
    if (!body.jobId) {
      return validationErrorResponse({
        jobId: 'Job ID is required',
      });
    }

    // Save the job
    try {
      const savedJob = await SavedJobService.saveJob({
        candidateId: candidate.id,
        jobId: body.jobId,
      });

      return successResponse(
        {
          savedJob,
          message: 'Job saved successfully',
        },
        'Job saved successfully',
        201
      );
    } catch (error: any) {
      // Handle specific errors
      if (error.message === 'Job already saved') {
        return conflictResponse('You have already saved this job');
      }
      if (error.message === 'Job not found or not active') {
        return errorResponse('Job not found or is no longer available', 404);
      }
      throw error;
    }
  } catch (error) {
    return serverErrorResponse('Failed to save job', error);
  }
});

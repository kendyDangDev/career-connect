import { NextRequest } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/lib/middleware';
import { CandidateExperienceService } from '@/services/candidate/candidate-experience.service';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  validationErrorResponse,
} from '@/utils/api-response';
import {
  createCandidateExperienceSchema,
  bulkCreateCandidateExperienceSchema,
  getCandidateExperienceQuerySchema,
} from '@/lib/validations/candidate/experience.validation';
import { UserType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/candidate/experience
 * Get list of experience records for the authenticated candidate
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
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validatedParams = getCandidateExperienceQuerySchema.safeParse(queryParams);
    if (!validatedParams.success) {
      return validationErrorResponse(validatedParams.error.flatten().fieldErrors);
    }

    // Get experience records
    const result = await CandidateExperienceService.getCandidateExperience({
      candidateId: candidate.id,
      sortBy: validatedParams.data.sortBy,
      sortOrder: validatedParams.data.sortOrder,
      includeDescription: validatedParams.data.includeDescription,
      isCurrent: validatedParams.data.isCurrent,
    });

    // Get statistics
    const stats = await CandidateExperienceService.getCandidateExperienceStatistics(candidate.id);

    // Get summary
    const summary = await CandidateExperienceService.getCandidateExperienceSummary(candidate.id);

    return successResponse(
      {
        ...result,
        statistics: stats,
        summary: summary,
      },
      'Experience records retrieved successfully'
    );
  } catch (error) {
    return serverErrorResponse('Failed to retrieve experience records', error);
  }
});

/**
 * POST /api/candidate/experience
 * Add a new experience record or bulk add experience records for the authenticated candidate
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
    const body = await req.json();

    // Check if it's bulk create or single create
    const isBulkCreate = body.experiences && Array.isArray(body.experiences);

    if (isBulkCreate) {
      // Validate bulk create
      const validated = bulkCreateCandidateExperienceSchema.safeParse(body);
      if (!validated.success) {
        return validationErrorResponse(validated.error.flatten().fieldErrors);
      }

      try {
        const result = await CandidateExperienceService.bulkCreateCandidateExperience(
          candidate.id,
          validated.data
        );

        return successResponse(result, 'Experience records added successfully', 201);
      } catch (error: any) {
        if (error.message === 'Candidate not found') {
          return errorResponse('Candidate profile not found', 404);
        }
        if (error.message.includes('Current position cannot have an end date')) {
          return validationErrorResponse({
            experiences: [error.message],
          });
        }
        if (error.message.includes('Non-current position must have an end date')) {
          return validationErrorResponse({
            experiences: [error.message],
          });
        }
        throw error;
      }
    } else {
      // Validate single create
      const validated = createCandidateExperienceSchema.safeParse(body);
      if (!validated.success) {
        return validationErrorResponse(validated.error.flatten().fieldErrors);
      }

      try {
        const experience = await CandidateExperienceService.createCandidateExperience(
          candidate.id,
          validated.data
        );

        return successResponse({ experience }, 'Experience record added successfully', 201);
      } catch (error: any) {
        if (error.message === 'Candidate not found') {
          return errorResponse('Candidate profile not found', 404);
        }
        if (error.message === 'Current position cannot have an end date') {
          return validationErrorResponse({
            endDate: ['Current position cannot have an end date'],
          });
        }
        if (error.message === 'Non-current position must have an end date') {
          return validationErrorResponse({
            endDate: ['Non-current position must have an end date'],
          });
        }
        throw error;
      }
    }
  } catch (error) {
    return serverErrorResponse('Failed to add experience record', error);
  }
});


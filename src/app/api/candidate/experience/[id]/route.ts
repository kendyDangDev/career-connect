import { NextRequest } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/middleware/auth';
import { CandidateExperienceService } from '@/services/candidate/candidate-experience.service';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  validationErrorResponse,
} from '@/utils/api-response';
import { updateCandidateExperienceSchema } from '@/lib/validations/candidate/experience.validation';
import { UserType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/candidate/experience/[id]
 * Get a specific experience record for the authenticated candidate
 */
export const GET = withRole(
  [UserType.CANDIDATE],
  async (req: AuthenticatedRequest, { params }: RouteParams) => {
    try {
      // Get candidate record
      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user!.id },
      });

      if (!candidate) {
        return errorResponse('Candidate profile not found', 404);
      }

      // Get experience record
      const experience = await CandidateExperienceService.getCandidateExperienceById(
        params.id,
        candidate.id
      );

      if (!experience) {
        return errorResponse('Experience record not found', 404);
      }

      return successResponse({ experience }, 'Experience record retrieved successfully');
    } catch (error) {
      return serverErrorResponse('Failed to retrieve experience record', error);
    }
  }
);

/**
 * PUT /api/candidate/experience/[id]
 * Update a specific experience record for the authenticated candidate
 */
export const PUT = withRole(
  [UserType.CANDIDATE],
  async (req: AuthenticatedRequest, { params }: RouteParams) => {
    try {
      // Get candidate record
      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user!.id },
      });

      if (!candidate) {
        return errorResponse('Candidate profile not found', 404);
      }

      // Parse and validate request body
      const body = await req.json();
      const validated = updateCandidateExperienceSchema.safeParse(body);
      if (!validated.success) {
        return validationErrorResponse(validated.error.flatten().fieldErrors);
      }

      try {
        const updatedExperience = await CandidateExperienceService.updateCandidateExperience(
          params.id,
          candidate.id,
          validated.data
        );

        return successResponse(
          { experience: updatedExperience },
          'Experience record updated successfully'
        );
      } catch (error: any) {
        if (error.message === 'Experience record not found or does not belong to candidate') {
          return errorResponse('Experience record not found', 404);
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
        if (error.message === 'End date must be after start date') {
          return validationErrorResponse({
            endDate: ['End date must be after start date'],
          });
        }
        throw error;
      }
    } catch (error) {
      return serverErrorResponse('Failed to update experience record', error);
    }
  }
);

/**
 * DELETE /api/candidate/experience/[id]
 * Delete a specific experience record for the authenticated candidate
 */
export const DELETE = withRole(
  [UserType.CANDIDATE],
  async (req: AuthenticatedRequest, { params }: RouteParams) => {
    try {
      // Get candidate record
      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user!.id },
      });

      if (!candidate) {
        return errorResponse('Candidate profile not found', 404);
      }

      try {
        await CandidateExperienceService.deleteCandidateExperience(params.id, candidate.id);

        return successResponse(null, 'Experience record deleted successfully');
      } catch (error: any) {
        if (error.message === 'Experience record not found or does not belong to candidate') {
          return errorResponse('Experience record not found', 404);
        }
        throw error;
      }
    } catch (error) {
      return serverErrorResponse('Failed to delete experience record', error);
    }
  }
);

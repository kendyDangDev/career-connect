import { NextRequest } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/middleware/auth';
import { CandidateSkillService } from '@/services/candidate/candidate-skill.service';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  validationErrorResponse,
} from '@/utils/api-response';
import { updateCandidateSkillSchema } from '@/lib/validations/candidate/skill.validation';
import { UserType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/candidate/skills/[id]
 * Get a specific skill for the authenticated candidate
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

      // Get skill
      const skill = await CandidateSkillService.getCandidateSkillById(params.id, candidate.id);

      if (!skill) {
        return errorResponse('Skill not found', 404);
      }

      return successResponse({ skill }, 'Skill retrieved successfully');
    } catch (error) {
      return serverErrorResponse('Failed to retrieve skill', error);
    }
  }
);

/**
 * PUT /api/candidate/skills/[id]
 * Update a specific skill for the authenticated candidate
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
      const validated = updateCandidateSkillSchema.safeParse(body);
      if (!validated.success) {
        return validationErrorResponse(validated.error.flatten().fieldErrors);
      }

      try {
        const updatedSkill = await CandidateSkillService.updateCandidateSkill(
          params.id,
          candidate.id,
          validated.data
        );

        return successResponse({ skill: updatedSkill }, 'Skill updated successfully');
      } catch (error: any) {
        if (error.message === 'Skill not found or does not belong to candidate') {
          return errorResponse('Skill not found', 404);
        }
        throw error;
      }
    } catch (error) {
      return serverErrorResponse('Failed to update skill', error);
    }
  }
);

/**
 * DELETE /api/candidate/skills/[id]
 * Delete a specific skill for the authenticated candidate
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
        await CandidateSkillService.deleteCandidateSkill(params.id, candidate.id);

        return successResponse(null, 'Skill deleted successfully');
      } catch (error: any) {
        if (error.message === 'Skill not found or does not belong to candidate') {
          return errorResponse('Skill not found', 404);
        }
        throw error;
      }
    } catch (error) {
      return serverErrorResponse('Failed to delete skill', error);
    }
  }
);

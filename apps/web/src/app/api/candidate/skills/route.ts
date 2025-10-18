import { NextRequest } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/lib/middleware/auth';
import { CandidateSkillService } from '@/services/candidate/candidate-skill.service';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  validationErrorResponse,
  conflictResponse,
} from '@/utils/api-response';
import {
  createCandidateSkillSchema,
  bulkCreateCandidateSkillsSchema,
  getCandidateSkillsQuerySchema,
} from '@/lib/validations/candidate/skill.validation';
import { UserType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/candidate/skills
 * Get list of skills for the authenticated candidate
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
    const validatedParams = getCandidateSkillsQuerySchema.safeParse(queryParams);
    if (!validatedParams.success) {
      return validationErrorResponse(validatedParams.error.flatten().fieldErrors);
    }

    // Get skills
    const result = await CandidateSkillService.getCandidateSkills({
      candidateId: candidate.id,
      includeSkillDetails: validatedParams.data.includeSkillDetails,
    });

    return successResponse(result, 'Skills retrieved successfully');
  } catch (error) {
    return serverErrorResponse('Failed to retrieve skills', error);
  }
});

/**
 * POST /api/candidate/skills
 * Add a new skill or bulk add skills for the authenticated candidate
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
    const isBulkCreate = body.skills && Array.isArray(body.skills);

    if (isBulkCreate) {
      // Validate bulk create
      const validated = bulkCreateCandidateSkillsSchema.safeParse(body);
      if (!validated.success) {
        return validationErrorResponse(validated.error.flatten().fieldErrors);
      }

      try {
        const result = await CandidateSkillService.bulkCreateCandidateSkills(
          candidate.id,
          validated.data
        );

        return successResponse(result, 'Skills added successfully', 201);
      } catch (error: any) {
        if (error.message === 'One or more skills not found') {
          return errorResponse('One or more skills do not exist', 400);
        }
        if (error.message === 'All skills already exist for this candidate') {
          return conflictResponse('All specified skills already exist');
        }
        throw error;
      }
    } else {
      // Validate single create
      const validated = createCandidateSkillSchema.safeParse(body);
      if (!validated.success) {
        return validationErrorResponse(validated.error.flatten().fieldErrors);
      }

      try {
        const skill = await CandidateSkillService.createCandidateSkill(
          candidate.id,
          validated.data
        );

        return successResponse({ skill }, 'Skill added successfully', 201);
      } catch (error: any) {
        if (error.message === 'Skill not found') {
          return errorResponse('Skill does not exist', 404);
        }
        if (error.message === 'Candidate already has this skill') {
          return conflictResponse('You already have this skill');
        }
        throw error;
      }
    }
  } catch (error) {
    return serverErrorResponse('Failed to add skill', error);
  }
});

import { NextRequest } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/middleware/auth';
import { CandidateEducationService } from '@/services/candidate/candidate-education.service';
import { 
  successResponse, 
  errorResponse, 
  serverErrorResponse,
  validationErrorResponse
} from '@/utils/api-response';
import {
  createCandidateEducationSchema,
  bulkCreateCandidateEducationSchema,
  getCandidateEducationQuerySchema
} from '@/lib/validations/candidate/education.validation';
import { UserType } from '@/generated/prisma';
import prisma from '@/lib/prisma';

/**
 * GET /api/candidate/education
 * Get list of education records for the authenticated candidate
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
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedParams = getCandidateEducationQuerySchema.safeParse(queryParams);
    if (!validatedParams.success) {
      return validationErrorResponse(validatedParams.error.flatten().fieldErrors);
    }

    // Get education records
    const result = await CandidateEducationService.getCandidateEducation({
      candidateId: candidate.id,
      sortBy: validatedParams.data.sortBy,
      sortOrder: validatedParams.data.sortOrder,
      includeDescription: validatedParams.data.includeDescription
    });

    // Get statistics
    const stats = await CandidateEducationService.getCandidateEducationStatistics(candidate.id);

    return successResponse({
      ...result,
      statistics: stats
    }, 'Education records retrieved successfully');

  } catch (error) {
    return serverErrorResponse('Failed to retrieve education records', error);
  }
});

/**
 * POST /api/candidate/education
 * Add a new education record or bulk add education records for the authenticated candidate
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
    const body = await req.json();

    // Check if it's bulk create or single create
    const isBulkCreate = body.education && Array.isArray(body.education);

    if (isBulkCreate) {
      // Validate bulk create
      const validated = bulkCreateCandidateEducationSchema.safeParse(body);
      if (!validated.success) {
        return validationErrorResponse(validated.error.flatten().fieldErrors);
      }

      try {
        const result = await CandidateEducationService.bulkCreateCandidateEducation(
          candidate.id,
          validated.data
        );

        return successResponse(result, 'Education records added successfully', 201);
      } catch (error: any) {
        if (error.message === 'Candidate not found') {
          return errorResponse('Candidate profile not found', 404);
        }
        throw error;
      }
    } else {
      // Validate single create
      const validated = createCandidateEducationSchema.safeParse(body);
      if (!validated.success) {
        return validationErrorResponse(validated.error.flatten().fieldErrors);
      }

      try {
        const education = await CandidateEducationService.createCandidateEducation(
          candidate.id,
          validated.data
        );

        return successResponse({ education }, 'Education record added successfully', 201);
      } catch (error: any) {
        if (error.message === 'Candidate not found') {
          return errorResponse('Candidate profile not found', 404);
        }
        throw error;
      }
    }

  } catch (error) {
    return serverErrorResponse('Failed to add education record', error);
  }
});

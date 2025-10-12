import { NextRequest } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/lib/middleware';
import { CandidateCertificationService } from '@/services/candidate/candidate-certification.service';
import { 
  successResponse, 
  errorResponse, 
  serverErrorResponse,
  validationErrorResponse
} from '@/utils/api-response';
import {
  createCandidateCertificationSchema,
  bulkCreateCandidateCertificationSchema,
  getCandidateCertificationQuerySchema
} from '@/lib/validations/candidate/certification.validation';
import { UserType } from '@/generated/prisma';
import {prisma} from '@/lib/prisma';

/**
 * GET /api/candidate/certifications
 * Get list of certification records for the authenticated candidate
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
    const validatedParams = getCandidateCertificationQuerySchema.safeParse(queryParams);
    if (!validatedParams.success) {
      return validationErrorResponse(validatedParams.error.flatten().fieldErrors);
    }

    // Get certification records
    const result = await CandidateCertificationService.getCandidateCertifications({
      candidateId: candidate.id,
      sortBy: validatedParams.data.sortBy,
      sortOrder: validatedParams.data.sortOrder,
      isExpired: validatedParams.data.isExpired,
      isValid: validatedParams.data.isValid
    });

    // Get statistics
    const stats = await CandidateCertificationService.getCandidateCertificationStatistics(candidate.id);

    // Get summary
    const summary = await CandidateCertificationService.getCandidateCertificationSummary(candidate.id);

    // Check for expiring certifications
    const expiringCertifications = await CandidateCertificationService.checkExpiringCertifications(candidate.id, 30);

    return successResponse({
      ...result,
      statistics: stats,
      summary: summary,
      expiringCertifications: expiringCertifications
    }, 'Certification records retrieved successfully');

  } catch (error) {
    return serverErrorResponse('Failed to retrieve certification records', error);
  }
});

/**
 * POST /api/candidate/certifications
 * Add a new certification record or bulk add certification records for the authenticated candidate
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
    const isBulkCreate = body.certifications && Array.isArray(body.certifications);

    if (isBulkCreate) {
      // Validate bulk create
      const validated = bulkCreateCandidateCertificationSchema.safeParse(body);
      if (!validated.success) {
        return validationErrorResponse(validated.error.flatten().fieldErrors);
      }

      try {
        const result = await CandidateCertificationService.bulkCreateCandidateCertifications(
          candidate.id,
          validated.data
        );

        return successResponse(result, 'Certification records added successfully', 201);
      } catch (error: any) {
        if (error.message === 'Candidate not found') {
          return errorResponse('Candidate profile not found', 404);
        }
        if (error.message.includes('Expiry date must be after issue date')) {
          return validationErrorResponse({
            certifications: [error.message]
          });
        }
        throw error;
      }
    } else {
      // Validate single create
      const validated = createCandidateCertificationSchema.safeParse(body);
      if (!validated.success) {
        return validationErrorResponse(validated.error.flatten().fieldErrors);
      }

      try {
        const certification = await CandidateCertificationService.createCandidateCertification(
          candidate.id,
          validated.data
        );

        return successResponse({ certification }, 'Certification record added successfully', 201);
      } catch (error: any) {
        if (error.message === 'Candidate not found') {
          return errorResponse('Candidate profile not found', 404);
        }
        if (error.message === 'Expiry date must be after issue date') {
          return validationErrorResponse({
            expiryDate: ['Expiry date must be after issue date']
          });
        }
        throw error;
      }
    }

  } catch (error) {
    return serverErrorResponse('Failed to add certification record', error);
  }
});


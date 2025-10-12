import { NextRequest } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/lib/middleware/auth';
import { CandidateCertificationService } from '@/services/candidate/candidate-certification.service';
import { 
  successResponse, 
  errorResponse, 
  serverErrorResponse,
  validationErrorResponse
} from '@/utils/api-response';
import { updateCandidateCertificationSchema } from '@/lib/validations/candidate/certification.validation';
import { UserType } from '@/generated/prisma';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/candidate/certifications/[id]
 * Get a specific certification record for the authenticated candidate
 */
export const GET = withRole([UserType.CANDIDATE], async (
  req: AuthenticatedRequest,
  { params }: RouteParams
) => {
  try {
    // Get candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id }
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    // Get certification record
    const certification = await CandidateCertificationService.getCandidateCertificationById(
      params.id,
      candidate.id
    );

    if (!certification) {
      return errorResponse('Certification record not found', 404);
    }

    return successResponse({ certification }, 'Certification record retrieved successfully');

  } catch (error) {
    return serverErrorResponse('Failed to retrieve certification record', error);
  }
});

/**
 * PUT /api/candidate/certifications/[id]
 * Update a specific certification record for the authenticated candidate
 */
export const PUT = withRole([UserType.CANDIDATE], async (
  req: AuthenticatedRequest,
  { params }: RouteParams
) => {
  try {
    // Get candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id }
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    // Parse and validate request body
    const body = await req.json();
    const validated = updateCandidateCertificationSchema.safeParse(body);
    if (!validated.success) {
      return validationErrorResponse(validated.error.flatten().fieldErrors);
    }

    try {
      const updatedCertification = await CandidateCertificationService.updateCandidateCertification(
        params.id,
        candidate.id,
        validated.data
      );

      return successResponse({ certification: updatedCertification }, 'Certification record updated successfully');
    } catch (error: any) {
      if (error.message === 'Certification record not found or does not belong to candidate') {
        return errorResponse('Certification record not found', 404);
      }
      if (error.message === 'Expiry date must be after issue date') {
        return validationErrorResponse({
          expiryDate: ['Expiry date must be after issue date']
        });
      }
      throw error;
    }

  } catch (error) {
    return serverErrorResponse('Failed to update certification record', error);
  }
});

/**
 * DELETE /api/candidate/certifications/[id]
 * Delete a specific certification record for the authenticated candidate
 */
export const DELETE = withRole([UserType.CANDIDATE], async (
  req: AuthenticatedRequest,
  { params }: RouteParams
) => {
  try {
    // Get candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id }
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    try {
      await CandidateCertificationService.deleteCandidateCertification(
        params.id,
        candidate.id
      );

      return successResponse(null, 'Certification record deleted successfully');
    } catch (error: any) {
      if (error.message === 'Certification record not found or does not belong to candidate') {
        return errorResponse('Certification record not found', 404);
      }
      throw error;
    }

  } catch (error) {
    return serverErrorResponse('Failed to delete certification record', error);
  }
});

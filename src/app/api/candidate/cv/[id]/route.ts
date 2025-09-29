import { NextRequest, NextResponse } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/middleware/auth';
import { CandidateCvService } from '@/services/candidate/candidate-cv.service';
import { UploadService } from '@/services/upload.service';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  validationErrorResponse,
} from '@/utils/api-response';
import {
  updateCandidateCvSchema,
} from '@/lib/validations/candidate/cv.validation';
import { UserType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/candidate/cv/[id]
 * Get a specific CV for preview/download
 */
export const GET = withRole([UserType.CANDIDATE], async (
  req: AuthenticatedRequest,
  { params }: RouteParams
) => {
  try {
    const { id } = await params;

    // Get candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id },
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    // Check if requesting preview or download
    const searchParams = new URL(req.url).searchParams;
    const action = searchParams.get('action'); // 'preview' or 'download'

    // Get CV record
    const cv = await CandidateCvService.getCandidateCvById(id, candidate.id);
    
    if (!cv) {
      return errorResponse('CV not found', 404);
    }

    // If just fetching CV metadata
    if (!action) {
      return successResponse({ cv }, 'CV retrieved successfully');
    }

    // Generate URL for preview/download
    const fileName = `${cv.cvName}.${cv.mimeType.split('/')[1]}`;
    const cvUrl = await UploadService.getCvUrl(
      cv.fileUrl,
      action as 'preview' | 'download',
      fileName
    );

    if (!cvUrl) {
      return errorResponse('Failed to generate CV access URL', 500);
    }

    // Return URL for client to access
    return successResponse(
      {
        url: cvUrl,
        expiresIn: parseInt(process.env.CLOUDINARY_SIGNED_URL_EXPIRES || '3600'),
        fileName,
        mimeType: cv.mimeType,
        fileSize: cv.fileSize,
      },
      action === 'download' ? 'Download URL generated successfully' : 'Preview URL generated successfully'
    );
  } catch (error: any) {
    if (error.message === 'CV not found') {
      return errorResponse('CV not found', 404);
    }
    return serverErrorResponse('Failed to retrieve CV', error);
  }
});

/**
 * PATCH /api/candidate/cv/[id]
 * Update CV information
 */
export const PATCH = withRole([UserType.CANDIDATE], async (
  req: AuthenticatedRequest,
  { params }: RouteParams
) => {
  try {
    const { id } = await params;

    // Get candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id },
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    // Parse request body
    const body = await req.json();

    // Validate data
    const validatedData = updateCandidateCvSchema.safeParse(body);
    if (!validatedData.success) {
      return validationErrorResponse(validatedData.error.flatten().fieldErrors);
    }

    // Update CV
    const updatedCv = await CandidateCvService.updateCandidateCv(
      id,
      candidate.id,
      validatedData.data
    );

    return successResponse(
      { cv: updatedCv },
      'CV updated successfully'
    );
  } catch (error: any) {
    if (error.message === 'CV not found') {
      return errorResponse('CV not found', 404);
    }
    return serverErrorResponse('Failed to update CV', error);
  }
});

/**
 * DELETE /api/candidate/cv/[id]
 * Delete a CV
 */
export const DELETE = withRole([UserType.CANDIDATE], async (
  req: AuthenticatedRequest,
  { params }: RouteParams
) => {
  try {
    const { id } = await params;

    // Get candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id },
    });

    if (!candidate) {
      return errorResponse('Candidate profile not found', 404);
    }

    // Delete CV
    const result = await CandidateCvService.deleteCandidateCv(id, candidate.id);

    return successResponse(result, 'CV deleted successfully');
  } catch (error: any) {
    if (error.message === 'CV not found') {
      return errorResponse('CV not found', 404);
    }
    return serverErrorResponse('Failed to delete CV', error);
  }
});
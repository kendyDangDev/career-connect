import { NextRequest, NextResponse } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/lib/middleware/auth';
import { CandidateCvService } from '@/services/candidate/candidate-cv.service';
import { UploadService } from '@/services/upload.service';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  validationErrorResponse,
} from '@/utils/api-response';
import {
  uploadCandidateCvSchema,
  getCandidateCvsQuerySchema,
  cvConstraints,
} from '@/lib/validations/candidate/cv.validation';
import { UserType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/candidate/cv
 * Get list of CVs for the authenticated candidate
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

    // Parse and validate query parameters
    const searchParams = new URL(req.url).searchParams;
    const queryParams = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
      sortBy: searchParams.get('sortBy') || 'uploadedAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
      search: searchParams.get('search') || undefined,
    };

    const validatedParams = getCandidateCvsQuerySchema.safeParse(queryParams);
    if (!validatedParams.success) {
      return validationErrorResponse(validatedParams.error.flatten().fieldErrors);
    }

    // Get CVs
    const result = await CandidateCvService.getCandidateCvs({
      candidateId: candidate.id,
      ...validatedParams.data,
    });

    // Check if candidate has legacy CV and migrate if needed
    if (result.cvs.length === 0 && candidate.cvFileUrl) {
      await CandidateCvService.migrateLegacyCv(candidate.id, candidate.cvFileUrl);
      // Re-fetch after migration
      const newResult = await CandidateCvService.getCandidateCvs({
        candidateId: candidate.id,
        ...validatedParams.data,
      });
      return successResponse(newResult, 'CVs retrieved successfully');
    }

    return successResponse(result, 'CVs retrieved successfully');
  } catch (error) {
    return serverErrorResponse('Failed to retrieve CVs', error);
  }
});

/**
 * POST /api/candidate/cv
 * Upload a new CV for the authenticated candidate
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

    // Check CV limit
    const hasReachedLimit = await CandidateCvService.hasReachedCvLimit(candidate.id);
    if (hasReachedLimit) {
      return errorResponse(
        `You have reached the maximum limit of ${cvConstraints.maxCvCount} CVs`,
        400
      );
    }

    // Parse form data
    const formData = (await req.formData()) as any;
    const file = formData.get('file') as File | null;
    const cvName = (formData.get('cvName') as string | null) || '';
    const description = formData.get('description') as string | null;
    const isPrimary = formData.get('isPrimary') === 'true';

    // Validate file presence
    if (!file) {
      return errorResponse('No file provided', 400);
    }

    // Validate file
    const fileValidation = UploadService.validateCvFile(file);
    if (!fileValidation.valid) {
      return errorResponse(fileValidation.error!, 400);
    }

    // Validate form data
    const validatedData = uploadCandidateCvSchema.safeParse({
      cvName,
      description,
      isPrimary,
    });

    if (!validatedData.success) {
      return validationErrorResponse(validatedData.error.flatten().fieldErrors);
    }

    console.log('Cv File upload:', file);

    // Upload file to Cloudinary
    const uploadResult = await UploadService.uploadCandidateCv(
      file,
      candidate.id,
      validatedData.data.cvName
    );

    if (!uploadResult.success) {
      return errorResponse(uploadResult.error!, 400);
    }

    // Create CV record in database with Cloudinary URL
    try {
      const cv = await CandidateCvService.createCandidateCv(candidate.id, {
        ...validatedData.data,
        fileUrl: uploadResult.fileUrl!, // Cloudinary URL
        fileSize: uploadResult.fileSize!,
        mimeType: uploadResult.mimeType!,
      });

      return successResponse({ cv }, 'CV uploaded successfully', 201);
    } catch (dbError: any) {
      // If database operation fails, delete the uploaded file from Cloudinary
      await UploadService.deleteCvFromCloudinary(uploadResult.fileUrl!);
      throw dbError;
    }
  } catch (error: any) {
    if (error.message?.includes('Maximum') && error.message?.includes('CVs')) {
      return errorResponse(error.message, 400);
    }
    return serverErrorResponse('Failed to upload CV', error);
  }
});

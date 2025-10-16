import { NextRequest, NextResponse } from 'next/server';
import {
  withCompanyRole,
  CompanyAuthenticatedRequest,
  canManageCompany,
} from '@/lib/middleware/company-auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/middleware';
import { CompanyService } from '@/services/company.service';
import { UploadService } from '@/services/upload.service';
import { CompanyRole } from '@/generated/prisma';
import { z } from 'zod';

// Validation schemas
const mediaTypeSchema = z.enum(['logo', 'cover', 'gallery', 'video']);

/**
 * POST /api/companies/media
 * Upload company media (logo, cover, gallery, video)
 * Requires: Company ADMIN or HR_MANAGER role
 */
export const POST = withCompanyRole(
  [CompanyRole.ADMIN, CompanyRole.HR_MANAGER],
  async (request: CompanyAuthenticatedRequest) => {
    try {
      // Parse form data
      const formData = await request.formData();
      const mediaType = formData.get('type') as string;

      // Validate media type
      const validationResult = mediaTypeSchema.safeParse(mediaType);
      if (!validationResult.success) {
        return errorResponse(
          'INVALID_MEDIA_TYPE',
          'Invalid media type. Must be one of: logo, cover, gallery, video',
          400
        );
      }

      const companyId = request.company!.id;

      // Handle different media types
      switch (validationResult.data) {
        case 'logo': {
          const file = formData.get('file') as File;
          if (!file) {
            return errorResponse('NO_FILE', 'No file provided', 400);
          }

          const uploadResult = await UploadService.uploadCompanyLogo(file, companyId);

          if (!uploadResult.success) {
            return errorResponse('UPLOAD_FAILED', uploadResult.error || 'Upload failed', 400);
          }

          // Delete old logo if exists
          const currentCompany = await CompanyService.getCompanyProfile(companyId);
          if (currentCompany?.logoUrl) {
            await UploadService.deleteFile(currentCompany.logoUrl);
          }

          // Update database
          await CompanyService.updateCompanyMedia(companyId, 'logo', uploadResult.fileUrl!);

          return successResponse({ logoUrl: uploadResult.fileUrl }, 'Logo uploaded successfully');
        }

        case 'cover': {
          const file = formData.get('file') as File;
          if (!file) {
            return errorResponse('NO_FILE', 'No file provided', 400);
          }

          const uploadResult = await UploadService.uploadCompanyCover(file, companyId);

          if (!uploadResult.success) {
            return errorResponse('UPLOAD_FAILED', uploadResult.error || 'Upload failed', 400);
          }

          // Delete old cover if exists
          const currentCompany = await CompanyService.getCompanyProfile(companyId);
          if (currentCompany?.coverImageUrl) {
            await UploadService.deleteFile(currentCompany.coverImageUrl);
          }

          // Update database
          await CompanyService.updateCompanyMedia(companyId, 'cover', uploadResult.fileUrl!);

          return successResponse(
            { coverImageUrl: uploadResult.fileUrl },
            'Cover image uploaded successfully'
          );
        }

        case 'gallery': {
          const files = formData.getAll('files') as File[];
          if (files.length === 0) {
            return errorResponse('NO_FILES', 'No files provided', 400);
          }

          const uploadResult = await UploadService.uploadCompanyGallery(files, companyId);

          if (!uploadResult.success && !uploadResult.urls) {
            return errorResponse('UPLOAD_FAILED', 'Failed to upload gallery images', 400);
          }

          // Note: Gallery images would typically be stored in a separate table
          // For now, we'll just return the URLs

          return successResponse(
            {
              urls: uploadResult.urls,
              errors: uploadResult.errors,
            },
            'Gallery images uploaded'
          );
        }

        case 'video': {
          const file = formData.get('file') as File;
          if (!file) {
            return errorResponse('NO_FILE', 'No file provided', 400);
          }

          const uploadResult = await UploadService.uploadCompanyVideo(file, companyId);

          if (!uploadResult.success) {
            return errorResponse('UPLOAD_FAILED', uploadResult.error || 'Upload failed', 400);
          }

          // Note: Videos would typically be stored in a separate table
          // For now, we'll just return the URL

          return successResponse({ videoUrl: uploadResult.fileUrl }, 'Video uploaded successfully');
        }

        default:
          return errorResponse('INVALID_MEDIA_TYPE', 'Invalid media type', 400);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse('VALIDATION_ERROR', error.errors[0].message, 400);
      }

      return serverErrorResponse('Failed to upload media', error);
    }
  }
);

/**
 * DELETE /api/companies/media
 * Delete company media (logo or cover)
 * Requires: Company ADMIN or HR_MANAGER role
 */
export const DELETE = withCompanyRole(
  [CompanyRole.ADMIN, CompanyRole.HR_MANAGER],
  async (request: CompanyAuthenticatedRequest) => {
    try {
      // Parse request body
      const body = await request.json();
      const { mediaType, fileUrl } = body;

      // Validate media type
      const deleteMediaTypeSchema = z.enum(['logo', 'cover']);
      const validationResult = deleteMediaTypeSchema.safeParse(mediaType);

      if (!validationResult.success) {
        return errorResponse(
          'INVALID_MEDIA_TYPE',
          'Invalid media type. Must be either logo or cover',
          400
        );
      }

      if (!fileUrl || typeof fileUrl !== 'string') {
        return errorResponse('INVALID_URL', 'File URL is required', 400);
      }

      const companyId = request.company!.id;

      // Delete file from storage
      await UploadService.deleteFile(fileUrl);

      // Update database
      await CompanyService.updateCompanyMedia(
        companyId,
        validationResult.data,
        '' // Set to empty string to remove
      );

      return successResponse(
        null,
        `${mediaType === 'logo' ? 'Logo' : 'Cover image'} deleted successfully`
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse('VALIDATION_ERROR', error.errors[0].message, 400);
      }

      return serverErrorResponse('Failed to delete media', error);
    }
  }
);

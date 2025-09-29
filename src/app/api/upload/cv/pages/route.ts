import { NextRequest, NextResponse } from 'next/server';
import { UploadService } from '@/services/upload.service';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/utils/api-response';
import { z } from 'zod';

// Validation schema
const getCvPagesSchema = z.object({
  fileUrl: z.string().url('Invalid file URL'),
});

/**
 * POST /api/upload/cv/pages
 * Get all page URLs for a CV
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = getCvPagesSchema.safeParse(body);
    if (!validatedData.success) {
      return errorResponse('Invalid file URL', 400);
    }

    const { fileUrl } = validatedData.data;

    console.log('🔍 Getting CV pages for URL:', fileUrl);

    // Get page count
    const pageCount = await UploadService.getCvPageCount(fileUrl);
    console.log('📄 Page count:', pageCount);

    // Get all page URLs
    const pageUrls = await UploadService.getAllCvPageUrls(fileUrl);
    console.log('🔗 Generated page URLs:', pageUrls.length);

    // Return response
    return successResponse({
      pageCount,
      pageUrls,
      totalSize: pageUrls.length,
    }, 'CV pages retrieved successfully');

  } catch (error: any) {
    console.error('Error getting CV pages:', error);
    return serverErrorResponse('Failed to get CV pages', error);
  }
}

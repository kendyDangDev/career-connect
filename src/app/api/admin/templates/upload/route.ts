import { NextRequest, NextResponse } from 'next/server';
import { TemplateService } from '@/services/template.service';
import { withAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/templates/upload
 * Upload a preview image for a template
 */
export const POST = withAdmin(async (request: NextRequest) => {
  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const templateId = formData.get('templateId') as string;

    // Validate file
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided',
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type. Only JPEG, PNG and WebP images are allowed',
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: 'File size exceeds 5MB limit',
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload image
    const imageUrl = await TemplateService.uploadPreviewImage(
      buffer,
      file.name
    );

    // If templateId is provided, update the template
    let updatedTemplate = null;
    if (templateId) {
      // Check if template exists
      const template = await prisma.template.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        return NextResponse.json(
          {
            success: false,
            error: 'Template not found',
          },
          { status: 404 }
        );
      }

      // Update template with new image URL
      updatedTemplate = await prisma.template.update({
        where: { id: templateId },
        data: { previewImage: imageUrl },
      });

      // Log audit
      const userId = (request as any).userId;
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'UPDATE_TEMPLATE_IMAGE',
          tableName: 'templates',
          recordId: templateId,
          oldValues: { previewImage: template.previewImage } as any,
          newValues: { previewImage: imageUrl } as any,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          imageUrl,
          template: updatedTemplate,
        },
        message: 'Image uploaded successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/admin/templates/upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload image',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});


import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { TemplateService } from '@/services/template.service';
import { withAdminAuth } from '@/lib/auth/admin-middleware';
import { prisma } from '@/lib/prisma';

// Validation schema for duplicate request
const DuplicateTemplateSchema = z.object({
  name: z
    .string()
    .min(3, 'Template name must be at least 3 characters')
    .max(100, 'Template name cannot exceed 100 characters')
    .trim()
    .optional(),
});

/**
 * POST /api/admin/templates/[id]/duplicate
 * Duplicate a template with a new name
 */
export const POST = withAdminAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { id } = params;
      const body = await request.json();

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: 'Template ID is required',
          },
          { status: 400 }
        );
      }

      // Validate input
      const validatedData = DuplicateTemplateSchema.parse(body);

      // Check if source template exists
      const sourceTemplate = await prisma.template.findUnique({
        where: { id },
      });

      if (!sourceTemplate) {
        return NextResponse.json(
          {
            success: false,
            error: 'Source template not found',
          },
          { status: 404 }
        );
      }

      // Generate new name if not provided
      const newName =
        validatedData.name || `${sourceTemplate.name} (Copy)`;

      // Check for duplicate name
      const existingTemplate = await prisma.template.findFirst({
        where: {
          name: {
            equals: newName,
            mode: 'insensitive',
          },
        },
      });

      if (existingTemplate) {
        return NextResponse.json(
          {
            success: false,
            error: 'Template with this name already exists',
          },
          { status: 409 }
        );
      }

      // Duplicate the template
      const duplicatedTemplate = await TemplateService.duplicateTemplate(
        id,
        newName
      );

      // Log audit
      const userId = (request as any).userId;
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'DUPLICATE_TEMPLATE',
          tableName: 'templates',
          recordId: duplicatedTemplate.id,
          oldValues: { sourceTemplateId: id } as any,
          newValues: duplicatedTemplate as any,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: duplicatedTemplate,
          message: 'Template duplicated successfully',
        },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid input data',
            details: error.errors,
          },
          { status: 400 }
        );
      }

      if (error instanceof Error && error.message === 'Source template not found') {
        return NextResponse.json(
          {
            success: false,
            error: 'Source template not found',
          },
          { status: 404 }
        );
      }

      console.error('POST /api/admin/templates/[id]/duplicate error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to duplicate template',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }
);
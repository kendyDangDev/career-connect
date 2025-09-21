import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { TemplateService } from '@/services/template.service';
import { UpdateTemplateSchema } from '@/lib/validations/template.validation';
import { withAdminAuth } from '@/lib/auth/admin-middleware';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/templates/[id]
 * Get a single template by ID
 */
export const GET = (
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { id } = params;

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: 'Template ID is required',
          },
          { status: 400 }
        );
      }

      const template = await TemplateService.getTemplateById(id);

      return NextResponse.json({
        success: true,
        data: template,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Template not found') {
        return NextResponse.json(
          {
            success: false,
            error: 'Template not found',
          },
          { status: 404 }
        );
      }

      console.error('GET /api/admin/templates/[id] error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch template',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }
);

/**
 * PUT /api/admin/templates/[id]
 * Update a template
 */
export const PUT = withAdminAuth(
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
      const validatedData = UpdateTemplateSchema.parse(body);

      // Check for duplicate name if name is being updated
      if (validatedData.name) {
        const existingTemplate = await prisma.template.findFirst({
          where: {
            name: {
              equals: validatedData.name,
              mode: 'insensitive',
            },
            NOT: {
              id: id,
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
      }

      // Get old template data for audit log
      const oldTemplate = await prisma.template.findUnique({
        where: { id },
      });

      if (!oldTemplate) {
        return NextResponse.json(
          {
            success: false,
            error: 'Template not found',
          },
          { status: 404 }
        );
      }

      // Update template
      const template = await TemplateService.updateTemplate(id, validatedData);

      // Log audit
      const userId = (request as any).userId;
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'UPDATE_TEMPLATE',
          tableName: 'templates',
          recordId: id,
          oldValues: oldTemplate as any,
          newValues: template as any,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });

      return NextResponse.json({
        success: true,
        data: template,
        message: 'Template updated successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid input data',
            details: error.issues,
          },
          { status: 400 }
        );
      }

      if (error instanceof Error && error.message === 'Template not found') {
        return NextResponse.json(
          {
            success: false,
            error: 'Template not found',
          },
          { status: 404 }
        );
      }

      console.error('PUT /api/admin/templates/[id] error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update template',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/admin/templates/[id]
 * Delete a template
 */
export const DELETE = withAdminAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { id } = params;

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: 'Template ID is required',
          },
          { status: 400 }
        );
      }

      // Get template data before deletion for audit log
      const template = await prisma.template.findUnique({
        where: { id },
        include: {
          _count: {
            select: { userCvs: true },
          },
        },
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

      // Delete template (service will check if it's in use)
      const result = await TemplateService.deleteTemplate(id);

      // Log audit
      const userId = (request as any).userId;
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'DELETE_TEMPLATE',
          tableName: 'templates',
          recordId: id,
          oldValues: template as any,
          newValues: null,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });

      return NextResponse.json({
        success: true,
        ...result,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Cannot delete template')
      ) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 409 }
        );
      }

      if (error instanceof Error && error.message === 'Template not found') {
        return NextResponse.json(
          {
            success: false,
            error: 'Template not found',
          },
          { status: 404 }
        );
      }

      console.error('DELETE /api/admin/templates/[id] error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete template',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }
);
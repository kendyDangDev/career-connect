import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { TemplateService } from '@/services/template.service';
import {
  CreateTemplateSchema,
  TemplateQuerySchema,
} from '@/lib/validations/template.validation';
import { withAdmin, withOptionalAuth, AuthenticatedRequest, createAuditLog, successResponse, validationErrorResponse } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/templates
 * Get all templates with pagination and filters
 */
export const GET = withOptionalAuth(async (request: AuthenticatedRequest) => {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validatedQuery = TemplateQuerySchema.parse(queryParams);

    // Get templates from service
    const result = await TemplateService.getTemplates(validatedQuery);

    return successResponse(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse('Invalid query parameters', error.issues);
    }

    console.error('GET /api/admin/templates error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch templates',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/admin/templates
 * Create a new template
 */
export const POST = withAdmin(async (request: AuthenticatedRequest) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = CreateTemplateSchema.parse(body);

    // Check for duplicate name
    const existingTemplate = await prisma.template.findFirst({
      where: {
        name: {
          equals: validatedData.name,
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

    // Create template
    const template = await TemplateService.createTemplate(validatedData);

    // Log audit
    await createAuditLog(
      request.user!.id,
      'CREATE_TEMPLATE',
      'templates',
      template.id,
      undefined,
      template as any,
      request
    );

    return successResponse(template, 'Template created successfully', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse('Invalid input data', error.issues);
    }

    console.error('POST /api/admin/templates error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create template',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});

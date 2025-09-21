import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { TemplateService } from '@/services/template.service';
import {
  CreateTemplateSchema,
  TemplateQuerySchema,
} from '@/lib/validations/template.validation';
import { withAdminAuth } from '@/lib/auth/admin-middleware';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/templates
 * Get all templates with pagination and filters
 */
export const GET = (async (request: NextRequest) => {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validatedQuery = TemplateQuerySchema.parse(queryParams);

    // Get templates from service
    const result = await TemplateService.getTemplates(validatedQuery);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: error.issues,
        },
        { status: 400 }
      );
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
export const POST = withAdminAuth(async (request: NextRequest) => {
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
    const userId = (request as any).userId;
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE_TEMPLATE',
        tableName: 'templates',
        recordId: template.id,
        newValues: template as any,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: template,
        message: 'Template created successfully',
      },
      { status: 201 }
    );
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
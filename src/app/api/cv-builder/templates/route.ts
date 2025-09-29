import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {prisma} from '@/lib/prisma';

// Schema validation
const getTemplatesSchema = z.object({
  category: z.string().optional(),
  isPremium: z.boolean().optional(),
  limit: z.number().min(1).max(50).default(10),
  offset: z.number().min(0).default(0),
});

/**
 * GET /api/cv-builder/templates
 * Lấy danh sách CV templates
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    
    const queryParams = {
      category: searchParams.get('category') || undefined,
      isPremium: searchParams.get('isPremium') === 'true' ? true : undefined,
      limit: parseInt(searchParams.get('limit') || '10'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const validatedParams = getTemplatesSchema.parse(queryParams);

    // Build where clause
    const whereClause: any = {};
    if (validatedParams.category) {
      whereClause.category = validatedParams.category;
    }
    if (validatedParams.isPremium !== undefined) {
      whereClause.isPremium = validatedParams.isPremium;
    }

    // Fetch templates from database
    const templates = await prisma.template.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      take: validatedParams.limit,
      skip: validatedParams.offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.template.count({
      where: whereClause,
    });

    return NextResponse.json({
      data: templates,
      pagination: {
        total: totalCount,
        limit: validatedParams.limit,
        offset: validatedParams.offset,
        hasNext: validatedParams.offset + validatedParams.limit < totalCount,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

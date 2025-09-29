import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {prisma} from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// Schema validation
const createUserCvSchema = z.object({
  templateId: z.string(),
  cv_name: z.string().min(1).max(100),
  cvData: z.object({}).optional(),
});

const getUserCvsSchema = z.object({
  limit: z.number().min(1).max(50).default(10),
  offset: z.number().min(0).default(0),
});

/**
 * GET /api/cv-builder/user-cvs
 * Lấy danh sách CV của user
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    const queryParams = {
      limit: parseInt(searchParams.get('limit') || '10'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const validatedParams = getUserCvsSchema.parse(queryParams);

    // Fetch user CVs from database
    const userCvs = await prisma.userCv.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            previewImage: true,
            isPremium: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: validatedParams.limit,
      skip: validatedParams.offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.userCv.count({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      data: userCvs,
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
        { error: 'Invalid parameters', details: error.issues },
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

/**
 * POST /api/cv-builder/user-cvs
 * Tạo CV mới cho user
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createUserCvSchema.parse(body);

    // Check if template exists
    const template = await prisma.template.findUnique({
      where: { id: validatedData.templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Create new user CV
    const userCv = await prisma.userCv.create({
      data: {
        userId: session.user.id,
        templateId: validatedData.templateId,
        cv_name: validatedData.cv_name,
        cvData: validatedData.cvData || {},
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            previewImage: true,
            isPremium: true,
          },
        },
      },
    });

    return NextResponse.json(
      { data: userCv },
      { status: 201 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
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

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {prisma} from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// Schema validation
const updateUserCvSchema = z.object({
  cv_name: z.string().min(1).max(100).optional(),
  cvData: z.object({}).optional(),
});

/**
 * GET /api/cv-builder/user-cvs/[id]
 * Lấy chi tiết một CV của user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'CV ID is required' },
        { status: 400 }
      );
    }

    const userCv = await prisma.userCv.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        template: true,
      },
    });

    if (!userCv) {
      return NextResponse.json(
        { error: 'CV not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: userCv });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cv-builder/user-cvs/[id]
 * Cập nhật một CV của user
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'CV ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateUserCvSchema.parse(body);

    // Check if CV exists and belongs to user
    const existingCv = await prisma.userCv.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingCv) {
      return NextResponse.json(
        { error: 'CV not found' },
        { status: 404 }
      );
    }

    // Update CV
    const updatedCv = await prisma.userCv.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
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

    return NextResponse.json({ data: updatedCv });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
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
 * DELETE /api/cv-builder/user-cvs/[id]
 * Xóa một CV của user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'CV ID is required' },
        { status: 400 }
      );
    }

    // Check if CV exists and belongs to user
    const existingCv = await prisma.userCv.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingCv) {
      return NextResponse.json(
        { error: 'CV not found' },
        { status: 404 }
      );
    }

    // Delete CV
    await prisma.userCv.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'CV deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

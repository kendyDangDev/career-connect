import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, getUserFromRequest } from '@/middleware/auth.middleware';
import { userProfileSchema } from '@/lib/validations/user.validation';

// GET /api/users/[id]/profile - Get user profile
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            userType: true,
            status: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error('GET /api/users/[id]/profile error', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id]/profile - Create or update user profile
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticate(req);
  if (authResult) return authResult;

  const currentUser = getUserFromRequest(req);

  // Users can only update their own profile unless they're admin
  if (currentUser.id !== params.id && currentUser.userType !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized - You can only update your own profile' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const parse = userProfileSchema.safeParse(body);
    
    if (!parse.success) {
      return NextResponse.json(
        { 
          error: 'Invalid profile data', 
          details: parse.error.flatten() 
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!userExists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Upsert profile (create if doesn't exist, update if exists)
    const profile = await prisma.userProfile.upsert({
      where: { userId: params.id },
      update: parse.data,
      create: {
        userId: params.id,
        ...parse.data,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            userType: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      data: profile,
      message: 'Profile updated successfully' 
    });
  } catch (error: any) {
    console.error('PUT /api/users/[id]/profile error', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Profile already exists for this user' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id]/profile - Delete user profile (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticate(req);
  if (authResult) return authResult;

  const currentUser = getUserFromRequest(req);

  // Only admin can delete profiles
  if (currentUser.userType !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 403 }
    );
  }

  try {
    await prisma.userProfile.delete({
      where: { userId: params.id },
    });

    return NextResponse.json({ 
      message: 'Profile deleted successfully' 
    });
  } catch (error: any) {
    console.error('DELETE /api/users/[id]/profile error', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, getUserFromRequest } from '@/lib/middleware/auth';
import { updateUserSchema, updateUserStatusSchema, changePasswordSchema } from '@/lib/validations/user.validation';
import { hashPassword, verifyPassword } from '@/lib/auth-utils';

// GET /api/users/[id] - Get user by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await authenticate(req);
  if (authResult) return authResult;

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        userType: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('GET /api/users/[id] error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/users/[id] - Update user by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await authenticate(req);
  if (authResult) return authResult;

  const currentUser = getUserFromRequest(req);
  
  // Users can only update their own profile unless they're admin
  if (currentUser.id !== params.id && currentUser.userType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    
    // If updating status, only admin can do it
    if (body.status && currentUser.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admin can update user status' }, { status: 403 });
    }

    // If changing password
    if (body.currentPassword && body.newPassword) {
      const passwordParse = changePasswordSchema.safeParse(body);
      if (!passwordParse.success) {
        return NextResponse.json({ 
          error: 'Invalid password data', 
          details: passwordParse.error.flatten() 
        }, { status: 400 });
      }

      // Verify current password
      const user = await prisma.user.findUnique({
        where: { id: params.id },
        select: { passwordHash: true },
      });

      if (!user?.passwordHash) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const isPasswordValid = await verifyPassword(passwordParse.data.currentPassword, user.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      // Update password
      const hashedPassword = await hashPassword(passwordParse.data.newPassword);
      await prisma.user.update({
        where: { id: params.id },
        data: { passwordHash: hashedPassword },
      });

      return NextResponse.json({ message: 'Password updated successfully' });
    }

    // Regular user update
    const parse = updateUserSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ 
        error: 'Invalid user data', 
        details: parse.error.flatten() 
      }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: parse.data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        userType: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ data: updatedUser });
  } catch (error: any) {
    console.error('PUT /api/users/[id] error', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Delete user by ID (Admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await authenticate(req);
  if (authResult) return authResult;

  const currentUser = getUserFromRequest(req);
  
  // Only admin can delete users
  if (currentUser.userType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Prevent self-deletion
  if (currentUser.id === params.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  try {
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('DELETE /api/users/[id] error', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
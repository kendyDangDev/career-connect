import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin, AuthenticatedRequest } from '@/lib/middleware/auth';
import { createAuditLog, successResponse } from '@/lib/middleware/utils';
import { UserStatus } from '@/generated/prisma';
import * as bcrypt from 'bcryptjs';

// GET - Get single user by ID (ADMIN only)
export const GET = withAdmin(
  async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const userId = params.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          userType: true,
          status: true,
          emailVerified: true,
          phoneVerified: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              city: true,
              province: true,
              country: true,
              address: true,
              postalCode: true,
              about: true,
              avatar: true,
            },
          },
          companyUsers: {
            include: {
              company: {
                select: {
                  id: true,
                  companyName: true,
                  logo: true,
                  website: true,
                },
              },
            },
          },
          candidate: {
            select: {
              id: true,
              currentPosition: true,
              experienceYears: true,
              salaryExpectation: true,
              skills: true,
              languages: true,
              willingToRelocate: true,
            },
          },
        },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Create audit log
      await createAuditLog(
        req.user!.id,
        'VIEW_USER',
        'users',
        userId,
        undefined,
        undefined,
        req
      );

      return successResponse(user);
    } catch (error) {
      console.error('Get user error:', error);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
  }
);

// PUT - Update user (ADMIN only)
export const PUT = withAdmin(
  async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const userId = params.id;
      const body = await req.json();
      const { email, firstName, lastName, phone, userType, status, password } = body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          userType: true,
          status: true,
        },
      });

      if (!existingUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Prevent admin from changing their own role
      if (userId === req.user!.id && userType && userType !== existingUser.userType) {
        return NextResponse.json({ error: 'You cannot change your own role' }, { status: 403 });
      }

      // Check if email is being changed and if it's already in use
      if (email && email !== existingUser.email) {
        const emailInUse = await prisma.user.findUnique({
          where: { email },
        });

        if (emailInUse) {
          return NextResponse.json({ error: 'Email is already in use' }, { status: 400 });
        }
      }

      // Prepare update data
      const updateData: any = {
        ...(email && { email }),
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(userType && { userType }),
        ...(status && { status }),
      };

      // If password is provided, hash it
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          userType: true,
          status: true,
          emailVerified: true,
          phoneVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Create audit log
      await createAuditLog(
        req.user!.id,
        'UPDATE_USER',
        'users',
        userId,
        existingUser,
        updateData,
        req
      );

      return successResponse(updatedUser, 'User updated successfully');
    } catch (error) {
      console.error('Update user error:', error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
  }
);

// DELETE - Delete user (ADMIN only)
export const DELETE = withAdmin(
  async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const userId = params.id;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          userType: true,
        },
      });

      if (!existingUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Prevent admin from deleting themselves
      if (userId === req.user!.id) {
        return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 403 });
      }

      // Check if user has any active relationships
      const companyUsersCount = await prisma.companyUser.count({
        where: { userId },
      });

      if (companyUsersCount > 0) {
        return NextResponse.json(
          {
            error: 'Cannot delete user. User is associated with one or more companies.',
          },
          { status: 400 }
        );
      }

      // Delete user (will cascade delete related records based on schema)
      await prisma.user.delete({
        where: { id: userId },
      });

      // Create audit log
      await createAuditLog(
        req.user!.id,
        'DELETE_USER',
        'users',
        userId,
        existingUser,
        undefined,
        req
      );

      return successResponse(null, 'User deleted successfully');
    } catch (error) {
      console.error('Delete user error:', error);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
  }
);

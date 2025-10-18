import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * OPTIONS /api/users/[id]/avatar
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * POST /api/users/[id]/avatar
 * Upload a new avatar for the user
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = await params;
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      const currentUser = req.user;

      // Check if user can update avatar (user can only update their own avatar unless admin)
      if (!currentUser || (currentUser.id !== userId && currentUser.userType !== 'ADMIN')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden - You can only update your own avatar',
          },
          { status: 403 }
        );
      }

      // Check if the user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, avatarUrl: true },
      });

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: 'User not found',
          },
          { status: 404 }
        );
      }

      // Get form data
      const formData = await request.formData();
      const file = formData.get('avatar') as File;

      // Validate file
      if (!file) {
        return NextResponse.json(
          {
            success: false,
            error: 'No file provided',
          },
          { status: 400 }
        );
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid file type. Only JPEG, PNG, WebP and GIF images are allowed',
          },
          { status: 400 }
        );
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return NextResponse.json(
          {
            success: false,
            error: 'File size exceeds 5MB limit',
          },
          { status: 400 }
        );
      }

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Optimize image with sharp
      const optimizedImage = await sharp(buffer)
        .resize(300, 300, {
          fit: 'cover',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Delete old avatar from Cloudinary if exists
      if (user.avatarUrl) {
        await deleteOldAvatar(user.avatarUrl);
      }

      // Upload to Cloudinary
      const avatarUrl = await uploadToCloudinary(optimizedImage, userId);

      // Update user with new avatar URL
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          phone: true,
          userType: true,
        },
      });

      // Log audit
      await prisma.auditLog.create({
        data: {
          userId: currentUser?.id || 'unknown',
          action: 'UPDATE_AVATAR',
          tableName: 'users',
          recordId: userId,
          oldValues: { avatarUrl: user.avatarUrl } as any,
          newValues: { avatarUrl } as any,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            avatarUrl,
            user: updatedUser,
          },
          message: 'Avatar uploaded successfully',
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('POST /api/users/[id]/avatar error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to upload avatar',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  })(request);
}

/**
 * DELETE /api/users/[id]/avatar
 * Delete user's avatar
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      const currentUser = req.user;

      // Check if user can delete avatar (user can only delete their own avatar unless admin)
      if (!currentUser || (currentUser.id !== userId && currentUser.userType !== 'ADMIN')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden - You can only delete your own avatar',
          },
          { status: 403 }
        );
      }

      // Get user's current avatar
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, avatarUrl: true },
      });

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: 'User not found',
          },
          { status: 404 }
        );
      }

      if (!user.avatarUrl) {
        return NextResponse.json(
          {
            success: false,
            error: 'User has no avatar',
          },
          { status: 400 }
        );
      }

      // Delete from Cloudinary
      await deleteOldAvatar(user.avatarUrl);

      // Update user to remove avatar URL
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: null },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          phone: true,
          userType: true,
        },
      });

      // Log audit
      await prisma.auditLog.create({
        data: {
          userId: currentUser?.id || 'unknown',
          action: 'DELETE_AVATAR',
          tableName: 'users',
          recordId: userId,
          oldValues: { avatarUrl: user.avatarUrl } as any,
          newValues: { avatarUrl: null } as any,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            user: updatedUser,
          },
          message: 'Avatar deleted successfully',
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('DELETE /api/users/[id]/avatar error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete avatar',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  })(request);
}

/**
 * Helper function to upload image to Cloudinary
 */
async function uploadToCloudinary(buffer: Buffer, userId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'avatars',
        public_id: `user-${userId}-${Date.now()}`,
        resource_type: 'image',
        transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Failed to upload image: ${error.message}`));
        } else if (result) {
          resolve(result.secure_url);
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Helper function to delete old avatar from Cloudinary
 */
async function deleteOldAvatar(avatarUrl: string): Promise<void> {
  try {
    // Extract public_id from URL
    const urlParts = avatarUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = `avatars/${filename.split('.')[0]}`;

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Failed to delete old avatar from Cloudinary:', error);
    // Don't throw error, just log it
  }
}

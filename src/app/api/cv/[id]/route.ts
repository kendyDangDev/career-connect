import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  errorResponse,
  handleApiError,
  getCurrentUser,
  parseRequestBody,
  hasAccessToCV,
  isValidUUID,
} from '@/lib/api-utils';
import { updateUserCvSchema } from '@/lib/validations/cv.validation';

// GET: Retrieve a single CV by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('Authentication required', 401);
    }

    const { id } = params;
    
    // Validate ID format
    if (!isValidUUID(id)) {
      return errorResponse('Invalid CV ID format', 400);
    }

    // Check access permission
    const hasAccess = await hasAccessToCV(id, user.id, prisma);
    if (!hasAccess) {
      return errorResponse('Access denied to this CV', 403);
    }

    // Get CV with related data
    const cv = await prisma.userCv.findUnique({
      where: { id },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            previewImage: true,
            structure: true,
            styling: true,
            isPremium: true,
          },
        },
        sections: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!cv) {
      return errorResponse('CV not found', 404);
    }

    return successResponse(cv, 'CV retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT: Update a CV
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('Authentication required', 401);
    }

    const { id } = params;
    
    // Validate ID format
    if (!isValidUUID(id)) {
      return errorResponse('Invalid CV ID format', 400);
    }

    // Check access permission
    const hasAccess = await hasAccessToCV(id, user.id, prisma);
    if (!hasAccess) {
      return errorResponse('Access denied to this CV', 403);
    }

    const body = await parseRequestBody(request);
    
    // Validate request body
    const validatedData = updateUserCvSchema.parse(body);

    // Update CV
    const updatedCv = await prisma.userCv.update({
      where: { id },
      data: validatedData,
      include: {
        template: true,
        sections: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return successResponse(updatedCv, 'CV updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE: Delete a CV
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('Authentication required', 401);
    }

    const { id } = params;
    
    // Validate ID format
    if (!isValidUUID(id)) {
      return errorResponse('Invalid CV ID format', 400);
    }

    // Check access permission
    const hasAccess = await hasAccessToCV(id, user.id, prisma);
    if (!hasAccess) {
      return errorResponse('Access denied to this CV', 403);
    }

    // Delete CV (sections will be cascade deleted)
    await prisma.userCv.delete({
      where: { id },
    });

    return successResponse(null, 'CV deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  errorResponse,
  handleApiError,
  getCurrentUser,
  parseRequestBody,
  isValidUUID,
} from '@/lib/api-utils';
import { updateCvSectionSchema } from '@/lib/validations/cv.validation';

// Helper function to check if user has access to a section
async function hasAccessToSection(sectionId: string, userId: string) {
  try {
    const section = await prisma.cvSection.findUnique({
      where: { id: sectionId },
      include: {
        cv: {
          select: { userId: true },
        },
      },
    });
    
    return section?.cv.userId === userId;
  } catch (error) {
    console.error('Error checking section access:', error);
    return false;
  }
}

// GET: Retrieve a single section by ID
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
      return errorResponse('Invalid section ID format', 400);
    }

    // Check access permission
    const hasAccess = await hasAccessToSection(id, user.id);
    if (!hasAccess) {
      return errorResponse('Access denied to this section', 403);
    }

    // Get section with related data
    const section = await prisma.cvSection.findUnique({
      where: { id },
      include: {
        cv: {
          select: {
            id: true,
            cv_name: true,
            userId: true,
          },
        },
      },
    });

    if (!section) {
      return errorResponse('Section not found', 404);
    }

    return successResponse(section, 'Section retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT: Update a section
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
      return errorResponse('Invalid section ID format', 400);
    }

    // Check access permission
    const hasAccess = await hasAccessToSection(id, user.id);
    if (!hasAccess) {
      return errorResponse('Access denied to this section', 403);
    }

    const body = await parseRequestBody(request);
    
    // Validate request body
    const validatedData = updateCvSectionSchema.parse(body);

    // Update section
    const updatedSection = await prisma.cvSection.update({
      where: { id },
      data: validatedData,
      include: {
        cv: {
          select: {
            id: true,
            cv_name: true,
          },
        },
      },
    });

    return successResponse(updatedSection, 'Section updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE: Delete a section
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
      return errorResponse('Invalid section ID format', 400);
    }

    // Check access permission
    const hasAccess = await hasAccessToSection(id, user.id);
    if (!hasAccess) {
      return errorResponse('Access denied to this section', 403);
    }

    // Get section info before deletion
    const section = await prisma.cvSection.findUnique({
      where: { id },
      select: { cvId: true, order: true },
    });

    if (!section) {
      return errorResponse('Section not found', 404);
    }

    // Delete section
    await prisma.cvSection.delete({
      where: { id },
    });

    // Reorder remaining sections
    await prisma.cvSection.updateMany({
      where: {
        cvId: section.cvId,
        order: { gt: section.order || 0 },
      },
      data: {
        order: { decrement: 1 },
      },
    });

    return successResponse(null, 'Section deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
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
import { batchUpdateSectionsSchema } from '@/lib/validations/cv.validation';

// PUT: Batch update multiple sections
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('Authentication required', 401);
    }

    const body = await parseRequestBody(request);
    
    // Validate request body
    const validatedData = batchUpdateSectionsSchema.parse(body);
    const { sections } = validatedData;

    if (sections.length === 0) {
      return errorResponse('No sections provided for update', 400);
    }

    // Validate all section IDs
    const invalidIds = sections.filter(s => !isValidUUID(s.id));
    if (invalidIds.length > 0) {
      return errorResponse('Invalid section ID format', 400, {
        invalidIds: invalidIds.map(s => s.id),
      });
    }

    // Get all sections and check if user has access
    const existingSections = await prisma.cvSection.findMany({
      where: {
        id: { in: sections.map(s => s.id) },
      },
      include: {
        cv: {
          select: { userId: true, id: true },
        },
      },
    });

    // Check if all sections exist
    if (existingSections.length !== sections.length) {
      return errorResponse('Some sections not found', 404);
    }

    // Check if user has access to all sections (they should belong to the same CV)
    const cvIds = [...new Set(existingSections.map(s => s.cv.id))];
    if (cvIds.length > 1) {
      return errorResponse('Sections must belong to the same CV', 400);
    }

    const cvId = cvIds[0];
    const hasAccess = await hasAccessToCV(cvId, user.id, prisma);
    if (!hasAccess) {
      return errorResponse('Access denied to this CV', 403);
    }

    // Perform batch update using transaction
    const updatedSections = await prisma.$transaction(
      sections.map(section => {
        const { id, ...updateData } = section;
        
        // Remove undefined values
        const cleanUpdateData = Object.fromEntries(
          Object.entries(updateData).filter(([_, v]) => v !== undefined)
        );

        return prisma.cvSection.update({
          where: { id },
          data: cleanUpdateData,
        });
      })
    );

    // Get all updated sections with related data
    const result = await prisma.cvSection.findMany({
      where: {
        id: { in: sections.map(s => s.id) },
      },
      include: {
        cv: {
          select: {
            id: true,
            cv_name: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    return successResponse(result, 'Sections updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// POST: Reorder sections for a CV
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('Authentication required', 401);
    }

    const body = await parseRequestBody(request);
    const { cvId, sectionIds } = body;

    if (!cvId || !isValidUUID(cvId)) {
      return errorResponse('Invalid CV ID', 400);
    }

    if (!Array.isArray(sectionIds) || sectionIds.length === 0) {
      return errorResponse('Section IDs array is required', 400);
    }

    // Check if user has access to the CV
    const hasAccess = await hasAccessToCV(cvId, user.id, prisma);
    if (!hasAccess) {
      return errorResponse('Access denied to this CV', 403);
    }

    // Get all sections for this CV
    const existingSections = await prisma.cvSection.findMany({
      where: { cvId },
      select: { id: true },
    });

    const existingIds = existingSections.map(s => s.id);
    
    // Check if all provided section IDs belong to this CV
    const invalidIds = sectionIds.filter((id: string) => !existingIds.includes(id));
    if (invalidIds.length > 0) {
      return errorResponse('Some sections do not belong to this CV', 400, {
        invalidIds,
      });
    }

    // Check if all CV sections are included
    if (sectionIds.length !== existingIds.length) {
      return errorResponse('All sections of the CV must be included for reordering', 400);
    }

    // Update order in transaction
    await prisma.$transaction(
      sectionIds.map((id: string, index: number) =>
        prisma.cvSection.update({
          where: { id },
          data: { order: index + 1 },
        })
      )
    );

    // Get updated sections
    const updatedSections = await prisma.cvSection.findMany({
      where: { cvId },
      orderBy: { order: 'asc' },
    });

    return successResponse(updatedSections, 'Sections reordered successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
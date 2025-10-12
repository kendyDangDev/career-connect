import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRole, AuthenticatedRequest } from '@/lib/middleware/auth';
import { UserType } from '@/generated/prisma';
import {
  createAuditLog,
  successResponse,
  errorResponse,
  paginatedResponse,
  checkRateLimit
} from '@/lib/middleware/utils';
import {
  updateLocationSchema,
  idParamSchemaJoi,
  checkItemInUse
} from '@/lib/validations/system-categories';
import { Location, LocationType } from '@/types/system-categories';

// GET /api/admin/system-categories/locations/[id]
export const GET = withRole([UserType.ADMIN], async (req: AuthenticatedRequest) => {
  try {
    // Extract ID from URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    // Validate ID
    const { error } = idParamSchemaJoi.validate({ id });
    if (error) {
      return errorResponse(
        'INVALID_ID',
        'ID không hợp lệ',
        400
      );
    }

    // Get location with full details
    const location = await prisma.location.findUnique({
      where: { id: id! },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            type: true,
            isActive: true,
            _count: {
              select: {
                children: true
              }
            }
          }
        },
        _count: {
          select: {
            children: true
          }
        }
      }
    });

    if (!location) {
      return errorResponse(
        'NOT_FOUND',
        'Không tìm thấy địa điểm',
        404
      );
    }

    return successResponse<Location>(location as any);
  } catch (error: any) {
    console.error('Get location error:', error);
    return errorResponse(
      'FETCH_ERROR',
      error.message || 'Không thể lấy thông tin địa điểm',
      500
    );
  }
});

// PUT /api/admin/system-categories/locations/[id]
export const PUT = withRole([UserType.ADMIN], async (req: AuthenticatedRequest) => {
  try {
    // Check rate limit
    if (!checkRateLimit(req.user!.id, 10, 60000)) {
      return errorResponse(
        'RATE_LIMIT',
        'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
        429
      );
    }

    // Extract ID from URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    // Validate ID
    const { error: idError } = idParamSchemaJoi.validate({ id });
    if (idError) {
      return errorResponse(
        'INVALID_ID',
        'ID không hợp lệ',
        400
      );
    }

    // Get existing location
    const existingLocation = await prisma.location.findUnique({
      where: { id: id! },
      include: {
        children: {
          select: { id: true, type: true }
        }
      }
    });

    if (!existingLocation) {
      return errorResponse(
        'NOT_FOUND',
        'Không tìm thấy địa điểm',
        404
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateLocationSchema.parse(body);

    // Check duplicate name if name is being updated
    if (validatedData.name && validatedData.name !== existingLocation.name) {
      const existingWithSameName = await prisma.location.findFirst({
        where: {
          name: {
            equals: validatedData.name,
            mode: 'insensitive'
          },
          parentId: validatedData.parentId !== undefined 
            ? (validatedData.parentId || null) 
            : existingLocation.parentId,
          type: validatedData.type || existingLocation.type,
          NOT: { id: id }
        }
      });

      if (existingWithSameName) {
        return errorResponse(
          'DUPLICATE_NAME',
          'Địa điểm với tên này đã tồn tại trong cùng cấp',
          400
        );
      }
    }

    // Validate type change if provided
    if (validatedData.type && validatedData.type !== existingLocation.type) {
      // Check if has children
      if (existingLocation.children.length > 0) {
        // Validate that children types are compatible
        const childTypes = new Set(existingLocation.children.map(c => c.type));
        const typeHierarchy: Record<LocationType, LocationType | null> = {
          [LocationType.COUNTRY]: null,
          [LocationType.PROVINCE]: LocationType.COUNTRY,
          [LocationType.CITY]: LocationType.PROVINCE,
          [LocationType.DISTRICT]: LocationType.CITY
        };

        for (const childType of childTypes) {
          const expectedParentType = typeHierarchy[childType as LocationType];
          if (expectedParentType !== validatedData.type) {
            return errorResponse(
              'INVALID_TYPE_CHANGE',
              `Không thể thay đổi loại địa điểm vì có địa điểm con loại ${childType}`,
              400
            );
          }
        }
      }
    }

    // Validate parent ID if being updated
    if (validatedData.parentId !== undefined) {
      // Cannot set itself as parent
      if (validatedData.parentId === id) {
        return errorResponse(
          'SELF_PARENT',
          'Địa điểm không thể là cha của chính nó',
          400
        );
      }

      // Check if new parent exists and validate type hierarchy
      if (validatedData.parentId) {
        const parentLocation = await prisma.location.findUnique({
          where: { id: validatedData.parentId }
        });

        if (!parentLocation) {
          return errorResponse(
            'INVALID_PARENT',
            'Địa điểm cha không tồn tại',
            400
          );
        }

        // Cannot set a child location as parent
        const childIds = existingLocation.children.map(c => c.id);
        if (childIds.includes(validatedData.parentId)) {
          return errorResponse(
            'CIRCULAR_REFERENCE',
            'Không thể đặt địa điểm con làm địa điểm cha',
            400
          );
        }

        // Validate type hierarchy
        const currentType = validatedData.type || existingLocation.type;
        const typeHierarchy: Record<LocationType, LocationType | null> = {
          [LocationType.COUNTRY]: null,
          [LocationType.PROVINCE]: LocationType.COUNTRY,
          [LocationType.CITY]: LocationType.PROVINCE,
          [LocationType.DISTRICT]: LocationType.CITY
        };

        const expectedParentType = typeHierarchy[currentType];
        
        if (expectedParentType && parentLocation.type !== expectedParentType) {
          return errorResponse(
            'INVALID_TYPE_HIERARCHY',
            `${currentType} phải có cha là ${expectedParentType}`,
            400
          );
        }
      } else {
        // Only COUNTRY can have no parent
        const currentType = validatedData.type || existingLocation.type;
        if (currentType !== LocationType.COUNTRY) {
          return errorResponse(
            'PARENT_REQUIRED',
            `${currentType} phải có địa điểm cha`,
            400
          );
        }
      }
    }

    // Prepare update data
    const updateData: any = { ...validatedData };
    
    // Handle parentId update
    if (validatedData.parentId === '') {
      updateData.parentId = null;
    }

    // Update location
    const updatedLocation = await prisma.location.update({
      where: { id: id! },
      data: updateData,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        _count: {
          select: {
            children: true
          }
        }
      }
    });

    // Create audit log
    await createAuditLog(
      req.user!.id,
      'UPDATE',
      'locations',
      id!,
      existingLocation,
      updatedLocation,
      req
    );

    return successResponse<Location>(
      updatedLocation as any,
      'Cập nhật địa điểm thành công'
    );
  } catch (error: any) {
    console.error('Update location error:', error);
    
    if (error.name === 'ZodError') {
      return errorResponse(
        'VALIDATION_ERROR',
        'Dữ liệu không hợp lệ: ' + error.errors[0].message,
        400
      );
    }

    return errorResponse(
      'UPDATE_ERROR',
      error.message || 'Không thể cập nhật địa điểm',
      500
    );
  }
});

// DELETE /api/admin/system-categories/locations/[id]
export const DELETE = withRole([UserType.ADMIN], async (req: AuthenticatedRequest) => {
  try {
    // Check rate limit
    if (!checkRateLimit(req.user!.id, 5, 60000)) {
      return errorResponse(
        'RATE_LIMIT',
        'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
        429
      );
    }

    // Extract ID from URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    // Validate ID
    const { error } = idParamSchemaJoi.validate({ id });
    if (error) {
      return errorResponse(
        'INVALID_ID',
        'ID không hợp lệ',
        400
      );
    }

    // Check if location exists
    const location = await prisma.location.findUnique({
      where: { id: id! }
    });

    if (!location) {
      return errorResponse(
        'NOT_FOUND',
        'Không tìm thấy địa điểm',
        404
      );
    }

    // Check if location is in use
    const { inUse, count, relatedModel } = await checkItemInUse(
      prisma,
      'location',
      id!
    );

    if (inUse) {
      return errorResponse(
        'IN_USE',
        `Không thể xóa địa điểm này vì đang có ${count} ${relatedModel}`,
        400
      );
    }

    // Delete location
    await prisma.location.delete({
      where: { id: id! }
    });

    // Create audit log
    await createAuditLog(
      req.user!.id,
      'DELETE',
      'locations',
      id!,
      location,
      null,
      req
    );

    return successResponse(
      { id },
      'Xóa địa điểm thành công'
    );
  } catch (error: any) {
    console.error('Delete location error:', error);
    return errorResponse(
      'DELETE_ERROR',
      error.message || 'Không thể xóa địa điểm',
      500
    );
  }
});

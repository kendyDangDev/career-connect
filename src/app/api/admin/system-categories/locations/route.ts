import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createAdminHandler,
  createAuditLog,
  successResponse,
  errorResponse,
  paginatedResponse,
  checkRateLimit
} from '@/middleware/admin-auth';
import {
  createLocationSchema,
  locationQuerySchema,
  checkDuplicateName
} from '@/lib/validations/system-categories';
import { Location, LocationType } from '@/types/system-categories';

// Helper function to build location tree
function buildLocationTree(locations: any[]): any[] {
  const locationMap = new Map();
  const rootLocations: any[] = [];

  // First pass: create map
  locations.forEach(loc => {
    locationMap.set(loc.id, { ...loc, children: [] });
  });

  // Second pass: build tree
  locations.forEach(loc => {
    if (loc.parentId) {
      const parent = locationMap.get(loc.parentId);
      if (parent) {
        parent.children.push(locationMap.get(loc.id));
      }
    } else {
      rootLocations.push(locationMap.get(loc.id));
    }
  });

  return rootLocations;
}

// GET /api/admin/system-categories/locations
export const GET = createAdminHandler(async (req, context) => {
  try {
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams);
    const query = locationQuerySchema.parse(queryParams);

    // Build where clause
    const where: any = {};
    
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.parentId === 'null') {
      where.parentId = null;
    } else if (query.parentId) {
      where.parentId = query.parentId;
    }

    // Get total count
    const total = await prisma.location.count({ where });

    // Get paginated data
    let locations = await prisma.location.findMany({
      where,
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
      },
      orderBy: {
        [query.sortBy]: query.sortOrder
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit
    });

    // If includeChildren is true and we're querying root locations, build tree
    if (query.includeChildren && query.parentId === 'null') {
      const allLocations = await prisma.location.findMany({
        where: {
          isActive: query.isActive,
          type: query.type
        },
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
        },
        orderBy: [
          { type: 'asc' },
          { [query.sortBy]: query.sortOrder }
        ]
      });
      
      locations = buildLocationTree(allLocations);
      
      // Apply pagination to root locations only
      const startIndex = (query.page - 1) * query.limit;
      const endIndex = startIndex + query.limit;
      locations = locations.slice(startIndex, endIndex);
    }

    // Get type counts for filters
    const typeCounts = await prisma.location.groupBy({
      by: ['type'],
      where: query.isActive !== undefined ? { isActive: query.isActive } : {},
      _count: {
        type: true
      }
    });

    const typeStats = typeCounts.reduce((acc, curr) => {
      acc[curr.type] = curr._count.type;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      data: locations,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
        typeStats
      }
    });
  } catch (error: any) {
    console.error('Get locations error:', error);
    return errorResponse(
      'FETCH_ERROR',
      error.message || 'Không thể lấy danh sách địa điểm',
      500
    );
  }
});

// POST /api/admin/system-categories/locations
export const POST = createAdminHandler(async (req, context) => {
  try {
    // Check rate limit
    if (!checkRateLimit(context.user.id, 10, 60000)) {
      return errorResponse(
        'RATE_LIMIT',
        'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
        429
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = createLocationSchema.parse(body);

    // Check duplicate name within same parent
    const existingLocation = await prisma.location.findFirst({
      where: {
        name: {
          equals: validatedData.name,
          mode: 'insensitive'
        },
        parentId: validatedData.parentId || null,
        type: validatedData.type
      }
    });

    if (existingLocation) {
      return errorResponse(
        'DUPLICATE_NAME',
        'Địa điểm với tên này đã tồn tại trong cùng cấp',
        400
      );
    }

    // Validate parent ID and type hierarchy if provided
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

      // Validate type hierarchy
      const typeHierarchy: Record<LocationType, LocationType | null> = {
        [LocationType.COUNTRY]: null,
        [LocationType.PROVINCE]: LocationType.COUNTRY,
        [LocationType.CITY]: LocationType.PROVINCE,
        [LocationType.DISTRICT]: LocationType.CITY
      };

      const expectedParentType = typeHierarchy[validatedData.type];
      
      if (expectedParentType && parentLocation.type !== expectedParentType) {
        return errorResponse(
          'INVALID_TYPE_HIERARCHY',
          `${validatedData.type} phải có cha là ${expectedParentType}`,
          400
        );
      }
    } else {
      // Only COUNTRY can have no parent
      if (validatedData.type !== LocationType.COUNTRY) {
        return errorResponse(
          'PARENT_REQUIRED',
          `${validatedData.type} phải có địa điểm cha`,
          400
        );
      }
    }

    // Create location
    const location = await prisma.location.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        parentId: validatedData.parentId || null,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude
      },
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
      context.user.id,
      'CREATE',
      'locations',
      location.id,
      null,
      location,
      req
    );

    return successResponse<Location>(
      location as any,
      'Tạo địa điểm thành công',
      201
    );
  } catch (error: any) {
    console.error('Create location error:', error);
    
    if (error.name === 'ZodError') {
      return errorResponse(
        'VALIDATION_ERROR',
        'Dữ liệu không hợp lệ: ' + error.errors[0].message,
        400
      );
    }

    return errorResponse(
      'CREATE_ERROR',
      error.message || 'Không thể tạo địa điểm',
      500
    );
  }
});

// GET popular cities (for quick selection)
export async function GET_POPULAR(req: NextRequest) {
  return createAdminHandler(async (req, context) => {
    try {
      // Get top cities by job count or pre-defined list
      const popularCities = await prisma.location.findMany({
        where: {
          type: LocationType.CITY,
          isActive: true,
          OR: [
            { name: { in: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'] } }
          ]
        },
        include: {
          parent: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      return successResponse(popularCities);
    } catch (error: any) {
      console.error('Get popular cities error:', error);
      return errorResponse(
        'FETCH_ERROR',
        error.message || 'Không thể lấy danh sách thành phố phổ biến',
        500
      );
    }
  })(req);
}

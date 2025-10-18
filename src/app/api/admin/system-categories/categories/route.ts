import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRole, AuthenticatedRequest } from '@/lib/middleware';
import { UserType } from '@/generated/prisma';
import {
  createAuditLog,
  successResponse,
  errorResponse,
  paginatedResponse,
  checkRateLimit,
} from '@/lib/middleware';
import {
  createCategorySchema,
  categoryQuerySchema,
  validateAndCreateSlug,
  checkDuplicateName,
} from '@/lib/validations/system-categories';
import { Category } from '@/types/system-categories';

// Helper function to build category tree
function buildCategoryTree(categories: any[]): any[] {
  const categoryMap = new Map();
  const rootCategories: any[] = [];

  // First pass: create map
  categories.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  // Second pass: build tree
  categories.forEach((cat) => {
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId);
      if (parent) {
        parent.children.push(categoryMap.get(cat.id));
      }
    } else {
      rootCategories.push(categoryMap.get(cat.id));
    }
  });

  return rootCategories;
}

// GET /api/admin/system-categories/categories
export const GET = withRole(
  [UserType.ADMIN, UserType.EMPLOYER],
  async (req: AuthenticatedRequest) => {
    try {
      // Parse query parameters
      const { searchParams } = new URL(req.url);
      const queryParams = Object.fromEntries(searchParams);
      const query = categoryQuerySchema.parse(queryParams);

      // Build where clause
      const where: any = {};

      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      if (query.isActive !== undefined) {
        where.isActive = query.isActive;
      }

      if (query.parentId === 'null') {
        where.parentId = null;
      } else if (query.parentId) {
        where.parentId = query.parentId;
      }

      // Get total count
      const total = await prisma.category.count({ where });

      // Get paginated data
      let categories = await prisma.category.findMany({
        where,
        include: {
          parent: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              children: true,
              jobCategories: true,
            },
          },
        },
        orderBy: {
          [query.sortBy]: query.sortOrder,
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      });

      // If includeChildren is true and we're querying root categories, build tree
      if (query.includeChildren && query.parentId === 'null') {
        const allCategories = await prisma.category.findMany({
          where: { isActive: query.isActive },
          include: {
            parent: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                children: true,
                jobCategories: true,
              },
            },
          },
          orderBy: {
            [query.sortBy]: query.sortOrder,
          },
        });

        categories = buildCategoryTree(allCategories);

        // Apply pagination to root categories only
        const startIndex = (query.page - 1) * query.limit;
        const endIndex = startIndex + query.limit;
        categories = categories.slice(startIndex, endIndex);
      }

      return paginatedResponse<Category>(categories as any, total, query.page, query.limit);
    } catch (error: any) {
      console.error('Get categories error:', error);
      return errorResponse('FETCH_ERROR', error.message || 'Không thể lấy danh sách danh mục', 500);
    }
  }
);

// POST /api/admin/system-categories/categories
export const POST = withRole([UserType.ADMIN], async (req: AuthenticatedRequest) => {
  try {
    // Check rate limit
    if (!checkRateLimit(req.user!.id, 10, 60000)) {
      return errorResponse(
        'RATE_LIMIT',
        'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
        429
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = createCategorySchema.parse(body);
    const dataWithSlug = validateAndCreateSlug(validatedData);

    // Check duplicate name
    const isDuplicate = await checkDuplicateName(prisma, 'category', dataWithSlug.name);

    if (isDuplicate) {
      return errorResponse('DUPLICATE_NAME', 'Danh mục với tên này đã tồn tại', 400);
    }

    // Validate parent ID if provided
    if (dataWithSlug.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: dataWithSlug.parentId },
      });

      if (!parentCategory) {
        return errorResponse('INVALID_PARENT', 'Danh mục cha không tồn tại', 400);
      }

      // Check for circular reference (prevent deep nesting)
      let currentParentId = parentCategory.parentId;
      let depth = 1;
      const MAX_DEPTH = 3; // Maximum nesting level

      while (currentParentId && depth < MAX_DEPTH) {
        const parent = await prisma.category.findUnique({
          where: { id: currentParentId },
          select: { parentId: true },
        });

        if (!parent) break;
        currentParentId = parent.parentId;
        depth++;
      }

      if (depth >= MAX_DEPTH) {
        return errorResponse(
          'MAX_DEPTH_EXCEEDED',
          `Không thể tạo danh mục con quá ${MAX_DEPTH} cấp`,
          400
        );
      }
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name: dataWithSlug.name,
        slug: dataWithSlug.slug,
        parentId: dataWithSlug.parentId || null,
        description: dataWithSlug.description,
        iconUrl: dataWithSlug.iconUrl,
        sortOrder: dataWithSlug.sortOrder,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            children: true,
            jobCategories: true,
          },
        },
      },
    });

    // Create audit log
    await createAuditLog(req.user!.id, 'CREATE', 'categories', category.id, null, category, req);

    return successResponse<Category>(category as any, 'Tạo danh mục thành công', 201);
  } catch (error: any) {
    console.error('Create category error:', error);

    if (error.name === 'ZodError') {
      return errorResponse(
        'VALIDATION_ERROR',
        'Dữ liệu không hợp lệ: ' + error.errors[0].message,
        400
      );
    }

    return errorResponse('CREATE_ERROR', error.message || 'Không thể tạo danh mục', 500);
  }
});

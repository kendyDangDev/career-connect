import { NextRequest } from 'next/server';
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
  createIndustrySchema,
  systemCategoryQuerySchema,
  validateAndCreateSlug,
  checkDuplicateName
} from '@/lib/validations/system-categories';
import { Industry } from '@/types/system-categories';

// GET /api/admin/system-categories/industries
export const GET = createAdminHandler(async (req, context) => {
  try {
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams);
    const query = systemCategoryQuerySchema.parse(queryParams);

    // Build where clause
    const where: any = {};
    
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    // Get total count
    const total = await prisma.industry.count({ where });

    // Get paginated data
    const industries = await prisma.industry.findMany({
      where,
      include: {
        _count: {
          select: {
            companies: true
          }
        }
      },
      orderBy: {
        [query.sortBy]: query.sortOrder
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit
    });

    return paginatedResponse<Industry>(
      industries as any,
      total,
      query.page,
      query.limit
    );
  } catch (error: any) {
    console.error('Get industries error:', error);
    return errorResponse(
      'FETCH_ERROR',
      error.message || 'Không thể lấy danh sách ngành nghề',
      500
    );
  }
});

// POST /api/admin/system-categories/industries
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
    const validatedData = createIndustrySchema.parse(body);
    const dataWithSlug = validateAndCreateSlug(validatedData);

    // Check duplicate name
    const isDuplicate = await checkDuplicateName(
      prisma,
      'industry',
      dataWithSlug.name
    );

    if (isDuplicate) {
      return errorResponse(
        'DUPLICATE_NAME',
        'Ngành nghề với tên này đã tồn tại',
        400
      );
    }

    // Create industry
    const industry = await prisma.industry.create({
      data: {
        name: dataWithSlug.name,
        slug: dataWithSlug.slug,
        description: dataWithSlug.description,
        iconUrl: dataWithSlug.iconUrl,
        sortOrder: dataWithSlug.sortOrder
      },
      include: {
        _count: {
          select: {
            companies: true
          }
        }
      }
    });

    // Create audit log
    await createAuditLog(
      context.user.id,
      'CREATE',
      'industries',
      industry.id,
      null,
      industry,
      req
    );

    return successResponse<Industry>(
      industry as any,
      'Tạo ngành nghề thành công',
      201
    );
  } catch (error: any) {
    console.error('Create industry error:', error);
    
    if (error.name === 'ZodError') {
      return errorResponse(
        'VALIDATION_ERROR',
        'Dữ liệu không hợp lệ: ' + error.errors[0].message,
        400
      );
    }

    return errorResponse(
      'CREATE_ERROR',
      error.message || 'Không thể tạo ngành nghề',
      500
    );
  }
});

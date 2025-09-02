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
  createSkillSchema,
  skillQuerySchema,
  validateAndCreateSlug,
  checkDuplicateName
} from '@/lib/validations/system-categories';
import { Skill, SkillCategory } from '@/types/system-categories';

// GET /api/admin/system-categories/skills
export const GET = createAdminHandler(async (req, context) => {
  try {
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams);
    const query = skillQuerySchema.parse(queryParams);

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

    if (query.category) {
      where.category = query.category;
    }

    // Get total count
    const total = await prisma.skill.count({ where });

    // Get paginated data
    const skills = await prisma.skill.findMany({
      where,
      include: {
        _count: {
          select: {
            candidateSkills: true,
            jobSkills: true
          }
        }
      },
      orderBy: {
        [query.sortBy]: query.sortOrder
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit
    });

    // Get category counts for filters
    const categoryCounts = await prisma.skill.groupBy({
      by: ['category'],
      where: query.isActive !== undefined ? { isActive: query.isActive } : {},
      _count: {
        category: true
      }
    });

    const categoryStats = categoryCounts.reduce((acc, curr) => {
      acc[curr.category] = curr._count.category;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      data: skills,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
        categoryStats
      }
    });
  } catch (error: any) {
    console.error('Get skills error:', error);
    return errorResponse(
      'FETCH_ERROR',
      error.message || 'Không thể lấy danh sách kỹ năng',
      500
    );
  }
});

// POST /api/admin/system-categories/skills
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
    const validatedData = createSkillSchema.parse(body);
    const dataWithSlug = validateAndCreateSlug(validatedData);

    // Check duplicate name
    const isDuplicate = await checkDuplicateName(
      prisma,
      'skill',
      dataWithSlug.name
    );

    if (isDuplicate) {
      return errorResponse(
        'DUPLICATE_NAME',
        'Kỹ năng với tên này đã tồn tại',
        400
      );
    }

    // Create skill
    const skill = await prisma.skill.create({
      data: {
        name: dataWithSlug.name,
        slug: dataWithSlug.slug,
        category: dataWithSlug.category,
        description: dataWithSlug.description,
        iconUrl: dataWithSlug.iconUrl
      },
      include: {
        _count: {
          select: {
            candidateSkills: true,
            jobSkills: true
          }
        }
      }
    });

    // Create audit log
    await createAuditLog(
      context.user.id,
      'CREATE',
      'skills',
      skill.id,
      null,
      skill,
      req
    );

    return successResponse<Skill>(
      skill as any,
      'Tạo kỹ năng thành công',
      201
    );
  } catch (error: any) {
    console.error('Create skill error:', error);
    
    if (error.name === 'ZodError') {
      return errorResponse(
        'VALIDATION_ERROR',
        'Dữ liệu không hợp lệ: ' + error.errors[0].message,
        400
      );
    }

    return errorResponse(
      'CREATE_ERROR',
      error.message || 'Không thể tạo kỹ năng',
      500
    );
  }
});

// Import skills from file
export async function POST_IMPORT(req: NextRequest) {
  return createAdminHandler(async (req, context) => {
    try {
      // Check rate limit
      if (!checkRateLimit(context.user.id, 1, 300000)) { // 1 request per 5 minutes
        return errorResponse(
          'RATE_LIMIT',
          'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
          429
        );
      }

      const formData = await req.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return errorResponse(
          'NO_FILE',
          'Vui lòng chọn file để import',
          400
        );
      }

      // Validate file type
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
        return errorResponse(
          'INVALID_FILE_TYPE',
          'Chỉ hỗ trợ file CSV hoặc JSON',
          400
        );
      }

      const content = await file.text();
      let skills: any[] = [];

      // Parse file content
      if (file.name.endsWith('.json')) {
        try {
          skills = JSON.parse(content);
        } catch (e) {
          return errorResponse(
            'INVALID_JSON',
            'File JSON không hợp lệ',
            400
          );
        }
      } else {
        // Parse CSV
        const lines = content.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        if (!headers.includes('name') || !headers.includes('category')) {
          return errorResponse(
            'INVALID_CSV_HEADERS',
            'File CSV phải có cột "name" và "category"',
            400
          );
        }

        skills = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const skill: any = {};
          headers.forEach((header, index) => {
            skill[header] = values[index];
          });
          return skill;
        });
      }

      // Validate and import skills
      const results = {
        total: skills.length,
        success: 0,
        failed: 0,
        errors: [] as Array<{ row: number; error: string }>
      };

      for (let i = 0; i < skills.length; i++) {
        try {
          const skillData = skills[i];
          
          // Validate skill data
          const validatedData = createSkillSchema.parse({
            name: skillData.name,
            category: skillData.category as SkillCategory,
            description: skillData.description || undefined,
            iconUrl: skillData.iconUrl || undefined
          });

          const dataWithSlug = validateAndCreateSlug(validatedData);

          // Check if skill already exists
          const existing = await prisma.skill.findFirst({
            where: {
              OR: [
                { name: { equals: dataWithSlug.name, mode: 'insensitive' } },
                { slug: dataWithSlug.slug }
              ]
            }
          });

          if (existing) {
            results.failed++;
            results.errors.push({
              row: i + 2, // +2 because of header row and 0-based index
              error: `Kỹ năng "${dataWithSlug.name}" đã tồn tại`
            });
            continue;
          }

          // Create skill
          await prisma.skill.create({
            data: {
              name: dataWithSlug.name,
              slug: dataWithSlug.slug,
              category: dataWithSlug.category,
              description: dataWithSlug.description,
              iconUrl: dataWithSlug.iconUrl
            }
          });

          results.success++;
        } catch (error: any) {
          results.failed++;
          results.errors.push({
            row: i + 2,
            error: error.message || 'Lỗi không xác định'
          });
        }
      }

      // Create audit log
      await createAuditLog(
        context.user.id,
        'IMPORT_SKILLS',
        'skills',
        'bulk_import',
        null,
        results,
        req
      );

      return successResponse(
        results,
        `Import hoàn tất: ${results.success} thành công, ${results.failed} thất bại`
      );
    } catch (error: any) {
      console.error('Import skills error:', error);
      return errorResponse(
        'IMPORT_ERROR',
        error.message || 'Không thể import kỹ năng',
        500
      );
    }
  })(req);
}

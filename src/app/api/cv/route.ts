import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  handleApiError,
  getCurrentUser,
  parseRequestBody,
  buildOrderBy,
  buildSearchWhere,
} from '@/lib/api-utils';
import {
  createUserCvSchema,
  cvQuerySchema,
} from '@/lib/validations/cv.validation';

// GET: List all CVs with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('Authentication required', 401);
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedQuery = cvQuerySchema.parse(queryParams);
    const {
      userId,
      templateId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = validatedQuery;

    // Build where clause
    const where: any = {};
    
    // Filter by userId - if admin, they can view all, otherwise only their own
    if (userId) {
      where.userId = userId;
    } else {
      where.userId = user.id; // Default to current user's CVs
    }
    
    if (templateId) {
      where.templateId = templateId;
    }

    // Get total count
    const total = await prisma.userCv.count({ where });

    // Get paginated data
    const cvs = await prisma.userCv.findMany({
      where,
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            previewImage: true,
            isPremium: true,
          },
        },
        sections: {
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            sections: true,
          },
        },
      },
      orderBy: buildOrderBy(sortBy, sortOrder),
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginatedResponse(cvs, total, page, limit, 'CVs retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// POST: Create a new CV
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('Authentication required', 401);
    }

    const body = await parseRequestBody(request);
    
    // Validate request body
    const validatedData = createUserCvSchema.parse(body);
    
    // Create CV with user association
    const cv = await prisma.userCv.create({
      data: {
        ...validatedData,
        userId: user.id, // Always use current user's ID
      },
      include: {
        template: true,
        sections: true,
      },
    });

    return successResponse(cv, 'CV created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
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
  hasAccessToCV,
} from '@/lib/api-utils';
import {
  createCvSectionSchema,
  sectionQuerySchema,
} from '@/lib/validations/cv.validation';

// GET: List all sections with pagination and filtering
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
    const validatedQuery = sectionQuerySchema.parse(queryParams);
    const {
      cvId,
      page = 1,
      limit = 10,
      sortBy = 'order',
      sortOrder = 'asc',
    } = validatedQuery;

    // Build where clause
    const where: any = {};
    
    if (cvId) {
      // Check if user has access to this CV
      const hasAccess = await hasAccessToCV(cvId, user.id, prisma);
      if (!hasAccess) {
        return errorResponse('Access denied to this CV', 403);
      }
      where.cvId = cvId;
    } else {
      // If no cvId specified, get sections from all user's CVs
      const userCvs = await prisma.userCv.findMany({
        where: { userId: user.id },
        select: { id: true },
      });
      where.cvId = { in: userCvs.map(cv => cv.id) };
    }

    // Get total count
    const total = await prisma.cvSection.count({ where });

    // Get paginated data
    const sections = await prisma.cvSection.findMany({
      where,
      include: {
        cv: {
          select: {
            id: true,
            cv_name: true,
            userId: true,
          },
        },
      },
      orderBy: buildOrderBy(sortBy, sortOrder),
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginatedResponse(sections, total, page, limit, 'Sections retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// POST: Create a new section
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('Authentication required', 401);
    }

    const body = await parseRequestBody(request);
    
    // Validate request body
    const validatedData = createCvSectionSchema.parse(body);
    
    // Check if user has access to the CV
    const hasAccess = await hasAccessToCV(validatedData.cvId, user.id, prisma);
    if (!hasAccess) {
      return errorResponse('Access denied to this CV', 403);
    }

    // If order is not specified, get the next order number
    let order = validatedData.order;
    if (order === undefined || order === null) {
      const maxOrderSection = await prisma.cvSection.findFirst({
        where: { cvId: validatedData.cvId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      order = (maxOrderSection?.order ?? 0) + 1;
    }

    // Create section
    const section = await prisma.cvSection.create({
      data: {
        ...validatedData,
        order,
      },
      include: {
        cv: {
          select: {
            id: true,
            cv_name: true,
          },
        },
      },
    });

    return successResponse(section, 'Section created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
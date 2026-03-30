export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { CompanyReviewService } from '@/services/company-review.service';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  validationErrorResponse,
  unauthorizedResponse,
} from '@/utils/api-response';
import {
  createCompanyReviewSchema,
  getCompanyReviewsQuerySchema,
} from '@/lib/validations/company-review.validation';
import { UserType } from '@/generated/prisma';
import jwt from 'jsonwebtoken';

/**
 * GET /api/reviews/company
 * Get company reviews with filters and pagination
 */
export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validatedParams = getCompanyReviewsQuerySchema.safeParse(queryParams);
    if (!validatedParams.success) {
      return validationErrorResponse(validatedParams.error.flatten().fieldErrors);
    }

    // Check if requesting unapproved reviews
    const session = await getServerSession(authOptions);
    let isApproved = true;

    // Only admin or the reviewer can see unapproved reviews
    if (validatedParams.data.isApproved === false) {
      if (!session) {
        return unauthorizedResponse();
      }

      // Check if admin or filtering by own reviews
      const isAdmin = session.user.userType === UserType.ADMIN;
      const isOwnReviews = validatedParams.data.reviewerId === session.user.id;

      if (!isAdmin && !isOwnReviews) {
        return errorResponse('You can only view your own unapproved reviews', 403);
      }

      isApproved = false;
    }

    // Get reviews
    const result = await CompanyReviewService.getCompanyReviews({
      ...validatedParams.data,
      isApproved,
    });

    // If requesting by company, also get statistics
    if (validatedParams.data.companyId || validatedParams.data.companySlug) {
      const companyId =
        validatedParams.data.companyId ||
        (
          await CompanyReviewService.getCompanyReviews({
            companySlug: validatedParams.data.companySlug,
            limit: 1,
          })
        ).reviews[0]?.companyId;

      if (companyId) {
        const statistics = await CompanyReviewService.getCompanyStatistics(companyId);
        return successResponse(
          {
            ...result,
            statistics,
          },
          'Reviews retrieved successfully'
        );
      }
    }

    return successResponse(result, 'Reviews retrieved successfully');
  } catch (error) {
    return serverErrorResponse('Failed to retrieve reviews', error);
  }
}

/**
 * POST /api/reviews/company
 * Create a new company review (requires authentication)
 */
export async function POST(req: NextRequest) {
  try {
    let user = null;

    // Try to get session from NextAuth first (for web app)
    const session = await getServerSession(authOptions);
    if (session) {
      user = session.user;
    } else {
      // If no session, try to verify JWT token from Authorization header (for mobile app)
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);

        try {
          const jwtSecret = process.env.JWT_SECRET;
          if (!jwtSecret) {
            throw new Error('JWT_SECRET not configured');
          }

          const decoded = jwt.verify(token, jwtSecret) as any;

          // Validate JWT payload structure
          if (decoded && decoded.id && decoded.userType) {
            user = {
              id: decoded.id,
              userType: decoded.userType,
              email: decoded.email,
              name: decoded.name,
            };
          }
        } catch (jwtError) {
          return errorResponse('Invalid or expired token', 401);
        }
      }
    }

    // Check if user is authenticated
    if (!user) {
      return unauthorizedResponse();
    }

    // Only candidates can create reviews
    if (user.userType !== UserType.CANDIDATE) {
      return errorResponse('Only candidates can create reviews', 403);
    }

    // Parse request body
    const body = await req.json();

    // Validate request body
    const validated = createCompanyReviewSchema.safeParse(body);
    if (!validated.success) {
      return validationErrorResponse(validated.error.flatten().fieldErrors);
    }

    // Check if user can review this company
    const canReviewResult = await CompanyReviewService.canReviewCompany(
      user.id,
      validated.data.companyId
    );

    if (!canReviewResult.canReview) {
      return errorResponse(canReviewResult.reason || 'Cannot review this company', 400);
    }

    try {
      const review = await CompanyReviewService.createCompanyReview(user.id, validated.data);

      return successResponse({ review }, 'Review created successfully', 201);
    } catch (error: any) {
      if (error.message === 'Company not found') {
        return errorResponse('Company not found', 404);
      }
      if (error.message === 'You have already reviewed this company') {
        return errorResponse('You have already reviewed this company', 409);
      }
      throw error;
    }
  } catch (error) {
    return serverErrorResponse('Failed to create review', error);
  }
}

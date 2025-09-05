import { prisma } from '@/lib/prisma';
import { 
  CompanyReview,
  Prisma,
  EmploymentStatus
} from '@/generated/prisma';
import {
  CreateCompanyReviewInput,
  UpdateCompanyReviewInput,
  GetCompanyReviewsParams,
  CompanyReviewWithRelations,
  CompanyReviewResponse,
  CompanyReviewStatistics,
  CompanyReviewDetail,
  ReviewerInfo,
  AdminUpdateReviewInput
} from '@/types/company-review.types';

export class CompanyReviewService {
  /**
   * Get company reviews with pagination and filters
   */
  static async getCompanyReviews({
    companyId,
    companySlug,
    reviewerId,
    isApproved = true, // Default to only approved reviews for public
    rating,
    minRating,
    employmentStatus,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10
  }: GetCompanyReviewsParams): Promise<CompanyReviewResponse> {
    // Build where clause
    const where: Prisma.CompanyReviewWhereInput = {};
    
    if (companyId) {
      where.companyId = companyId;
    } else if (companySlug) {
      // Get company by slug first
      const company = await prisma.company.findUnique({
        where: { companySlug },
        select: { id: true }
      });
      if (company) {
        where.companyId = company.id;
      } else {
        // Return empty result if company not found
        return {
          reviews: [],
          total: 0,
          page,
          totalPages: 0,
          hasMore: false
        };
      }
    }

    if (reviewerId) {
      where.reviewerId = reviewerId;
    }

    if (isApproved !== undefined) {
      where.isApproved = isApproved;
    }

    if (rating) {
      where.rating = rating;
    }

    if (minRating) {
      where.rating = { gte: minRating };
    }

    if (employmentStatus) {
      where.employmentStatus = employmentStatus;
    }

    // Build order by
    const orderBy: Prisma.CompanyReviewOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.companyReview.count({ where });

    // Get reviews with relations
    const reviews = await prisma.companyReview.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            companySlug: true,
            logoUrl: true
          }
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true
          }
        }
      }
    });

    // Transform reviews to handle anonymous reviewers
    const transformedReviews = reviews.map(review => {
      const reviewerInfo: ReviewerInfo = review.isAnonymous
        ? {
            id: review.reviewer.id,
            displayName: 'Anonymous User',
            isAnonymous: true
          }
        : {
            id: review.reviewer.id,
            displayName: `${review.reviewer.firstName} ${review.reviewer.lastName}`,
            avatarUrl: review.reviewer.avatarUrl || undefined,
            isAnonymous: false
          };

      return {
        ...review,
        reviewer: reviewerInfo
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      reviews: transformedReviews as CompanyReviewWithRelations[],
      total,
      page,
      totalPages,
      hasMore: page < totalPages
    };
  }

  /**
   * Get a single review by ID
   */
  static async getCompanyReviewById(
    id: string,
    includeUnapproved: boolean = false
  ): Promise<CompanyReviewDetail | null> {
    const where: Prisma.CompanyReviewWhereInput = { id };
    
    if (!includeUnapproved) {
      where.isApproved = true;
    }

    const review = await prisma.companyReview.findFirst({
      where,
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            companySlug: true,
            logoUrl: true
          }
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true
          }
        }
      }
    });

    if (!review) {
      return null;
    }

    // Transform reviewer info
    const reviewerInfo: ReviewerInfo = review.isAnonymous
      ? {
          id: review.reviewer.id,
          displayName: 'Anonymous User',
          isAnonymous: true
        }
      : {
          id: review.reviewer.id,
          displayName: `${review.reviewer.firstName} ${review.reviewer.lastName}`,
          avatarUrl: review.reviewer.avatarUrl || undefined,
          isAnonymous: false
        };

    return {
      ...review,
      reviewer: reviewerInfo
    } as CompanyReviewDetail;
  }

  /**
   * Create a new company review
   */
  static async createCompanyReview(
    reviewerId: string,
    data: CreateCompanyReviewInput
  ): Promise<CompanyReviewDetail> {
    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: data.companyId }
    });

    if (!company) {
      throw new Error('Company not found');
    }

    // Check if user has already reviewed this company
    const existingReview = await prisma.companyReview.findFirst({
      where: {
        companyId: data.companyId,
        reviewerId: reviewerId
      }
    });

    if (existingReview) {
      throw new Error('You have already reviewed this company');
    }

    // Create the review
    const review = await prisma.companyReview.create({
      data: {
        ...data,
        reviewerId,
        isApproved: false // All reviews start as unapproved
      },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            companySlug: true,
            logoUrl: true
          }
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true
          }
        }
      }
    });

    // Transform reviewer info
    const reviewerInfo: ReviewerInfo = review.isAnonymous
      ? {
          id: review.reviewer.id,
          displayName: 'Anonymous User',
          isAnonymous: true
        }
      : {
          id: review.reviewer.id,
          displayName: `${review.reviewer.firstName} ${review.reviewer.lastName}`,
          avatarUrl: review.reviewer.avatarUrl || undefined,
          isAnonymous: false
        };

    return {
      ...review,
      reviewer: reviewerInfo
    } as CompanyReviewDetail;
  }

  /**
   * Update a company review
   */
  static async updateCompanyReview(
    id: string,
    reviewerId: string,
    data: UpdateCompanyReviewInput
  ): Promise<CompanyReviewDetail> {
    // Check if review exists and belongs to the reviewer
    const existingReview = await prisma.companyReview.findFirst({
      where: { id, reviewerId }
    });

    if (!existingReview) {
      throw new Error('Review not found or you do not have permission to update it');
    }

    // Update the review
    const updatedReview = await prisma.companyReview.update({
      where: { id },
      data: {
        ...data,
        isApproved: false // Reset approval status when edited
      },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            companySlug: true,
            logoUrl: true
          }
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true
          }
        }
      }
    });

    // Transform reviewer info
    const reviewerInfo: ReviewerInfo = updatedReview.isAnonymous
      ? {
          id: updatedReview.reviewer.id,
          displayName: 'Anonymous User',
          isAnonymous: true
        }
      : {
          id: updatedReview.reviewer.id,
          displayName: `${updatedReview.reviewer.firstName} ${updatedReview.reviewer.lastName}`,
          avatarUrl: updatedReview.reviewer.avatarUrl || undefined,
          isAnonymous: false
        };

    return {
      ...updatedReview,
      reviewer: reviewerInfo
    } as CompanyReviewDetail;
  }

  /**
   * Delete a company review
   */
  static async deleteCompanyReview(
    id: string,
    reviewerId: string
  ): Promise<void> {
    // Check if review exists and belongs to the reviewer
    const existingReview = await prisma.companyReview.findFirst({
      where: { id, reviewerId }
    });

    if (!existingReview) {
      throw new Error('Review not found or you do not have permission to delete it');
    }

    await prisma.companyReview.delete({
      where: { id }
    });
  }

  /**
   * Admin update review status
   */
  static async adminUpdateReview(
    id: string,
    data: AdminUpdateReviewInput
  ): Promise<CompanyReview> {
    const review = await prisma.companyReview.findUnique({
      where: { id }
    });

    if (!review) {
      throw new Error('Review not found');
    }

    return await prisma.companyReview.update({
      where: { id },
      data
    });
  }

  /**
   * Get company review statistics
   */
  static async getCompanyStatistics(
    companyId: string
  ): Promise<CompanyReviewStatistics> {
    // Get all approved reviews for the company
    const reviews = await prisma.companyReview.findMany({
      where: {
        companyId,
        isApproved: true
      },
      select: {
        rating: true,
        workLifeBalanceRating: true,
        salaryBenefitRating: true,
        managementRating: true,
        cultureRating: true,
        employmentStatus: true
      }
    });

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        averageWorkLifeBalance: 0,
        averageSalaryBenefit: 0,
        averageManagement: 0,
        averageCulture: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        byEmploymentStatus: { CURRENT: 0, FORMER: 0 },
        recommendationRate: 0
      };
    }

    // Calculate averages
    const totalReviews = reviews.length;
    
    const calculateAverage = (ratings: (number | null)[]) => {
      const validRatings = ratings.filter(r => r !== null) as number[];
      return validRatings.length > 0
        ? validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length
        : 0;
    };

    const averageRating = calculateAverage(reviews.map(r => r.rating));
    const averageWorkLifeBalance = calculateAverage(reviews.map(r => r.workLifeBalanceRating));
    const averageSalaryBenefit = calculateAverage(reviews.map(r => r.salaryBenefitRating));
    const averageManagement = calculateAverage(reviews.map(r => r.managementRating));
    const averageCulture = calculateAverage(reviews.map(r => r.cultureRating));

    // Calculate rating distribution
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    // Calculate by employment status
    const byEmploymentStatus = reviews.reduce((acc, review) => {
      acc[review.employmentStatus] = (acc[review.employmentStatus] || 0) + 1;
      return acc;
    }, {} as Record<EmploymentStatus, number>);

    // Calculate recommendation rate (4+ stars)
    const recommendedReviews = reviews.filter(r => r.rating >= 4).length;
    const recommendationRate = (recommendedReviews / totalReviews) * 100;

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      averageWorkLifeBalance: Math.round(averageWorkLifeBalance * 10) / 10,
      averageSalaryBenefit: Math.round(averageSalaryBenefit * 10) / 10,
      averageManagement: Math.round(averageManagement * 10) / 10,
      averageCulture: Math.round(averageCulture * 10) / 10,
      ratingDistribution,
      byEmploymentStatus,
      recommendationRate: Math.round(recommendationRate)
    };
  }

  /**
   * Check if user can review a company
   */
  static async canReviewCompany(
    userId: string,
    companyId: string
  ): Promise<{ canReview: boolean; reason?: string }> {
    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return { canReview: false, reason: 'Company not found' };
    }

    // Check if user has already reviewed this company
    const existingReview = await prisma.companyReview.findFirst({
      where: {
        companyId,
        reviewerId: userId
      }
    });

    if (existingReview) {
      return { canReview: false, reason: 'You have already reviewed this company' };
    }

    // Additional checks can be added here (e.g., user must be verified, etc.)

    return { canReview: true };
  }

  /**
   * Get user's reviews
   */
  static async getUserReviews(
    userId: string,
    includeUnapproved: boolean = true
  ): Promise<CompanyReviewWithRelations[]> {
    const where: Prisma.CompanyReviewWhereInput = { reviewerId: userId };
    
    if (!includeUnapproved) {
      where.isApproved = true;
    }

    const reviews = await prisma.companyReview.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            companySlug: true,
            logoUrl: true
          }
        }
      }
    });

    return reviews as CompanyReviewWithRelations[];
  }
}

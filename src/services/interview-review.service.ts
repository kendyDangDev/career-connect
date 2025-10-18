import { prisma } from '@/lib/prisma';
import { InterviewReview, Prisma, InterviewOutcome } from '@/generated/prisma';
import {
  CreateInterviewReviewInput,
  UpdateInterviewReviewInput,
  GetInterviewReviewsParams,
  InterviewReviewWithRelations,
  InterviewReviewResponse,
  InterviewReviewStatistics,
  InterviewReviewDetail,
  ReviewerInfo,
  InterviewTips,
} from '@/types/interview-review.types';

export class InterviewReviewService {
  /**
   * Get interview reviews with pagination and filters
   */
  static async getInterviewReviews({
    companyId,
    companySlug,
    jobId,
    reviewerId,
    outcome,
    minOverallRating,
    minDifficultyRating,
    recommendation,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  }: GetInterviewReviewsParams): Promise<InterviewReviewResponse> {
    // Build where clause
    const where: Prisma.InterviewReviewWhereInput = {};

    if (companyId) {
      where.companyId = companyId;
    } else if (companySlug) {
      // Get company by slug first
      const company = await prisma.company.findUnique({
        where: { companySlug },
        select: { id: true },
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
          hasMore: false,
        };
      }
    }

    if (jobId) {
      where.jobId = jobId;
    }

    if (reviewerId) {
      where.reviewerId = reviewerId;
    }

    if (outcome) {
      where.outcome = outcome;
    }

    if (minOverallRating) {
      where.overallRating = { gte: minOverallRating };
    }

    if (minDifficultyRating) {
      where.difficultyRating = { gte: minDifficultyRating };
    }

    if (recommendation !== undefined) {
      where.recommendation = recommendation;
    }

    // Build order by
    const orderBy: Prisma.InterviewReviewOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.interviewReview.count({ where });

    // Get reviews with relations
    const reviews = await prisma.interviewReview.findMany({
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
            logoUrl: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Transform reviews to handle anonymous reviewers
    const transformedReviews = reviews.map((review) => {
      const reviewerInfo: ReviewerInfo = review.isAnonymous
        ? {
            id: review.reviewer.id,
            displayName: 'Anonymous Candidate',
            isAnonymous: true,
          }
        : {
            id: review.reviewer.id,
            displayName: `${review.reviewer.firstName} ${review.reviewer.lastName}`,
            avatarUrl: review.reviewer.avatarUrl || undefined,
            isAnonymous: false,
          };

      return {
        ...review,
        reviewer: reviewerInfo,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      reviews: transformedReviews as any,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  /**
   * Get a single review by ID
   */
  static async getInterviewReviewById(id: string): Promise<InterviewReviewDetail | null> {
    const review = await prisma.interviewReview.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            companySlug: true,
            logoUrl: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!review) {
      return null;
    }

    // Transform reviewer info
    const reviewerInfo: ReviewerInfo = review.isAnonymous
      ? {
          id: review.reviewer.id,
          displayName: 'Anonymous Candidate',
          isAnonymous: true,
        }
      : {
          id: review.reviewer.id,
          displayName: `${review.reviewer.firstName} ${review.reviewer.lastName}`,
          avatarUrl: review.reviewer.avatarUrl || undefined,
          isAnonymous: false,
        };

    return {
      ...review,
      reviewer: reviewerInfo,
    } as InterviewReviewDetail;
  }

  /**
   * Create a new interview review
   */
  static async createInterviewReview(
    reviewerId: string,
    data: CreateInterviewReviewInput
  ): Promise<InterviewReviewDetail> {
    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
    });

    if (!company) {
      throw new Error('Company not found');
    }

    // Check if job exists (if provided)
    if (data.jobId) {
      const job = await prisma.job.findUnique({
        where: { id: data.jobId },
      });

      if (!job) {
        throw new Error('Job not found');
      }

      // Verify job belongs to the company
      if (job.companyId !== data.companyId) {
        throw new Error('Job does not belong to the specified company');
      }
    }

    // Check if user has already reviewed this company/job combination
    const existingReview = await prisma.interviewReview.findFirst({
      where: {
        companyId: data.companyId,
        jobId: data.jobId || null,
        reviewerId: reviewerId,
      },
    });

    if (existingReview) {
      throw new Error('You have already reviewed this interview');
    }

    // Create the review
    const review = await prisma.interviewReview.create({
      data: {
        ...data,
        reviewerId,
      },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            companySlug: true,
            logoUrl: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Transform reviewer info
    const reviewerInfo: ReviewerInfo = review.isAnonymous
      ? {
          id: review.reviewer.id,
          displayName: 'Anonymous Candidate',
          isAnonymous: true,
        }
      : {
          id: review.reviewer.id,
          displayName: `${review.reviewer.firstName} ${review.reviewer.lastName}`,
          avatarUrl: review.reviewer.avatarUrl || undefined,
          isAnonymous: false,
        };

    return {
      ...review,
      reviewer: reviewerInfo,
    } as InterviewReviewDetail;
  }

  /**
   * Update an interview review
   */
  static async updateInterviewReview(
    id: string,
    reviewerId: string,
    data: UpdateInterviewReviewInput
  ): Promise<InterviewReviewDetail> {
    // Check if review exists and belongs to the reviewer
    const existingReview = await prisma.interviewReview.findFirst({
      where: { id, reviewerId },
    });

    if (!existingReview) {
      throw new Error('Review not found or you do not have permission to update it');
    }

    // Update the review
    const updatedReview = await prisma.interviewReview.update({
      where: { id },
      data,
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            companySlug: true,
            logoUrl: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Transform reviewer info
    const reviewerInfo: ReviewerInfo = updatedReview.isAnonymous
      ? {
          id: updatedReview.reviewer.id,
          displayName: 'Anonymous Candidate',
          isAnonymous: true,
        }
      : {
          id: updatedReview.reviewer.id,
          displayName: `${updatedReview.reviewer.firstName} ${updatedReview.reviewer.lastName}`,
          avatarUrl: updatedReview.reviewer.avatarUrl || undefined,
          isAnonymous: false,
        };

    return {
      ...updatedReview,
      reviewer: reviewerInfo,
    } as InterviewReviewDetail;
  }

  /**
   * Delete an interview review
   */
  static async deleteInterviewReview(id: string, reviewerId: string): Promise<void> {
    // Check if review exists and belongs to the reviewer
    const existingReview = await prisma.interviewReview.findFirst({
      where: { id, reviewerId },
    });

    if (!existingReview) {
      throw new Error('Review not found or you do not have permission to delete it');
    }

    await prisma.interviewReview.delete({
      where: { id },
    });
  }

  /**
   * Get interview statistics for a company
   */
  static async getCompanyInterviewStatistics(
    companyId: string
  ): Promise<InterviewReviewStatistics> {
    const reviews = await prisma.interviewReview.findMany({
      where: { companyId },
      select: {
        overallRating: true,
        difficultyRating: true,
        recommendation: true,
        outcome: true,
      },
    });

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageOverallRating: 0,
        averageDifficultyRating: 0,
        recommendationRate: 0,
        outcomeDistribution: { OFFER: 0, REJECTION: 0, PENDING: 0 },
        ratingDistribution: {
          overall: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          difficulty: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
      };
    }

    // Calculate averages
    const totalReviews = reviews.length;
    const averageOverallRating =
      reviews.reduce((sum, r) => sum + r.overallRating, 0) / totalReviews;
    const averageDifficultyRating =
      reviews.reduce((sum, r) => sum + r.difficultyRating, 0) / totalReviews;

    // Calculate recommendation rate
    const recommendedCount = reviews.filter((r) => r.recommendation).length;
    const recommendationRate = (recommendedCount / totalReviews) * 100;

    // Calculate outcome distribution
    const outcomeDistribution = reviews.reduce(
      (acc, review) => {
        acc[review.outcome] = (acc[review.outcome] || 0) + 1;
        return acc;
      },
      {} as Record<InterviewOutcome, number>
    );

    // Calculate rating distributions
    const overallRatingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const difficultyRatingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    reviews.forEach((review) => {
      overallRatingDist[review.overallRating]++;
      difficultyRatingDist[review.difficultyRating]++;
    });

    return {
      totalReviews,
      averageOverallRating: Math.round(averageOverallRating * 10) / 10,
      averageDifficultyRating: Math.round(averageDifficultyRating * 10) / 10,
      recommendationRate: Math.round(recommendationRate),
      outcomeDistribution,
      ratingDistribution: {
        overall: overallRatingDist,
        difficulty: difficultyRatingDist,
      },
    };
  }

  /**
   * Get interview tips for a company
   */
  static async getInterviewTips(companyId: string): Promise<InterviewTips> {
    const reviews = await prisma.interviewReview.findMany({
      where: {
        companyId,
        interviewQuestions: { not: null },
      },
      select: {
        interviewQuestions: true,
        processDescription: true,
        difficultyRating: true,
      },
    });

    if (reviews.length === 0) {
      return {
        companyId,
        commonQuestions: [],
        processOverview: 'No interview process information available yet.',
        preparationTips: [
          'Research the company thoroughly',
          'Practice common interview questions',
          'Prepare questions to ask the interviewer',
        ],
        difficultyLevel: 'Medium',
      };
    }

    // Extract and parse questions
    const allQuestions: string[] = [];
    reviews.forEach((review) => {
      if (review.interviewQuestions) {
        // Split questions by common delimiters
        const questions = review.interviewQuestions
          .split(/[\n\r]+|[0-9]+\.|[-•]/)
          .map((q) => q.trim())
          .filter((q) => q.length > 10);
        allQuestions.push(...questions);
      }
    });

    // Get most common questions (deduplicate similar ones)
    const uniqueQuestions = [...new Set(allQuestions)].slice(0, 10);

    // Generate process overview
    const processDescriptions = reviews
      .filter((r) => r.processDescription)
      .map((r) => r.processDescription)
      .filter(Boolean) as string[];

    const processOverview =
      processDescriptions.length > 0
        ? processDescriptions[0] // Use the most recent one
        : 'No specific process information available.';

    // Calculate difficulty level
    const avgDifficulty = reviews.reduce((sum, r) => sum + r.difficultyRating, 0) / reviews.length;
    const difficultyLevel = avgDifficulty <= 2 ? 'Easy' : avgDifficulty <= 3.5 ? 'Medium' : 'Hard';

    // Generate preparation tips based on difficulty
    const preparationTips = [
      'Research the company culture and values',
      'Review the job description thoroughly',
      'Prepare examples using the STAR method',
    ];

    if (difficultyLevel === 'Hard') {
      preparationTips.push(
        'Practice technical questions relevant to the role',
        'Be ready for challenging behavioral scenarios'
      );
    }

    return {
      companyId,
      commonQuestions: uniqueQuestions,
      processOverview,
      preparationTips,
      difficultyLevel,
    };
  }

  /**
   * Check if user can review an interview
   */
  static async canReviewInterview(
    userId: string,
    companyId: string,
    jobId?: string
  ): Promise<{ canReview: boolean; reason?: string }> {
    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return { canReview: false, reason: 'Company not found' };
    }

    // Check if already reviewed
    const existingReview = await prisma.interviewReview.findFirst({
      where: {
        companyId,
        jobId: jobId || null,
        reviewerId: userId,
      },
    });

    if (existingReview) {
      return { canReview: false, reason: 'You have already reviewed this interview' };
    }

    return { canReview: true };
  }

  /**
   * Get user's interview reviews
   */
  static async getUserInterviewReviews(userId: string): Promise<InterviewReviewWithRelations[]> {
    const reviews = await prisma.interviewReview.findMany({
      where: { reviewerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            companySlug: true,
            logoUrl: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return reviews as InterviewReviewWithRelations[];
  }
}

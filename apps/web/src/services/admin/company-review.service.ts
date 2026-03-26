import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import type {
  AdminCompanyReviewListItem,
  AdminCompanyReviewListResponseData,
  CompanyReviewModerationStatus,
} from '@/types/admin/company-review';

interface AdminCompanyReviewListParams {
  page?: number;
  limit?: number;
  status?: CompanyReviewModerationStatus;
  search?: string;
}

export class AdminCompanyReviewService {
  static async getCompanyReviews({
    page = 1,
    limit = 10,
    status = 'pending',
    search,
  }: AdminCompanyReviewListParams): Promise<AdminCompanyReviewListResponseData> {
    const where: Prisma.CompanyReviewWhereInput = {};

    if (status === 'pending') {
      where.isApproved = false;
    } else if (status === 'approved') {
      where.isApproved = true;
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          reviewText: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          company: {
            is: {
              companyName: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          reviewer: {
            is: {
              firstName: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          reviewer: {
            is: {
              lastName: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          reviewer: {
            is: {
              email: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.companyReview.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
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
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.companyReview.count({ where }),
    ]);

    const items: AdminCompanyReviewListItem[] = reviews.map((review) => {
      const displayName = review.isAnonymous
        ? 'Ẩn danh'
        : `${review.reviewer.firstName ?? ''} ${review.reviewer.lastName ?? ''}`.trim() ||
          review.reviewer.email;

      return {
        id: review.id,
        company: {
          id: review.company.id,
          companyName: review.company.companyName,
          companySlug: review.company.companySlug,
          logoUrl: review.company.logoUrl,
        },
        reviewer: {
          id: review.reviewer.id,
          displayName,
          isAnonymous: review.isAnonymous,
        },
        rating: review.rating,
        title: review.title,
        reviewText: review.reviewText,
        pros: review.pros,
        cons: review.cons,
        workLifeBalanceRating: review.workLifeBalanceRating,
        salaryBenefitRating: review.salaryBenefitRating,
        managementRating: review.managementRating,
        cultureRating: review.cultureRating,
        employmentStatus: review.employmentStatus,
        positionTitle: review.positionTitle,
        employmentLength: review.employmentLength,
        isApproved: review.isApproved,
        createdAt: review.createdAt.toISOString(),
      };
    });

    return {
      reviews: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        status,
        search,
      },
    };
  }
}

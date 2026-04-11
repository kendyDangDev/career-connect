import { prisma } from '@/lib/prisma';
import { CompanyUpdateDTO, CompanyResponse, PublicCompanyProfile } from '@/types/company';
import { generateCompanySlug } from '@/lib/utils/company-utils';
import { Company, Prisma } from '@/generated/prisma';

export class CompanyService {
  /**
   * Get company profile with additional info
   */
  static async getCompanyProfile(companyId: string): Promise<CompanyResponse | null> {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        industry: true,
        _count: {
          select: {
            companyUsers: true,
            jobs: {
              where: {
                status: 'ACTIVE',
              },
            },
            companyFollowers: true,
          },
        },
      },
    });

    if (!company) return null;

    return {
      ...company,
      employeeCount: company._count.companyUsers,
      activeJobCount: company._count.jobs,
      followerCount: company._count.companyFollowers,
    };
  }

  /**
   * Get public company profile (for candidates viewing)
   */
  static async getPublicCompanyProfile(companySlug: string): Promise<PublicCompanyProfile | null> {
    const company = await prisma.company.findUnique({
      where: { companySlug },
      include: {
        industry: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            jobs: {
              where: {
                status: 'ACTIVE',
              },
            },
            companyFollowers: true,
            companyReviews: {
              where: {
                isApproved: true,
              },
            },
          },
        },
      },
    });

    if (!company) return null;

    // Calculate review stats
    const reviewStats = await this.getCompanyReviewStats(company.id);

    return {
      id: company.id,
      companyName: company.companyName,
      companySlug: company.companySlug,
      industry: company.industry,
      companySize: company.companySize,
      websiteUrl: company.websiteUrl,
      description: company.description,
      logoUrl: company.logoUrl,
      coverImageUrl: company.coverImageUrl,
      address: company.address,
      city: company.city,
      province: company.province,
      country: company.country,
      foundedYear: company.foundedYear,
      verificationStatus: company.verificationStatus,
      activeJobCount: company._count.jobs,
      followerCount: company._count.companyFollowers,
      reviewStats,
    };
  }

  /**
   * Update company profile
   */
  static async updateCompanyProfile(companyId: string, data: CompanyUpdateDTO): Promise<Company> {
    const updateData: Prisma.CompanyUpdateInput = {
      ...data,
      updatedAt: new Date(),
    };

    // If company name changes, update slug
    if (data.companyName) {
      updateData.companySlug = generateCompanySlug(data.companyName);

      // Check if slug already exists
      const existingCompany = await prisma.company.findFirst({
        where: {
          companySlug: updateData.companySlug as string,
          id: { not: companyId },
        },
      });

      if (existingCompany) {
        // Add a suffix to make it unique
        const count = await prisma.company.count({
          where: {
            companySlug: {
              startsWith: updateData.companySlug as string,
            },
          },
        });
        updateData.companySlug = `${updateData.companySlug}-${count + 1}`;
      }
    }

    return await prisma.company.update({
      where: { id: companyId },
      data: updateData,
    });
  }

  /**
   * Update company media (logo, cover image)
   */
  static async updateCompanyMedia(
    companyId: string,
    mediaType: 'logo' | 'cover',
    fileUrl: string
  ): Promise<Company> {
    const updateData: Prisma.CompanyUpdateInput = {
      updatedAt: new Date(),
    };

    if (mediaType === 'logo') {
      updateData.logoUrl = fileUrl;
    } else {
      updateData.coverImageUrl = fileUrl;
    }

    return await prisma.company.update({
      where: { id: companyId },
      data: updateData,
    });
  }

  /**
   * Get company review statistics
   */
  static async getCompanyReviewStats(companyId: string): Promise<{
    totalReviews: number;
    averageRating: number;
  }> {
    const stats = await prisma.companyReview.aggregate({
      where: {
        companyId,
        isApproved: true,
      },
      _count: true,
      _avg: {
        rating: true,
      },
    });

    return {
      totalReviews: stats._count,
      averageRating: stats._avg.rating || 0,
    };
  }

  /**
   * Check if user has permission to manage company
   */
  static async checkUserCompanyPermission(userId: string, companyId: string): Promise<boolean> {
    const companyUser = await prisma.companyUser.findFirst({
      where: {
        userId,
        companyId,
        role: {
          in: ['ADMIN', 'HR_MANAGER'],
        },
      },
    });

    return !!companyUser;
  }

  /**
   * Get company statistics for dashboard
   */
  static async getCompanyStats(companyId: string) {
    const [activeJobs, totalApplications, followers, profileViews, teamMembers] = await Promise.all([
        // Active jobs count
        prisma.job.count({
          where: {
            companyId,
            status: 'ACTIVE',
          },
        }),

        // Total applications
        prisma.application.count({
          where: {
            job: { companyId },
          },
        }),

        // Followers count
        prisma.companyFollower.count({
          where: { companyId },
        }),

        // Use job views as the visibility metric until dedicated company profile views exist.
        prisma.jobView.count({
          where: {
            job: { companyId },
            viewedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),

        prisma.companyUser.count({
          where: { companyId },
        }),
      ]);

    return {
      activeJobs,
      totalApplications,
      followers,
      profileViews,
      teamMembers,
    };
  }

  /**
   * Create initial company for new employer
   */
  static async createCompany(data: {
    companyName: string;
    userId: string;
    email?: string;
    phone?: string;
  }): Promise<Company> {
    const companySlug = generateCompanySlug(data.companyName);

    // Check if slug exists
    const existingCount = await prisma.company.count({
      where: {
        companySlug: {
          startsWith: companySlug,
        },
      },
    });

    const finalSlug = existingCount > 0 ? `${companySlug}-${existingCount + 1}` : companySlug;

    // Create company and link user
    const company = await prisma.company.create({
      data: {
        companyName: data.companyName,
        companySlug: finalSlug,
        email: data.email,
        phone: data.phone,
        companyUsers: {
          create: {
            userId: data.userId,
            role: 'ADMIN',
            isPrimaryContact: true,
          },
        },
      },
    });

    return company;
  }
}

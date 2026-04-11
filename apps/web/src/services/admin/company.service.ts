import { prisma } from "@/lib/prisma";
import { NotificationType, Prisma, UserType, VerificationStatus } from "@/generated/prisma";
import { emailService } from '@/lib/services/email.service';
import { notificationService } from '@/lib/services/notification-service';
import {
  CompanyListParams,
  AdminCompanyDetail,
  AdminCompanyListItem,
  CompanyListResponse,
  AdminCompanyUpdateDTO,
  CompanyStatistics,
  AdminCompanyStats,
  CompanyVerificationDTO
} from "@/types/admin/company";

export class AdminCompanyService {
  /**
   * Get paginated list of companies with filters
   */
  static async getCompanies(params: CompanyListParams): Promise<CompanyListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      companySize,
      industryId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      fromDate,
      toDate
    } = params;

    // Build where clause
    const where: Prisma.CompanyWhereInput = {};

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.verificationStatus = status ;
    }

    if (companySize) {
      where.companySize = companySize;
    }

    if (industryId) {
      where.industryId = industryId;
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }
      if (toDate) {
        where.createdAt.lte = new Date(toDate);
      }
    }

    // Build orderBy
    const orderBy: Prisma.CompanyOrderByWithRelationInput = {};
    if (sortBy === 'activeJobCount') {
      // Sort by job count requires different approach
      orderBy.jobs = { _count: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Execute queries
    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        select: {
          id: true,
          companyName: true,
          companySlug: true,
          industry: {
            select: {
              id: true,
              name: true
            }
          },
          companySize: true,
          verificationStatus: true,
          logoUrl: true,
          city: true,
          province: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              companyUsers: true,
              jobs: true,
              companyFollowers: true
            }
          }
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.company.count({ where })
    ]);

    return {
      companies: companies as AdminCompanyListItem[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        status,
        companySize,
        industryId
      }
    };
  }

  /**
   * Get detailed company information
   */
  static async getCompanyDetail(companyId: string): Promise<AdminCompanyDetail | null> {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        industry: {
          select: {
            id: true,
            name: true
          }
        },
        companyUsers: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true
              }
            }
          }
        },
        _count: {
          select: {
            companyUsers: true,
            jobs: true,
            companyFollowers: true,
            companyReviews: true
          }
        }
      }
    });

    if (!company) return null;

    // Get statistics
    const stats = await this.getCompanyStatistics(companyId);

    return {
      ...company,
      stats
    } as AdminCompanyDetail;
  }

  /**
   * Update company information
   */
  static async updateCompany(
    companyId: string,
    data: AdminCompanyUpdateDTO
  ): Promise<AdminCompanyDetail | null> {
    // Get current company data for audit log
    const currentCompany = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!currentCompany) return null;

    // Update company
    await prisma.company.update({
      where: { id: companyId },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    // Return updated company detail
    return this.getCompanyDetail(companyId);
  }

  /**
   * Update company verification status
   */
  static async updateVerificationStatus(
    companyId: string,
    data: CompanyVerificationDTO
  ): Promise<AdminCompanyDetail | null> {
    const { verificationStatus, verificationNotes, notifyCompany } = data;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        companyUsers: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                userType: true,
              },
            },
          },
          orderBy: [{ isPrimaryContact: 'desc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!company) {
      return null;
    }

    const primaryContact =
      company.companyUsers.find((companyUser) => companyUser.isPrimaryContact) ??
      company.companyUsers.find((companyUser) => companyUser.role === 'ADMIN') ??
      company.companyUsers[0];

    await prisma.$transaction(async (tx) => {
      await tx.company.update({
        where: { id: companyId },
        data: {
          verificationStatus,
          verificationNotes:
            verificationStatus === VerificationStatus.REJECTED
              ? verificationNotes?.trim() || null
              : null,
          updatedAt: new Date(),
        },
      });

      if (
        verificationStatus === VerificationStatus.VERIFIED &&
        primaryContact?.user.userType !== UserType.EMPLOYER
      ) {
        await tx.user.update({
          where: { id: primaryContact.user.id },
          data: {
            userType: UserType.EMPLOYER,
          },
        });
      }
    });

    if (notifyCompany && primaryContact?.user.email) {
      try {
        const recipientName = primaryContact.user.firstName || undefined;

        if (verificationStatus === VerificationStatus.VERIFIED) {
        await emailService.sendCompanyApprovalEmail(
          primaryContact.user.email,
          company.companyName,
          recipientName
        );

        await notificationService.createNotification({
          userId: primaryContact.user.id,
          type: NotificationType.SYSTEM,
          title: 'Yêu cầu trở thành nhà tuyển dụng đã được duyệt',
          message: `${company.companyName} đã được xác minh. Bạn có thể truy cập Employer Dashboard ngay bây giờ.`,
          relatedEntityId: companyId,
          relatedEntityType: 'company',
        });
      }

        if (verificationStatus === VerificationStatus.REJECTED) {
        const rejectionReason = verificationNotes?.trim() || 'Vui lòng kiểm tra lại hồ sơ doanh nghiệp và nộp lại.';

        await emailService.sendCompanyRejectionEmail(
          primaryContact.user.email,
          company.companyName,
          rejectionReason,
          recipientName
        );

        await notificationService.createNotification({
          userId: primaryContact.user.id,
          type: NotificationType.SYSTEM,
          title: 'Yêu cầu trở thành nhà tuyển dụng bị từ chối',
          message: rejectionReason,
          relatedEntityId: companyId,
          relatedEntityType: 'company',
        });
      }
      } catch (error) {
        console.error('Failed to notify company about verification status change:', error);
      }
    }

    return this.getCompanyDetail(companyId);
  }

  /**
   * Delete company (soft or hard delete)
   */
  static async deleteCompany(companyId: string, hardDelete: boolean = false): Promise<boolean> {
    if (hardDelete) {
      // Hard delete - remove from database
      await prisma.company.delete({
        where: { id: companyId }
      });
    } else {
      // Soft delete - just change status
      await prisma.company.update({
        where: { id: companyId },
        data: {
          verificationStatus: VerificationStatus.REJECTED,
          updatedAt: new Date()
        }
      });
    }

    return true;
  }

  /**
   * Get company statistics
   */
  static async getCompanyStatistics(companyId: string): Promise<CompanyStatistics> {
    const [
      jobStats,
      applicationStats,
      followers,
      reviews,
      viewStats,
      primaryContact
    ] = await Promise.all([
      // Job statistics
      prisma.job.groupBy({
        by: ['status'],
        where: { companyId },
        _count: true
      }),
      
      // Application statistics
      prisma.application.groupBy({
        by: ['status'],
        where: {
          job: { companyId }
        },
        _count: true
      }),
      
      // Followers count
      prisma.companyFollower.count({
        where: { companyId }
      }),
      
      // Reviews statistics
      prisma.companyReview.aggregate({
        where: {
          companyId,
          isApproved: true
        },
        _count: true,
        _avg: {
          rating: true
        }
      }),
      
      // View statistics
      Promise.all([
        prisma.jobView.count({
          where: {
            job: { companyId }
          }
        }),
        prisma.jobView.count({
          where: {
            job: { companyId },
            viewedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]),
      
      // Primary contact
      prisma.companyUser.findFirst({
        where: {
          companyId,
          isPrimaryContact: true
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          }
        }
      })
    ]);

    // Process job stats
    const totalJobs = jobStats.reduce((sum, stat) => sum + stat._count, 0);
    const activeJobs = jobStats.find(stat => stat.status === 'ACTIVE')?._count || 0;

    // Process application stats
    const totalApplications = applicationStats.reduce((sum, stat) => sum + stat._count, 0);
    const pendingApplications = applicationStats.find(stat => stat.status === 'APPLIED')?._count || 0;

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      totalFollowers: followers,
      totalReviews: reviews._count,
      averageRating: reviews._avg.rating || 0,
      totalViews: viewStats[0],
      viewsLastMonth: viewStats[1],
      primaryContact: primaryContact ? {
        id: primaryContact.user.id,
        name: `${primaryContact.user.firstName || ''} ${primaryContact.user.lastName || ''}`.trim(),
        email: primaryContact.user.email,
        phone: primaryContact.user.phone || undefined
      } : undefined
    };
  }

  /**
   * Get admin dashboard statistics
   */
  static async getAdminStats(): Promise<AdminCompanyStats> {
    const [
      statusCounts,
      sizeCounts,
      industryCounts,
      recentCompanies,
      growthData
    ] = await Promise.all([
      // Companies by status
      prisma.company.groupBy({
        by: ['verificationStatus'],
        _count: true
      }),
      
      // Companies by size
      prisma.company.groupBy({
        by: ['companySize'],
        where: { companySize: { not: null } },
        _count: true
      }),
      
      // Companies by industry
      prisma.company.groupBy({
        by: ['industryId'],
        where: { industryId: { not: null } },
        _count: true
      }),
      
      // Recent companies
      prisma.company.findMany({
        select: {
          id: true,
          companyName: true,
          createdAt: true,
          verificationStatus: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      
      // Growth statistics (last 6 months)
      this.getGrowthStatistics(6)
    ]);

    // Get industry names
    const industryIds = industryCounts.map(i => i.industryId).filter(id => id !== null);
    const industries = await prisma.industry.findMany({
      where: { id: { in: industryIds as string[] } },
      select: { id: true, name: true }
    });

    const industryMap = new Map(industries.map(i => [i.id, i.name]));

    // Process status counts
    const totalCompanies = statusCounts.reduce((sum, s) => sum + s._count, 0);
    const verifiedCompanies = statusCounts.find(s => s.verificationStatus === 'VERIFIED')?._count || 0;
    const pendingVerification = statusCounts.find(s => s.verificationStatus === 'PENDING')?._count || 0;
    const rejectedCompanies = statusCounts.find(s => s.verificationStatus === 'REJECTED')?._count || 0;

    return {
      totalCompanies,
      verifiedCompanies,
      pendingVerification,
      rejectedCompanies,
      companiesBySize: sizeCounts.map(s => ({
        size: s.companySize!,
        count: s._count
      })),
      companiesByIndustry: industryCounts
        .filter(i => i.industryId !== null)
        .map(i => ({
          industryId: i.industryId!,
          industryName: industryMap.get(i.industryId!) || 'Unknown',
          count: i._count
        })),
      recentCompanies,
      growthStats: growthData
    };
  }

  /**
   * Get growth statistics for the last N months
   */
  private static async getGrowthStatistics(months: number) {
    const stats = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const [newCompanies, verifiedInMonth] = await Promise.all([
        prisma.company.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }),
        prisma.company.count({
          where: {
            verificationStatus: 'VERIFIED',
            updatedAt: {
              gte: startDate,
              lte: endDate
            }
          }
        })
      ]);

      stats.push({
        month: startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        newCompanies,
        verifiedCompanies: verifiedInMonth
      });
    }

    return stats;
  }

  /**
   * Bulk update companies
   */
  static async bulkUpdateStatus(
    companyIds: string[],
    status: VerificationStatus
  ): Promise<number> {
    const result = await prisma.company.updateMany({
      where: {
        id: { in: companyIds }
      },
      data: {
        verificationStatus: status,
        updatedAt: new Date()
      }
    });

    return result.count;
  }
}

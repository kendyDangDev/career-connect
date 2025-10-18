import { prisma } from '@/lib/prisma';
import { ApplicationStatus, UserType } from '@/generated/prisma';

export interface ApplicationListParams {
  page?: number;
  limit?: number;
  sortBy?: 'appliedAt' | 'statusUpdatedAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: ApplicationStatus;
  jobId?: string;
  candidateId?: string;
}

export interface ApplicationListResponse {
  applications: ApplicationListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApplicationListItem {
  id: string;
  jobId: string;
  candidateId: string;
  userId: string;
  status: ApplicationStatus;
  appliedAt: Date;
  statusUpdatedAt: Date;
  cvFileUrl?: string | null;
  coverLetter?: string | null;
  rating?: number | null;
  recruiterNotes?: string | null;
  interviewScheduledAt?: Date | null;
  job: {
    id: string;
    title: string;
    company: {
      id: string;
      companyName: string;
      logoUrl?: string | null;
    };
  };
  candidate: {
    id: string;
    currentPosition?: string | null;
    experienceYears?: number | null;
    user: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      email: string;
      phone?: string | null;
      avatarUrl?: string | null;
    };
  };
}

export interface ApplicationDetail extends ApplicationListItem {
  createdAt: Date;
  updatedAt: Date;
  candidate: {
    id: string;
    currentPosition?: string | null;
    experienceYears?: number | null;
    expectedSalaryMin?: number | null;
    expectedSalaryMax?: number | null;
    availabilityStatus: string;
    preferredWorkType?: string | null;
    preferredLocationType?: string | null;
    cvFileUrl?: string | null;
    user: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      email: string;
      phone?: string | null;
      avatarUrl?: string | null;
      profile?: {
        dateOfBirth?: Date | null;
        gender?: string | null;
        address?: string | null;
        city?: string | null;
        province?: string | null;
        bio?: string | null;
        linkedinUrl?: string | null;
        githubUrl?: string | null;
        portfolioUrl?: string | null;
      } | null;
    };
    skills: {
      skill: {
        id: string;
        name: string;
        category: string;
      };
      proficiencyLevel: string;
      yearsExperience?: number | null;
    }[];
    education: {
      id: string;
      institutionName: string;
      degreeType: string;
      fieldOfStudy: string;
      startDate: Date;
      endDate?: Date | null;
      isCurrentlyStudying: boolean;
      gpa?: number | null;
    }[];
    experiences: {
      id: string;
      companyName: string;
      position: string;
      startDate: Date;
      endDate?: Date | null;
      isCurrentPosition: boolean;
      description?: string | null;
    }[];
  };
  timeline: {
    id: string;
    status: ApplicationStatus;
    note?: string | null;
    createdAt: Date;
    changedBy: string;
    user: {
      firstName?: string | null;
      lastName?: string | null;
      userType: UserType;
    };
  }[];
}

export class ApplicationService {
  /**
   * Get all applications with filters and pagination
   * Accessible by ADMIN and authorized company users
   */
  static async getApplications(params: ApplicationListParams): Promise<ApplicationListResponse> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'appliedAt',
      sortOrder = 'desc',
      search,
      status,
      jobId,
      candidateId,
    } = params;

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (jobId) {
      where.jobId = jobId;
    }

    if (candidateId) {
      where.candidateId = candidateId;
    }

    if (search) {
      where.OR = [
        {
          job: {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          job: {
            company: {
              companyName: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          candidate: {
            user: {
              OR: [
                {
                  firstName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  lastName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  email: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          },
        },
      ];
    }

    // Get total count
    const total = await prisma.application.count({ where });

    // Get applications
    const applications = await prisma.application.findMany({
      where,
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                companyName: true,
                logoUrl: true,
              },
            },
          },
        },
        candidate: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: offset,
      take: limit,
    });

    return {
      applications: applications as ApplicationListItem[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get applications for a specific candidate
   * Accessible by the candidate themselves or authorized users
   */
  static async getCandidateApplications(
    candidateId: string,
    params: ApplicationListParams
  ): Promise<ApplicationListResponse> {
    return this.getApplications({
      ...params,
      candidateId,
    });
  }

  /**
   * Get applications for a specific job
   * Accessible by company users who own the job
   */
  static async getJobApplications(
    jobId: string,
    params: ApplicationListParams
  ): Promise<ApplicationListResponse> {
    return this.getApplications({
      ...params,
      jobId,
    });
  }

  /**
   * Get detailed information about a specific application
   */
  static async getApplicationDetail(applicationId: string): Promise<ApplicationDetail | null> {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                companyName: true,
                logoUrl: true,
              },
            },
          },
        },
        candidate: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            skills: {
              include: {
                skill: true,
              },
            },
            education: {
              orderBy: {
                startDate: 'desc',
              },
            },
            experience: {
              orderBy: {
                startDate: 'desc',
              },
            },
          },
        },
        timeline: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                userType: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return application as ApplicationDetail | null;
  }

  /**
   * Update application status
   * Accessible by company users who own the job
   */
  static async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    note?: string,
    changedBy?: string,
    rating?: number,
    recruiterNotes?: string,
    interviewScheduledAt?: Date
  ): Promise<ApplicationDetail | null> {
    const application = await prisma.$transaction(async (tx) => {
      // Update application
      const updatedApplication = await tx.application.update({
        where: { id: applicationId },
        data: {
          status,
          rating,
          recruiterNotes,
          interviewScheduledAt,
          statusUpdatedAt: new Date(),
        },
      });

      // Create timeline entry if changedBy is provided
      if (changedBy) {
        await tx.applicationTimeline.create({
          data: {
            applicationId,
            status,
            note,
            changedBy,
          },
        });
      }

      return updatedApplication;
    });

    // Return updated application with full details
    return this.getApplicationDetail(application.id);
  }

  /**
   * Get application statistics
   */
  static async getApplicationStats(filters?: {
    companyId?: string;
    jobId?: string;
    candidateId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: any = {};

    if (filters?.companyId) {
      where.job = {
        companyId: filters.companyId,
      };
    }

    if (filters?.jobId) {
      where.jobId = filters.jobId;
    }

    if (filters?.candidateId) {
      where.candidateId = filters.candidateId;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.appliedAt = {};
      if (filters.dateFrom) {
        where.appliedAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.appliedAt.lte = filters.dateTo;
      }
    }

    const [statusStats, totalApplications] = await Promise.all([
      prisma.application.groupBy({
        by: ['status'],
        where,
        _count: {
          status: true,
        },
      }),
      prisma.application.count({ where }),
    ]);

    const statusCounts = statusStats.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      },
      {} as Record<ApplicationStatus, number>
    );

    return {
      total: totalApplications,
      byStatus: statusCounts,
    };
  }

  /**
   * Check if user can access application
   */
  static async canUserAccessApplication(
    applicationId: string,
    userId: string,
    userType: UserType
  ): Promise<boolean> {
    if (userType === UserType.ADMIN) {
      return true;
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: {
              include: {
                companyUsers: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      return false;
    }

    // Candidate can access their own applications
    if (userType === UserType.CANDIDATE && application.userId === userId) {
      return true;
    }

    // Company users can access applications for their company's jobs
    if (userType === UserType.EMPLOYER) {
      return application.job.company.companyUsers.some((cu) => cu.userId === userId);
    }

    return false;
  }
}

import { prisma } from '@/lib/prisma';
import { Prisma, ApplicationStatus } from '@/generated/prisma';
import {
  ApplicationListItem,
  ApplicationDetail,
  ApplicationListResponse,
  ApplicationListParams,
  ApplicationStats,
  UpdateApplicationStatusDTO,
  BulkUpdateApplicationsDTO,
  AddApplicationNoteDTO,
  ApplicationFilterCriteria,
  ScoringConfig,
} from '@/types/employer/application';
import {
  calculateMatchScore,
  filterApplications,
  sortApplications,
  getDefaultScoringConfig,
} from '@/lib/utils/application-utils';

export class EmployerApplicationService {
  /**
   * Get applications for a job with filters and scoring
   */
  static async getJobApplications(
    jobId: string,
    companyId: string,
    params: ApplicationListParams
  ): Promise<ApplicationListResponse> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'appliedAt',
      sortOrder = 'desc',
      search,
      filter,
      includeMatchScores = false,
    } = params;

    // Verify job belongs to company
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        companyId,
      },
      include: {
        jobSkills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!job) {
      throw new Error('Job not found or access denied');
    }

    // Build where clause
    const where: Prisma.ApplicationWhereInput = {
      jobId,
    };

    // Add search filter
    if (search) {
      where.OR = [
        {
          candidate: {
            user: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    // Get all applications (for filtering and stats)
    const allApplications = await prisma.application.findMany({
      where,
      include: {
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
                profile: {
                  select: {
                    city: true,
                    province: true,
                  },
                },
              },
            },
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    });

    // Transform to ApplicationListItem format
    let applications: ApplicationListItem[] = allApplications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      candidateId: app.candidateId,
      status: app.status,
      appliedAt: app.appliedAt,
      statusUpdatedAt: app.statusUpdatedAt,
      cvFileUrl: app.cvFileUrl,
      coverLetter: app.coverLetter,
      rating: app.rating,
      recruiterNotes: app.recruiterNotes,
      interviewScheduledAt: app.interviewScheduledAt,
      candidate: {
        id: app.candidate.id,
        currentPosition: app.candidate.currentPosition,
        experienceYears: app.candidate.experienceYears,
        expectedSalaryMin: app.candidate.expectedSalaryMin?.toNumber() || null,
        expectedSalaryMax: app.candidate.expectedSalaryMax?.toNumber() || null,
        user: app.candidate.user,
        skills: app.candidate.skills.map((cs) => ({
          skill: {
            id: cs.skill.id,
            name: cs.skill.name,
          },
          proficiencyLevel: cs.proficiencyLevel,
          yearsExperience: cs.yearsExperience,
        })),
      },
    }));

    // Calculate match scores if requested
    if (includeMatchScores) {
      const scoringConfig = getDefaultScoringConfig();
      applications = applications.map((app) => {
        const matchResult = calculateMatchScore(
          app.candidate,
          {
            skills: job.jobSkills,
            experienceLevel: job.experienceLevel,
            salaryMin: job.salaryMin?.toNumber(),
            salaryMax: job.salaryMax?.toNumber(),
            locationCity: job.locationCity,
            workLocationType: job.workLocationType,
          },
          scoringConfig
        );

        return {
          ...app,
          matchScore: matchResult.score,
          matchDetails: matchResult.details,
        };
      });
    }

    // Apply filters
    if (filter) {
      applications = filterApplications(applications, filter);
    }

    // Calculate stats before pagination
    const stats = await this.calculateApplicationStats(applications);

    // Sort applications
    applications = sortApplications(applications, sortBy, sortOrder);

    // Paginate
    const startIndex = (page - 1) * limit;
    const paginatedApplications = applications.slice(startIndex, startIndex + limit);

    return {
      applications: paginatedApplications,
      pagination: {
        page,
        limit,
        total: applications.length,
        totalPages: Math.ceil(applications.length / limit),
      },
      stats,
      filters: filter || {},
    };
  }

  /**
   * Calculate application statistics
   */
  private static async calculateApplicationStats(
    applications: ApplicationListItem[]
  ): Promise<ApplicationStats> {
    const total = applications.length;

    // Group by status
    const statusGroups = applications.reduce(
      (acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      },
      {} as Record<ApplicationStatus, number>
    );

    const byStatus = Object.entries(statusGroups).map(([status, count]) => ({
      status: status as ApplicationStatus,
      count,
      percentage: Math.round((count / total) * 100),
    }));

    // Calculate average match score
    const scoresArray = applications
      .filter((app) => app.matchScore !== undefined)
      .map((app) => app.matchScore!);
    const averageMatchScore =
      scoresArray.length > 0
        ? Math.round(scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length)
        : 0;

    // Count top candidates (score >= 80)
    const topCandidates = applications.filter(
      (app) => app.matchScore && app.matchScore >= 80
    ).length;

    // Count new today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newToday = applications.filter((app) => new Date(app.appliedAt) >= today).length;

    // Count pending review (APPLIED status)
    const pendingReview = statusGroups[ApplicationStatus.APPLIED] || 0;

    // Count scheduled interviews
    const scheduledInterviews = applications.filter(
      (app) => app.interviewScheduledAt && new Date(app.interviewScheduledAt) >= new Date()
    ).length;

    return {
      total,
      byStatus,
      averageMatchScore,
      topCandidates,
      newToday,
      pendingReview,
      scheduledInterviews,
    };
  }

  /**
   * Get detailed application information
   */
  static async getApplicationDetail(
    applicationId: string,
    companyId: string
  ): Promise<ApplicationDetail | null> {
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        job: {
          companyId,
        },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                id: true,
                companyName: true,
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
                endDate: 'desc',
              },
            },
            experience: {
              orderBy: {
                endDate: 'desc',
              },
            },
          },
        },
        timeline: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!application) return null;

    // Transform decimal values
    return {
      ...application,
      candidate: {
        ...application.candidate,
        expectedSalaryMin: application.candidate.expectedSalaryMin?.toNumber() || null,
        expectedSalaryMax: application.candidate.expectedSalaryMax?.toNumber() || null,
        education: application.candidate.education.map((edu) => ({
          ...edu,
          gpa: edu.gpa || null,
        })),
      },
    } as ApplicationDetail;
  }

  /**
   * Update application status
   */
  static async updateApplicationStatus(
    applicationId: string,
    companyId: string,
    userId: string,
    data: UpdateApplicationStatusDTO
  ): Promise<boolean> {
    // Verify application belongs to company
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        job: {
          companyId,
        },
      },
    });

    if (!application) {
      throw new Error('Application not found or access denied');
    }

    // Update application in transaction
    await prisma.$transaction(async (tx) => {
      // Prepare update data - only include fields that are provided
      const updatePayload: Prisma.ApplicationUpdateInput = {
        statusUpdatedAt: new Date(),
      };

      if (data.status !== undefined) {
        updatePayload.status = data.status;
      }

      if (data.rating !== undefined) {
        updatePayload.rating = data.rating;
      }

      if (data.notes !== undefined) {
        // Append notes if there are existing notes, otherwise just set the new notes
        updatePayload.recruiterNotes = application.recruiterNotes
          ? `${application.recruiterNotes}\n\n${data.notes}`
          : data.notes;
      }

      if (data.interviewScheduledAt !== undefined) {
        updatePayload.interviewScheduledAt = new Date(data.interviewScheduledAt);
      }

      // Update application
      await tx.application.update({
        where: { id: applicationId },
        data: updatePayload,
      });

      // Only add to timeline if status is changed
      if (data.status !== undefined) {
        await tx.applicationTimeline.create({
          data: {
            applicationId,
            status: data.status,
            note: data.notes,
            changedBy: userId,
          },
        });
      }
    });

    // TODO: Send notification to candidate if requested
    if (data.notifyCandidate) {
      // Implement notification logic
    }

    return true;
  }

  /**
   * Add note to application
   */
  static async addApplicationNote(
    applicationId: string,
    companyId: string,
    data: AddApplicationNoteDTO
  ): Promise<boolean> {
    // Verify application belongs to company
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        job: {
          companyId,
        },
      },
    });

    if (!application) {
      throw new Error('Application not found or access denied');
    }

    // Append note
    const currentNotes = application.recruiterNotes || '';
    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}] ${data.note}`;
    const updatedNotes = currentNotes ? `${currentNotes}\n\n${newNote}` : newNote;

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        recruiterNotes: updatedNotes,
        updatedAt: new Date(),
      },
    });

    return true;
  }

  /**
   * Bulk update applications
   */
  static async bulkUpdateApplications(
    companyId: string,
    userId: string,
    data: BulkUpdateApplicationsDTO
  ): Promise<{ success: number; failed: number }> {
    // Verify all applications belong to company
    const applications = await prisma.application.findMany({
      where: {
        id: { in: data.applicationIds },
        job: {
          companyId,
        },
      },
    });

    if (applications.length !== data.applicationIds.length) {
      throw new Error('Some applications not found or access denied');
    }

    let success = 0;
    let failed = 0;

    // Process each application
    for (const application of applications) {
      try {
        await prisma.$transaction(async (tx) => {
          const updateData: Prisma.ApplicationUpdateInput = {
            statusUpdatedAt: new Date(),
          };

          // Handle different actions
          switch (data.action) {
            case 'UPDATE_STATUS':
              if (data.status) {
                updateData.status = data.status;

                // Add to timeline
                await tx.applicationTimeline.create({
                  data: {
                    applicationId: application.id,
                    status: data.status,
                    note: data.notes || 'Bulk status update',
                    changedBy: userId,
                  },
                });
              }
              break;

            case 'ADD_RATING':
              if (data.rating) {
                updateData.rating = data.rating;
              }
              break;

            case 'ADD_TAG':
              // TODO: Implement tagging system
              break;
          }

          // Add notes if provided
          if (data.notes) {
            const currentNotes = application.recruiterNotes || '';
            updateData.recruiterNotes = currentNotes
              ? `${currentNotes}\n\n[Bulk Update] ${data.notes}`
              : `[Bulk Update] ${data.notes}`;
          }

          await tx.application.update({
            where: { id: application.id },
            data: updateData,
          });
        });

        success++;
      } catch (error) {
        failed++;
        console.error(`Failed to update application ${application.id}:`, error);
      }
    }

    // TODO: Send bulk notifications if requested
    if (data.notifyCandidates) {
      // Implement bulk notification logic
    }

    return { success, failed };
  }

  /**
   * Get AI-powered filtering with custom scoring
   */
  static async filterApplicationsWithAI(
    jobId: string,
    companyId: string,
    filterCriteria: ApplicationFilterCriteria,
    scoringConfig?: ScoringConfig
  ): Promise<ApplicationListItem[]> {
    // Get all applications
    const result = await this.getJobApplications(jobId, companyId, {
      page: 1,
      limit: 1000, // Get all for filtering
      includeMatchScores: true,
      filter: filterCriteria,
    });

    // Use custom scoring config if provided
    if (scoringConfig) {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
          jobSkills: {
            include: {
              skill: true,
            },
          },
        },
      });

      if (job) {
        // Recalculate scores with custom config
        result.applications = result.applications.map((app) => {
          const matchResult = calculateMatchScore(
            app.candidate,
            {
              skills: job.jobSkills,
              experienceLevel: job.experienceLevel,
              salaryMin: job.salaryMin?.toNumber(),
              salaryMax: job.salaryMax?.toNumber(),
              locationCity: job.locationCity,
              workLocationType: job.workLocationType,
            },
            scoringConfig
          );

          return {
            ...app,
            matchScore: matchResult.score,
            matchDetails: matchResult.details,
          };
        });
      }
    }

    // Sort by match score
    return result.applications.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }

  /**
   * Compare multiple candidates
   */
  static async compareCandidates(applicationIds: string[], companyId: string): Promise<any> {
    // Get applications with full details
    const applications = await Promise.all(
      applicationIds.map((id) => this.getApplicationDetail(id, companyId))
    );

    const validApplications = applications.filter((app) => app !== null);

    if (validApplications.length < 2) {
      throw new Error('Need at least 2 candidates to compare');
    }

    // TODO: Implement detailed comparison logic
    return {
      candidates: validApplications,
      comparisonCriteria: [
        'Skills Match',
        'Experience',
        'Education',
        'Salary Expectation',
        'Availability',
      ],
    };
  }
}

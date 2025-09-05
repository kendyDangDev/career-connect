import prisma from '@/lib/prisma';
import { 
  SavedJob, 
  Prisma,
  JobStatus
} from '@/generated/prisma';
import { 
  GetSavedJobsParams,
  SaveJobParams,
  UnsaveJobParams,
  CheckJobSavedParams,
  SavedJobWithRelations,
  SavedJobFilters,
  PaginationParams
} from '@/types/saved-job.types';

export class SavedJobService {
  /**
   * Get paginated list of saved jobs for a candidate
   */
  static async getSavedJobs({
    candidateId,
    filters = {},
    pagination = {}
  }: GetSavedJobsParams): Promise<{
    savedJobs: SavedJobWithRelations[];
    total: number;
  }> {
    const {
      search,
      jobType,
      workLocationType,
      experienceLevel,
      salaryMin,
      salaryMax,
      locationCity,
      locationProvince,
      sortBy = 'savedAt',
      sortOrder = 'desc'
    } = filters;

    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.SavedJobWhereInput = {
      candidateId,
      job: {
        status: JobStatus.ACTIVE, // Only show active jobs
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { company: { companyName: { contains: search, mode: 'insensitive' } } }
          ]
        }),
        ...(jobType && jobType.length > 0 && {
          jobType: { in: jobType }
        }),
        ...(workLocationType && workLocationType.length > 0 && {
          workLocationType: { in: workLocationType }
        }),
        ...(experienceLevel && experienceLevel.length > 0 && {
          experienceLevel: { in: experienceLevel }
        }),
        ...(salaryMin && {
          OR: [
            { salaryMax: { gte: salaryMin } },
            { salaryNegotiable: true }
          ]
        }),
        ...(salaryMax && {
          OR: [
            { salaryMin: { lte: salaryMax } },
            { salaryNegotiable: true }
          ]
        }),
        ...(locationCity && {
          locationCity: { contains: locationCity, mode: 'insensitive' }
        }),
        ...(locationProvince && {
          locationProvince: { contains: locationProvince, mode: 'insensitive' }
        })
      }
    };

    // Build orderBy clause
    let orderBy: Prisma.SavedJobOrderByWithRelationInput = {};
    switch (sortBy) {
      case 'savedAt':
        orderBy = { createdAt: sortOrder };
        break;
      case 'deadline':
        orderBy = { job: { applicationDeadline: sortOrder } };
        break;
      case 'salary':
        orderBy = { job: { salaryMax: sortOrder } };
        break;
      case 'jobTitle':
        orderBy = { job: { title: sortOrder } };
        break;
      default:
        orderBy = { createdAt: sortOrder };
    }

    // Execute queries in parallel
    const [savedJobs, total] = await Promise.all([
      prisma.savedJob.findMany({
        where,
        include: {
          job: {
            include: {
              company: {
                select: {
                  id: true,
                  companyName: true,
                  companySlug: true,
                  logoUrl: true,
                  city: true,
                  province: true
                }
              },
              _count: {
                select: {
                  applications: true,
                  savedJobs: true
                }
              }
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.savedJob.count({ where })
    ]);

    return {
      savedJobs: savedJobs as SavedJobWithRelations[],
      total
    };
  }

  /**
   * Save a job for a candidate
   */
  static async saveJob({ candidateId, jobId }: SaveJobParams): Promise<SavedJobWithRelations> {
    // Check if candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId }
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Check if job exists and is active
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        status: JobStatus.ACTIVE
      }
    });

    if (!job) {
      throw new Error('Job not found or not active');
    }

    // Check if already saved
    const existingSavedJob = await prisma.savedJob.findUnique({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId
        }
      }
    });

    if (existingSavedJob) {
      throw new Error('Job already saved');
    }

    // Create saved job
    const savedJob = await prisma.savedJob.create({
      data: {
        candidateId,
        jobId
      },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                companyName: true,
                companySlug: true,
                logoUrl: true,
                city: true,
                province: true
              }
            },
            _count: {
              select: {
                applications: true,
                savedJobs: true
              }
            }
          }
        }
      }
    });

    return savedJob as SavedJobWithRelations;
  }

  /**
   * Remove a saved job
   */
  static async unsaveJob({ candidateId, savedJobId }: UnsaveJobParams): Promise<boolean> {
    // Check if saved job exists and belongs to candidate
    const savedJob = await prisma.savedJob.findFirst({
      where: {
        id: savedJobId,
        candidateId
      }
    });

    if (!savedJob) {
      throw new Error('Saved job not found');
    }

    // Delete saved job
    await prisma.savedJob.delete({
      where: {
        id: savedJobId
      }
    });

    return true;
  }

  /**
   * Check if a job is saved by a candidate
   */
  static async checkJobSaved({ candidateId, jobId }: CheckJobSavedParams): Promise<{
    isSaved: boolean;
    savedAt?: Date;
    savedJobId?: string;
  }> {
    const savedJob = await prisma.savedJob.findUnique({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId
        }
      }
    });

    if (savedJob) {
      return {
        isSaved: true,
        savedAt: savedJob.createdAt,
        savedJobId: savedJob.id
      };
    }

    return {
      isSaved: false
    };
  }

  /**
   * Get saved jobs count for a candidate
   */
  static async getSavedJobsCount(candidateId: string): Promise<number> {
    return await prisma.savedJob.count({
      where: {
        candidateId,
        job: {
          status: JobStatus.ACTIVE
        }
      }
    });
  }

  /**
   * Check if multiple jobs are saved
   */
  static async checkMultipleJobsSaved(
    candidateId: string, 
    jobIds: string[]
  ): Promise<Record<string, boolean>> {
    const savedJobs = await prisma.savedJob.findMany({
      where: {
        candidateId,
        jobId: {
          in: jobIds
        }
      },
      select: {
        jobId: true
      }
    });

    const savedJobIds = new Set(savedJobs.map(sj => sj.jobId));
    
    return jobIds.reduce((acc, jobId) => {
      acc[jobId] = savedJobIds.has(jobId);
      return acc;
    }, {} as Record<string, boolean>);
  }
}

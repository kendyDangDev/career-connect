import { prisma } from '@/lib/prisma';
import { 
  CompanyFollower, 
  Prisma,
  VerificationStatus
} from '@/generated/prisma';
import { 
  GetFollowedCompaniesParams,
  FollowCompanyParams,
  UnfollowCompanyParams,
  CheckCompanyFollowedParams,
  CompanyFollowerWithRelations,
  CompanyFollowerFilters,
  PaginationParams,
  BulkFollowCompaniesParams,
  BulkUnfollowCompaniesParams,
  CompanyFollowerStats,
  GetCompanyFollowersParams,
  CompanyFollowerWithCandidate
} from '@/types/company-follower.types';

export class CompanyFollowerService {
  /**
   * Get paginated list of companies followed by a candidate
   */
  static async getFollowedCompanies({
    candidateId,
    filters = {},
    pagination = {}
  }: GetFollowedCompaniesParams): Promise<{
    followedCompanies: CompanyFollowerWithRelations[];
    total: number;
  }> {
    const {
      search,
      industryId,
      companySize,
      verificationStatus,
      city,
      province,
      sortBy = 'followedAt',
      sortOrder = 'desc'
    } = filters;

    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.CompanyFollowerWhereInput = {
      candidateId,
      company: {
        ...(search && {
          OR: [
            { companyName: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        }),
        ...(industryId && industryId.length > 0 && {
          industryId: { in: industryId }
        }),
        ...(companySize && companySize.length > 0 && {
          companySize: { in: companySize }
        }),
        ...(verificationStatus && verificationStatus.length > 0 && {
          verificationStatus: { in: verificationStatus }
        }),
        ...(city && {
          city: { contains: city, mode: 'insensitive' }
        }),
        ...(province && {
          province: { contains: province, mode: 'insensitive' }
        })
      }
    };

    // Build orderBy clause
    let orderBy: Prisma.CompanyFollowerOrderByWithRelationInput = {};
    switch (sortBy) {
      case 'followedAt':
        orderBy = { createdAt: sortOrder };
        break;
      case 'companyName':
        orderBy = { company: { companyName: sortOrder } };
        break;
      case 'jobCount':
        orderBy = { company: { jobs: { _count: sortOrder } } };
        break;
      default:
        orderBy = { createdAt: sortOrder };
    }

    // Execute queries in parallel
    const [followedCompanies, total] = await Promise.all([
      prisma.companyFollower.findMany({
        where,
        include: {
          company: {
            include: {
              industry: {
                select: {
                  id: true,
                  name: true
                }
              },
              _count: {
                select: {
                  jobs: {
                    where: {
                      status: 'ACTIVE'
                    }
                  },
                  companyFollowers: true
                }
              }
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.companyFollower.count({ where })
    ]);

    return {
      followedCompanies: followedCompanies as CompanyFollowerWithRelations[],
      total
    };
  }

  /**
   * Follow a company
   */
  static async followCompany({ candidateId, companyId }: FollowCompanyParams): Promise<CompanyFollowerWithRelations> {
    // Check if candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId }
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      throw new Error('Company not found');
    }

    // Check if already following
    const existingFollow = await prisma.companyFollower.findUnique({
      where: {
        companyId_candidateId: {
          companyId,
          candidateId
        }
      }
    });

    if (existingFollow) {
      throw new Error('Already following this company');
    }

    // Create company follower
    const companyFollower = await prisma.companyFollower.create({
      data: {
        candidateId,
        companyId
      },
      include: {
        company: {
          include: {
            industry: {
              select: {
                id: true,
                name: true
              }
            },
            _count: {
              select: {
                jobs: {
                  where: {
                    status: 'ACTIVE'
                  }
                },
                companyFollowers: true
              }
            }
          }
        }
      }
    });

    return companyFollower as CompanyFollowerWithRelations;
  }

  /**
   * Unfollow a company
   */
  static async unfollowCompany({ candidateId, companyId }: UnfollowCompanyParams): Promise<void> {
    // Check if following exists
    const companyFollower = await prisma.companyFollower.findUnique({
      where: {
        companyId_candidateId: {
          companyId,
          candidateId
        }
      }
    });

    if (!companyFollower) {
      throw new Error('Not following this company');
    }

    // Delete company follower
    await prisma.companyFollower.delete({
      where: {
        id: companyFollower.id
      }
    });
  }

  /**
   * Check if a candidate is following a company
   */
  static async checkCompanyFollowed({ candidateId, companyId }: CheckCompanyFollowedParams): Promise<boolean> {
    const companyFollower = await prisma.companyFollower.findUnique({
      where: {
        companyId_candidateId: {
          companyId,
          candidateId
        }
      }
    });

    return !!companyFollower;
  }

  /**
   * Bulk follow companies
   */
  static async bulkFollowCompanies({ candidateId, companyIds }: BulkFollowCompaniesParams): Promise<{
    followed: string[];
    alreadyFollowed: string[];
    notFound: string[];
  }> {
    // Check if candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId }
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Get existing companies
    const companies = await prisma.company.findMany({
      where: {
        id: { in: companyIds }
      },
      select: { id: true }
    });

    const existingCompanyIds = companies.map(c => c.id);
    const notFound = companyIds.filter(id => !existingCompanyIds.includes(id));

    // Check already followed
    const alreadyFollowedRecords = await prisma.companyFollower.findMany({
      where: {
        candidateId,
        companyId: { in: existingCompanyIds }
      },
      select: { companyId: true }
    });

    const alreadyFollowed = alreadyFollowedRecords.map(f => f.companyId);
    const toFollow = existingCompanyIds.filter(id => !alreadyFollowed.includes(id));

    // Create follow records
    if (toFollow.length > 0) {
      await prisma.companyFollower.createMany({
        data: toFollow.map(companyId => ({
          candidateId,
          companyId
        })),
        skipDuplicates: true
      });
    }

    return {
      followed: toFollow,
      alreadyFollowed,
      notFound
    };
  }

  /**
   * Bulk unfollow companies
   */
  static async bulkUnfollowCompanies({ candidateId, companyIds }: BulkUnfollowCompaniesParams): Promise<{
    unfollowed: string[];
    notFollowing: string[];
  }> {
    // Get existing follows
    const existingFollows = await prisma.companyFollower.findMany({
      where: {
        candidateId,
        companyId: { in: companyIds }
      },
      select: { companyId: true }
    });

    const followedCompanyIds = existingFollows.map(f => f.companyId);
    const notFollowing = companyIds.filter(id => !followedCompanyIds.includes(id));

    // Delete follow records
    if (followedCompanyIds.length > 0) {
      await prisma.companyFollower.deleteMany({
        where: {
          candidateId,
          companyId: { in: followedCompanyIds }
        }
      });
    }

    return {
      unfollowed: followedCompanyIds,
      notFollowing
    };
  }

  /**
   * Get company follower statistics
   */
  static async getCompanyFollowerStats(companyId: string): Promise<CompanyFollowerStats> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalFollowers, recentFollowers, previousMonthFollowers] = await Promise.all([
      // Total followers
      prisma.companyFollower.count({
        where: { companyId }
      }),
      // Followers in last 30 days
      prisma.companyFollower.count({
        where: {
          companyId,
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      // Followers 30-60 days ago (for growth calculation)
      prisma.companyFollower.count({
        where: {
          companyId,
          createdAt: {
            gte: new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
            lt: thirtyDaysAgo
          }
        }
      })
    ]);

    // Calculate growth percentage
    let followerGrowth = 0;
    if (previousMonthFollowers > 0) {
      followerGrowth = ((recentFollowers - previousMonthFollowers) / previousMonthFollowers) * 100;
    } else if (recentFollowers > 0) {
      followerGrowth = 100; // 100% growth if no previous followers
    }

    return {
      totalFollowers,
      recentFollowers,
      followerGrowth: Math.round(followerGrowth * 100) / 100 // Round to 2 decimal places
    };
  }

  /**
   * Get company followers (for employer view)
   */
  static async getCompanyFollowers({
    companyId,
    filters = {},
    pagination = {}
  }: GetCompanyFollowersParams): Promise<{
    followers: CompanyFollowerWithCandidate[];
    total: number;
  }> {
    const {
      search,
      sortBy = 'followedAt',
      sortOrder = 'desc'
    } = filters;

    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.CompanyFollowerWhereInput = {
      companyId,
      ...(search && {
        candidate: {
          user: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      })
    };

    // Build orderBy clause
    let orderBy: Prisma.CompanyFollowerOrderByWithRelationInput = {};
    switch (sortBy) {
      case 'followedAt':
        orderBy = { createdAt: sortOrder };
        break;
      case 'candidateName':
        orderBy = { 
          candidate: { 
            user: { 
              firstName: sortOrder 
            } 
          } 
        };
        break;
      default:
        orderBy = { createdAt: sortOrder };
    }

    // Execute queries in parallel
    const [followers, total] = await Promise.all([
      prisma.companyFollower.findMany({
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
                  avatarUrl: true
                }
              }
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.companyFollower.count({ where })
    ]);

    return {
      followers: followers as CompanyFollowerWithCandidate[],
      total
    };
  }
}

import { 
  CompanyFollower, 
  Company,
  Candidate,
  User,
  VerificationStatus,
  CompanySize
} from '@/generated/prisma';

// Company follower with relations
export interface CompanyFollowerWithRelations extends CompanyFollower {
  company: {
    id: string;
    companyName: string;
    companySlug: string;
    logoUrl: string | null;
    coverImageUrl: string | null;
    description: string | null;
    city: string | null;
    province: string | null;
    country: string | null;
    companySize: CompanySize | null;
    websiteUrl: string | null;
    verificationStatus: VerificationStatus;
    _count?: {
      jobs: number;
      companyFollowers: number;
    };
    industry?: {
      id: string;
      name: string;
    } | null;
  };
}

// Request params for following a company
export interface FollowCompanyParams {
  candidateId: string;
  companyId: string;
}

// Request params for unfollowing a company
export interface UnfollowCompanyParams {
  candidateId: string;
  companyId: string;
}

// Check if company is followed params
export interface CheckCompanyFollowedParams {
  candidateId: string;
  companyId: string;
}

// Get followed companies params
export interface GetFollowedCompaniesParams {
  candidateId: string;
  filters?: CompanyFollowerFilters;
  pagination?: PaginationParams;
}

// Filters for company followers
export interface CompanyFollowerFilters {
  search?: string;
  industryId?: string[];
  companySize?: CompanySize[];
  verificationStatus?: VerificationStatus[];
  city?: string;
  province?: string;
  sortBy?: 'followedAt' | 'companyName' | 'jobCount';
  sortOrder?: 'asc' | 'desc';
}

// Pagination params
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// API request body for following a company
export interface FollowCompanyRequest {
  companyId: string;
}

// API response for company follower operations
export interface CompanyFollowerResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Bulk follow/unfollow operations
export interface BulkFollowCompaniesParams {
  candidateId: string;
  companyIds: string[];
}

export interface BulkUnfollowCompaniesParams {
  candidateId: string;
  companyIds: string[];
}

// Company follower statistics
export interface CompanyFollowerStats {
  totalFollowers: number;
  recentFollowers: number; // Last 30 days
  followerGrowth: number; // Percentage
}

// Get company followers (for employer view)
export interface GetCompanyFollowersParams {
  companyId: string;
  filters?: {
    search?: string;
    sortBy?: 'followedAt' | 'candidateName';
    sortOrder?: 'asc' | 'desc';
  };
  pagination?: PaginationParams;
}

// Company follower with candidate info (for employer view)
export interface CompanyFollowerWithCandidate extends CompanyFollower {
  candidate: {
    id: string;
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
      avatarUrl: string | null;
    };
    currentPosition: string | null;
    experienceYears: number | null;
  };
}

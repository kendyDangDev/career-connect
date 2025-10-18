// Company size enum
export enum CompanySize {
  STARTUP = "STARTUP_1_10",
  SMALL = "SMALL_11_50",
  MEDIUM = "MEDIUM_51_200",
  LARGE = "LARGE_201_500",
  ENTERPRISE = "ENTERPRISE_501_PLUS",
}

// Verification status enum
export enum VerificationStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

// Industry interface
export interface Industry {
  id: string;
  name: string;
}

// Company interface
export interface Company {
  id: string;
  companyName: string;
  companySlug: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  description?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  companySize?: CompanySize | null;
  websiteUrl?: string | null;
  verificationStatus: VerificationStatus;
  _count?: {
    jobs: number;
    companyFollowers: number;
  };
  industry?: Industry;
}

// Company follower interface
export interface CompanyFollower {
  id: string;
  companyId: string;
  candidateId: string;
  createdAt: string;
  company: Company;
}

// Filters for getting followed companies
export interface CompanyFollowersFilters {
  page?: number;
  limit?: number;
  search?: string;
  industryId?: string[];
  companySize?: CompanySize[];
  verificationStatus?: VerificationStatus[];
  city?: string;
  province?: string;
  sortBy?: "followedAt" | "companyName" | "jobCount";
  sortOrder?: "asc" | "desc";
}

// Pagination interface
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// API Response interfaces
export interface GetCompanyFollowersResponse {
  success: boolean;
  message: string;
  data: {
    data: CompanyFollower[];
    pagination: Pagination;
  };
}

export interface FollowCompanyResponse {
  success: boolean;
  message: string;
  data: {
    companyFollower: CompanyFollower;
    message: string;
  };
}

export interface CheckFollowStatusResponse {
  success: boolean;
  message: string;
  data: {
    companyId: string;
    isFollowing: boolean;
  };
}

export interface BulkFollowResponse {
  success: boolean;
  message: string;
  data: {
    followed: string[];
    alreadyFollowed: string[];
    notFound: string[];
    summary: {
      followed: number;
      alreadyFollowed: number;
      notFound: number;
    };
  };
}

export interface BulkUnfollowResponse {
  success: boolean;
  message: string;
  data: {
    unfollowed: string[];
    notFollowing: string[];
    summary: {
      unfollowed: number;
      notFollowing: number;
    };
  };
}

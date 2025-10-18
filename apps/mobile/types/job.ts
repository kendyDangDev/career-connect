export interface Company {
  id: string;
  companyName: string;
  companySlug: string;
  logoUrl: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  website?: string;
  city?: string;
  province?: string;
}

export interface JobSkill {
  id: string;
  requiredLevel: 'REQUIRED' | 'PREFERRED' | 'OPTIONAL';
  minYearsExperience: number;
  skill: {
    id: string;
    name: string;
    category: string;
  };
}

export interface JobCategory {
  id: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface Job {
  id: string;
  title: string;
  slug: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  // Full content string containing all sections (for API compatibility)
  fullContent?: string;
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  workLocationType: 'REMOTE' | 'ONSITE' | 'HYBRID';
  experienceLevel: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
  salaryMin: number;
  salaryMax: number;
  currency: string;
  salaryNegotiable: boolean;
  locationCity: string;
  locationProvince: string;
  applicationDeadline: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'DRAFT';
  viewCount: number;
  applicationCount: number;
  featured: boolean;
  urgent: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  company: Company;
  jobSkills?: JobSkill[];
  jobCategories?: JobCategory[];
  _count?: {
    applications: number;
    savedJobs: number;
    jobViews: number;
  };
}

export interface JobsResponse {
  success: boolean;
  message: string;
  data: {
    jobs: Job[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface JobDetailResponse {
  success: boolean;
  message: string;
  data: Job;
}

export interface JobFilters {
  page?: number;
  limit?: number;
  search?: string;
  jobType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  experienceLevel?: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
  locationCity?: string;
  locationProvince?: string;
  categoryId?: string;
  companyId?: string;
  sortBy?: 'createdAt' | 'publishedAt' | 'viewCount' | 'applicationCount';
  sortOrder?: 'asc' | 'desc';
}

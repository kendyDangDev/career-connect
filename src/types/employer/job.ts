import {
  Job,
  JobType,
  WorkLocationType,
  ExperienceLevel,
  JobStatus,
  RequiredLevel,
  Skill,
  Category,
} from '@/generated/prisma';

// DTO for creating a new job
export interface CreateJobDTO {
  title: string;
  description: string;
  requirements: string;
  benefits?: string;
  jobType: JobType;
  workLocationType: WorkLocationType;
  experienceLevel: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  salaryNegotiable?: boolean;
  locationCity?: string;
  locationProvince?: string;
  locationCountry?: string;
  applicationDeadline?: Date | string;
  skills?: {
    skillId: string;
    requiredLevel: RequiredLevel;
    minYearsExperience?: number;
  }[];
  categories?: string[]; // category IDs
  featured?: boolean;
  urgent?: boolean;
}

// DTO for updating a job
export interface UpdateJobDTO extends Partial<CreateJobDTO> {
  status?: JobStatus;
}

// Job detail with relations
export interface JobDetail extends Job {
  company: {
    id: string;
    companyName: string;
    companySlug: string;
    logoUrl?: string | null;
    verificationStatus: string;
  };
  jobSkills: {
    id: string;
    requiredLevel: RequiredLevel;
    minYearsExperience?: number | null;
    skill: Skill;
  }[];
  jobCategories: {
    id: string;
    category: Category;
  }[];
  _count: {
    applications: number;
    savedJobs: number;
    jobViews: number;
  };
}

// Job list item
export interface JobListItem {
  id: string;
  title: string;
  slug: string;
  jobType: JobType;
  workLocationType: WorkLocationType;
  experienceLevel: ExperienceLevel;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  salaryNegotiable: boolean;
  locationCity?: string | null;
  locationProvince?: string | null;
  applicationDeadline?: Date | null;
  status: JobStatus;
  viewCount: number;
  applicationCount: number;
  featured: boolean;
  urgent: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date | null;
}

// Job list response
export interface JobListResponse {
  jobs: JobListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: {
    totalJobs: number;
    activeJobs: number;
    pendingJobs: number;
    closedJobs: number;
  };
}

// Query parameters for job listing
export interface JobListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: JobStatus;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  sortBy?: 'createdAt' | 'title' | 'applicationDeadline' | 'applicationCount' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
  fromDate?: string;
  toDate?: string;
}

// Job statistics
export interface JobStatistics {
  // Basic stats
  totalViews: number;
  totalApplications: number;
  totalSaved: number;
  conversionRate: string;

  // Weekly comparison
  viewsChange: string;
  viewsChangeType: 'increase' | 'decrease';
  applicationsChange: string;
  applicationsChangeType: 'increase' | 'decrease';
  savedChange: string;
  savedChangeType: 'increase' | 'decrease';
  conversionChange: string;
  conversionChangeType: 'increase' | 'decrease';

  // Detailed weekly stats
  currentWeek: {
    views: number;
    applications: number;
    saved: number;
    conversionRate: string;
  };
  previousWeek: {
    views: number;
    applications: number;
    saved: number;
    conversionRate: string;
  };

  // Legacy fields (for backward compatibility)
  uniqueViews?: number;
  viewsLastWeek?: number;
  viewsLastMonth?: number;
  applicationsLastWeek?: number;
  applicationsLastMonth?: number;
  applicationsByStatus?: {
    status: string;
    count: number;
  }[];
  viewsByDate?: {
    date: string;
    views: number;
  }[];
  applicationsByDate?: {
    date: string;
    applications: number;
  }[];
  averageTimeToApply?: number;
  topReferrers?: {
    source: string;
    count: number;
  }[];
}

// Job duplicate DTO
export interface DuplicateJobDTO {
  title?: string; // Optional new title
  status?: JobStatus; // Status for the duplicated job
}

// Job status update DTO
export interface UpdateJobStatusDTO {
  status: JobStatus;
  reason?: string;
  notifyApplicants?: boolean;
}

// Job validation schemas
export const jobValidationSchema = {
  title: {
    min: 10,
    max: 200,
    pattern: /^[a-zA-Z0-9\s\-.,()&/]+$/,
  },
  description: {
    min: 50,
    max: 10000,
  },
  requirements: {
    min: 50,
    max: 5000,
  },
  benefits: {
    max: 3000,
  },
  salary: {
    min: 0,
    max: 999999999,
  },
  applicationDeadline: {
    minDays: 3, // At least 3 days from now
    maxDays: 365, // Maximum 1 year from now
  },
};

// Job template structure
export interface JobTemplate {
  id: string;
  name: string;
  description: string;
  content: {
    title: string;
    description: string;
    requirements: string;
    benefits?: string;
    jobType?: JobType;
    experienceLevel?: ExperienceLevel;
    skills?: string[];
  };
  category: string;
  isDefault: boolean;
}

// Job preview data
export interface JobPreview {
  job: Partial<CreateJobDTO>;
  company: {
    name: string;
    logo?: string;
    location?: string;
  };
  previewUrl?: string;
}

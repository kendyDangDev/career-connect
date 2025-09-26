// Job View Types
export interface JobView {
  id: string;
  jobId: string;
  userId: string | null;
  ipAddress: string;
  userAgent: string;
  viewedAt: string;
  job: {
    id: string;
    title: string;
    slug: string;
    company: {
      id: string;
      companyName: string;
      logoUrl: string | null;
    };
    locationCity: string | null;
    locationProvince: string | null;
    jobType: JobType;
    workLocationType?: WorkLocationType;
    experienceLevel?: ExperienceLevel;
    salaryMin: number | null;
    salaryMax: number | null;
    currency: string | null;
    status: JobStatus;
    deadline?: string;
    viewCount?: number;
    applicationCount?: number;
    skills?: string[];
  };
}

export type JobType = 
  | "FULL_TIME"
  | "PART_TIME" 
  | "CONTRACT"
  | "INTERNSHIP"
  | "FREELANCE"
  | "TEMPORARY";

export type WorkLocationType =
  | "ONSITE"
  | "REMOTE"
  | "HYBRID";

export type ExperienceLevel =
  | "ENTRY"
  | "MID"
  | "SENIOR"
  | "LEAD"
  | "EXECUTIVE";

export type JobStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "EXPIRED"
  | "DRAFT";

export interface JobViewStats {
  totalViews: number;
  uniqueJobs: number;
  viewsByDate: {
    date: string;
    count: number;
  }[];
  topViewedJobs: {
    jobId: string;
    jobTitle: string;
    companyName: string;
    viewCount: number;
  }[];
  recentViews: JobView[];
}

export interface JobViewsFilters {
  page?: number;
  limit?: number;
  sortBy?: "viewedAt" | "jobTitle";
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
  search?: string;
  jobType?: JobType[];
  workLocationType?: WorkLocationType[];
  experienceLevel?: ExperienceLevel[];
}

export interface JobViewsResponse {
  success: boolean;
  data: JobView[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface JobViewStatsResponse {
  success: boolean;
  data: JobViewStats;
}
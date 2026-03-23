import { 
  SavedJob, 
  Job, 
  Company, 
  JobType, 
  WorkLocationType, 
  ExperienceLevel, 
  JobStatus 
} from '@/generated/prisma';

// Saved job with all relations
export interface SavedJobWithRelations extends SavedJob {
  job: {
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
    featured: boolean;
    urgent: boolean;
    createdAt: Date;
    publishedAt?: Date | null;
    company: {
      id: string;
      companyName: string;
      companySlug: string;
      logoUrl?: string | null;
      city?: string | null;
      province?: string | null;
    };
    _count: {
      applications: number;
      savedJobs: number;
    };
  };
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Filter parameters for saved jobs
export interface SavedJobFilters {
  search?: string;
  applicationStatus?: 'open' | 'expired';
  jobType?: JobType[];
  workLocationType?: WorkLocationType[];
  experienceLevel?: ExperienceLevel[];
  salaryMin?: number;
  salaryMax?: number;
  locationCity?: string;
  locationProvince?: string;
  sortBy?: 'savedAt' | 'deadline' | 'salary' | 'jobTitle';
  sortOrder?: 'asc' | 'desc';
}

// API Response types
export interface SavedJobsResponse {
  savedJobs: SavedJobWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Save job request
export interface SaveJobRequest {
  jobId: string;
}

// Save job response
export interface SaveJobResponse {
  success: boolean;
  message: string;
  savedJob?: SavedJobWithRelations;
}

// Check saved status response
export interface CheckSavedResponse {
  isSaved: boolean;
  savedAt?: Date;
  savedJobId?: string;
}

// Delete saved job response
export interface DeleteSavedJobResponse {
  success: boolean;
  message: string;
}

// Error response
export interface ErrorResponse {
  error: string;
  details?: any;
}

// Service layer types
export interface GetSavedJobsParams {
  candidateId: string;
  filters?: SavedJobFilters;
  pagination?: PaginationParams;
}

export interface SaveJobParams {
  candidateId: string;
  jobId: string;
}

export interface UnsaveJobParams {
  candidateId: string;
  savedJobId: string;
}

export interface CheckJobSavedParams {
  candidateId: string;
  jobId: string;
}

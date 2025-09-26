import { Job } from "./job";

// Saved Job entity
export interface SavedJob {
  id: string;
  candidateId: string;
  jobId: string;
  createdAt: string; // ISO string date when job was saved
  job: Job; // Full job details
}

// API Response types
export interface SavedJobsResponse {
  success: boolean;
  message: string;
  data: {
    data: SavedJob[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface SaveJobResponse {
  success: boolean;
  message: string;
  data: {
    savedJob: SavedJob;
  };
}

export interface RemoveSavedJobResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
  };
}

export interface CheckSavedJobResponse {
  success: boolean;
  message: string;
  data: {
    isSaved: boolean;
    savedAt?: string; // ISO string date
    savedJobId?: string;
  };
}

// Filter options for saved jobs
export interface SavedJobsFilters {
  page?: number;
  limit?: number;
  search?: string;
  jobType?: ("FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP")[];
  workLocationType?: ("ONSITE" | "REMOTE" | "HYBRID")[];
  experienceLevel?: ("ENTRY" | "MID" | "SENIOR" | "LEAD" | "EXECUTIVE")[];
  salaryMin?: number;
  salaryMax?: number;
  locationCity?: string;
  locationProvince?: string;
  sortBy?: "savedAt" | "deadline" | "salary" | "jobTitle";
  sortOrder?: "asc" | "desc";
}

// Error response format
export interface SavedJobErrorResponse {
  success: false;
  error: string;
  details?: any;
}

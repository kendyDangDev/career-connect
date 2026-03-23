import { axiosInstance } from '@/lib/axios';
import {
  ExperienceLevel,
  JobType,
  WorkLocationType,
  type WorkLocationType as WorkLocationTypeValue,
} from '@/generated/prisma';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface PaginatedPayload<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export type CandidateSavedJobsApplicationStatus = 'all' | 'open' | 'expired';

export interface CandidateSavedJobsListParams {
  page?: number;
  limit?: number;
  search?: string;
  applicationStatus?: CandidateSavedJobsApplicationStatus;
  jobType?: JobType[];
  workLocationType?: WorkLocationType[];
  experienceLevel?: ExperienceLevel[];
  salaryMin?: number;
  salaryMax?: number;
  locationProvince?: string;
  sortBy?: 'savedAt' | 'deadline' | 'salary' | 'jobTitle';
  sortOrder?: 'asc' | 'desc';
}

export interface CandidateSavedJobCompanySummary {
  id: string;
  companyName: string;
  companySlug: string;
  logoUrl?: string | null;
  city?: string | null;
  province?: string | null;
}

export interface CandidateSavedJobSummary {
  id: string;
  title: string;
  slug: string;
  jobType: JobType;
  workLocationType: WorkLocationTypeValue;
  experienceLevel: ExperienceLevel;
  salaryMin?: number | string | null;
  salaryMax?: number | string | null;
  currency?: string | null;
  salaryNegotiable: boolean;
  locationCity?: string | null;
  locationProvince?: string | null;
  applicationDeadline?: string | null;
  status: string;
  featured: boolean;
  urgent: boolean;
  createdAt: string;
  publishedAt?: string | null;
  company: CandidateSavedJobCompanySummary;
  _count: {
    applications: number;
    savedJobs: number;
  };
}

export interface CandidateSavedJobListItem {
  id: string;
  candidateId: string;
  jobId: string;
  createdAt: string;
  job: CandidateSavedJobSummary;
}

export interface CandidateSavedJobsListData {
  savedJobs: CandidateSavedJobListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CandidateSavedJobStatus {
  isSaved: boolean;
  savedAt?: string;
  savedJobId?: string;
}

export interface CandidateSaveJobPayload {
  savedJob: CandidateSavedJobListItem;
  message: string;
}

export interface CandidateRemoveSavedJobPayload {
  message: string;
}

function appendArrayParams(
  queryParams: URLSearchParams,
  key: 'jobType[]' | 'workLocationType[]' | 'experienceLevel[]',
  values?: string[]
) {
  values?.forEach((value) => queryParams.append(key, value));
}

function buildQueryString(params: CandidateSavedJobsListParams = {}) {
  const queryParams = new URLSearchParams();

  if (params.page) {
    queryParams.set('page', String(params.page));
  }

  if (params.limit) {
    queryParams.set('limit', String(params.limit));
  }

  if (params.search) {
    queryParams.set('search', params.search);
  }

  if (params.applicationStatus && params.applicationStatus !== 'all') {
    queryParams.set('applicationStatus', params.applicationStatus);
  }

  appendArrayParams(queryParams, 'jobType[]', params.jobType);
  appendArrayParams(queryParams, 'workLocationType[]', params.workLocationType);
  appendArrayParams(queryParams, 'experienceLevel[]', params.experienceLevel);

  if (params.salaryMin !== undefined) {
    queryParams.set('salaryMin', String(params.salaryMin));
  }

  if (params.salaryMax !== undefined) {
    queryParams.set('salaryMax', String(params.salaryMax));
  }

  if (params.locationProvince) {
    queryParams.set('locationProvince', params.locationProvince);
  }

  if (params.sortBy) {
    queryParams.set('sortBy', params.sortBy);
  }

  if (params.sortOrder) {
    queryParams.set('sortOrder', params.sortOrder);
  }

  const serializedParams = queryParams.toString();
  return serializedParams ? `?${serializedParams}` : '';
}

async function unwrapResponse<T>(request: Promise<{ data: ApiResponse<T> }>) {
  const response = await request;

  if (!response.data.success) {
    throw new Error(response.data.error || 'Request failed');
  }

  return response.data.data;
}

export const candidateSavedJobsApi = {
  async getSavedJobs(params: CandidateSavedJobsListParams = {}) {
    const payload = await unwrapResponse(
      axiosInstance.get<ApiResponse<PaginatedPayload<CandidateSavedJobListItem>>>(
        `/api/candidate/saved-jobs${buildQueryString(params)}`
      )
    );

    return {
      savedJobs: payload.data,
      pagination: payload.pagination,
    } satisfies CandidateSavedJobsListData;
  },

  getSavedJobStatus(jobId: string) {
    return unwrapResponse(
      axiosInstance.get<ApiResponse<CandidateSavedJobStatus>>(
        `/api/candidate/saved-jobs/check/${jobId}`
      )
    );
  },

  saveJob(jobId: string) {
    return unwrapResponse(
      axiosInstance.post<ApiResponse<CandidateSaveJobPayload>>('/api/candidate/saved-jobs', {
        jobId,
      })
    );
  },

  removeSavedJob(savedJobId: string) {
    return unwrapResponse(
      axiosInstance.delete<ApiResponse<CandidateRemoveSavedJobPayload>>(
        `/api/candidate/saved-jobs/${savedJobId}`
      )
    );
  },
};

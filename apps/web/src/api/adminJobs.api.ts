import { axiosInstance } from '@/lib/axios';
import { JobStatus } from '@/generated/prisma';

export interface JobsParams {
  page?: number;
  limit?: number;
  status?: JobStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  featured?: boolean;
  urgent?: boolean;
  companyId?: string;
}

export interface JobsResponse {
  jobs: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface JobStatistics {
  // Define the structure based on your API response
  [key: string]: any;
}

// Query Keys
export const adminJobsKeys = {
  all: ['adminJobs'] as const,
  lists: () => [...adminJobsKeys.all, 'list'] as const,
  list: (params: JobsParams) => [...adminJobsKeys.lists(), params] as const,
  statistics: () => [...adminJobsKeys.all, 'statistics'] as const,
};

// API Functions
export const getJobs = async (params: JobsParams): Promise<JobsResponse> => {
  const response = await axiosInstance.get('/api/admin/jobs', { params });
  return response.data.data;
};

export const deleteJob = async (jobId: string): Promise<void> => {
  await axiosInstance.delete(`/api/admin/jobs/${jobId}`);
};

export const updateJobStatus = async (
  jobId: string,
  status: JobStatus,
  reason?: string
): Promise<void> => {
  await axiosInstance.patch(`/api/admin/jobs/${jobId}`, { status, reason });
};

export const bulkUpdateJobs = async (
  jobIds: string[],
  action: string,
  data?: any
): Promise<any> => {
  const response = await axiosInstance.post('/api/admin/jobs/bulk', {
    jobIds,
    action,
    data,
  });
  return response.data;
};

export const bulkDeleteJobs = async (jobIds: string[]): Promise<any> => {
  const response = await axiosInstance.delete('/api/admin/jobs/bulk', {
    data: { jobIds },
  });
  return response.data;
};

export const getJobStatistics = async (): Promise<JobStatistics> => {
  const response = await axiosInstance.get('/api/admin/jobs/statistics');
  return response.data.data;
};

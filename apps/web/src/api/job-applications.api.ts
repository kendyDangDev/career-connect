import axiosInstance from '@/lib/axios';

interface ApplicationsParams {
  jobId: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: 'appliedAt' | 'name' | 'experience';
  sortOrder?: 'asc' | 'desc';
}

interface ApplicationsResponse {
  applications: import('@/types/employer/job').ApplicationDetail[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  statusCounts: Record<string, number>;
  job: {
    id: string;
    title: string;
  };
}

// ─── Query Key Factory ─────────────────────────────────────────────────────────

export const jobApplicationsKeys = {
  all: ['job-applications'] as const,
  lists: () => [...jobApplicationsKeys.all, 'list'] as const,
  list: (params: ApplicationsParams) => [...jobApplicationsKeys.lists(), params] as const,
};

// ─── API Layer ─────────────────────────────────────────────────────────────────

export const jobApplicationsApi = {
  getJobApplications: async (params: ApplicationsParams): Promise<ApplicationsResponse> => {
    const { jobId, ...queryParams } = params;
    const { data } = await axiosInstance.get<ApplicationsResponse>(
      `/api/admin/jobs/${jobId}/applications`,
      { params: queryParams }
    );
    return data;
  },
};

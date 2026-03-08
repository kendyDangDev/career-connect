import { useQuery } from '@tanstack/react-query';
import { ApplicationDetail } from '@/types/employer/job';
import { jobApplicationsApi, jobApplicationsKeys } from '@/api/job-applications.api';

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
  applications: ApplicationDetail[];
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

export const useJobApplications = (params: ApplicationsParams) => {
  return useQuery({
    queryKey: jobApplicationsKeys.list(params),
    queryFn: () => jobApplicationsApi.getJobApplications(params),
    enabled: !!params.jobId,
  });
};

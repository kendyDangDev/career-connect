import { useQuery } from '@tanstack/react-query';
import { ApplicationDetail } from '@/types/employer/job';

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
  const {
    jobId,
    page = 1,
    limit = 10,
    search = '',
    status = 'all',
    sortBy = 'appliedAt',
    sortOrder = 'desc',
  } = params;

  return useQuery({
    queryKey: ['job-applications', jobId, page, limit, search, status, sortBy, sortOrder],
    queryFn: async (): Promise<ApplicationsResponse> => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (search) {
        searchParams.append('search', search);
      }

      if (status && status !== 'all') {
        searchParams.append('status', status);
      }

      const response = await fetch(`/api/admin/jobs/${jobId}/applications?${searchParams}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch applications: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch applications');
      }

      return result.data;
    },
    enabled: !!jobId,
  });
};

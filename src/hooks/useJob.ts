import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { jobApi } from '@/api/job.api';
import { UpdateJobData, UpdateApplicationData } from '@/types/job.types';
import { handleApiError } from '@/lib/axios';
import { useRouter } from 'next/navigation';

/**
 * Query keys for job-related queries
 */
export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (filters: string) => [...jobKeys.lists(), filters] as const,
  details: () => [...jobKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
  applications: (jobId: string) => [...jobKeys.detail(jobId), 'applications'] as const,
  applicationsList: (jobId: string, filters: string) =>
    [...jobKeys.applications(jobId), filters] as const,
};

/**
 * Hook to fetch job detail
 * @param jobId - Job ID
 * @returns Query result with job detail
 */
export const useJobDetail = (jobId: string) => {
  return useQuery({
    queryKey: jobKeys.detail(jobId),
    queryFn: () => jobApi.getJobDetail(jobId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled: !!jobId,
  });
};

/**
 * Hook to update job information
 * @returns Mutation to update job
 */
export const useUpdateJob = (jobId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateJobData) => jobApi.updateJob(jobId, data),
    onSuccess: (response) => {
      // Invalidate job detail and jobs list
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });

      toast.success(response.message || 'Cập nhật công việc thành công!');
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage || 'Cập nhật thất bại. Vui lòng thử lại!');
    },
  });
};

/**
 * Hook to update job status (Quick action)
 * @returns Mutation to update job status
 */
export const useUpdateJobStatus = (jobId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: 'PENDING' | 'ACTIVE' | 'CLOSED' | 'REJECTED') =>
      jobApi.updateJobStatus(jobId, status),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });

      toast.success(response.message || 'Cập nhật trạng thái thành công!');
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage || 'Cập nhật trạng thái thất bại!');
    },
  });
};

/**
 * Hook to delete job
 * @returns Mutation to delete job
 */
export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (jobId: string) => jobApi.deleteJob(jobId),
    onSuccess: (response, jobId) => {
      // Invalidate jobs list
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      // Remove job detail from cache
      queryClient.removeQueries({ queryKey: jobKeys.detail(jobId) });

      toast.success(response.message || 'Xóa công việc thành công!');

      // Redirect to jobs list
      setTimeout(() => {
        router.push('/employer/jobs');
      }, 1000);
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage || 'Xóa công việc thất bại!');
    },
  });
};

/**
 * Hook to duplicate job
 * @returns Mutation to duplicate job
 */
export const useDuplicateJob = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (jobId: string) => jobApi.duplicateJob(jobId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });

      toast.success('Sao chép công việc thành công!');

      // Redirect to new job
      setTimeout(() => {
        router.push(`/employer/jobs/${response.data.id}`);
      }, 1000);
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage || 'Sao chép công việc thất bại!');
    },
  });
};

/**
 * Hook to fetch job applications with pagination
 * @param jobId - Job ID
 * @param params - Query parameters
 * @returns Query result with applications list
 */
export const useJobApplications = (
  jobId: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }
) => {
  const filtersKey = JSON.stringify(params || {});

  return useQuery({
    queryKey: jobKeys.applicationsList(jobId, filtersKey),
    queryFn: () => jobApi.getJobApplications(jobId, params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
    enabled: !!jobId,
  });
};

/**
 * Hook to update application status
 * @returns Mutation to update application
 */
export const useUpdateApplication = (jobId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, data }: { applicationId: string; data: UpdateApplicationData }) =>
      jobApi.updateApplicationStatus(applicationId, data),
    onSuccess: () => {
      // Invalidate applications list
      queryClient.invalidateQueries({ queryKey: jobKeys.applications(jobId) });
      // Also invalidate job detail to update counts
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
      // Invalidate application detail
      queryClient.invalidateQueries({ queryKey: ['applications', 'detail'] });

      toast.success('Cập nhật trạng thái ứng viên thành công!');
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage || 'Cập nhật thất bại!');
    },
  });
};

/**
 * Hook to bulk update applications
 * @returns Mutation to bulk update
 */
export const useBulkUpdateApplications = (jobId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationIds, status }: { applicationIds: string[]; status: string }) =>
      jobApi.bulkUpdateApplications(applicationIds, status),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.applications(jobId) });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });

      toast.success(`Đã cập nhật ${response.updated} ứng viên thành công!`);
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage || 'Cập nhật hàng loạt thất bại!');
    },
  });
};

/**
 * Hook to prefetch job detail (useful for navigation)
 */
export const usePrefetchJobDetail = () => {
  const queryClient = useQueryClient();

  return (jobId: string) => {
    queryClient.prefetchQuery({
      queryKey: jobKeys.detail(jobId),
      queryFn: () => jobApi.getJobDetail(jobId),
    });
  };
};

/**
 * Hook to fetch application detail
 * @param applicationId - Application ID
 * @returns Query result with full application detail
 */
export const useApplicationDetail = (applicationId: string) => {
  return useQuery({
    queryKey: ['applications', 'detail', applicationId],
    queryFn: () => jobApi.getApplicationDetail(applicationId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled: !!applicationId,
  });
};

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { JobStatus } from '@/generated/prisma';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  JobsParams,
  JobsResponse,
  JobStatistics,
  adminJobsKeys,
  getJobs,
  deleteJob as deleteJobApi,
  updateJobStatus as updateJobStatusApi,
  bulkUpdateJobs,
  bulkDeleteJobs,
  getJobStatistics,
} from '@/api/adminJobs.api';

export function useAdminJobs(initialParams: JobsParams = {}) {
  const notifications = useNotifications();
  const queryClient = useQueryClient();

  const [params, setParams] = useState<JobsParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialParams,
  });

  // Query for jobs
  const {
    data: jobsData,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: adminJobsKeys.list(params),
    queryFn: () => getJobs(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const jobs = jobsData?.jobs || [];
  const pagination = jobsData?.pagination || null;

  const updateParams = (newParams: Partial<JobsParams>) => {
    setParams((prev) => ({
      ...prev,
      ...newParams,
    }));
  };

  // Mutation for deleting a job
  const deleteJobMutation = useMutation({
    mutationFn: (jobId: string) => deleteJobApi(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminJobsKeys.lists() });
    },
  });

  const deleteJob = async (jobId: string) => {
    const loadingId = notifications.loading('Đang xóa việc làm...');

    try {
      await deleteJobMutation.mutateAsync(jobId);
      notifications.dismissNotification(loadingId);
      notifications.warning('🗑️ Đã xóa việc làm', 'Việc làm đã được xóa khỏi hệ thống');
    } catch (err) {
      notifications.dismissNotification(loadingId);
      const message = err instanceof Error ? err.message : 'Failed to delete job';
      notifications.error('❌ Xóa thất bại', message);
    }
  };

  // Mutation for updating job status
  const updateJobStatusMutation = useMutation({
    mutationFn: ({
      jobId,
      status,
      reason,
    }: {
      jobId: string;
      status: JobStatus;
      reason?: string;
    }) => updateJobStatusApi(jobId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminJobsKeys.lists() });
    },
  });

  const updateJobStatus = async (jobId: string, status: JobStatus, reason?: string) => {
    const loadingId = notifications.loading('Đang cập nhật trạng thái...');

    try {
      await updateJobStatusMutation.mutateAsync({ jobId, status, reason });
      notifications.dismissNotification(loadingId);

      // Different notifications based on status
      switch (status) {
        case JobStatus.ACTIVE:
          notifications.success(
            '✅ Đã duyệt việc làm',
            'Việc làm đã được phê duyệt và hiển thị công khai'
          );
          break;
        case JobStatus.CLOSED:
          notifications.info('📊 Đã đóng việc làm', 'Việc làm đã ngừng tuyển dụng');
          break;
        case JobStatus.EXPIRED:
          notifications.warning('⏰ Việc làm đã hết hạn', 'Việc làm đã quá thời hạn tuyển dụng');
          break;
        default:
          notifications.info('📊 Trạng thái đã thay đổi', `Trạng thái mới: ${status}`);
      }
    } catch (err) {
      notifications.dismissNotification(loadingId);
      const message = err instanceof Error ? err.message : 'Failed to update job status';
      notifications.error('❌ Cập nhật thất bại', message);
    }
  };

  // Mutation for bulk update
  const bulkUpdateMutation = useMutation({
    mutationFn: ({ jobIds, action, data }: { jobIds: string[]; action: string; data?: any }) =>
      bulkUpdateJobs(jobIds, action, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminJobsKeys.lists() });
    },
  });

  const bulkUpdate = async (jobIds: string[], action: string, data?: any) => {
    const loadingId = notifications.loading(`Đang cập nhật ${jobIds.length} việc làm...`);

    try {
      const result = await bulkUpdateMutation.mutateAsync({ jobIds, action, data });
      notifications.dismissNotification(loadingId);

      // Different notifications based on action
      if (action === 'FEATURE') {
        notifications.success(
          '⭐ Đã đánh dấu nổi bật',
          `${jobIds.length} việc làm đã được đánh dấu nổi bật`,
          {
            action: {
              label: 'Xem danh sách',
              onClick: () => (window.location.href = '/admin/jobs/featured'),
            },
          }
        );
      } else if (action === 'APPROVE') {
        notifications.success(
          '✅ Phê duyệt hàng loạt thành công',
          `Đã phê duyệt ${jobIds.length} việc làm`
        );
      } else {
        notifications.success(
          '✅ Cập nhật thành công',
          result.message || `Đã cập nhật ${jobIds.length} việc làm`
        );
      }
    } catch (err) {
      notifications.dismissNotification(loadingId);
      const message = err instanceof Error ? err.message : 'Failed to perform bulk operation';
      notifications.error('❌ Cập nhật hàng loạt thất bại', message);
    }
  };

  // Mutation for bulk delete
  const bulkDeleteMutation = useMutation({
    mutationFn: (jobIds: string[]) => bulkDeleteJobs(jobIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminJobsKeys.lists() });
    },
  });

  const bulkDelete = async (jobIds: string[]) => {
    const loadingId = notifications.loading(`Đang xóa ${jobIds.length} việc làm...`);

    try {
      await bulkDeleteMutation.mutateAsync(jobIds);
      notifications.dismissNotification(loadingId);
      notifications.warning(
        '🗑️ Xóa hàng loạt thành công',
        `Đã xóa ${jobIds.length} việc làm khỏi hệ thống`
      );
    } catch (err) {
      notifications.dismissNotification(loadingId);
      const message = err instanceof Error ? err.message : 'Failed to delete jobs';
      notifications.error('❌ Xóa hàng loạt thất bại', message);
    }
  };

  return {
    jobs,
    loading,
    error: error?.message || null,
    pagination,
    params,
    updateParams,
    deleteJob,
    updateJobStatus,
    bulkUpdate,
    bulkDelete,
    refetch,
  };
}

export function useJobStatistics() {
  const {
    data: stats,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: adminJobsKeys.statistics(),
    queryFn: getJobStatistics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    stats,
    loading,
    error: error?.message || null,
    refetch,
  };
}

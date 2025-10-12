import { useState, useEffect, useCallback } from 'react';
import { JobStatus } from '@/generated/prisma';
import { toast } from 'sonner';
import { useNotifications } from '@/contexts/NotificationContext';

interface JobsParams {
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

interface JobsResponse {
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

export function useAdminJobs(initialParams: JobsParams = {}) {
  const notifications = useNotifications();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [params, setParams] = useState<JobsParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialParams,
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(`/api/admin/jobs?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch jobs');
      }

      const data = await response.json();
      
      if (data.success) {
        setJobs(data.data.jobs);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      notifications.error('❌ Lỗi tải danh sách', message);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const updateParams = useCallback((newParams: Partial<JobsParams>) => {
    setParams((prev) => ({
      ...prev,
      ...newParams,
    }));
  }, []);

  const deleteJob = useCallback(async (jobId: string) => {
    const loadingId = notifications.loading('Đang xóa việc làm...');
    
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete job');
      }

      notifications.dismissNotification(loadingId);
      notifications.warning('🗑️ Đã xóa việc làm', 'Việc làm đã được xóa khỏi hệ thống');
      await fetchJobs();
    } catch (err) {
      notifications.dismissNotification(loadingId);
      const message = err instanceof Error ? err.message : 'Failed to delete job';
      notifications.error('❌ Xóa thất bại', message);
    }
  }, [fetchJobs, notifications]);

  const updateJobStatus = useCallback(async (jobId: string, status: JobStatus, reason?: string) => {
    const loadingId = notifications.loading('Đang cập nhật trạng thái...');
    
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status, reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update job status');
      }

      notifications.dismissNotification(loadingId);
      
      // Different notifications based on status
      switch (status) {
        case JobStatus.ACTIVE:
          notifications.success('✅ Đã duyệt việc làm', 'Việc làm đã được phê duyệt và hiển thị công khai');
          break;
        case JobStatus.REJECTED:
          notifications.warning('🚫 Đã từ chối việc làm', reason || 'Việc làm không đáp ứng yêu cầu');
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
      
      await fetchJobs();
    } catch (err) {
      notifications.dismissNotification(loadingId);
      const message = err instanceof Error ? err.message : 'Failed to update job status';
      notifications.error('❌ Cập nhật thất bại', message);
    }
  }, [fetchJobs, notifications]);

  const bulkUpdate = useCallback(async (jobIds: string[], action: string, data?: any) => {
    const loadingId = notifications.loading(`Đang cập nhật ${jobIds.length} việc làm...`);
    
    try {
      const response = await fetch('/api/admin/jobs/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ jobIds, action, data }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to perform bulk operation');
      }

      const result = await response.json();
      notifications.dismissNotification(loadingId);
      
      // Different notifications based on action
      if (action === 'FEATURE') {
        notifications.success(
          '⭐ Đã đánh dấu nổi bật',
          `${jobIds.length} việc làm đã được đánh dấu nổi bật`,
          {
            action: {
              label: 'Xem danh sách',
              onClick: () => window.location.href = '/admin/jobs/featured'
            }
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
      
      await fetchJobs();
    } catch (err) {
      notifications.dismissNotification(loadingId);
      const message = err instanceof Error ? err.message : 'Failed to perform bulk operation';
      notifications.error('❌ Cập nhật hàng loạt thất bại', message);
    }
  }, [fetchJobs, notifications]);

  const bulkDelete = useCallback(async (jobIds: string[]) => {
    const loadingId = notifications.loading(`Đang xóa ${jobIds.length} việc làm...`);
    
    try {
      const response = await fetch('/api/admin/jobs/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ jobIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete jobs');
      }

      const result = await response.json();
      notifications.dismissNotification(loadingId);
      notifications.warning(
        '🗑️ Xóa hàng loạt thành công',
        `Đã xóa ${jobIds.length} việc làm khỏi hệ thống`
      );
      await fetchJobs();
    } catch (err) {
      notifications.dismissNotification(loadingId);
      const message = err instanceof Error ? err.message : 'Failed to delete jobs';
      notifications.error('❌ Xóa hàng loạt thất bại', message);
    }
  }, [fetchJobs, notifications]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
    pagination,
    params,
    updateParams,
    deleteJob,
    updateJobStatus,
    bulkUpdate,
    bulkDelete,
    refetch: fetchJobs,
  };
}

export function useJobStatistics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/jobs/statistics', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch statistics');
      }

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch statistics');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
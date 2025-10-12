import { useCallback } from 'react';
import { 
  useJobsList as useJobsListBase, 
  useJobDetail as useJobDetailBase,
  useJobMutations as useJobMutationsBase,
  useJobAnalytics,
  useAdminDashboard
} from './useJobManagement';
import { useNotifications } from '@/contexts/NotificationContext';
import { CreateJobDTO, UpdateJobDTO, UpdateJobStatusDTO } from '@/types/employer/job';

/**
 * Enhanced version of useJobsList with notifications
 */
export const useJobsList = (initialFilters?: any) => {
  const result = useJobsListBase(initialFilters);
  const { error: notify } = useNotifications();

  // Show error notification when fetch fails
  if (result.error) {
    notify('Lỗi tải danh sách công việc', result.error);
  }

  return result;
};

/**
 * Enhanced version of useJobDetail with notifications
 */
export const useJobDetail = (jobId: string | null) => {
  const result = useJobDetailBase(jobId);
  const { error: notify } = useNotifications();

  // Show error notification when fetch fails
  if (result.error) {
    notify('Lỗi tải thông tin công việc', result.error);
  }

  return result;
};

/**
 * Enhanced version of useJobMutations with notifications
 */
export const useJobMutations = (onSuccessCallback?: (operation: string, data?: any) => void) => {
  const notifications = useNotifications();

  // Wrapper for onSuccess callback that includes notifications
  const onSuccess = useCallback((operation: string, data?: any) => {
    // Show success notifications based on operation
    switch (operation) {
      case 'create':
        notifications.success(
          '✨ Tạo công việc thành công',
          'Công việc mới đã được tạo và sẵn sàng để ứng tuyển',
          {
            action: {
              label: 'Xem chi tiết',
              onClick: () => {
                // Navigate to job detail
                if (data?.id) {
                  window.location.href = `/admin/jobs/${data.id}`;
                }
              }
            }
          }
        );
        break;
      
      case 'update':
        notifications.success(
          '✅ Cập nhật thành công',
          'Thông tin công việc đã được cập nhật'
        );
        break;
      
      case 'updateStatus':
        notifications.info(
          '📊 Trạng thái đã thay đổi',
          `Trạng thái công việc đã được cập nhật thành công`
        );
        break;
      
      case 'duplicate':
        notifications.success(
          '📋 Sao chép thành công',
          'Công việc đã được sao chép. Bạn có thể chỉnh sửa nội dung mới',
          {
            action: {
              label: 'Chỉnh sửa',
              onClick: () => {
                if (data?.id) {
                  window.location.href = `/admin/jobs/${data.id}/edit`;
                }
              }
            }
          }
        );
        break;
      
      case 'delete':
        notifications.warning(
          '🗑️ Đã xóa công việc',
          'Công việc đã được xóa khỏi hệ thống'
        );
        break;
      
      case 'bulkUpdateStatus':
        notifications.success(
          '✅ Cập nhật hàng loạt thành công',
          `Đã cập nhật trạng thái cho ${data?.count || 'nhiều'} công việc`
        );
        break;
      
      case 'bulkDelete':
        notifications.warning(
          '🗑️ Xóa hàng loạt thành công',
          `Đã xóa ${data?.count || 'nhiều'} công việc khỏi hệ thống`
        );
        break;
    }

    // Call the original callback if provided
    onSuccessCallback?.(operation, data);
  }, [notifications, onSuccessCallback]);

  const baseMutations = useJobMutationsBase(onSuccess);

  // Enhanced mutations with loading notifications
  const createJob = useCallback(async (data: CreateJobDTO) => {
    const loadingId = notifications.loading('Đang tạo công việc mới...');
    
    try {
      await baseMutations.createJob(data);
    } catch (error) {
      notifications.error(
        '❌ Tạo công việc thất bại',
        error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'
      );
    } finally {
      notifications.dismissNotification(loadingId);
    }
  }, [baseMutations, notifications]);

  const updateJob = useCallback(async (jobId: string, data: UpdateJobDTO) => {
    const loadingId = notifications.loading('Đang cập nhật thông tin...');
    
    try {
      await baseMutations.updateJob(jobId, data);
    } catch (error) {
      notifications.error(
        '❌ Cập nhật thất bại',
        error instanceof Error ? error.message : 'Không thể cập nhật thông tin công việc'
      );
    } finally {
      notifications.dismissNotification(loadingId);
    }
  }, [baseMutations, notifications]);

  const updateJobStatus = useCallback(async (jobId: string, data: UpdateJobStatusDTO) => {
    const loadingId = notifications.loading('Đang thay đổi trạng thái...');
    
    try {
      await baseMutations.updateJobStatus(jobId, data);
    } catch (error) {
      notifications.error(
        '❌ Thay đổi trạng thái thất bại',
        error instanceof Error ? error.message : 'Không thể thay đổi trạng thái công việc'
      );
    } finally {
      notifications.dismissNotification(loadingId);
    }
  }, [baseMutations, notifications]);

  const duplicateJob = useCallback(async (jobId: string, title?: string) => {
    const loadingId = notifications.loading('Đang sao chép công việc...');
    
    try {
      await baseMutations.duplicateJob(jobId, title);
    } catch (error) {
      notifications.error(
        '❌ Sao chép thất bại',
        error instanceof Error ? error.message : 'Không thể sao chép công việc'
      );
    } finally {
      notifications.dismissNotification(loadingId);
    }
  }, [baseMutations, notifications]);

  const deleteJob = useCallback(async (jobId: string) => {
    const loadingId = notifications.loading('Đang xóa công việc...');
    
    try {
      await baseMutations.deleteJob(jobId);
    } catch (error) {
      notifications.error(
        '❌ Xóa thất bại',
        error instanceof Error ? error.message : 'Không thể xóa công việc'
      );
    } finally {
      notifications.dismissNotification(loadingId);
    }
  }, [baseMutations, notifications]);

  const bulkUpdateStatus = useCallback(async (jobIds: string[], status: string, reason?: string) => {
    const loadingId = notifications.loading(`Đang cập nhật ${jobIds.length} công việc...`);
    
    try {
      await baseMutations.bulkUpdateStatus(jobIds, status, reason);
    } catch (error) {
      notifications.error(
        '❌ Cập nhật hàng loạt thất bại',
        error instanceof Error ? error.message : 'Không thể cập nhật trạng thái'
      );
    } finally {
      notifications.dismissNotification(loadingId);
    }
  }, [baseMutations, notifications]);

  const bulkDelete = useCallback(async (jobIds: string[]) => {
    const loadingId = notifications.loading(`Đang xóa ${jobIds.length} công việc...`);
    
    try {
      await baseMutations.bulkDelete(jobIds);
    } catch (error) {
      notifications.error(
        '❌ Xóa hàng loạt thất bại',
        error instanceof Error ? error.message : 'Không thể xóa các công việc đã chọn'
      );
    } finally {
      notifications.dismissNotification(loadingId);
    }
  }, [baseMutations, notifications]);

  return {
    ...baseMutations,
    createJob,
    updateJob,
    updateJobStatus,
    duplicateJob,
    deleteJob,
    bulkUpdateStatus,
    bulkDelete,
  };
};

// Re-export unchanged hooks
export { useJobAnalytics, useAdminDashboard };
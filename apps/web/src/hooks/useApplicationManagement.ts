'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApplicationStatus } from '@/generated/prisma';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  getApplicationDetail,
  updateApplicationStatus as updateApplicationStatusApi,
  adminApplicationKeys,
} from '@/api/admin/adminApplication.api';
import type { UpdateApplicationStatusParams } from '@/types/admin/application.types';

export const useApplicationMutations = () => {
  const { showNotification } = useNotifications();
  const queryClient = useQueryClient();

  // Mutation for updating application status
  const updateApplicationStatusMutation = useMutation({
    mutationFn: (params: UpdateApplicationStatusParams) => updateApplicationStatusApi(params),
    onSuccess: () => {
      // Invalidate related queries if needed
      queryClient.invalidateQueries({ queryKey: adminApplicationKeys.all });
    },
  });

  const updateApplicationStatus = async (params: UpdateApplicationStatusParams) => {
    try {
      const result = await updateApplicationStatusMutation.mutateAsync(params);

      showNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Cập nhật trạng thái ứng tuyển thành công',
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';

      showNotification({
        type: 'error',
        title: 'Lỗi',
        message: errorMessage,
      });

      throw err;
    }
  };

  // Query for application detail (if needed, but since it's a hook for mutations, this might be optional)
  // For now, keeping it as a function that can be called manually
  const getApplicationDetailQuery = (applicationId: string) => {
    return useQuery({
      queryKey: adminApplicationKeys.detail(applicationId),
      queryFn: () => getApplicationDetail(applicationId),
      enabled: !!applicationId,
    });
  };

  return {
    updateApplicationStatus,
    getApplicationDetail: getApplicationDetail, // Keep as direct function for backward compatibility
    loading: updateApplicationStatusMutation.isPending,
    error: updateApplicationStatusMutation.error?.message || null,
    // If you want to expose the query hook
    useApplicationDetail: getApplicationDetailQuery,
  };
};

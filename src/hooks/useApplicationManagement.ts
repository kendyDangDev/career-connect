'use client';

import { useState } from 'react';
import { ApplicationStatus } from '@/generated/prisma';
import { useNotifications } from '@/contexts/NotificationContext';

interface UpdateApplicationStatusParams {
  applicationId: string;
  status: ApplicationStatus;
  reason?: string;
  notes?: string;
}

export const useApplicationMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotifications();

  const updateApplicationStatus = async (params: UpdateApplicationStatusParams) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/applications/${params.applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: params.status,
          reason: params.reason,
          notes: params.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update application status');
      }

      showNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Cập nhật trạng thái ứng tuyển thành công',
      });

      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);

      showNotification({
        type: 'error',
        title: 'Lỗi',
        message: errorMessage,
      });

      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getApplicationDetail = async (applicationId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/applications/${applicationId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch application details');
      }

      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateApplicationStatus,
    getApplicationDetail,
    loading,
    error,
  };
};

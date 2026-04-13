'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  employerApplicationsApi,
  ApplicationsListParams,
  UpdateApplicationStatusRequest,
  UpdateApplicationStatusResponse,
  UpdateApplicationRatingRequest,
} from '@/api/employer/applications.api';
import { handleApiError } from '@/lib/axios';

// Query Keys
export const applicationsKeys = {
  all: ['employer', 'applications'] as const,
  lists: () => [...applicationsKeys.all, 'list'] as const,
  list: (params: ApplicationsListParams) => [...applicationsKeys.lists(), params] as const,
  detail: (id: string) => [...applicationsKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch applications list with filters and pagination
 */
export const useApplicationsList = (params: ApplicationsListParams = {}) => {
  return useQuery({
    queryKey: applicationsKeys.list(params),
    queryFn: () => employerApplicationsApi.getApplications(params),
    staleTime: 1000 * 60 * 2,
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook to update application status
 */
export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      statusData,
    }: {
      applicationId: string;
      statusData: UpdateApplicationStatusRequest;
    }) => employerApplicationsApi.updateStatus(applicationId, statusData),

    onSuccess: (response: UpdateApplicationStatusResponse, variables) => {
      queryClient.invalidateQueries({ queryKey: applicationsKeys.lists() });

      if (variables.statusData.status || variables.statusData.notes) {
        toast.success('Cập nhật trạng thái thành công');
      } else {
        toast.success('Đã cập nhật lịch phỏng vấn');
      }

      if (response.data.emailNotification.warning) {
        toast.warning(response.data.emailNotification.warning);
      }
    },

    onError: (error) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to update application rating
 */
export const useUpdateApplicationRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      ratingData,
    }: {
      applicationId: string;
      ratingData: UpdateApplicationRatingRequest;
    }) => employerApplicationsApi.updateRating(applicationId, ratingData),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationsKeys.lists() });
      toast.success('Cập nhật đánh giá thành công');
    },

    onError: (error) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to save a single note for application
 */
export const useSaveApplicationNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, notes }: { applicationId: string; notes: string }) =>
      employerApplicationsApi.saveNote(applicationId, notes),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationsKeys.lists() });
      toast.success('Đã lưu ghi chú');
    },

    onError: (error) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to bulk update applications
 */
export const useBulkUpdateApplications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationIds,
      updates,
    }: {
      applicationIds: string[];
      updates: Partial<UpdateApplicationStatusRequest>;
    }) => employerApplicationsApi.bulkUpdate(applicationIds, updates),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: applicationsKeys.lists() });
      toast.success(`Đã cập nhật ${variables.applicationIds.length} ứng viên`);
    },

    onError: (error) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    },
  });
};

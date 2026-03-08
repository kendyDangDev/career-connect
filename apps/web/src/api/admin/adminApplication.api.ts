import { axiosInstance } from '@/lib/axios';
import type {
  ApplicationDetail,
  UpdateApplicationStatusParams,
} from '@/types/admin/application.types';

// Query Keys
export const adminApplicationKeys = {
  all: ['adminApplication'] as const,
  details: () => [...adminApplicationKeys.all, 'detail'] as const,
  detail: (applicationId: string) => [...adminApplicationKeys.details(), applicationId] as const,
};

// API Functions
export const getApplicationDetail = async (applicationId: string): Promise<ApplicationDetail> => {
  const response = await axiosInstance.get(`/api/admin/applications/${applicationId}`);
  return response.data.data;
};

export const updateApplicationStatus = async (
  params: UpdateApplicationStatusParams
): Promise<ApplicationDetail> => {
  const response = await axiosInstance.put(`/api/admin/applications/${params.applicationId}`, {
    status: params.status,
    reason: params.reason,
    notes: params.notes,
  });
  return response.data.data;
};

import { axiosInstance } from '@/lib/axios';
import type { CandidateProfileFormValues } from '@/types/candidate/profile.types';

interface CandidateProfileResponse {
  success: boolean;
  data: CandidateProfileFormValues;
  message?: string;
  error?: string;
}

interface CandidateAvatarResponse {
  success: boolean;
  data?: {
    avatarUrl?: string | null;
    user?: {
      avatarUrl?: string | null;
    };
  };
  message?: string;
  error?: string;
}

export const candidateProfileApi = {
  async getProfile(): Promise<CandidateProfileFormValues> {
    const response = await axiosInstance.get<CandidateProfileResponse>('/api/candidate/profile');

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch candidate profile');
    }

    return response.data.data;
  },

  async updateProfile(data: CandidateProfileFormValues): Promise<CandidateProfileFormValues> {
    const response = await axiosInstance.put<CandidateProfileResponse>(
      '/api/candidate/profile',
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to update candidate profile');
    }

    return response.data.data;
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await axiosInstance.post<CandidateAvatarResponse>(
      `/api/users/${userId}/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to upload avatar');
    }

    const avatarUrl = response.data.data?.avatarUrl ?? response.data.data?.user?.avatarUrl;

    if (!avatarUrl) {
      throw new Error('Avatar URL was not returned by the server');
    }

    return avatarUrl;
  },

  async deleteAvatar(userId: string): Promise<void> {
    const response = await axiosInstance.delete<CandidateAvatarResponse>(
      `/api/users/${userId}/avatar`
    );

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete avatar');
    }
  },
};

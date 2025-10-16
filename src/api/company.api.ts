import axiosInstance from '@/lib/axios';
import {
  CompanyProfileResponse,
  UpdateCompanyData,
  UpdateCompanyResponse,
  MediaUploadResponse,
} from '@/types/company.types';

/**
 * Company API Service
 * Handles all API calls related to company management
 */
export const companyApi = {
  /**
   * Get company profile with statistics
   * @returns Company profile and stats
   */
  getProfile: async (): Promise<CompanyProfileResponse> => {
    const { data } = await axiosInstance.get<CompanyProfileResponse>('/api/companies/profile');
    return data;
  },

  /**
   * Update company profile
   * @param updateData - Company data to update
   * @returns Updated company profile
   */
  updateProfile: async (updateData: UpdateCompanyData): Promise<UpdateCompanyResponse> => {
    const { data } = await axiosInstance.put<UpdateCompanyResponse>(
      '/api/companies/profile',
      updateData
    );
    return data;
  },

  /**
   * Upload company media (logo, cover, gallery)
   * @param file - File to upload
   * @param type - Type of media (logo, cover, gallery)
   * @returns Upload response with URL
   */
  uploadMedia: async (file: File, type: 'logo' | 'cover' | 'gallery'): Promise<MediaUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const { data } = await axiosInstance.post<MediaUploadResponse>(
      '/api/companies/media',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  /**
   * Delete company media
   * @param url - URL of media to delete
   * @param type - Type of media
   */
  deleteMedia: async (url: string, type: 'logo' | 'cover' | 'gallery'): Promise<void> => {
    await axiosInstance.delete('/api/companies/media', {
      data: { url, type },
    });
  },
};

export default companyApi;

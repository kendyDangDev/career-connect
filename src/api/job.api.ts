import axiosInstance from '@/lib/axios';
import {
  JobDetailResponse,
  UpdateJobData,
  UpdateJobResponse,
  DeleteJobResponse,
  JobApplicationsResponse,
  UpdateApplicationData,
} from '@/types/job.types';

/**
 * Job API Service
 * Handles all API calls related to job management for employers
 */
export const jobApi = {
  /**
   * Get job detail by ID
   * @param jobId - Job ID
   * @returns Job detail with company and stats
   */
  getJobDetail: async (jobId: string): Promise<JobDetailResponse> => {
    const { data } = await axiosInstance.get<JobDetailResponse>(`/api/employer/jobs/${jobId}`);
    return data;
  },

  /**
   * Update job information
   * @param jobId - Job ID
   * @param updateData - Job data to update
   * @returns Updated job detail
   */
  updateJob: async (jobId: string, updateData: UpdateJobData): Promise<UpdateJobResponse> => {
    const { data } = await axiosInstance.put<UpdateJobResponse>(
      `/api/employer/jobs/${jobId}`,
      updateData
    );
    return data;
  },

  /**
   * Delete job (soft delete)
   * @param jobId - Job ID
   * @returns Delete confirmation
   */
  deleteJob: async (jobId: string): Promise<DeleteJobResponse> => {
    const { data } = await axiosInstance.delete<DeleteJobResponse>(`/api/employer/jobs/${jobId}`);
    return data;
  },

  /**
   * Update job status (Quick action)
   * @param jobId - Job ID
   * @param status - New status
   * @returns Updated job detail
   */
  updateJobStatus: async (
    jobId: string,
    status: 'PENDING' | 'ACTIVE' | 'CLOSED' | 'REJECTED'
  ): Promise<UpdateJobResponse> => {
    const { data } = await axiosInstance.put<UpdateJobResponse>(`/api/employer/jobs/${jobId}`, {
      status,
    });
    return data;
  },

  /**
   * Get job applications with filtering and pagination (Updated)
   * @param jobId - Job ID
   * @param params - Query parameters
   * @returns Applications list with pagination and stats
   */
  getJobApplications: async (
    jobId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const { data } = await axiosInstance.get(
      `/api/employer/jobs/${jobId}/applications?${queryParams.toString()}`
    );
    return data;
  },

  /**
   * Update application (Flexible - can update status, rating, notes, etc.)
   * Recommended endpoint for all application updates
   * @param applicationId - Application ID
   * @param updateData - Update data (any combination of status, notes, rating, interviewScheduledAt)
   * @returns Success response
   */
  updateApplicationStatus: async (
    applicationId: string,
    updateData: UpdateApplicationData
  ): Promise<{ success: boolean; message: string }> => {
    const { data } = await axiosInstance.patch(
      `/api/employer/applications/${applicationId}`,
      updateData
    );
    return data;
  },

  /**
   * Bulk update application statuses
   * @param applicationIds - Array of application IDs
   * @param status - New status to apply
   * @returns Success response
   */
  bulkUpdateApplications: async (
    applicationIds: string[],
    status: string
  ): Promise<{ success: boolean; message: string; updated: number }> => {
    const { data } = await axiosInstance.post(`/api/employer/applications/bulk-update`, {
      applicationIds,
      status,
    });
    return data;
  },

  /**
   * Duplicate job (copy job with draft status)
   * @param jobId - Job ID to duplicate
   * @returns New job detail
   */
  duplicateJob: async (jobId: string): Promise<JobDetailResponse> => {
    const { data } = await axiosInstance.post<JobDetailResponse>(
      `/api/employer/jobs/${jobId}/duplicate`
    );
    return data;
  },

  /**
   * Get application detail with full candidate info
   * @param applicationId - Application ID
   * @returns Full application detail
   */
  getApplicationDetail: async (applicationId: string) => {
    const { data } = await axiosInstance.get(`/api/employer/applications/${applicationId}`);
    return data;
  },
};

export default jobApi;

import axiosInstance from '@/lib/axios';
import { ApplicationStatus } from '@/generated/prisma';

// Request/Response types
export interface ApplicationsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string; // comma-separated status values
  jobId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CandidateApplication {
  id: string;
  candidateId: string;
  userId: string; // User ID for conversations
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  position: string;
  location: string;
  experience: string;
  experienceYears?: number | null;
  appliedDate: string;
  status: ApplicationStatus;
  rating?: number | null;
  matchScore?: number;
  skills: string[];
  notes?: string;
  coverLetter?: string;
  cvFileUrl?: string;
  interviewScheduledAt?: string;
}

export interface ApplicationsStats {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
}

export interface ApplicationsListResponse {
  success: boolean;
  data: {
    applications: CandidateApplication[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    stats: ApplicationsStats;
  };
}

export interface UpdateApplicationStatusRequest {
  status?: ApplicationStatus;
  notes?: string;
  interviewScheduledAt?: string;
  notifyCandidate?: boolean;
}

export interface UpdateApplicationStatusResponse {
  success: boolean;
  message?: string;
  data: {
    updated: boolean;
    emailNotification: {
      attempted: boolean;
      sent: boolean;
      warning?: string;
    };
  };
}

export interface UpdateApplicationRatingRequest {
  rating: number;
}

export const employerApplicationsApi = {
  /**
   * Get all applications for employer's company
   */
  getApplications: async (
    params: ApplicationsListParams = {}
  ): Promise<ApplicationsListResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.jobId) queryParams.append('jobId', params.jobId);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const { data } = await axiosInstance.get<ApplicationsListResponse>(
      `/api/employer/applications?${queryParams.toString()}`
    );
    return data;
  },

  /**
   * Update application status
   */
  updateStatus: async (
    applicationId: string,
    statusData: UpdateApplicationStatusRequest
  ): Promise<UpdateApplicationStatusResponse> => {
    const { data } = await axiosInstance.patch<UpdateApplicationStatusResponse>(
      `/api/employer/applications/${applicationId}/status`,
      statusData
    );
    return data;
  },

  /**
   * Update application rating
   */
  updateRating: async (
    applicationId: string,
    ratingData: UpdateApplicationRatingRequest
  ): Promise<{ success: boolean; data: any }> => {
    const { data } = await axiosInstance.patch(
      `/api/employer/applications/${applicationId}`,
      ratingData
    );
    return data;
  },

  /**
   * Save a single recruiter note for application
   */
  saveNote: async (
    applicationId: string,
    notes: string
  ): Promise<{ success: boolean; data: any }> => {
    const { data } = await axiosInstance.patch(`/api/employer/applications/${applicationId}`, {
      notes,
    });
    return data;
  },

  /**
   * Bulk update applications
   */
  bulkUpdate: async (
    applicationIds: string[],
    updates: Partial<UpdateApplicationStatusRequest>
  ): Promise<{ success: boolean; data: any }> => {
    const { data } = await axiosInstance.post(`/api/employer/applications/bulk-update`, {
      applicationIds,
      ...updates,
    });
    return data;
  },
};

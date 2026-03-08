import axiosInstance from '@/lib/axios';
import {
  JobDetailResponse,
  UpdateJobData,
  UpdateJobResponse,
  DeleteJobResponse,
  JobApplicationsResponse,
  UpdateApplicationData,
} from '@/types/job.types';
import {
  JobListParams,
  JobListResponse,
  CreateJobDTO,
  UpdateJobDTO,
  JobDetail as EmployerJobDetail,
  JobStatistics,
  UpdateJobStatusDTO,
  DuplicateJobDTO,
} from '@/types/employer/job';

// ─── Admin-specific interfaces ────────────────────────────────────────────────

export interface AdminJobListParams extends JobListParams {
  companyId?: string;
  recruiterId?: string;
  fromDate?: string;
  toDate?: string;
  featured?: boolean;
  urgent?: boolean;
}

export interface AdminJobStatsSummary {
  totalJobs: number;
  activeJobs: number;
  pendingJobs: number;
  closedJobs: number;
  expiredJobs: number;
  totalApplications: number;
  totalViews: number;
  averageViewsPerJob: number;
  conversionRate: number;
  topPerformingJobs: {
    id: string;
    title: string;
    company: string;
    applications: number;
    views: number;
    conversionRate: number;
  }[];
  recentActivity: {
    date: string;
    jobsCreated: number;
    applications: number;
    views: number;
  }[];
}

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

// ─── Admin Job API ────────────────────────────────────────────────────────────
// Consolidates AdminJobService logic using axiosInstance for consistent
// auth (interceptors) and error handling across the app.

type AdminApiResponse<T> = { data: T; success: boolean; message?: string };

export const adminJobApi = {
  /**
   * Get paginated list of jobs (admin view — can see all companies)
   */
  getJobsList: async (params: AdminJobListParams = {}): Promise<JobListResponse> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const { data } = await axiosInstance.get<AdminApiResponse<JobListResponse>>(
      `/api/admin/jobs?${searchParams.toString()}`
    );
    return data.data;
  },

  /**
   * Get job detail by ID (admin)
   */
  getJobDetail: async (jobId: string): Promise<EmployerJobDetail> => {
    const { data } = await axiosInstance.get<AdminApiResponse<EmployerJobDetail>>(
      `/api/admin/jobs/${jobId}`
    );
    return data.data;
  },

  /**
   * Create a new job
   */
  createJob: async (
    jobData: CreateJobDTO
  ): Promise<{ id: string; slug: string; title: string; status: string }> => {
    const { data } = await axiosInstance.post<
      AdminApiResponse<{ id: string; slug: string; title: string; status: string }>
    >(`/api/admin/jobs`, jobData);
    return data.data;
  },

  /**
   * Update existing job (admin)
   */
  updateJob: async (jobId: string, updateData: UpdateJobDTO): Promise<EmployerJobDetail> => {
    const { data } = await axiosInstance.put<AdminApiResponse<EmployerJobDetail>>(
      `/api/admin/jobs/${jobId}`,
      updateData
    );
    return data.data;
  },

  /**
   * Update job status (admin)
   */
  updateJobStatus: async (
    jobId: string,
    statusData: UpdateJobStatusDTO
  ): Promise<{ success: boolean; message: string }> => {
    const { data } = await axiosInstance.patch<
      AdminApiResponse<{ success: boolean; message: string }>
    >(`/api/admin/jobs/${jobId}`, statusData);
    return data.data;
  },

  /**
   * Duplicate a job
   */
  duplicateJob: async (
    jobId: string,
    duplicateData?: DuplicateJobDTO
  ): Promise<EmployerJobDetail> => {
    const { data } = await axiosInstance.post<AdminApiResponse<EmployerJobDetail>>(
      `/api/admin/jobs/${jobId}/duplicate`,
      duplicateData || {}
    );
    return data.data;
  },

  /**
   * Delete / close a job (admin)
   */
  deleteJob: async (jobId: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await axiosInstance.delete<
      AdminApiResponse<{ success: boolean; message: string }>
    >(`/api/admin/jobs/${jobId}`);
    return data.data;
  },

  /**
   * Get job statistics (admin)
   */
  getJobStatistics: async (jobId: string): Promise<JobStatistics> => {
    const { data } = await axiosInstance.get<AdminApiResponse<JobStatistics>>(
      `/api/admin/jobs/${jobId}/statistics`
    );
    return data.data;
  },

  /**
   * Get admin dashboard stats summary
   */
  getAdminStatsSummary: async (): Promise<AdminJobStatsSummary> => {
    const { data } = await axiosInstance.get<AdminApiResponse<AdminJobStatsSummary>>(
      `/api/admin/jobs/statistics`
    );
    return data.data;
  },

  /**
   * Bulk update job statuses
   */
  bulkUpdateJobStatus: async (
    jobIds: string[],
    status: string,
    reason?: string
  ): Promise<{ success: boolean; message: string; updated: number }> => {
    const { data } = await axiosInstance.post<
      AdminApiResponse<{ success: boolean; message: string; updated: number }>
    >(`/api/admin/jobs/bulk/status`, { jobIds, status, reason });
    return data.data;
  },

  /**
   * Bulk delete jobs
   */
  bulkDeleteJobs: async (
    jobIds: string[]
  ): Promise<{ success: boolean; message: string; deleted: number }> => {
    const { data } = await axiosInstance.post<
      AdminApiResponse<{ success: boolean; message: string; deleted: number }>
    >(`/api/admin/jobs/bulk/delete`, { jobIds });
    return data.data;
  },

  /**
   * Get public jobs list
   */
  getPublicJobs: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      jobType?: string;
      experienceLevel?: string;
      locationCity?: string;
      categoryId?: string;
    } = {}
  ): Promise<{ jobs: any[]; pagination: any; success: boolean }> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const { data } = await axiosInstance.get<AdminApiResponse<{ jobs: any[]; pagination: any }>>(
      `/api/jobs?${searchParams.toString()}`
    );
    return { ...data.data, success: data.success };
  },

  /**
   * Get job templates for quick job creation
   */
  getJobTemplates: async (): Promise<
    {
      id: string;
      name: string;
      description: string;
      content: any;
      category: string;
      isDefault: boolean;
    }[]
  > => {
    const { data } =
      await axiosInstance.get<
        AdminApiResponse<
          {
            id: string;
            name: string;
            description: string;
            content: any;
            category: string;
            isDefault: boolean;
          }[]
        >
      >(`/api/admin/job-templates`);
    return data.data;
  },

  /**
   * Export jobs as CSV or Excel (returns raw Blob)
   */
  exportJobs: async (
    params: AdminJobListParams = {},
    format: 'csv' | 'excel' = 'csv'
  ): Promise<Blob> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    searchParams.append('format', format);
    const { data } = await axiosInstance.get<Blob>(
      `/api/admin/jobs/export?${searchParams.toString()}`,
      {
        responseType: 'blob',
        headers: {
          Accept:
            format === 'csv'
              ? 'text/csv'
              : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      }
    );
    return data;
  },

  /**
   * Advanced full-text job search (admin)
   */
  searchJobs: async (query: {
    q?: string;
    filters?: {
      status?: string[];
      jobType?: string[];
      experienceLevel?: string[];
      companyId?: string[];
      salaryRange?: { min?: number; max?: number };
      location?: string;
      dateRange?: { from?: string; to?: string };
    };
    sort?: { field: string; order: 'asc' | 'desc' };
    page?: number;
    limit?: number;
  }): Promise<JobListResponse> => {
    const { data } = await axiosInstance.post<AdminApiResponse<JobListResponse>>(
      `/api/admin/jobs/search`,
      query
    );
    return data.data;
  },

  /**
   * Get job application analytics
   */
  getJobApplicationAnalytics: async (
    jobId?: string,
    timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<{
    totalApplications: number;
    applicationTrends: { date: string; count: number }[];
    applicationsByStatus: { status: string; count: number; percentage: number }[];
    topSkills: { skill: string; count: number }[];
    locationStats: { location: string; count: number }[];
  }> => {
    const url = jobId
      ? `/api/admin/jobs/${jobId}/analytics?timeRange=${timeRange}`
      : `/api/admin/jobs/analytics?timeRange=${timeRange}`;
    const { data } = await axiosInstance.get<
      AdminApiResponse<{
        totalApplications: number;
        applicationTrends: { date: string; count: number }[];
        applicationsByStatus: { status: string; count: number; percentage: number }[];
        topSkills: { skill: string; count: number }[];
        locationStats: { location: string; count: number }[];
      }>
    >(url);
    return data.data;
  },
};

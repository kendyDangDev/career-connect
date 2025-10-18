import {
  JobListParams,
  JobListResponse,
  CreateJobDTO,
  UpdateJobDTO,
  JobDetail,
  JobStatistics,
  UpdateJobStatusDTO,
  DuplicateJobDTO,
} from '@/types/employer/job';

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

export class AdminJobService {
  private static readonly BASE_URL = '/api';
  private static readonly EMPLOYER_API_URL = '/api/admin/jobs';

  /**
   * Generic API request handler with error handling
   */
  private static async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<{ data: T; success: boolean; message?: string }> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'API request failed');
      }

      return result;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  /**
   * Get paginated list of jobs (admin view - can see all companies)
   */
  static async getJobsList(params: AdminJobListParams = {}): Promise<JobListResponse> {
    const searchParams = new URLSearchParams();

    // Add all parameters to search params
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const response = await this.request<JobListResponse>(
      `${this.EMPLOYER_API_URL}?${searchParams.toString()}`
    );

    return response.data;
  }

  /**
   * Get job details by ID
   */
  static async getJobDetail(jobId: string): Promise<JobDetail> {
    const response = await this.request<JobDetail>(`${this.BASE_URL}/admin/jobs/${jobId}`);

    return response.data;
  }

  /**
   * Create a new job
   */
  static async createJob(
    jobData: CreateJobDTO
  ): Promise<{ id: string; slug: string; title: string; status: string }> {
    const response = await this.request<{
      id: string;
      slug: string;
      title: string;
      status: string;
    }>(`${this.EMPLOYER_API_URL}`, {
      method: 'POST',
      body: JSON.stringify(jobData),
    });

    return response.data;
  }

  /**
   * Update existing job
   */
  static async updateJob(jobId: string, updateData: UpdateJobDTO): Promise<JobDetail> {
    const response = await this.request<JobDetail>(`${this.EMPLOYER_API_URL}/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    return response.data;
  }

  /**
   * Update job status
   */
  static async updateJobStatus(
    jobId: string,
    statusData: UpdateJobStatusDTO
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(
      `${this.EMPLOYER_API_URL}/${jobId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(statusData),
      }
    );

    return response.data;
  }

  /**
   * Duplicate a job
   */
  static async duplicateJob(jobId: string, duplicateData?: DuplicateJobDTO): Promise<JobDetail> {
    const response = await this.request<JobDetail>(`${this.EMPLOYER_API_URL}/${jobId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify(duplicateData || {}),
    });

    return response.data;
  }

  /**
   * Delete/Close a job
   */
  static async deleteJob(jobId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(
      `${this.EMPLOYER_API_URL}/${jobId}`,
      {
        method: 'DELETE',
      }
    );

    return response.data;
  }

  /**
   * Get job statistics
   */
  static async getJobStatistics(jobId: string): Promise<JobStatistics> {
    const response = await this.request<JobStatistics>(
      `${this.BASE_URL}/admin/jobs/${jobId}/statistics`
    );

    return response.data;
  }

  /**
   * Get admin dashboard statistics summary
   */
  static async getAdminStatsSummary(): Promise<AdminJobStatsSummary> {
    const response = await this.request<AdminJobStatsSummary>(
      `${this.BASE_URL}/admin/jobs/statistics`
    );

    return response.data;
  }

  /**
   * Bulk update job status
   */
  static async bulkUpdateJobStatus(
    jobIds: string[],
    status: string,
    reason?: string
  ): Promise<{ success: boolean; message: string; updated: number }> {
    const response = await this.request<{ success: boolean; message: string; updated: number }>(
      `${this.EMPLOYER_API_URL}/bulk/status`,
      {
        method: 'POST',
        body: JSON.stringify({ jobIds, status, reason }),
      }
    );

    return response.data;
  }

  /**
   * Bulk delete jobs
   */
  static async bulkDeleteJobs(
    jobIds: string[]
  ): Promise<{ success: boolean; message: string; deleted: number }> {
    const response = await this.request<{ success: boolean; message: string; deleted: number }>(
      `${this.EMPLOYER_API_URL}/bulk/delete`,
      {
        method: 'POST',
        body: JSON.stringify({ jobIds }),
      }
    );

    return response.data;
  }

  /**
   * Get public jobs (for preview/testing)
   */
  static async getPublicJobs(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      jobType?: string;
      experienceLevel?: string;
      locationCity?: string;
      categoryId?: string;
    } = {}
  ): Promise<{ jobs: any[]; pagination: any; success: boolean }> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const response = await this.request<{ jobs: any[]; pagination: any }>(
      `${this.BASE_URL}/jobs?${searchParams.toString()}`
    );

    return { ...response.data, success: response.success };
  }

  /**
   * Get job templates for quick job creation
   */
  static async getJobTemplates(): Promise<
    {
      id: string;
      name: string;
      description: string;
      content: any;
      category: string;
      isDefault: boolean;
    }[]
  > {
    const response = await this.request<
      {
        id: string;
        name: string;
        description: string;
        content: any;
        category: string;
        isDefault: boolean;
      }[]
    >(`${this.BASE_URL}/admin/job-templates`);

    return response.data;
  }

  /**
   * Export jobs data (CSV/Excel)
   */
  static async exportJobs(
    params: AdminJobListParams = {},
    format: 'csv' | 'excel' = 'csv'
  ): Promise<Blob> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    searchParams.append('format', format);

    const response = await fetch(`${this.EMPLOYER_API_URL}/export?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        Accept:
          format === 'csv'
            ? 'text/csv'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  /**
   * Search jobs with advanced filters and full-text search
   */
  static async searchJobs(query: {
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
    sort?: {
      field: string;
      order: 'asc' | 'desc';
    };
    page?: number;
    limit?: number;
  }): Promise<JobListResponse> {
    const response = await this.request<JobListResponse>(`${this.BASE_URL}/admin/jobs/search`, {
      method: 'POST',
      body: JSON.stringify(query),
    });

    return response.data;
  }

  /**
   * Get job application analytics
   */
  static async getJobApplicationAnalytics(
    jobId?: string,
    timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<{
    totalApplications: number;
    applicationTrends: { date: string; count: number }[];
    applicationsByStatus: { status: string; count: number; percentage: number }[];
    topSkills: { skill: string; count: number }[];
    locationStats: { location: string; count: number }[];
  }> {
    const url = jobId
      ? `${this.BASE_URL}/admin/jobs/${jobId}/analytics?timeRange=${timeRange}`
      : `${this.BASE_URL}/admin/jobs/analytics?timeRange=${timeRange}`;

    const response = await this.request<{
      totalApplications: number;
      applicationTrends: { date: string; count: number }[];
      applicationsByStatus: { status: string; count: number; percentage: number }[];
      topSkills: { skill: string; count: number }[];
      locationStats: { location: string; count: number }[];
    }>(url);

    return response.data;
  }
}

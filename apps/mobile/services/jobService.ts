import { JobDetailResponse, JobFilters, JobsResponse } from "../types/job";
import { authenticatedFetch, handleAuthResponse } from "../utils/authUtils";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

class JobService {
  private buildQueryParams(filters: JobFilters): string {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    return params.toString();
  }

  async getJobs(filters: JobFilters = {}): Promise<JobsResponse> {
    try {
      const queryParams = this.buildQueryParams(filters);
      const url = `${BASE_URL}/api/jobs${queryParams ? `?${queryParams}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: JobsResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching jobs:", error);
      throw error;
    }
  }

  async getJobById(idOrSlug: string): Promise<JobDetailResponse> {
    try {
      const url = `${BASE_URL}/api/jobs/${encodeURIComponent(idOrSlug)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: JobDetailResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching job details:", error);
      throw error;
    }
  }

  // Helper methods for common filters
  async searchJobs(
    query: string,
    filters: Omit<JobFilters, "search"> = {}
  ): Promise<JobsResponse> {
    return this.getJobs({ ...filters, search: query });
  }

  async getJobsByCategory(
    categoryId: string,
    filters: Omit<JobFilters, "categoryId"> = {}
  ): Promise<JobsResponse> {
    return this.getJobs({ ...filters, categoryId });
  }

  async getJobsByType(
    jobType: JobFilters["jobType"],
    filters: Omit<JobFilters, "jobType"> = {}
  ): Promise<JobsResponse> {
    return this.getJobs({ ...filters, jobType });
  }

  async getJobsByLocation(
    city: string,
    province?: string,
    filters: Omit<JobFilters, "locationCity" | "locationProvince"> = {}
  ): Promise<JobsResponse> {
    return this.getJobs({
      ...filters,
      locationCity: city,
      ...(province && { locationProvince: province }),
    });
  }

  async getFeaturedJobs(filters: JobFilters = {}): Promise<JobsResponse> {
    // Note: API doesn't have featured filter, but we can sort by featured jobs on the frontend
    const response = await this.getJobs(filters);

    // Sort featured jobs first
    const sortedJobs = response.data.jobs.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

    return {
      ...response,
      data: {
        ...response.data,
        jobs: sortedJobs,
      },
    };
  }

  async getRecentJobs(
    filters: Omit<JobFilters, "sortBy" | "sortOrder"> = {}
  ): Promise<JobsResponse> {
    return this.getJobs({
      ...filters,
      sortBy: "publishedAt",
      sortOrder: "desc",
    });
  }

  async getPopularJobs(
    filters: Omit<JobFilters, "sortBy" | "sortOrder"> = {}
  ): Promise<JobsResponse> {
    return this.getJobs({
      ...filters,
      sortBy: "viewCount",
      sortOrder: "desc",
    });
  }

  // Example of authenticated API call - Apply to a job
  async applyToJob(jobId: string, applicationData: any): Promise<any> {
    try {
      const url = `${BASE_URL}/api/jobs/${jobId}/apply`;

      const response = await authenticatedFetch(url, {
        method: "POST",
        body: JSON.stringify(applicationData),
      });

      // Handle authentication errors
      await handleAuthResponse(response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error applying to job:", error);
      throw error;
    }
  }

  // Example of authenticated API call - Get user's applied jobs
  async getUserAppliedJobs(): Promise<any> {
    try {
      const url = `${BASE_URL}/api/user/applied-jobs`;

      const response = await authenticatedFetch(url, {
        method: "GET",
      });

      // Handle authentication errors
      await handleAuthResponse(response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
      throw error;
    }
  }
}

export const jobService = new JobService();
export default jobService;

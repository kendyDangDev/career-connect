
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { 
  JobViewsFilters, 
  JobViewsResponse, 
  JobViewStatsResponse 
} from "@/types/jobView.types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

class JobViewService {
  private readonly BASE_PATH = "/api/candidate/job-views";

  private async getAuthToken(): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        // Fallback to localStorage for web
        if (typeof localStorage !== "undefined") {
          const token = localStorage.getItem("authToken");
          return token;
        }
        return null;
      } else {
        const token = await SecureStore.getItemAsync("authToken");
        return token;
      }
    } catch (error) {
      console.error("[JobViewService] Error getting auth token:", error);
      return null;
    }
  }

  private async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getAuthToken();

    // If no token in dev mode, return mock response
    if (!token && __DEV__) {
      return new Response(null, { status: 200 });
    }

    if (!token) {
      throw new Error("No authentication found. Please login.");
    }

    const headers: any = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }

  /**
   * Get list of viewed jobs
   */
  async getJobViews(filters?: JobViewsFilters): Promise<JobViewsResponse> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.sortBy) params.append("sortBy", filters.sortBy);
        if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
        if (filters.startDate) params.append("startDate", filters.startDate);
        if (filters.endDate) params.append("endDate", filters.endDate);
        if (filters.search) params.append("search", filters.search);
        
        // Handle array filters
        if (filters.jobType?.length) {
          filters.jobType.forEach(type => params.append("jobType", type));
        }
        if (filters.workLocationType?.length) {
          filters.workLocationType.forEach(type => params.append("workLocationType", type));
        }
        if (filters.experienceLevel?.length) {
          filters.experienceLevel.forEach(level => params.append("experienceLevel", level));
        }
      }

      const url = `${BASE_URL}${this.BASE_PATH}?${params.toString()}`;
      const response = await this.makeAuthenticatedRequest(url, {
        method: "GET",
      });

      if (!response.ok) {
        console.error(`[JobViewService] Request failed with status: ${response.status}`);
        
        if (response.status === 401) {
          throw new Error("Unauthorized - Please login to continue");
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      if (responseText) {
        try {
          const data = JSON.parse(responseText);
          return data;
        } catch (parseError) {
          console.error('[JobViewService] Failed to parse JSON response:', responseText);
          throw parseError;
        }
      } else {
        throw new Error("Empty response from server");
      }
    } catch (error) {
      console.error("Error fetching job views:", error);
      
      
      throw error;
    }
  }

  /**
   * Get job view statistics
   */
  async getJobViewStats(): Promise<JobViewStatsResponse> {
    try {
      const url = `${BASE_URL}${this.BASE_PATH}/stats`;
      const response = await this.makeAuthenticatedRequest(url, {
        method: "GET",
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching job view stats:", error);
      
      throw error;
    }
  }

  /**
   * Record a job view
   */
  async recordJobView(jobId: string): Promise<{ success: boolean; data: any }> {
    try {
      const url = `${BASE_URL}/api/jobs/${jobId}/view`;
      const response = await this.makeAuthenticatedRequest(url, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error recording job view:", error);
      throw error;
    }
  }

  /**
   * Check if user has viewed a specific job
   */
  async hasViewedJob(jobId: string): Promise<{ hasViewed: boolean }> {
    try {
      const url = `${BASE_URL}/api/jobs/${jobId}/view`;
      const response = await this.makeAuthenticatedRequest(url, {
        method: "GET",
      });

      if (!response.ok) {
        return { hasViewed: false };
      }

      const data = await response.json();
      return data.data || { hasViewed: false };
    } catch (error) {
      console.error("Error checking job view status:", error);
      return { hasViewed: false };
    }
  }

}

export default new JobViewService();
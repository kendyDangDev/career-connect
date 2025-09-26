import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import {
  CheckSavedJobResponse,
  RemoveSavedJobResponse,
  SavedJobErrorResponse,
  SavedJobsFilters,
  SavedJobsResponse,
  SaveJobResponse,
} from "../types/savedJob.types";


const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

class SavedJobService {
  private async getAuthToken(): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        // Fallback to localStorage for web - check if it exists first
        if (typeof localStorage !== "undefined") {
          const token = localStorage.getItem("authToken");
          console.log(
            "[SavedJobService] Getting token from localStorage:",
            token ? "Found" : "Not found"
          );
          return token;
        }
        return null;
      } else {
        const token = await SecureStore.getItemAsync("authToken");
        console.log(
          "[SavedJobService] Getting token from SecureStore:",
          token ? "Found" : "Not found"
        );
        return token;
      }
    } catch (error) {
      console.error("[SavedJobService] Error getting auth token:", error);
      return null;
    }
  }

  private buildQueryParams(filters: SavedJobsFilters): string {
    const params = new URLSearchParams();

    // Handle simple string/number parameters
    const simpleParams = [
      "page",
      "limit",
      "search",
      "salaryMin",
      "salaryMax",
      "locationCity",
      "locationProvince",
      "sortBy",
      "sortOrder",
    ];

    simpleParams.forEach((key) => {
      const value = filters[key as keyof SavedJobsFilters];
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    // Handle array parameters
    const arrayParams = ["jobType", "workLocationType", "experienceLevel"];
    arrayParams.forEach((key) => {
      const values = filters[key as keyof SavedJobsFilters] as
        | string[]
        | undefined;
      if (values && Array.isArray(values)) {
        values.forEach((value) => {
          params.append(`${key}[]`, value);
        });
      }
    });

    return params.toString();
  }

  private async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    // Check for token
    const token = await this.getAuthToken();

    console.log("[SavedJobService] Making authenticated request to:", url);
    console.log("[SavedJobService] Auth status: has token:", !!token);

    // If no authentication method is available, throw error
    if (!token) {
      console.error("[SavedJobService] No authentication token found");
      throw new Error("No authentication found. Please login.");
    }

    // Build headers with token
    const headers: any = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    console.log("[SavedJobService] Request config with auth header");

    // Make request with token authentication
    return fetch(url, {
      ...options,
      headers,
    });
  }

  /**
   * Get list of saved jobs for the authenticated candidate
   */
  async getSavedJobs(
    filters: SavedJobsFilters = {}
  ): Promise<SavedJobsResponse> {
    try {
      const queryParams = this.buildQueryParams(filters);
      const url = `${BASE_URL}/api/candidate/saved-jobs${queryParams ? `?${queryParams}` : ""}`;

      const response = await this.makeAuthenticatedRequest(url, {
        method: "GET",
      });

      if (!response.ok) {
        console.error(
          `[SavedJobService] Request failed with status: ${response.status}`
        );
        
        // Handle 401 specifically
        if (response.status === 401) {
          throw new Error("Unauthorized - Please login to continue");
        }

        const error: SavedJobErrorResponse = await response.json();
        console.error("[SavedJobService] Error response:", error);
        throw new Error(
          error.error || `HTTP error! status: ${response.status}`
        );
      }

      const data: SavedJobsResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      throw error;
    }
  }

  /**
   * Save a job to the candidate's saved list
   */
  async saveJob(jobId: string): Promise<SaveJobResponse> {
    try {
      const url = `${BASE_URL}/api/candidate/saved-jobs`;

      const response = await this.makeAuthenticatedRequest(url, {
        method: "POST",
        body: JSON.stringify({ jobId }),
      });

      if (!response.ok) {
        const error: SavedJobErrorResponse = await response.json();

        // Handle specific error cases
        if (response.status === 409) {
          throw new Error("Job is already saved");
        } else if (response.status === 404) {
          throw new Error("Job not found or not active");
        }

        throw new Error(
          error.error || `HTTP error! status: ${response.status}`
        );
      }

      const data: SaveJobResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error saving job:", error);
      throw error;
    }
  }

  /**
   * Remove a job from saved list
   */
  async removeSavedJob(savedJobId: string): Promise<RemoveSavedJobResponse> {
    try {
      const url = `${BASE_URL}/api/candidate/saved-jobs/${savedJobId}`;

      const response = await this.makeAuthenticatedRequest(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error: SavedJobErrorResponse = await response.json();

        if (response.status === 404) {
          throw new Error("Saved job not found");
        }

        throw new Error(
          error.error || `HTTP error! status: ${response.status}`
        );
      }

      const data: RemoveSavedJobResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error removing saved job:", error);
      throw error;
    }
  }

  /**
   * Check if a specific job is saved by the authenticated candidate
   */
  async checkIfJobSaved(jobId: string): Promise<CheckSavedJobResponse> {
    try {
      const url = `${BASE_URL}/api/candidate/saved-jobs/check/${jobId}`;

      const response = await this.makeAuthenticatedRequest(url, {
        method: "GET",
      });

      if (!response.ok) {
        const error: SavedJobErrorResponse = await response.json();
        throw new Error(
          error.error || `HTTP error! status: ${response.status}`
        );
      }

      const data: CheckSavedJobResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error checking saved job status:", error);
      // Return default response for unauthenticated users
      return {
        success: true,
        message: 'Check completed',
        data: {
          isSaved: false,
          savedAt: null,
          savedJobId: null,
        },
      };
    }
  }

  /**
   * Helper method to get saved jobs with search
   */
  async searchSavedJobs(
    query: string,
    filters: Omit<SavedJobsFilters, "search"> = {}
  ): Promise<SavedJobsResponse> {
    return this.getSavedJobs({ ...filters, search: query });
  }

  /**
   * Helper method to get saved jobs by job type
   */
  async getSavedJobsByType(
    jobTypes: SavedJobsFilters["jobType"],
    filters: Omit<SavedJobsFilters, "jobType"> = {}
  ): Promise<SavedJobsResponse> {
    return this.getSavedJobs({ ...filters, jobType: jobTypes });
  }

  /**
   * Helper method to get saved jobs by location
   */
  async getSavedJobsByLocation(
    city: string,
    province?: string,
    filters: Omit<SavedJobsFilters, "locationCity" | "locationProvince"> = {}
  ): Promise<SavedJobsResponse> {
    return this.getSavedJobs({
      ...filters,
      locationCity: city,
      ...(province && { locationProvince: province }),
    });
  }

  /**
   * Helper method to get saved jobs sorted by deadline
   */
  async getSavedJobsByDeadline(
    filters: Omit<SavedJobsFilters, "sortBy" | "sortOrder"> = {}
  ): Promise<SavedJobsResponse> {
    return this.getSavedJobs({
      ...filters,
      sortBy: "deadline",
      sortOrder: "asc", // Show jobs with nearest deadlines first
    });
  }

  /**
   * Toggle save status of a job
   * If saved, remove it. If not saved, save it.
   */
  async toggleSaveJob(
    jobId: string
  ): Promise<{ saved: boolean; savedJobId?: string }> {
    try {
      const checkResponse = await this.checkIfJobSaved(jobId);

      if (checkResponse.data.isSaved && checkResponse.data.savedJobId) {
        // Job is saved, remove it
        await this.removeSavedJob(checkResponse.data.savedJobId);
        return { saved: false };
      } else {
        // Job is not saved, save it
        const saveResponse = await this.saveJob(jobId);
        return {
          saved: true,
          savedJobId: saveResponse.data.savedJob.id,
        };
      }
    } catch (error) {
      console.error("Error toggling save job:", error);
      throw error;
    }
  }
}

export const savedJobService = new SavedJobService();
export default savedJobService;

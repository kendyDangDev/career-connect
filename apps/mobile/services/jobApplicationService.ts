import { Job } from '@/types/job';
import { Platform } from 'react-native';
import * as SecureStore from "expo-secure-store";

export interface ApplicationData {
  jobId: string;
  coverLetter: string;
  cvId: string;
  cvFileUrl?: string;
}

export interface ApplicationResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    applicationId: string;
    jobTitle: string;
    companyName: string;
    appliedAt: string;
  };
}

class JobApplicationService {
  private baseURL: string;
  private tokenKey = "authToken";
  private timeout = 30000; // 30 seconds timeout

  constructor() {
    // Get API URL - prioritize environment variable
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

    // For web development, use relative URL to avoid CORS
    if (Platform.OS === "web" && __DEV__) {
      if (
        typeof window !== "undefined" &&
        window.location.hostname === "localhost"
      ) {
        this.baseURL =
          process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      }
    }

    console.log(
      "[JobApplicationService] Initialized with baseURL:",
      this.baseURL
    );
  }

  // Helper method to get stored token
  private async getStoredToken(): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        return localStorage.getItem(this.tokenKey);
      } else {
        return await SecureStore.getItemAsync(this.tokenKey);
      }
    } catch (error) {
      console.error("Error getting stored token:", error);
      return null;
    }
  }

  // Helper method to make authenticated requests
  private async makeAuthenticatedRequest(
    url: string,
    method: string = "GET",
    body?: any
  ): Promise<Response> {
    const token = await this.getStoredToken();

    if (!token && !__DEV__) {
      throw new Error("No authentication token found");
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (body && method !== "GET") {
      config.body = JSON.stringify(body);
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), this.timeout);
    });

    const fetchPromise = fetch(url, config);

    return (await Promise.race([fetchPromise, timeoutPromise])) as Response;
  }

  /**
   * Submit job application
   */
  async submitApplication(applicationData: ApplicationData): Promise<ApplicationResponse> {
    try {
      const url = `${this.baseURL}/api/applications/apply`;
      const response = await this.makeAuthenticatedRequest(url, 'POST', applicationData);
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to submit application");
      }
      
      return data;
    } catch (error: any) {
      console.error('Error submitting application:', error);
      return {
        success: false,
        error: error.message || 'Không thể gửi đơn ứng tuyển. Vui lòng thử lại.',
      };
    }
  }

  /**
   * Get user's applications
   */
  async getUserApplications(): Promise<any> {
    try {
      const url = `${this.baseURL}/api/applications/my`;
      const response = await this.makeAuthenticatedRequest(url, 'GET');
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch applications");
      }
      
      return data;
    } catch (error: any) {
      console.error('Error fetching user applications:', error);
      return {
        success: false,
        error: error.message || 'Không thể tải danh sách đơn ứng tuyển.',
      };
    }
  }

  /**
   * Check if user has already applied for a job
   */
  async hasApplied(jobId: string): Promise<boolean> {
    try {
      const url = `${this.baseURL}/api/applications/check/${jobId}`;
      const response = await this.makeAuthenticatedRequest(url, 'GET');
      
      const data = await response.json();
      
      if (!response.ok) {
        return false;
      }
      
      return data.hasApplied || false;
    } catch (error) {
      console.error('Error checking application status:', error);
      return false;
    }
  }

  /**
   * Withdraw application
   */
  async withdrawApplication(applicationId: string): Promise<ApplicationResponse> {
    try {
      const url = `${this.baseURL}/api/applications/${applicationId}/withdraw`;
      const response = await this.makeAuthenticatedRequest(url, 'PATCH');
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to withdraw application");
      }
      
      return data;
    } catch (error: any) {
      console.error('Error withdrawing application:', error);
      return {
        success: false,
        error: error.message || 'Không thể rút đơn ứng tuyển. Vui lòng thử lại.',
      };
    }
  }
}

export const jobApplicationService = new JobApplicationService();


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

      // Check if using mock data
      const token = await this.getAuthToken();
      if (!token && __DEV__) {
        return this.getMockData(filters);
      }

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
          // Return mock data for development
          if (__DEV__) {
            return this.getMockData(filters);
          }
          throw parseError;
        }
      } else {
        // Empty response, return mock data in dev
        if (__DEV__) {
          return this.getMockData(filters);
        }
        throw new Error("Empty response from server");
      }
    } catch (error) {
      console.error("Error fetching job views:", error);
      
      // In development, return mock data on error
      if (__DEV__) {
        return this.getMockData(filters);
      }
      
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

      // Check if using mock data
      const token = await this.getAuthToken();
      if (!token && __DEV__) {
        return this.getMockStats();
      }

      if (!response.ok) {
        console.error(`[JobViewService] Stats request failed with status: ${response.status}`);
        if (__DEV__) {
          return this.getMockStats();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching job view stats:", error);
      
      // In development, return mock stats on error
      if (__DEV__) {
        return this.getMockStats();
      }
      
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

  /**
   * Generate mock data for development
   */
  private getMockData(filters?: JobViewsFilters): JobViewsResponse {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    
    const mockJobs = [
      {
        id: "view-1",
        jobId: "job-1",
        userId: "user-123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        viewedAt: "2024-01-20T10:30:00Z",
        job: {
          id: "job-1",
          title: "Senior React Native Developer",
          slug: "senior-react-native-developer",
          company: {
            id: "company-1",
            companyName: "Tech Innovators Vietnam",
            logoUrl: "https://picsum.photos/200?random=1",
          },
          locationCity: "Hồ Chí Minh",
          locationProvince: "Hồ Chí Minh",
          jobType: "FULL_TIME" as const,
          workLocationType: "HYBRID" as const,
          experienceLevel: "SENIOR" as const,
          salaryMin: 30000000,
          salaryMax: 50000000,
          currency: "VND",
          status: "ACTIVE" as const,
          deadline: "2024-02-01",
          viewCount: 245,
          applicationCount: 12,
          skills: ["React Native", "TypeScript", "Redux", "GraphQL"],
        },
      },
      {
        id: "view-2",
        jobId: "job-2",
        userId: "user-123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        viewedAt: "2024-01-19T14:20:00Z",
        job: {
          id: "job-2",
          title: "Full Stack Developer (Node.js + React)",
          slug: "full-stack-developer-nodejs-react",
          company: {
            id: "company-2",
            companyName: "Digital Solutions Co.",
            logoUrl: "https://picsum.photos/200?random=2",
          },
          locationCity: "Hà Nội",
          locationProvince: "Hà Nội",
          jobType: "FULL_TIME" as const,
          workLocationType: "REMOTE" as const,
          experienceLevel: "MID" as const,
          salaryMin: 20000000,
          salaryMax: 35000000,
          currency: "VND",
          status: "ACTIVE" as const,
          deadline: "2024-01-28",
          viewCount: 180,
          applicationCount: 8,
          skills: ["Node.js", "React", "MongoDB", "AWS"],
        },
      },
      {
        id: "view-3",
        jobId: "job-3",
        userId: "user-123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        viewedAt: "2024-01-19T09:15:00Z",
        job: {
          id: "job-3",
          title: "UI/UX Designer",
          slug: "ui-ux-designer",
          company: {
            id: "company-3",
            companyName: "Creative Studio",
            logoUrl: "https://picsum.photos/200?random=3",
          },
          locationCity: "Đà Nẵng",
          locationProvince: "Đà Nẵng",
          jobType: "FULL_TIME" as const,
          workLocationType: "ONSITE" as const,
          experienceLevel: "MID" as const,
          salaryMin: 18000000,
          salaryMax: 28000000,
          currency: "VND",
          status: "ACTIVE" as const,
          deadline: "2024-01-30",
          viewCount: 120,
          applicationCount: 15,
          skills: ["Figma", "Adobe XD", "Sketch", "Prototyping"],
        },
      },
      {
        id: "view-4",
        jobId: "job-4",
        userId: "user-123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        viewedAt: "2024-01-18T16:45:00Z",
        job: {
          id: "job-4",
          title: "DevOps Engineer",
          slug: "devops-engineer",
          company: {
            id: "company-4",
            companyName: "Cloud Tech Corp",
            logoUrl: "https://picsum.photos/200?random=4",
          },
          locationCity: "Hồ Chí Minh",
          locationProvince: "Hồ Chí Minh",
          jobType: "FULL_TIME" as const,
          workLocationType: "HYBRID" as const,
          experienceLevel: "SENIOR" as const,
          salaryMin: 35000000,
          salaryMax: 55000000,
          currency: "VND",
          status: "ACTIVE" as const,
          deadline: "2024-02-05",
          viewCount: 98,
          applicationCount: 5,
          skills: ["Docker", "Kubernetes", "AWS", "CI/CD"],
        },
      },
      {
        id: "view-5",
        jobId: "job-5",
        userId: "user-123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        viewedAt: "2024-01-18T11:30:00Z",
        job: {
          id: "job-5",
          title: "Product Manager",
          slug: "product-manager",
          company: {
            id: "company-5",
            companyName: "Startup Hub",
            logoUrl: "https://picsum.photos/200?random=5",
          },
          locationCity: "Hà Nội",
          locationProvince: "Hà Nội",
          jobType: "FULL_TIME" as const,
          workLocationType: "ONSITE" as const,
          experienceLevel: "LEAD" as const,
          salaryMin: 40000000,
          salaryMax: 60000000,
          currency: "VND",
          status: "ACTIVE" as const,
          deadline: "2024-01-25",
          viewCount: 156,
          applicationCount: 9,
          skills: ["Product Strategy", "Agile", "Data Analysis", "Leadership"],
        },
      },
    ];

    // Apply search filter
    let filteredJobs = [...mockJobs];
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredJobs = filteredJobs.filter(
        view =>
          view.job.title.toLowerCase().includes(searchLower) ||
          view.job.company.companyName.toLowerCase().includes(searchLower)
      );
    }

    // Apply job type filter
    if (filters?.jobType?.length) {
      filteredJobs = filteredJobs.filter(view =>
        filters.jobType!.includes(view.job.jobType)
      );
    }

    // Apply sorting
    if (filters?.sortBy === "jobTitle") {
      filteredJobs.sort((a, b) => {
        const comparison = a.job.title.localeCompare(b.job.title);
        return filters.sortOrder === "desc" ? -comparison : comparison;
      });
    } else {
      // Default sort by viewedAt
      filteredJobs.sort((a, b) => {
        const comparison = new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime();
        return filters?.sortOrder === "asc" ? -comparison : comparison;
      });
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    return {
      success: true,
      data: paginatedJobs,
      pagination: {
        page,
        limit,
        total: filteredJobs.length,
        totalPages: Math.ceil(filteredJobs.length / limit),
        hasNext: endIndex < filteredJobs.length,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Generate mock statistics for development
   */
  private getMockStats(): JobViewStatsResponse {
    return {
      success: true,
      data: {
        totalViews: 125,
        uniqueJobs: 45,
        viewsByDate: [
          { date: "2024-01-20", count: 12 },
          { date: "2024-01-19", count: 18 },
          { date: "2024-01-18", count: 15 },
          { date: "2024-01-17", count: 22 },
          { date: "2024-01-16", count: 10 },
        ],
        topViewedJobs: [
          {
            jobId: "job-1",
            jobTitle: "Senior React Native Developer",
            companyName: "Tech Innovators Vietnam",
            viewCount: 5,
          },
          {
            jobId: "job-2",
            jobTitle: "Full Stack Developer",
            companyName: "Digital Solutions Co.",
            viewCount: 4,
          },
          {
            jobId: "job-3",
            jobTitle: "UI/UX Designer",
            companyName: "Creative Studio",
            viewCount: 3,
          },
        ],
        recentViews: [],
      },
    };
  }
}

export default new JobViewService();
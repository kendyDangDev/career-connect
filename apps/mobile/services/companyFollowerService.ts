import type {
  BulkFollowResponse,
  BulkUnfollowResponse,
  CheckFollowStatusResponse,
  CompanyFollower,
  CompanyFollowersFilters,
  FollowCompanyResponse,
  GetCompanyFollowersResponse,
} from "@/types/companyFollower.types";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

interface ApiError {
  success: false;
  error: string;
  details?: any;
}

class CompanyFollowerService {
  private baseURL: string;
  private tokenKey = "authToken";
  private timeout = 30000; // 30 seconds timeout

  constructor() {
    // Get API URL - prioritize environment variable
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

    // For web development, use relative URL to avoid CORS
    if (Platform.OS === "web" && __DEV__) {
      if (
        typeof window !== "undefined" &&
        window.location.hostname === "localhost"
      ) {
        this.baseURL =
          process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
      }
    }

    console.log(
      "[CompanyFollowerService] Initialized with baseURL:",
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
      "Content-Type": "application/json",
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

  // Get followed companies
  async getFollowedCompanies(
    filters?: CompanyFollowersFilters
  ): Promise<GetCompanyFollowersResponse> {
    try {
      // In development, return mock data
      // if (__DEV__) {
      //   console.log('[CompanyFollowerService] Returning mock data for development');
      //   return this.getMockFollowedCompanies(filters);
      // }

      // Build query string
      const queryParams = new URLSearchParams();

      if (filters) {
        // Validate and set pagination parameters
        if (filters.page) queryParams.append("page", filters.page.toString());
        if (filters.limit) {
          // Ensure limit doesn't exceed maximum
          const limit = Math.min(filters.limit, 100);
          queryParams.append("limit", limit.toString());
        }

        // Note: The API document has a typo - it shows 'limit' twice on line 31,
        // but the second one should be 'search' based on the description
        if (filters.search) queryParams.append("search", filters.search);
        if (filters.city) queryParams.append("city", filters.city);
        if (filters.province) queryParams.append("province", filters.province);
        if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
        if (filters.sortOrder)
          queryParams.append("sortOrder", filters.sortOrder);

        // Handle array parameters
        if (filters.industryId && filters.industryId.length > 0) {
          filters.industryId.forEach((id) =>
            queryParams.append("industryId[]", id)
          );
        }
        if (filters.companySize && filters.companySize.length > 0) {
          filters.companySize.forEach((size) =>
            queryParams.append("companySize[]", size)
          );
        }
        if (
          filters.verificationStatus &&
          filters.verificationStatus.length > 0
        ) {
          filters.verificationStatus.forEach((status) =>
            queryParams.append("verificationStatus[]", status)
          );
        }
      }

      const url = `${this.baseURL}/api/candidate/company-followers?${queryParams.toString()}`;
      console.log("[CompanyFollowerService] Fetching followed companies:", url);

      const response = await this.makeAuthenticatedRequest(url);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch followed companies");
      }

      return data;
    } catch (error) {
      console.error("Error fetching followed companies:", error);
      throw error;
    }
  }

  // Follow a company
  async followCompany(companyId: string): Promise<FollowCompanyResponse> {
    try {
      const url = `${this.baseURL}/api/candidate/company-followers`;
      const response = await this.makeAuthenticatedRequest(url, "POST", {
        companyId,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to follow company");
      }

      return data;
    } catch (error) {
      console.error("Error following company:", error);
      throw error;
    }
  }

  // Unfollow a company
  async unfollowCompany(companyId: string): Promise<void> {
    try {
      const url = `${this.baseURL}/api/candidate/company-followers/${companyId}`;
      const response = await this.makeAuthenticatedRequest(url, "DELETE");

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to unfollow company");
      }
    } catch (error) {
      console.error("Error unfollowing company:", error);
      throw error;
    }
  }

  // Check if following a company
  async checkFollowStatus(
    companyId: string
  ): Promise<CheckFollowStatusResponse> {
    try {
      const url = `${this.baseURL}/api/candidate/company-followers/check/${companyId}`;
      const response = await this.makeAuthenticatedRequest(url);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to check follow status");
      }

      return data;
    } catch (error) {
      console.error("Error checking follow status:", error);
      throw error;
    }
  }

  // Bulk follow companies
  async bulkFollowCompanies(companyIds: string[]): Promise<BulkFollowResponse> {
    try {
      // Validate input
      if (
        !companyIds ||
        !Array.isArray(companyIds) ||
        companyIds.length === 0
      ) {
        throw new Error("At least one company ID is required");
      }

      if (companyIds.length > 50) {
        throw new Error("Maximum 50 companies can be followed at once");
      }

      const url = `${this.baseURL}/api/candidate/company-followers/bulk`;
      const response = await this.makeAuthenticatedRequest(url, "POST", {
        companyIds,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to bulk follow companies");
      }

      return data;
    } catch (error) {
      console.error("Error bulk following companies:", error);
      throw error;
    }
  }

  // Bulk unfollow companies
  async bulkUnfollowCompanies(
    companyIds: string[]
  ): Promise<BulkUnfollowResponse> {
    try {
      // Validate input
      if (
        !companyIds ||
        !Array.isArray(companyIds) ||
        companyIds.length === 0
      ) {
        throw new Error("At least one company ID is required");
      }

      if (companyIds.length > 50) {
        throw new Error("Maximum 50 companies can be unfollowed at once");
      }

      const url = `${this.baseURL}/api/candidate/company-followers/bulk`;
      const response = await this.makeAuthenticatedRequest(url, "DELETE", {
        companyIds,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to bulk unfollow companies");
      }

      return data;
    } catch (error) {
      console.error("Error bulk unfollowing companies:", error);
      throw error;
    }
  }

  // Mock data for development
  private getMockFollowedCompanies(
    filters?: CompanyFollowersFilters
  ): GetCompanyFollowersResponse {
    const mockCompanies: CompanyFollower[] = [
      {
        id: "1",
        companyId: "comp1",
        candidateId: "cand1",
        createdAt: "2024-01-15T10:00:00.000Z",
        company: {
          id: "comp1",
          companyName: "FPT Software",
          companySlug: "fpt-software",
          logoUrl: "https://picsum.photos/100/100?random=1",
          coverImageUrl: "https://picsum.photos/400/200?random=1",
          description:
            "Leading technology company in Vietnam specializing in software development and digital transformation",
          city: "Hà Nội",
          province: "Hà Nội",
          country: "Việt Nam",
          companySize: "ENTERPRISE" as any,
          websiteUrl: "https://www.fpt-software.com",
          verificationStatus: "VERIFIED" as any,
          _count: {
            jobs: 45,
            companyFollowers: 1250,
          },
          industry: {
            id: "ind1",
            name: "Công nghệ thông tin",
          },
        },
      },
      {
        id: "2",
        companyId: "comp2",
        candidateId: "cand1",
        createdAt: "2024-01-20T14:30:00.000Z",
        company: {
          id: "comp2",
          companyName: "VNG Corporation",
          companySlug: "vng-corporation",
          logoUrl: "https://picsum.photos/100/100?random=2",
          coverImageUrl: "https://picsum.photos/400/200?random=2",
          description:
            "Vietnam's leading technology company, creating breakthrough products and services",
          city: "Hồ Chí Minh",
          province: "Hồ Chí Minh",
          country: "Việt Nam",
          companySize: "LARGE" as any,
          websiteUrl: "https://www.vng.com.vn",
          verificationStatus: "VERIFIED" as any,
          _count: {
            jobs: 32,
            companyFollowers: 890,
          },
          industry: {
            id: "ind1",
            name: "Công nghệ thông tin",
          },
        },
      },
      {
        id: "3",
        companyId: "comp3",
        candidateId: "cand1",
        createdAt: "2024-02-01T09:15:00.000Z",
        company: {
          id: "comp3",
          companyName: "Tiki Corporation",
          companySlug: "tiki-corporation",
          logoUrl: "https://picsum.photos/100/100?random=3",
          coverImageUrl: "https://picsum.photos/400/200?random=3",
          description:
            "E-commerce platform connecting millions of customers with quality products",
          city: "Hồ Chí Minh",
          province: "Hồ Chí Minh",
          country: "Việt Nam",
          companySize: "LARGE" as any,
          websiteUrl: "https://tiki.vn",
          verificationStatus: "VERIFIED" as any,
          _count: {
            jobs: 28,
            companyFollowers: 750,
          },
          industry: {
            id: "ind2",
            name: "Thương mại điện tử",
          },
        },
      },
      {
        id: "4",
        companyId: "comp4",
        candidateId: "cand1",
        createdAt: "2024-02-10T11:45:00.000Z",
        company: {
          id: "comp4",
          companyName: "Base.vn",
          companySlug: "base-vn",
          logoUrl: "https://picsum.photos/100/100?random=4",
          coverImageUrl: "https://picsum.photos/400/200?random=4",
          description:
            "Cloud-based CRM and business management software for SMEs",
          city: "Hồ Chí Minh",
          province: "Hồ Chí Minh",
          country: "Việt Nam",
          companySize: "MEDIUM" as any,
          websiteUrl: "https://base.vn",
          verificationStatus: "VERIFIED" as any,
          _count: {
            jobs: 12,
            companyFollowers: 320,
          },
          industry: {
            id: "ind1",
            name: "Công nghệ thông tin",
          },
        },
      },
      {
        id: "5",
        companyId: "comp5",
        candidateId: "cand1",
        createdAt: "2024-02-15T16:20:00.000Z",
        company: {
          id: "comp5",
          companyName: "Grab Vietnam",
          companySlug: "grab-vietnam",
          logoUrl: "https://picsum.photos/100/100?random=5",
          coverImageUrl: "https://picsum.photos/400/200?random=5",
          description:
            "Southeast Asia's leading superapp offering transportation, food delivery, and digital payment services",
          city: "Hồ Chí Minh",
          province: "Hồ Chí Minh",
          country: "Việt Nam",
          companySize: "LARGE" as any,
          websiteUrl: "https://www.grab.com/vn",
          verificationStatus: "VERIFIED" as any,
          _count: {
            jobs: 38,
            companyFollowers: 1100,
          },
          industry: {
            id: "ind3",
            name: "Vận tải & Logistics",
          },
        },
      },
    ];

    // Apply filters
    let filteredCompanies = [...mockCompanies];

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredCompanies = filteredCompanies.filter(
        (cf) =>
          cf.company.companyName.toLowerCase().includes(searchLower) ||
          cf.company.description?.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.city) {
      filteredCompanies = filteredCompanies.filter(
        (cf) => cf.company.city === filters.city
      );
    }

    if (filters?.companySize && filters.companySize.length > 0) {
      filteredCompanies = filteredCompanies.filter(
        (cf) =>
          cf.company.companySize &&
          filters.companySize!.includes(cf.company.companySize)
      );
    }

    // Apply sorting
    if (filters?.sortBy) {
      filteredCompanies.sort((a, b) => {
        let comparison = 0;

        switch (filters.sortBy) {
          case "followedAt":
            comparison =
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case "companyName":
            comparison = a.company.companyName.localeCompare(
              b.company.companyName
            );
            break;
          case "jobCount":
            comparison =
              (a.company._count?.jobs || 0) - (b.company._count?.jobs || 0);
            break;
        }

        return filters.sortOrder === "desc" ? -comparison : comparison;
      });
    }

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

    return {
      success: true,
      message: "Followed companies retrieved successfully",
      data: {
        data: paginatedCompanies,
        pagination: {
          page,
          limit,
          total: filteredCompanies.length,
          totalPages: Math.ceil(filteredCompanies.length / limit),
          hasNext: endIndex < filteredCompanies.length,
          hasPrev: page > 1,
        },
      },
    };
  }
}

export default new CompanyFollowerService();

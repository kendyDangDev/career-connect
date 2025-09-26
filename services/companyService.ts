import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface CompanyProfile {
  id: string;
  companyName: string;
  companySlug: string;
  industry: {
    id: string;
    name: string;
  };
  companySize: string;
  websiteUrl: string;
  description: string;
  logoUrl: string;
  coverImageUrl: string;
  address: string;
  city: string;
  province: string;
  country: string;
  phone: string;
  email: string;
  foundedYear: number;
  verificationStatus: string;
  activeJobCount: number;
  followerCount: number;
  reviewStats?: {
    totalReviews: number;
    averageRating: number;
  };
  galleryImages?: string[];
  benefits?: string[];
  socialLinks?: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

interface CompanyJob {
  id: string;
  title: string;
  slug: string;
  jobType: string;
  workLocationType: string;
  experienceLevel: string;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  salaryNegotiable: boolean;
  locationCity: string;
  locationProvince: string;
  locationCountry: string;
  applicationDeadline: string;
  status: string;
  viewCount: number;
  applicationCount: number;
  featured: boolean;
  urgent: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  jobSkills?: {
    requiredLevel: string;
    minYearsExperience: number;
    skill: {
      id: string;
      name: string;
      slug: string;
      category: string;
    };
  }[];
  jobCategories?: {
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
  _count?: {
    applications: number;
    savedJobs: number;
  };
}

class CompanyService {

  private async getAuthToken(): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        // Fallback to localStorage for web - check if it exists first
        if (typeof localStorage !== "undefined") {
          const token = localStorage.getItem("authToken");
          console.log(
            "[CompanyService] Getting token from localStorage:",
            token ? "Found" : "Not found"
          );
          return token;
        }
        return null;
      } else {
        const token = await SecureStore.getItemAsync("authToken");
        console.log(
          "[CompanyService] Getting token from SecureStore:",
          token ? "Found" : "Not found"
        );
        return token;
      }
    } catch (error) {
      console.error("[CompanyService] Error getting auth token:", error);
      return null;
    }
  }

  // Get public company profile
  async getPublicCompanyProfile(slug: string): Promise<{
    success: boolean;
    data?: CompanyProfile;
    message?: string;
  }> {
    try {
      console.log('[CompanyService] Fetching company profile for:', slug);
      
      const response = await axios.get(
        `${API_BASE_URL}/api/companies/${slug}`
      );
      return response.data;
    } catch (error: any) {
      console.error('[CompanyService] Error fetching company profile:', error);
      
      // In development, return mock data on error
      // if (__DEV__) {
      //   console.log('[CompanyService] Using mock data fallback');
      //   // Import mock data dynamically to avoid circular dependencies
      //   const { mockCompanyProfile } = await import('../utils/mockCompanyData');
      //   return {
      //     success: true,
      //     data: mockCompanyProfile as CompanyProfile
      //   };
      // }
      
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch company profile'
      };
    }
  }

  // Get company jobs
  async getCompanyJobs(companySlug: string, page: number = 1, limit: number = 10): Promise<{
    success: boolean;
    data?: {
      company: {
        id: string;
        companyName: string;
        companySlug: string;
        logoUrl: string;
        coverImageUrl: string;
        description: string;
        websiteUrl: string;
        address: string;
        city: string;
        province: string;
        country: string;
        companySize: string;
        foundedYear: number;
        verificationStatus: string;
        industry: {
          id: string;
          name: string;
          slug: string;
        };
        stats: {
          totalJobs: number;
          activeJobs: number;
          totalFollowers: number;
        };
      };
      jobs: CompanyJob[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
      jobStats: {
        active: number;
        paused: number;
        closed: number;
        expired: number;
        draft: number;
        total: number;
      };
    };
    message?: string;
  }> {
    try {
      console.log('[CompanyService] Fetching jobs for company:', companySlug);
      
      const response = await axios.get(
        `${API_BASE_URL}/api/companies/${companySlug}/jobs`,
        {
          params: { page, limit }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('[CompanyService] Error fetching company jobs:', error);
      
      
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch company jobs'
      };
    }
  }

  // Follow/Unfollow company
  async toggleFollowCompany(companyId: string, isFollowing: boolean): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const token = await this.getAuthToken();
      
      console.log('[CompanyService] Toggle follow for company:', companyId);
      console.log('[CompanyService] Auth status:', token ? 'Authenticated' : 'Not authenticated');
      
      if (!token) {
        console.log('[CompanyService] No auth token, returning auth required message');
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      if (isFollowing) {
        // Unfollow company - DELETE /api/candidate/company-followers/{companyId}
        const endpoint = `${API_BASE_URL}/api/candidate/company-followers/${companyId}`;
        console.log('[CompanyService] Calling unfollow endpoint:', endpoint);

        await axios.delete(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('[CompanyService] Unfollow successful');
        return {
          success: true,
          message: 'Unfollowed successfully'
        };
      } else {
        // Follow company - POST /api/candidate/company-followers
        const endpoint = `${API_BASE_URL}/api/candidate/company-followers`;
        console.log('[CompanyService] Calling follow endpoint:', endpoint);

        const response = await axios.post(
          endpoint,
          { companyId }, // Send companyId in request body
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('[CompanyService] Follow successful');
        return response.data;
      }
    } catch (error: any) {
      console.error('[CompanyService] Error toggling follow:', error);
      
      // In development, simulate success
      if (__DEV__ && !await this.getAuthToken()) {
        console.log('[CompanyService] Dev mode: simulating follow success');
        return {
          success: true,
          message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to update follow status'
      };
    }
  }

  // Check if following a company
  async checkFollowStatus(companyId: string): Promise<{
    success: boolean;
    data?: {
      companyId: string;
      isFollowing: boolean;
    };
    message?: string;
  }> {
    try {
      const token = await this.getAuthToken();
      
      console.log('[CompanyService] Checking follow status for company:', companyId);
      
      if (!token) {
        console.log('[CompanyService] No auth token, returning not following');
        return {
          success: true,
          data: {
            companyId,
            isFollowing: false
          }
        };
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/candidate/company-followers/check/${companyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('[CompanyService] Follow status check successful');
      return response.data;
    } catch (error: any) {
      console.error('[CompanyService] Error checking follow status:', error);
      
      // If not authenticated or error, assume not following
      return {
        success: true,
        data: {
          companyId,
          isFollowing: false
        }
      };
    }
  }

  // Get followed companies
  async getFollowedCompanies(params: {
    page?: number;
    limit?: number;
    search?: string;
    industryId?: string[];
    companySize?: string[];
    verificationStatus?: string[];
    city?: string;
    province?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<{
    success: boolean;
    data?: {
      data: {
        id: string;
        companyId: string;
        candidateId: string;
        createdAt: string;
        company: {
          id: string;
          companyName: string;
          companySlug: string;
          logoUrl: string | null;
          coverImageUrl: string | null;
          description: string | null;
          city: string | null;
          province: string | null;
          country: string | null;
          companySize: string | null;
          websiteUrl: string | null;
          verificationStatus: string;
          _count: {
            jobs: number;
            companyFollowers: number;
          };
          industry: {
            id: string;
            name: string;
          };
        };
      }[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    };
    message?: string;
  }> {
    try {
      const token = await this.getAuthToken();
      
      console.log('[CompanyService] Fetching followed companies');
      
      if (!token) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/candidate/company-followers`,
        {
          params: {
            page: params.page || 1,
            limit: params.limit || 20,
            search: params.search,
            industryId: params.industryId,
            companySize: params.companySize,
            verificationStatus: params.verificationStatus,
            city: params.city,
            province: params.province,
            sortBy: params.sortBy || 'followedAt',
            sortOrder: params.sortOrder || 'desc'
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('[CompanyService] Followed companies fetched successfully');
      return response.data;
    } catch (error: any) {
      console.error('[CompanyService] Error fetching followed companies:', error);
      
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch followed companies'
      };
    }
  }

  // Get company reviews
  async getCompanyReviews(companyId: string, page: number = 1): Promise<{
    success: boolean;
    data?: {
      reviews: {
        id: string;
        rating: number;
        title: string;
        content: string;
        pros: string;
        cons: string;
        isCurrentEmployee: boolean;
        position: string;
        createdAt: string;
        helpfulCount: number;
        user: {
          name: string;
          avatar?: string;
        };
      }[];
      totalCount: number;
      averageRating: number;
      ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
      };
    };
    message?: string;
  }> {
    try {
      console.log('[CompanyService] Fetching reviews for company:', companyId);
      
      const response = await axios.get(
        `${API_BASE_URL}/api/companies/${companyId}/reviews`,
        {
          params: { page, limit: 10 }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('[CompanyService] Error fetching company reviews:', error);
      
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch company reviews'
      };
    }
  }

  // Get top companies
  async getTopCompanies(limit: number = 10): Promise<{
    success: boolean;
    data?: CompanyProfile[];
    message?: string;
  }> {
    try {
      console.log('[CompanyService] Fetching top companies');
      
      // Use admin endpoint to get companies sorted by active job count and verified status
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/companies`,
        {
          params: {
            limit: limit,
            status: 'VERIFIED', // Only verified companies
            sortBy: 'activeJobCount', // Sort by active jobs
            sortOrder: 'desc', // Descending order (highest first)
            page: 1
          }
        }
      );

      if (response.data.success && response.data.data.companies) {
        // Transform admin company data to match CompanyProfile interface
        const companies: CompanyProfile[] = response.data.data.companies.map((company: any) => ({
          id: company.id,
          companyName: company.companyName,
          companySlug: company.companySlug,
          industry: company.industry,
          companySize: company.companySize,
          websiteUrl: '',
          description: '',
          logoUrl: company.logoUrl || '',
          coverImageUrl: '',
          address: '',
          city: company.city || '',
          province: company.province || '',
          country: 'Vietnam',
          phone: '',
          email: '',
          foundedYear: 2020,
          verificationStatus: company.verificationStatus,
          activeJobCount: company._count?.jobs || 0,
          followerCount: company._count?.companyFollowers || 0
        }));

        return {
          success: true,
          data: companies
        };
      }

      return {
        success: false,
        message: 'No companies data received'
      };
    } catch (error: any) {
      console.error('[CompanyService] Error fetching top companies:', error);
      
      // In development, return mock data on error
      // if (__DEV__) {
      //   console.log('[CompanyService] Using mock top companies fallback');
        
      //   // Mock data for top companies
      //   const mockTopCompanies: CompanyProfile[] = [
      //     {
      //       id: "1",
      //       companyName: "FPT Software",
      //       companySlug: "fpt-software",
      //       industry: {
      //         id: "tech",
      //         name: "Technology"
      //       },
      //       companySize: "LARGE_501_1000",
      //       websiteUrl: "https://www.fpt-software.com",
      //       description: "Leading software development company in Vietnam",
      //       logoUrl: "https://images.seeklogo.com/logo-png/21/1/fpt-logo-png_seeklogo-211515.png",
      //       coverImageUrl: "",
      //       address: "FPT Tower, Cau Giay District",
      //       city: "Hanoi",
      //       province: "Hanoi",
      //       country: "Vietnam",
      //       phone: "+84-24-7300-8866",
      //       email: "info@fpt.com.vn",
      //       foundedYear: 1999,
      //       verificationStatus: "VERIFIED",
      //       activeJobCount: 25,
      //       followerCount: 1200
      //     },
      //     {
      //       id: "2",
      //       companyName: "Viettel Group",
      //       companySlug: "viettel-group",
      //       industry: {
      //         id: "telecom",
      //         name: "Telecommunications"
      //       },
      //       companySize: "LARGE_1000_PLUS",
      //       websiteUrl: "https://viettel.com.vn",
      //       description: "Vietnam's largest telecommunications company",
      //       logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTE-w1ycHZhg_1ctxIE2GK8N5c9tz4eBJpSSA&s",
      //       coverImageUrl: "",
      //       address: "Viettel Building, Ba Dinh District",
      //       city: "Hanoi",
      //       province: "Hanoi",
      //       country: "Vietnam",
      //       phone: "+84-24-2200-0000",
      //       email: "info@viettel.com.vn",
      //       foundedYear: 2004,
      //       verificationStatus: "VERIFIED",
      //       activeJobCount: 18,
      //       followerCount: 2500
      //     },
      //     {
      //       id: "3",
      //       companyName: "VNG Corporation",
      //       companySlug: "vng-corporation",
      //       industry: {
      //         id: "tech",
      //         name: "Technology"
      //       },
      //       companySize: "LARGE_501_1000",
      //       websiteUrl: "https://www.vng.com.vn",
      //       description: "Leading internet and technology company in Vietnam",
      //       logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSALu_tTSdYer51Y0P6JG2xboAmKTFVEty8nQ&s",
      //       coverImageUrl: "",
      //       address: "VNG Campus, District 9",
      //       city: "Ho Chi Minh City",
      //       province: "Ho Chi Minh City",
      //       country: "Vietnam",
      //       phone: "+84-28-7300-7768",
      //       email: "info@vng.com.vn",
      //       foundedYear: 2004,
      //       verificationStatus: "VERIFIED",
      //       activeJobCount: 32,
      //       followerCount: 1800
      //     },
      //     {
      //       id: "4",
      //       companyName: "Shopee Vietnam",
      //       companySlug: "shopee-vietnam",
      //       industry: {
      //         id: "ecommerce",
      //         name: "E-commerce"
      //       },
      //       companySize: "LARGE_501_1000",
      //       websiteUrl: "https://careers.shopee.vn",
      //       description: "Leading e-commerce platform in Southeast Asia",
      //       logoUrl: "https://images.seeklogo.com/logo-png/37/1/shopee-logo-png_seeklogo-376331.png",
      //       coverImageUrl: "",
      //       address: "Lim Tower 3, District 1",
      //       city: "Ho Chi Minh City",
      //       province: "Ho Chi Minh City",
      //       country: "Vietnam",
      //       phone: "+84-28-7108-4444",
      //       email: "careers@shopee.com",
      //       foundedYear: 2015,
      //       verificationStatus: "VERIFIED",
      //       activeJobCount: 28,
      //       followerCount: 3200
      //     },
      //     {
      //       id: "5",
      //       companyName: "Grab Vietnam",
      //       companySlug: "grab-vietnam",
      //       industry: {
      //         id: "tech",
      //         name: "Technology"
      //       },
      //       companySize: "LARGE_501_1000",
      //       websiteUrl: "https://www.grab.com/vn",
      //       description: "Southeast Asia's leading superapp",
      //       logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR10B8-HdM5bDtZ5RFE8lwUwAOlNOVPCD0B1Q&s",
      //       coverImageUrl: "",
      //       address: "Viettel Complex, Cau Giay District",
      //       city: "Hanoi",
      //       province: "Hanoi",
      //       country: "Vietnam",
      //       phone: "+84-24-7108-6666",
      //       email: "careers@grab.com",
      //       foundedYear: 2014,
      //       verificationStatus: "VERIFIED",
      //       activeJobCount: 15,
      //       followerCount: 2100
      //     },
      //     {
      //       id: "6",
      //       companyName: "Tiki Corporation",
      //       companySlug: "tiki-corporation",
      //       industry: {
      //         id: "ecommerce",
      //         name: "E-commerce"
      //       },
      //       companySize: "MEDIUM_201_500",
      //       websiteUrl: "https://tiki.vn",
      //       description: "Vietnam's leading online shopping platform",
      //       logoUrl: "https://brandlogos.net/wp-content/uploads/2022/03/tiki-logo-brandlogos.net_.png",
      //       coverImageUrl: "",
      //       address: "52 Ut Tich, Tan Binh District",
      //       city: "Ho Chi Minh City",
      //       province: "Ho Chi Minh City",
      //       country: "Vietnam",
      //       phone: "+84-28-7300-1234",
      //       email: "careers@tiki.vn",
      //       foundedYear: 2010,
      //       verificationStatus: "VERIFIED",
      //       activeJobCount: 12,
      //       followerCount: 1500
      //     }
      //   ];

      //   return {
      //     success: true,
      //     data: mockTopCompanies
      //   };
      // }
      
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch top companies'
      };
    }
  }
}

export default new CompanyService();
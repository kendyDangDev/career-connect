import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface CompanyReview {
  id: string;
  companyId: string;
  reviewerId: string;
  rating: number;
  title: string;
  reviewText: string;
  pros?: string;
  cons?: string;
  workLifeBalanceRating?: number;
  salaryBenefitRating?: number;
  managementRating?: number;
  cultureRating?: number;
  isAnonymous: boolean;
  employmentStatus: 'CURRENT' | 'FORMER';
  positionTitle?: string;
  employmentLength?: string;
  isApproved: boolean;
  createdAt: string;
  company?: {
    id: string;
    companyName: string;
    companySlug: string;
    logoUrl?: string;
  };
  reviewer?: {
    id: string;
    displayName?: string;
    avatarUrl?: string;
    isAnonymous: boolean;
  };
}

export interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  averageWorkLifeBalance?: number;
  averageSalaryBenefit?: number;
  averageManagement?: number;
  averageCulture?: number;
  ratingDistribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
  byEmploymentStatus: {
    CURRENT: number;
    FORMER: number;
  };
  recommendationRate: number;
}

export interface CreateReviewDto {
  companyId: string;
  rating: number;
  title: string;
  reviewText: string;
  pros?: string;
  cons?: string;
  workLifeBalanceRating?: number;
  salaryBenefitRating?: number;
  managementRating?: number;
  cultureRating?: number;
  isAnonymous?: boolean;
  employmentStatus: 'CURRENT' | 'FORMER';
  positionTitle?: string;
  employmentLength?: string;
}

export interface ReviewsResponse {
  success: boolean;
  message: string;
  data?: {
    reviews: CompanyReview[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
    statistics?: ReviewStatistics;
  };
}

class ReviewService {
  private async getAuthToken(): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        if (typeof localStorage !== "undefined") {
          return localStorage.getItem("authToken");
        }
        return null;
      } else {
        return await SecureStore.getItemAsync("authToken");
      }
    } catch (error) {
      console.error("[ReviewService] Error getting auth token:", error);
      return null;
    }
  }

  // Get company reviews with filters
  async getCompanyReviews(
    companySlug: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      rating?: number;
      minRating?: number;
      employmentStatus?: 'CURRENT' | 'FORMER';
      isApproved?: boolean;
    }
  ): Promise<ReviewsResponse> {
    try {
      console.log('[ReviewService] Fetching reviews for:', companySlug);
      
      const queryParams = new URLSearchParams({
        companySlug,
        page: (params?.page || 1).toString(),
        limit: (params?.limit || 10).toString(),
        sortBy: params?.sortBy || 'createdAt',
        sortOrder: params?.sortOrder || 'desc',
        isApproved: (params?.isApproved !== false).toString()
      });

      if (params?.rating) queryParams.append('rating', params.rating.toString());
      if (params?.minRating) queryParams.append('minRating', params.minRating.toString());
      if (params?.employmentStatus) queryParams.append('employmentStatus', params.employmentStatus);

      const response = await axios.get(
        `${API_BASE_URL}/api/reviews/company?${queryParams.toString()}`
      );
      
      return response.data;
    } catch (error: any) {
      console.error('[ReviewService] Error fetching reviews:', error);
      
      // Return mock data in development
      if (__DEV__) {
        return this.getMockReviews(companySlug, params?.page || 1);
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch reviews'
      };
    }
  }

  // Get review by ID
  async getReviewById(reviewId: string): Promise<{
    success: boolean;
    message: string;
    data?: { review: CompanyReview };
  }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/reviews/company/${reviewId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('[ReviewService] Error fetching review:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch review'
      };
    }
  }

  // Create a new review
  async createReview(review: CreateReviewDto): Promise<{
    success: boolean;
    message: string;
    data?: { review: CompanyReview };
  }> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return {
          success: false,
          message: 'Authentication required to submit review'
        };
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/reviews/company`,
        review,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error: any) {
      console.error('[ReviewService] Error creating review:', error);
      
      if (error.response?.status === 409) {
        return {
          success: false,
          message: 'You have already reviewed this company'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit review'
      };
    }
  }

  // Update an existing review
  async updateReview(reviewId: string, updates: Partial<CreateReviewDto>): Promise<{
    success: boolean;
    message: string;
    data?: { review: CompanyReview };
  }> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/reviews/company/${reviewId}`,
        updates,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error: any) {
      console.error('[ReviewService] Error updating review:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update review'
      };
    }
  }

  // Delete a review
  async deleteReview(reviewId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await axios.delete(
        `${API_BASE_URL}/api/reviews/company/${reviewId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error: any) {
      console.error('[ReviewService] Error deleting review:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete review'
      };
    }
  }

  // Get company review statistics
  async getCompanyStatistics(companySlug: string): Promise<{
    success: boolean;
    message: string;
    data?: { statistics: ReviewStatistics };
  }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/reviews/company/statistics?companySlug=${companySlug}`
      );
      return response.data;
    } catch (error: any) {
      console.error('[ReviewService] Error fetching statistics:', error);
      
      // Return mock statistics in development
      if (__DEV__) {
        return {
          success: true,
          message: 'Statistics retrieved successfully',
          data: {
            statistics: this.getMockStatistics()
          }
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch statistics'
      };
    }
  }

  // Get user's reviews
  async getUserReviews(): Promise<{
    success: boolean;
    message: string;
    data?: {
      reviews: CompanyReview[];
      total: number;
    };
  }> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/reviews/company/user`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error: any) {
      console.error('[ReviewService] Error fetching user reviews:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch your reviews'
      };
    }
  }

  // Mock data for development
  private getMockReviews(companySlug: string, page: number): ReviewsResponse {
    const mockReviews: CompanyReview[] = [
      {
        id: 'review1',
        companyId: 'company1',
        reviewerId: 'user1',
        rating: 5,
        title: 'Môi trường làm việc tuyệt vời',
        reviewText: 'Đã làm việc tại đây 2 năm và cảm thấy rất hài lòng. Team rất supportive, có nhiều cơ hội học hỏi và phát triển. Lãnh đạo luôn lắng nghe và hỗ trợ nhân viên.',
        pros: 'Work-life balance tốt, lương thưởng cạnh tranh, văn hóa công ty tuyệt vời',
        cons: 'Đôi khi deadline hơi gấp, cần cải thiện quy trình làm việc',
        workLifeBalanceRating: 5,
        salaryBenefitRating: 4,
        managementRating: 5,
        cultureRating: 5,
        isAnonymous: false,
        employmentStatus: 'CURRENT',
        positionTitle: 'Senior Software Engineer',
        employmentLength: '2 năm',
        isApproved: true,
        createdAt: '2024-01-15T10:00:00.000Z',
        reviewer: {
          id: 'user1',
          displayName: 'Nguyễn Văn A',
          avatarUrl: 'https://i.pravatar.cc/150?img=1',
          isAnonymous: false
        }
      },
      {
        id: 'review2',
        companyId: 'company1',
        reviewerId: 'user2',
        rating: 4,
        title: 'Công ty tốt cho người mới bắt đầu',
        reviewText: 'Là nơi tốt để bắt đầu sự nghiệp. Được đào tạo bài bản, có mentor hỗ trợ. Môi trường làm việc chuyên nghiệp.',
        pros: 'Đào tạo tốt, đồng nghiệp thân thiện, văn phòng đẹp',
        cons: 'Lương cho fresher chưa cao, ít có remote',
        workLifeBalanceRating: 4,
        salaryBenefitRating: 3,
        managementRating: 4,
        cultureRating: 4,
        isAnonymous: false,
        employmentStatus: 'FORMER',
        positionTitle: 'Junior Developer',
        employmentLength: '1 năm',
        isApproved: true,
        createdAt: '2024-01-10T10:00:00.000Z',
        reviewer: {
          id: 'user2',
          displayName: 'Trần Thị B',
          avatarUrl: 'https://i.pravatar.cc/150?img=2',
          isAnonymous: false
        }
      },
      {
        id: 'review3',
        companyId: 'company1',
        reviewerId: 'user3',
        rating: 3,
        title: 'Cần cải thiện nhiều thứ',
        reviewText: 'Công ty có tiềm năng nhưng cần cải thiện về quy trình và management. Áp lực công việc khá lớn.',
        pros: 'Học được nhiều kỹ năng mới, projects đa dạng',
        cons: 'Áp lực cao, OT nhiều, quy trình chưa rõ ràng',
        workLifeBalanceRating: 2,
        salaryBenefitRating: 3,
        managementRating: 3,
        cultureRating: 3,
        isAnonymous: true,
        employmentStatus: 'FORMER',
        positionTitle: 'Product Manager',
        employmentLength: '6 tháng',
        isApproved: true,
        createdAt: '2024-01-05T10:00:00.000Z',
        reviewer: {
          id: 'user3',
          displayName: 'Anonymous',
          avatarUrl: null,
          isAnonymous: true
        }
      }
    ];

    // Paginate results
    const limit = 10;
    const start = (page - 1) * limit;
    const paginatedReviews = mockReviews.slice(start, start + limit);

    return {
      success: true,
      message: 'Reviews retrieved successfully',
      data: {
        reviews: paginatedReviews,
        total: mockReviews.length,
        page,
        totalPages: Math.ceil(mockReviews.length / limit),
        hasMore: page < Math.ceil(mockReviews.length / limit),
        statistics: this.getMockStatistics()
      }
    };
  }

  private getMockStatistics(): ReviewStatistics {
    return {
      totalReviews: 25,
      averageRating: 4.2,
      averageWorkLifeBalance: 4.1,
      averageSalaryBenefit: 3.9,
      averageManagement: 4.0,
      averageCulture: 4.3,
      ratingDistribution: {
        '1': 1,
        '2': 2,
        '3': 4,
        '4': 10,
        '5': 8
      },
      byEmploymentStatus: {
        CURRENT: 15,
        FORMER: 10
      },
      recommendationRate: 72
    };
  }
}

export default new ReviewService();
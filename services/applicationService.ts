import {
  Application,
  ApplicationsResponse,
  ApplicationDetailResponse,
  ApplicationStatsResponse,
  ApplicationsFilters,
  UpdateApplicationRequest,
  ApplicationStatus,
  ErrorResponse
} from '@/types/application.types';

class ApplicationService {
  private baseURL: string;
  
  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    try {
      // For React Native
      const SecureStore = await import('expo-secure-store');
      const token = await SecureStore.getItemAsync('authToken');
      
      return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };
    } catch (error) {
      // For web or when SecureStore is not available
      const token = localStorage.getItem('authToken');
      return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };
    }
  }

  /**
   * Get list of applications with filters
   */
  async getApplications(filters?: ApplicationsFilters): Promise<ApplicationsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        if (filters.page) queryParams.append('page', filters.page.toString());
        if (filters.limit) queryParams.append('limit', filters.limit.toString());
        if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
        if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.jobId) queryParams.append('jobId', filters.jobId);
        if (filters.candidateId) queryParams.append('candidateId', filters.candidateId);
        
        // Handle status filter (can be single or array)
        if (filters.status) {
          if (Array.isArray(filters.status)) {
            filters.status.forEach(s => queryParams.append('status', s));
          } else {
            queryParams.append('status', filters.status);
          }
        }
      }

      const url = `${this.baseURL}/api/applications?${queryParams.toString()}`;
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Handle specific HTTP errors
        if (response.status === 403) {
          throw new Error('Bạn không có quyền xem danh sách đơn ứng tuyển');
        }
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        }
        throw new Error(data.error || 'Không thể tải danh sách đơn ứng tuyển');
      }

      return data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  }

  /**
   * Get application details
   */
  async getApplicationById(id: string): Promise<ApplicationDetailResponse> {
    try {
      const url = `${this.baseURL}/api/applications/${id}`;
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch application details');
      }

      return data;
    } catch (error) {
      console.error('Error fetching application details:', error);
      throw error;
    }
  }

  /**
   * Update application (for employers/admin only)
   */
  async updateApplication(id: string, updateData: UpdateApplicationRequest): Promise<ApplicationDetailResponse> {
    try {
      const url = `${this.baseURL}/api/applications/${id}`;
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update application');
      }

      return data;
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  }

  /**
   * Withdraw application
   */
  async withdrawApplication(id: string): Promise<{ success: boolean; message: string; data: { applicationId: string; status: ApplicationStatus } }> {
    try {
      const url = `${this.baseURL}/api/applications/${id}`;
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to withdraw application');
      }

      return data;
    } catch (error) {
      console.error('Error withdrawing application:', error);
      throw error;
    }
  }

  /**
   * Get application statistics
   */
  async getApplicationStats(filters?: {
    companyId?: string;
    jobId?: string;
    candidateId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApplicationStatsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        if (filters.companyId) queryParams.append('companyId', filters.companyId);
        if (filters.jobId) queryParams.append('jobId', filters.jobId);
        if (filters.candidateId) queryParams.append('candidateId', filters.candidateId);
        if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      }

      const url = `${this.baseURL}/api/applications/stats?${queryParams.toString()}`;
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch application statistics');
      }

      return data;
    } catch (error) {
      console.error('Error fetching application stats:', error);
      throw error;
    }
  }

}

export default new ApplicationService();
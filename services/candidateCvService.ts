import {
  CandidateCv,
  CVListResponse,
  CVQueryParams,
  UpdateCVRequest,
  CVAccessResponse,
  ApiResponse,
} from '@/types/candidateCv.types';
import { Platform } from 'react-native';
import * as SecureStore from "expo-secure-store";

class CandidateCvService {
  private baseURL: string;
  private basePath = '/api/candidate/cv';
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
      "[CandidateCvService] Initialized with baseURL:",
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
    body?: any,
    isFormData: boolean = false,
    onProgress?: (progress: number) => void
  ): Promise<Response> {
    const token = await this.getStoredToken();

    if (!token && !__DEV__) {
      throw new Error("No authentication token found");
    }

    const headers: HeadersInit = {
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    // Don't set Content-Type for FormData, let the browser set it
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body && method !== "GET") {
      config.body = isFormData ? body : JSON.stringify(body);
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), this.timeout);
    });

    const fetchPromise = fetch(url, config);

    return (await Promise.race([fetchPromise, timeoutPromise])) as Response;
  }

  /**
   * Get a paginated list of CVs for the authenticated candidate
   */
  async getCVs(params?: CVQueryParams): Promise<ApiResponse<CVListResponse>> {
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `${this.baseURL}${this.basePath}?${queryParams.toString()}`;
      const response = await this.makeAuthenticatedRequest(url);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch CVs");
      }

      return data;
    } catch (error: any) {
      console.error('Error fetching CVs:', error);
      return {
        success: false,
        message: 'Failed to fetch CVs',
        error: error.message,
      };
    }
  }

  /**
   * Upload a new CV file with Cloudinary integration
   */
  async uploadCV(
    file: File | Blob,
    cvName: string,
    description?: string,
    isPrimary?: boolean,
    candidateId?: string,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<CandidateCv>> {
    try {
      const formData = new FormData();
      
      // Append file based on platform
      if (Platform.OS === 'web') {
        formData.append('file', file, (file as File).name || 'cv.pdf');
      } else {
        // For React Native, handle file differently
        const fileData: any = {
          uri: (file as any).uri,
          type: (file as any).type || 'application/pdf',
          name: (file as any).name || 'cv.pdf',
        };
        formData.append('file', fileData as any);
      }
      
      formData.append('cvName', cvName);
      if (description) {
        formData.append('description', description);
      }
      if (isPrimary !== undefined) {
        formData.append('isPrimary', isPrimary.toString());
      }

      const url = `${this.baseURL}${this.basePath}`;
      const response = await this.makeAuthenticatedRequest(url, 'POST', formData, true, onProgress);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to upload CV");
      }

      return data;
    } catch (error: any) {
      console.error('Error uploading CV:', error);
      return {
        success: false,
        message: 'Failed to upload CV',
        error: error.message,
      };
    }
  }

  /**
   * Get CV details by ID
   */
  async getCVById(id: string, action?: 'preview' | 'download'): Promise<ApiResponse<CandidateCv | CVAccessResponse>> {
    try {
      let url = `${this.baseURL}${this.basePath}/${id}`;
      if (action) {
        url += `?action=${action}`;
      }
      const response = await this.makeAuthenticatedRequest(url);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch CV");
      }

      return data;
    } catch (error: any) {
      console.error('Error fetching CV:', error);
      return {
        success: false,
        message: 'Failed to fetch CV',
        error: error.message,
      };
    }
  }

  /**
   * Update CV information (metadata)
   */
  async updateCV(id: string, data: UpdateCVRequest): Promise<ApiResponse<CandidateCv>> {
    try {
      const url = `${this.baseURL}${this.basePath}/${id}`;
      const response = await this.makeAuthenticatedRequest(url, 'PATCH', data);
      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.error || "Failed to update CV");
      }

      return responseData;
    } catch (error: any) {
      console.error('Error updating CV:', error);
      return {
        success: false,
        message: 'Failed to update CV',
        error: error.message,
      };
    }
  }

  /**
   * Delete a CV
   */
  async deleteCV(id: string): Promise<ApiResponse<null>> {
    try {
      const url = `${this.baseURL}${this.basePath}/${id}`;
      const response = await this.makeAuthenticatedRequest(url, 'DELETE');
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete CV");
      }

      return data;
    } catch (error: any) {
      console.error('Error deleting CV:', error);
      return {
        success: false,
        message: 'Failed to delete CV',
        error: error.message,
      };
    }
  }

  /**
   * Set a CV as primary
   */
  async setPrimaryCV(id: string): Promise<ApiResponse<CandidateCv>> {
    try {
      const url = `${this.baseURL}${this.basePath}/${id}/primary`;
      const response = await this.makeAuthenticatedRequest(url, 'PUT');
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to set primary CV");
      }

      return data;
    } catch (error: any) {
      console.error('Error setting primary CV:', error);
      return {
        success: false,
        message: 'Failed to set primary CV',
        error: error.message,
      };
    }
  }

  /**
   * Download CV file
   */
  async downloadCV(cv: CandidateCv): Promise<boolean> {
    try {
      const response = await this.getCVById(cv.id, 'download');
      
      if (response.success && response.data) {
        const accessData = response.data as CVAccessResponse;
        
        if (Platform.OS === 'web') {
          // Web platform - trigger download
          const downloadUrl = accessData.url.replace('/upload/', '/upload/fl_attachment/');
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = accessData.fileName;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return true;
        } else {
          // Mobile platform - use expo-sharing or expo-file-system
          // This would need additional implementation for mobile
          console.log('Download URL:', accessData.url);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error downloading CV:', error);
      return false;
    }
  }

  /**
   * Preview CV in browser/viewer
   */
  async previewCV(cv: CandidateCv): Promise<string | null> {
    try {
      const response = await this.getCVById(cv.id, 'preview');
      
      if (response.success && response.data) {
        const accessData = response.data as CVAccessResponse;
        
        if (Platform.OS === 'web') {
          // Use Google Docs viewer for better PDF preview
          const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(accessData.url)}&embedded=true`;
          return viewerUrl;
        } else {
          // For mobile, return the direct URL
          return accessData.url;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting preview URL:', error);
      return null;
    }
  }

  /**
   * Get preview URL for CV - used by CVPreviewModal component
   */
  async getPreviewUrl(cvId: string): Promise<ApiResponse<CVAccessResponse>> {
    try {
      const response = await this.getCVById(cvId, 'preview');
      return response;
    } catch (error: any) {
      console.error('Error getting preview URL:', error);
      return {
        success: false,
        message: 'Failed to get preview URL',
        error: error.message,
      };
    }
  }

  /**
   * Check if candidate can upload more CVs
   */
  async canUploadMore(): Promise<boolean> {
    try {
      const response = await this.getCVs({ limit: 1 });
      if (response.success && response.data) {
        const { statistics } = response.data;
        return statistics.totalCvs < 5; // MAX_CVS_PER_CANDIDATE
      }
      return false;
    } catch (error) {
      console.error('Error checking CV limit:', error);
      return false;
    }
  }

  /**
   * Get statistics for CVs
   */
  async getStatistics(): Promise<ApiResponse<CVListResponse['statistics']>> {
    try {
      const response = await this.getCVs({ limit: 1 });
      if (response.success && response.data) {
        return {
          success: true,
          message: 'Statistics fetched successfully',
          data: response.data.statistics,
        };
      }
      return {
        success: false,
        message: 'Failed to fetch statistics',
      };
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      return {
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message,
      };
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File | Blob | any): { valid: boolean; error?: string } {
    const ALLOWED_TYPES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    // Check file type
    const fileType = file.type || file.mimeType;
    if (!ALLOWED_TYPES.includes(fileType)) {
      return {
        valid: false,
        error: 'Chỉ chấp nhận file PDF, DOC hoặc DOCX',
      };
    }

    // Check file size
    const fileSize = file.size || (file.fileSize ? parseInt(file.fileSize) : 0);
    if (fileSize > MAX_SIZE) {
      return {
        valid: false,
        error: 'Kích thước file không được vượt quá 10MB',
      };
    }

    return { valid: true };
  }

  /**
   * Share CV (for mobile platforms)
   */
  async shareCV(cv: CandidateCv): Promise<boolean> {
    try {
      const response = await this.getCVById(cv.id, 'preview');
      if (response.success && response.data) {
        const accessData = response.data as CVAccessResponse;
        
        if (Platform.OS === 'web') {
          // Web Share API
          if (navigator.share) {
            await navigator.share({
              title: cv.cvName,
              text: cv.description || 'Xem CV của tôi',
              url: accessData.url,
            });
            return true;
          } else {
            // Fallback: Copy URL to clipboard
            await navigator.clipboard.writeText(accessData.url);
            return true;
          }
        } else {
          // Mobile platforms would use React Native Share API
          console.log('Share URL:', accessData.url);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error sharing CV:', error);
      return false;
    }
  }

  /**
   * Duplicate a CV
   */
  async duplicateCV(cvId: string, newName?: string): Promise<ApiResponse<CandidateCv>> {
    try {
      const url = `${this.baseURL}${this.basePath}/${cvId}/duplicate`;
      const response = await this.makeAuthenticatedRequest(url, 'POST', { 
        cvName: newName 
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to duplicate CV");
      }

      return data;
    } catch (error: any) {
      console.error('Error duplicating CV:', error);
      return {
        success: false,
        message: 'Failed to duplicate CV',
        error: error.message,
      };
    }
  }

  /**
   * Get all CVs without pagination (for dropdowns, etc.)
   */
  async getAllCVs(): Promise<CandidateCv[]> {
    try {
      const response = await this.getCVs();
      if (response.success && response.data) {
        return response.data.cvs;
      }
      return [];
    } catch (error) {
      console.error('Error fetching all CVs:', error);
      return [];
    }
  }

  /**
   * Get primary CV
   */
  async getPrimaryCV(): Promise<CandidateCv | null> {
    try {
      const response = await this.getCVs({ limit: 100 });
      if (response.success && response.data) {
        const primaryCV = response.data.cvs.find(cv => cv.isPrimary);
        return primaryCV || null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching primary CV:', error);
      return null;
    }
  }

  /**
   * Batch delete multiple CVs
   */
  async batchDeleteCVs(cvIds: string[]): Promise<ApiResponse<null>> {
    try {
      const url = `${this.baseURL}${this.basePath}/batch-delete`;
      const response = await this.makeAuthenticatedRequest(url, 'POST', { ids: cvIds });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete CVs");
      }

      return data;
    } catch (error: any) {
      console.error('Error batch deleting CVs:', error);
      return {
        success: false,
        message: 'Failed to delete CVs',
        error: error.message,
      };
    }
  }

  /**
   * Search CVs by name or description
   */
  async searchCVs(query: string): Promise<CandidateCv[]> {
    try {
      const response = await this.getCVs({ search: query, limit: 50 });
      if (response.success && response.data) {
        return response.data.cvs;
      }
      return [];
    } catch (error) {
      console.error('Error searching CVs:', error);
      return [];
    }
  }

  /**
   * Update view count when CV is viewed
   */
  async trackView(cvId: string): Promise<void> {
    try {
      const url = `${this.baseURL}${this.basePath}/${cvId}/view`;
      await this.makeAuthenticatedRequest(url, 'POST');
    } catch (error) {
      console.error('Error tracking CV view:', error);
    }
  }
}

export default new CandidateCvService();
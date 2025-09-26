import { CandidateCv } from '@/types/candidateCv.types';

export interface CvListResponse {
  success: boolean;
  data?: CandidateCv[];
  total?: number;
  error?: string;
}

class CvService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  }

  /**
   * Get user's CVs
   */
  async getUserCvs(): Promise<CvListResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/candidate/cvs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user CVs:', error);
      return {
        success: false,
        error: 'Không thể tải danh sách CV. Vui lòng thử lại.',
      };
    }
  }

  /**
   * Upload new CV
   */
  async uploadCv(cvData: {
    cvName: string;
    file: File;
    description?: string;
    isPrimary?: boolean;
  }): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('cvName', cvData.cvName);
      formData.append('file', cvData.file);
      
      if (cvData.description) {
        formData.append('description', cvData.description);
      }
      
      if (cvData.isPrimary) {
        formData.append('isPrimary', 'true');
      }

      const response = await fetch(`${this.baseURL}/api/candidate/cvs/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading CV:', error);
      return {
        success: false,
        error: 'Không thể tải lên CV. Vui lòng thử lại.',
      };
    }
  }

  /**
   * Delete CV
   */
  async deleteCv(cvId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/candidate/cvs/${cvId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting CV:', error);
      return {
        success: false,
        error: 'Không thể xóa CV. Vui lòng thử lại.',
      };
    }
  }

  /**
   * Set primary CV
   */
  async setPrimaryCv(cvId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/candidate/cvs/${cvId}/primary`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error setting primary CV:', error);
      return {
        success: false,
        error: 'Không thể đặt CV làm CV chính. Vui lòng thử lại.',
      };
    }
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validate CV file
   */
  validateCvFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Chỉ hỗ trợ file PDF, DOC, DOCX',
      };
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File không được vượt quá 5MB',
      };
    }

    // Check file name length
    if (file.name.length > 100) {
      return {
        valid: false,
        error: 'Tên file quá dài',
      };
    }

    return { valid: true };
  }
}

export const cvService = new CvService();

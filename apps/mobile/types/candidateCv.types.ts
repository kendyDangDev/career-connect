/**
 * Types for Candidate CV Management
 */

// Base CV Interface
export interface CandidateCv {
  id: string;
  candidateId: string;
  cvName: string;
  fileUrl: string;
  cloudinaryPublicId?: string; // Cloudinary public ID for the file
  cloudinaryUrl?: string; // Direct Cloudinary URL
  fileSize: number; // in bytes
  mimeType: string;
  isPrimary: boolean;
  description?: string;
  uploadedAt: Date | string;
  lastViewedAt?: Date | string;
  viewCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Query Parameters
export interface CVQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'cvName' | 'uploadedAt' | 'fileSize' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// Pagination Response
export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Statistics
export interface CVStatistics {
  totalCvs: number;
  totalFileSize: number;
  totalViews: number;
  primaryCvId?: string;
}

// List Response
export interface CVListResponse {
  cvs: CandidateCv[];
  pagination: PaginationInfo;
  statistics: CVStatistics;
}

// Upload Request
export interface UploadCVRequest {
  file: File | Blob;
  cvName: string;
  description?: string;
  isPrimary?: boolean;
}

// Update Request
export interface UpdateCVRequest {
  cvName?: string;
  description?: string;
  isPrimary?: boolean;
}

// Preview/Download Response for Cloudinary
export interface CVAccessResponse {
  url: string;
  publicId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  version?: number;
  format?: string;
  resourceType?: string;
}

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// File types allowed
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// Maximum CVs per candidate
export const MAX_CVS_PER_CANDIDATE = 5;

// Helper functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
};

export const isValidFileType = (file: File | Blob): boolean => {
  return ALLOWED_FILE_TYPES.includes(file.type) || 
         (file instanceof File && ALLOWED_EXTENSIONS.some(ext => file.name?.toLowerCase().endsWith(ext)));
};

export const isValidFileSize = (file: File | Blob): boolean => {
  return file.size <= MAX_FILE_SIZE;
};

// Cloudinary specific helpers
export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width?: number;
  height?: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
  api_key: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  uploadPreset?: string;
}

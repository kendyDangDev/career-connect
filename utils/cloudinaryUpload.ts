/**
 * Cloudinary Upload Helper for Client-side
 */

import { CloudinaryUploadResponse } from '@/types/candidateCv.types';

// Cloudinary configuration (should be set from environment variables)
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'career-connect',
  uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'cv_upload_unsigned',
  apiKey: process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || '',
};

/**
 * Upload file directly to Cloudinary from client
 */
export const uploadToCloudinary = async (
  file: File | Blob,
  options?: {
    folder?: string;
    publicId?: string;
    tags?: string[];
    context?: Record<string, any>;
    onProgress?: (progress: number) => void;
  }
): Promise<CloudinaryUploadResponse> => {
  const formData = new FormData();
  
  // Add the file
  formData.append('file', file);
  
  // Add upload preset (for unsigned uploads)
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  
  // Add optional parameters
  if (options?.folder) {
    formData.append('folder', options.folder);
  }
  
  if (options?.publicId) {
    formData.append('public_id', options.publicId);
  }
  
  if (options?.tags && options.tags.length > 0) {
    formData.append('tags', options.tags.join(','));
  }
  
  if (options?.context) {
    Object.entries(options.context).forEach(([key, value]) => {
      formData.append(`context[${key}]`, String(value));
    });
  }
  
  // Set resource type to 'raw' for non-image files
  formData.append('resource_type', 'raw');
  
  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/raw/upload`;
  
  try {
    // Create XMLHttpRequest for progress tracking
    if (options?.onProgress && typeof XMLHttpRequest !== 'undefined') {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            options.onProgress!(progress);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              reject(new Error('Failed to parse response'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });
        
        xhr.open('POST', uploadUrl);
        xhr.send(formData);
      });
    } else {
      // Fallback to fetch without progress tracking
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }
      
      return await response.json();
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Generate Cloudinary URL with transformations
 */
export const getCloudinaryUrl = (
  publicId: string,
  options?: {
    resourceType?: string;
    transformation?: string[];
    download?: boolean;
    fileName?: string;
  }
): string => {
  const resourceType = options?.resourceType || 'raw';
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`;
  
  let transformations = '';
  if (options?.transformation && options.transformation.length > 0) {
    transformations = options.transformation.join('/') + '/';
  }
  
  // Add download flag if needed
  if (options?.download) {
    transformations += 'fl_attachment/';
    if (options?.fileName) {
      transformations += `fl_attachment:${options.fileName}/`;
    }
  }
  
  return `${baseUrl}/${transformations}${publicId}`;
};

/**
 * Delete file from Cloudinary (requires signed request from backend)
 */
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    // This should call your backend API to delete the file
    // as deletion requires API secret which should not be exposed to client
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

/**
 * Generate unique public ID for CV
 */
export const generateCVPublicId = (
  candidateId: string,
  fileName: string
): string => {
  const timestamp = Date.now();
  const uniqueId = Math.random().toString(36).substring(2, 9);
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const nameWithoutExt = cleanFileName.substring(0, cleanFileName.lastIndexOf('.')) || cleanFileName;
  
  return `cvs/${candidateId}/${nameWithoutExt}_${timestamp}_${uniqueId}`;
};

/**
 * Validate file before upload
 */
export const validateCVFile = (file: File | Blob): { valid: boolean; error?: string } => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 10MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`
    };
  }
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.'
    };
  }
  
  return { valid: true };
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
};

/**
 * Format bytes to human readable size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
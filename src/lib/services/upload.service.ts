import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  mimeType: string;
}

// Cloudinary Upload Service
export class UploadService {
  private cloudinary: any;

  constructor() {
    // Dynamic import to avoid build issues
    this.initCloudinary();
  }

  private async initCloudinary() {
    const { v2: cloudinary } = await import('cloudinary');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    this.cloudinary = cloudinary;
  }

  async uploadFile(
    file: Buffer | Uint8Array,
    folder: string,
    options: any = {}
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          ...options,
        },
        (error: any, result: any) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              key: result.public_id,
              url: result.secure_url,
              size: result.bytes,
              mimeType: result.resource_type,
            });
          }
        }
      );

      // Convert Uint8Array to Buffer if needed
      const buffer = file instanceof Uint8Array ? Buffer.from(file) : file;
      uploadStream.end(buffer);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await this.cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Upload company documents
   */
  async uploadCompanyDocument(
    file: Buffer | Uint8Array,
    originalName: string,
    mimeType: string,
    companyId: string,
    documentType: 'business-license' | 'authorization-letter' | 'other'
  ): Promise<UploadResult> {
    const folder = `companies/${companyId}/documents/${documentType}`;
    return this.uploadFile(file, folder);
  }

  /**
   * Upload company media (logo, cover image)
   */
  async uploadCompanyMedia(
    file: Buffer | Uint8Array,
    originalName: string,
    mimeType: string,
    companyId: string,
    mediaType: 'logo' | 'cover'
  ): Promise<UploadResult> {
    const folder = `companies/${companyId}/media`;
    return this.uploadFile(file, folder, { resource_type: 'image' });
  }

  /**
   * Upload user avatar
   */
  async uploadUserAvatar(
    file: Buffer | Uint8Array,
    originalName: string,
    mimeType: string,
    userId: string
  ): Promise<UploadResult> {
    const folder = `users/${userId}/avatar`;
    return this.uploadFile(file, folder, { resource_type: 'image' });
  }

  /**
   * Get signed URL for private files
   */
  async getSignedUrl(publicId: string, expiresIn: number = 3600): Promise<string> {
    const options = {
      sign_url: true,
      type: 'authenticated',
      expires_at: Math.floor(Date.now() / 1000) + expiresIn
    };
    return this.cloudinary.url(publicId, options);
  }

  /**
   * Validate file
   */
  validateFile(
    file: { size: number; type: string },
    options: {
      maxSize?: number;
      allowedTypes?: string[];
    } = {}
  ): { isValid: boolean; error?: string } {
    const { maxSize = 10 * 1024 * 1024, allowedTypes = [] } = options; // Default 10MB

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
      };
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Generate unique filename
   */
  generateFileName(originalName: string): string {
    const extension = originalName.split('.').pop();
    const timestamp = Date.now();
    const hash = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${hash}.${extension}`;
  }
}

// Export singleton instance
export const uploadService = new UploadService();

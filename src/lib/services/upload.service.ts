import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET!;
const CLOUDFRONT_URL = process.env.AWS_CLOUDFRONT_URL;

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  mimeType: string;
}

export class UploadService {
  /**
   * Upload file to S3
   */
  async uploadFile(
    file: Buffer | Uint8Array,
    originalName: string,
    mimeType: string,
    folder: string
  ): Promise<UploadResult> {
    const fileExtension = originalName.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = `${folder}/${fileName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: mimeType,
        Metadata: {
          originalName: originalName,
        },
      });

      await s3Client.send(command);

      const url = CLOUDFRONT_URL 
        ? `${CLOUDFRONT_URL}/${key}`
        : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      return {
        key,
        url,
        size: file.length,
        mimeType,
      };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file');
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
    return this.uploadFile(file, originalName, mimeType, folder);
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
    return this.uploadFile(file, originalName, mimeType, folder);
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
    return this.uploadFile(file, originalName, mimeType, folder);
  }

  /**
   * Get signed URL for private files
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error('Failed to delete file');
    }
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

// Alternative implementation using Cloudinary
export class CloudinaryUploadService {
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
    file: Buffer,
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

      uploadStream.end(file);
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
}

// Export the appropriate service based on configuration
export const uploadService = process.env.STORAGE_PROVIDER === 'cloudinary' 
  ? new CloudinaryUploadService() 
  : new UploadService();

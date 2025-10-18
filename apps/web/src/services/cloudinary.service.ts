import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

export interface CloudinaryUploadResult {
  success: boolean;
  publicId?: string;
  url?: string;
  secureUrl?: string;
  error?: string;
  fileSize?: number;
  format?: string;
  resourceType?: string;
  version?: number;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  cvFolder: string;
  signedUrlExpires: number;
}

export class CloudinaryService {
  private static instance: CloudinaryService;
  private config: CloudinaryConfig;
  private isConfigured: boolean = false;

  private constructor() {
    // Check if environment variables are set
    const requiredEnvVars = [
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY', 
      'CLOUDINARY_API_SECRET'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('⚠️  Missing Cloudinary environment variables:', missingVars.join(', '));
      console.error('Please add these to your .env file:');
      console.error(`
        CLOUDINARY_CLOUD_NAME=your-cloud-name
        CLOUDINARY_API_KEY=your-api-key
        CLOUDINARY_API_SECRET=your-api-secret
        CLOUDINARY_CV_FOLDER=career-connect/candidates/cvs
        CLOUDINARY_SIGNED_URL_EXPIRES=3600
`);
      throw new Error('Cloudinary configuration is required. Please set environment variables.');
    }
    
    this.isConfigured = true;

    this.config = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
      cvFolder: process.env.CLOUDINARY_CV_FOLDER || 'career-connect/candidates/cvs',
      signedUrlExpires: parseInt(process.env.CLOUDINARY_SIGNED_URL_EXPIRES || '3600'),
    };

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: this.config.cloudName,
      api_key: this.config.apiKey,
      api_secret: this.config.apiSecret,
      secure: true,
    });
    
    console.log('✅ CloudinaryService initialized with cloud name:', this.config.cloudName);
  }

  public static getInstance(): CloudinaryService {
    if (!CloudinaryService.instance) {
      CloudinaryService.instance = new CloudinaryService();
    }
    return CloudinaryService.instance;
  }

  /**
   * Generate a unique public ID for CV file
   */
  private generateCvPublicId(candidateId: string, cvName: string, fileExtension?: string): string {
    const timestamp = Date.now();
    const uniqueId = uuidv4().substring(0, 8);
    const sanitizedCvName = cvName.replace(/[^a-zA-Z0-9\-_]/g, '_').substring(0, 50);
    
    // Add file extension if provided
    const extension = fileExtension ? `.${fileExtension}` : '';
    
    return `${this.config.cvFolder}/${candidateId}/${sanitizedCvName}_${timestamp}_${uniqueId}${extension}`;
  }

  /**
   * Upload CV to Cloudinary
   */
  async uploadCv(
    file: File | Buffer,
    candidateId: string,
    cvName: string,
    originalFileName?: string
  ): Promise<CloudinaryUploadResult & { publicId?: string }> {
    try {
      // Check if Cloudinary is properly configured
      if (!this.config.apiKey || !this.config.apiSecret) {
        console.error('❌ Cloudinary is not configured and no fallback available.');
        return {
          success: false,
          error: 'Cloud storage service is not configured. Please contact administrator.',
        };
      }

      console.log('📤 Starting CV upload to Cloudinary...');
      console.log('   Candidate ID:', candidateId);
      console.log('   CV Name:', cvName);
      console.log('   File type:', file instanceof File ? 'File' : 'Buffer');
      
      if (file instanceof File) {
        console.log('   File details:');
        console.log('     - Name:', file.name);
        console.log('     - Size:', file.size, 'bytes');
        console.log('     - MIME type:', file.type);
        console.log('     - Last modified:', new Date(file.lastModified).toISOString());
      }
      
      // Extract file extension
      let fileExtension: string | undefined;
      if (file instanceof File) {
        const filenameParts = file.name.split('.');
        if (filenameParts.length > 1) {
          fileExtension = filenameParts.pop()?.toLowerCase();
        }
      } else if (originalFileName) {
        const filenameParts = originalFileName.split('.');
        if (filenameParts.length > 1) {
          fileExtension = filenameParts.pop()?.toLowerCase();
        }
      }
      
      // Generate unique public ID
      const publicId = this.generateCvPublicId(candidateId, cvName, fileExtension);
      console.log('   Generated public ID:', publicId);
      console.log('   File extension:', fileExtension);

      // Determine resource type based on file extension
      const isPdf = fileExtension === 'pdf';
      
      // Prepare upload options
      const uploadOptions = {
        public_id: publicId,
        resource_type: isPdf ? 'image' as const : 'raw' as const, // Use 'image' for PDFs to enable preview conversion
        type: 'upload', // Use 'upload' type for direct access
        overwrite: true,
        context: {
          candidate_id: candidateId,
          cv_name: cvName,
          original_filename: originalFileName || 'unknown',
          upload_date: new Date().toISOString(),
        },
        tags: ['cv', `candidate_${candidateId}`],
        use_filename: false,
        unique_filename: false,
        // Only apply format transformation for PDFs
        ...(isPdf ? {
          quality: 'auto',
        } : {}),
      };
      

      let uploadResult: UploadApiResponse;

      if (file instanceof File) {
        // Convert File to Buffer for upload
        const buffer = Buffer.from(await file.arrayBuffer());
        console.log('   Converted to buffer, size:', buffer.length, 'bytes');
        
        // Upload using buffer with stream
        uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) {
                console.error('   Upload stream error:', error);
                reject(error);
              } else if (result) {
                resolve(result);
              } else {
                reject(new Error('Upload failed - no result'));
              }
            }
          );
          uploadStream.end(buffer);
        });
      } else {
        // Upload using buffer directly
        uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) {
                console.error('   Upload stream error:', error);
                reject(error);
              } else if (result) {
                resolve(result);
              } else {
                reject(new Error('Upload failed - no result'));
              }
            }
          );
          uploadStream.end(file);
        });
      }

      console.log('✅ CV uploaded successfully to Cloudinary!');
      console.log('   Public ID:', uploadResult.public_id);
      console.log('   Secure URL:', uploadResult.secure_url);
      console.log('   File size:', uploadResult.bytes, 'bytes');
      console.log('   Format:', uploadResult.format);
      console.log('   Resource type:', uploadResult.resource_type);
      
      // Test if file is accessible
      try {
        const exists = await this.cvExists(uploadResult.public_id);
        console.log('   File exists check:', exists);
        
        // Test URL accessibility
        const urlTest = await this.testCvUrl(uploadResult.secure_url);
        console.log('   URL accessibility test:', urlTest);
      } catch (testError) {
        console.warn('   Could not verify file existence:', testError);
      }
      
      return {
        success: true,
        publicId: uploadResult.public_id,
        url: uploadResult.url,
        secureUrl: uploadResult.secure_url,
        fileSize: uploadResult.bytes,
        format: uploadResult.format,
        resourceType: uploadResult.resource_type,
        version: uploadResult.version,
      };
    } catch (error: any) {
      console.error('❌ Error uploading CV to Cloudinary:', error);
      console.error('   Error details:', error.message || error);
      
      // Check for specific Cloudinary errors
      if (error.message?.includes('Invalid cloud_name') || error.message?.includes('cloud_name')) {
        return {
          success: false,
          error: 'Cloudinary configuration error: Invalid cloud name. Please check .env file.',
        };
      }
      
      if (error.message?.includes('Invalid signature') || error.message?.includes('api_key')) {
        return {
          success: false,
          error: 'Cloudinary authentication error: Invalid API credentials. Please check .env file.',
        };
      }
      
      return {
        success: false,
        error: error.message || 'Failed to upload CV to Cloudinary',
      };
    }
  }

  /**
   * Delete CV from Cloudinary
   */
  async deleteCv(publicId: string): Promise<boolean> {
    try {
      // Try deleting as image first (for PDFs)
      let result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
      });
      
      if (result.result === 'ok') {
        return true;
      }
      
      // If not found as image, try as raw (for DOC/DOCX)
      result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'raw',
      });
      
      return result.result === 'ok';
    } catch (error) {
      console.error('Error deleting CV from Cloudinary:', error);
      return false;
    }
  }

  /**
   * Generate URL for CV download/preview
   */
  async getCvUrl(
    publicId: string,
    action: 'download' | 'preview' = 'preview',
    fileName?: string
  ): Promise<string | null> {
    try {
      // Check if this is a PDF by checking if it exists as image resource
      const isPdf = await this.isPdfFile(publicId);
      
      const options: any = {
        resource_type: isPdf ? 'image' : 'raw',
        secure: true,
        type: 'upload',
      };

      if (action === 'download') {
        if (isPdf) {
          // For PDF download, add attachment flag and keep as PDF
          options.flags = 'attachment';
          options.format = 'pdf';
          if (fileName) {
            options.flags += `:${fileName}`;
          }
        } else {
          // For DOC/DOCX, use raw URL
          if (fileName) {
            options.flags = `attachment:${fileName}`;
          }
        }
      } else {
        if (isPdf) {
          // For PDF preview, convert to image format
          options.format = 'jpg';
          options.quality = 'auto';
          options.page = 1; // Show first page for preview
        }
        // For DOC/DOCX preview, we can't convert to image, return raw URL
      }

      // Generate URL
      console.log('🔗 Generating CV URL with options:', options);
      const url = cloudinary.url(publicId, options);
      console.log('🔗 Generated URL:', url);
      return url;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return null;
    }
  }

  /**
   * Check if file is PDF by checking if it exists as image resource
   */
  private async isPdfFile(publicId: string): Promise<boolean> {
    try {
      await cloudinary.api.resource(publicId, {
        resource_type: 'image',
      });
      return true; // Found as image resource, likely PDF
    } catch (error) {
      return false; // Not found as image, likely DOC/DOCX
    }
  }

  /**
   * Generate signed URL for CV download/preview (backward compatibility)
   * @deprecated Use getCvUrl instead
   */
  async getSignedUrl(
    publicId: string,
    action: 'download' | 'preview' = 'preview',
    fileName?: string
  ): Promise<string | null> {
    return this.getCvUrl(publicId, action, fileName);
  }

  /**
   * Get page count for PDF
   */
  async getPageCount(publicId: string): Promise<number> {
    try {
      const metadata = await this.getCvMetadata(publicId);
      return metadata?.pages || 1;
    } catch (error) {
      console.error('Error getting page count:', error);
      return 1;
    }
  }

  /**
   * Get all page URLs for PDF
   */
  async getAllPageUrls(publicId: string): Promise<string[]> {
    try {
      const pageCount = await this.getPageCount(publicId);
      const urls: string[] = [];
      
      for (let page = 1; page <= pageCount; page++) {
        const url = this.getPreviewUrl(publicId, page);
        urls.push(url);
      }
      
      return urls;
    } catch (error) {
      console.error('Error getting all page URLs:', error);
      return [this.getPreviewUrl(publicId, 1)];
    }
  }

  /**
   * Get optimized URL for CV preview (PDFs)
   */
  getPreviewUrl(publicId: string, page: number = 1): string {
    // Convert PDF to image for preview
    return cloudinary.url(publicId, {
      resource_type: 'image',
      secure: true,
      type: 'upload',
      format: 'jpg',
      page: page,
      quality: 'auto',
    });
  }

  /**
   * Get thumbnail URL for CV
   */
  getThumbnailUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      resource_type: 'image',
      format: 'jpg',
      transformation: [
        { width: 200, height: 280, crop: 'fill', gravity: 'north' },
        { quality: 'auto:low' },
      ],
    });
  }

  /**
   * Check if CV exists in Cloudinary
   */
  async cvExists(publicId: string): Promise<boolean> {
    try {
      // Try as image first (for PDFs)
      const imageResult = await cloudinary.api.resource(publicId, {
        resource_type: 'image',
      });
      return !!imageResult;
    } catch (error) {
      try {
        // Try as raw (for DOC/DOCX)
        const rawResult = await cloudinary.api.resource(publicId, {
          resource_type: 'raw',
        });
        return !!rawResult;
      } catch (rawError) {
        console.error('   CV exists check error:', error);
        return false;
      }
    }
  }

  /**
   * Get CV metadata from Cloudinary
   */
  async getCvMetadata(publicId: string): Promise<{
    size?: number;
    format?: string;
    createdAt?: Date;
    pages?: number;
    context?: Record<string, string>;
  } | null> {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: 'image',
        context: true,
      });

      return {
        size: result.bytes,
        format: result.format,
        createdAt: new Date(result.created_at),
        pages: result.pages,
        context: result.context?.custom || {},
      };
    } catch (error) {
      console.error('Error getting CV metadata from Cloudinary:', error);
      return null;
    }
  }

  /**
   * Extract public ID from Cloudinary URL
   */
  extractPublicIdFromUrl(url: string): string | null {
    try {
      console.log('🔍 Extracting public ID from URL:', url);
      
      // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{version}/{public_id}.{format}
      const regex = /\/v\d+\/(.+)\.\w+$/;
      const match = url.match(regex);
      if (match) {
        console.log('✅ Found public ID with version:', match[1]);
        return match[1];
      }

      // Alternative format without version
      const regex2 = /upload\/(.+)\.\w+$/;
      const match2 = url.match(regex2);
      if (match2) {
        console.log('✅ Found public ID without version:', match2[1]);
        return match2[1];
      }

      // For URLs without extension (old format)
      const regex3 = /\/v\d+\/(.+)$/;
      const match3 = url.match(regex3);
      if (match3) {
        console.log('✅ Found public ID without extension:', match3[1]);
        return match3[1];
      }

      // If URL is already just the public ID
      if (!url.startsWith('http')) {
        console.log('✅ URL is already a public ID:', url);
        return url;
      }

      console.warn('❌ Could not extract public ID from URL');
      return null;
    } catch (error) {
      console.error('Error extracting public ID from URL:', error);
      return null;
    }
  }

  /**
   * Generate Cloudinary URL from public ID
   */
  generateCloudinaryUrl(publicId: string, secure: boolean = true): string {
    return cloudinary.url(publicId, {
      secure: secure,
      resource_type: 'image',
      type: 'upload',
    });
  }

  /**
   * Bulk delete CVs
   */
  async bulkDeleteCvs(publicIds: string[]): Promise<{ success: boolean; deleted: string[]; failed: string[] }> {
    const deleted: string[] = [];
    const failed: string[] = [];

    for (const publicId of publicIds) {
      const result = await this.deleteCv(publicId);
      if (result) {
        deleted.push(publicId);
      } else {
        failed.push(publicId);
      }
    }

    return {
      success: failed.length === 0,
      deleted,
      failed,
    };
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(): Promise<any> {
    try {
      const result = await cloudinary.api.usage();
      return result;
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return null;
    }
  }

  /**
   * Test CV URL accessibility
   */
  async testCvUrl(url: string): Promise<{ accessible: boolean; status?: number; error?: string }> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return {
        accessible: response.ok,
        status: response.status
      };
    } catch (error: any) {
      return {
        accessible: false,
        error: error.message || 'Failed to access URL'
      };
    }
  }
}
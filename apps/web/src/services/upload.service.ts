import { writeFile, mkdir, unlink, access } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { generateUniqueFilename } from "@/lib/utils/company-utils";
import { mediaConstraints } from "@/types/company";
import { cvConstraints } from "@/lib/validations/candidate/cv.validation";
import { CloudinaryService } from "@/services/cloudinary.service";

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

export class UploadService {
  private static uploadDir = join(process.cwd(), "public", "uploads");

  private static getFileExtension(fileName: string): string {
    const fileNameSegments = fileName.toLowerCase().split('.');
    return fileNameSegments.length > 1 ? `.${fileNameSegments.pop()}` : '';
  }

  /**
   * Ensure upload directory exists
   */
  private static async ensureUploadDir(subDir: string): Promise<string> {
    const fullPath = join(this.uploadDir, subDir);
    if (!existsSync(fullPath)) {
      await mkdir(fullPath, { recursive: true });
    }
    return fullPath;
  }

  /**
   * Upload company logo to Cloudinary
   */
  static async uploadCompanyLogo(
    file: File,
    companyId: string
  ): Promise<UploadResult> {
    try {
      // Validate file type
      if (!mediaConstraints.logo.allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: `Invalid file type. Allowed types: ${mediaConstraints.logo.allowedTypes.join(", ")}`
        };
      }

      // Validate file size
      if (file.size > mediaConstraints.logo.maxSize) {
        return {
          success: false,
          error: `File size exceeds limit of ${mediaConstraints.logo.maxSize / 1024 / 1024}MB`
        };
      }

      // Convert File to Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary
      const cloudinaryService = CloudinaryService.getInstance();
      const result = await cloudinaryService.uploadImage(
        buffer,
        'logos',
        companyId,
        'logo',
        {
          width: 300,
          height: 300,
          crop: 'fill'
        }
      );

      if (!result.success || !result.secureUrl) {
        return {
          success: false,
          error: result.error || 'Failed to upload to Cloudinary'
        };
      }

      return {
        success: true,
        fileUrl: result.secureUrl
      };
    } catch (error) {
      console.error("Error uploading logo:", error);
      return {
        success: false,
        error: "Failed to upload logo"
      };
    }
  }

  /**
   * Upload company cover image to Cloudinary
   */
  static async uploadCompanyCover(
    file: File,
    companyId: string
  ): Promise<UploadResult> {
    try {
      // Validate file type
      if (!mediaConstraints.coverImage.allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: `Invalid file type. Allowed types: ${mediaConstraints.coverImage.allowedTypes.join(", ")}`
        };
      }

      // Validate file size
      if (file.size > mediaConstraints.coverImage.maxSize) {
        return {
          success: false,
          error: `File size exceeds limit of ${mediaConstraints.coverImage.maxSize / 1024 / 1024}MB`
        };
      }

      // Convert File to Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary
      const cloudinaryService = CloudinaryService.getInstance();
      const result = await cloudinaryService.uploadImage(
        buffer,
        'covers',
        companyId,
        'cover',
        {
          width: 1200,
          height: 400,
          crop: 'fill'
        }
      );

      if (!result.success || !result.secureUrl) {
        return {
          success: false,
          error: result.error || 'Failed to upload to Cloudinary'
        };
      }

      return {
        success: true,
        fileUrl: result.secureUrl
      };
    } catch (error) {
      console.error("Error uploading cover image:", error);
      return {
        success: false,
        error: "Failed to upload cover image"
      };
    }
  }

  /**
   * Upload company gallery images to Cloudinary
   */
  static async uploadCompanyGallery(
    files: File[],
    companyId: string
  ): Promise<{ success: boolean; urls?: string[]; errors?: string[] }> {
    const urls: string[] = [];
    const errors: string[] = [];

    // Check max files limit
    if (files.length > mediaConstraints.gallery.maxFiles) {
      return {
        success: false,
        errors: [`Maximum ${mediaConstraints.gallery.maxFiles} files allowed`]
      };
    }

    const cloudinaryService = CloudinaryService.getInstance();

    for (const file of files) {
      // Validate file type
      if (!mediaConstraints.gallery.allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type`);
        continue;
      }

      // Validate file size
      if (file.size > mediaConstraints.gallery.maxSize) {
        errors.push(`${file.name}: File size exceeds limit`);
        continue;
      }

      try {
        // Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const result = await cloudinaryService.uploadImage(
          buffer,
          'gallery',
          companyId,
          'gallery',
          {
            width: 1200,
            height: 800,
            crop: 'fill'
          }
        );

        if (result.success && result.secureUrl) {
          urls.push(result.secureUrl);
        } else {
          errors.push(`${file.name}: ${result.error || 'Upload failed'}`);
        }
      } catch (error) {
        errors.push(`${file.name}: Upload failed`);
      }
    }

    return {
      success: errors.length === 0,
      urls: urls.length > 0 ? urls : undefined,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Upload company video
   */
  static async uploadCompanyVideo(
    file: File,
    companyId: string
  ): Promise<UploadResult> {
    try {
      // Validate file type
      if (!mediaConstraints.video.allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: `Invalid file type. Allowed types: ${mediaConstraints.video.allowedTypes.join(", ")}`
        };
      }

      // Validate file size
      if (file.size > mediaConstraints.video.maxSize) {
        return {
          success: false,
          error: `File size exceeds limit of ${mediaConstraints.video.maxSize / 1024 / 1024}MB`
        };
      }

      // Generate unique filename
      const filename = generateUniqueFilename(file.name, `company_${companyId}_video`);
      
      // Ensure directory exists
      const uploadPath = await this.ensureUploadDir("companies/videos");
      const filePath = join(uploadPath, filename);
      
      // Convert File to Buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Return public URL
      const fileUrl = `/uploads/companies/videos/${filename}`;
      
      return {
        success: true,
        fileUrl
      };
    } catch (error) {
      console.error("Error uploading video:", error);
      return {
        success: false,
        error: "Failed to upload video"
      };
    }
  }

  /**
   * Delete file (support both local and Cloudinary URLs)
   */
  static async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      // Check if it's a Cloudinary URL
      if (fileUrl.includes('cloudinary.com')) {
        const cloudinaryService = CloudinaryService.getInstance();
        const publicId = cloudinaryService.extractPublicIdFromUrl(fileUrl);
        
        if (publicId) {
          const deletedRawResource = await cloudinaryService.deleteCv(publicId);
          if (deletedRawResource) {
            return true;
          }

          return await cloudinaryService.deleteImage(publicId);
        }
        
        console.warn('Could not extract public ID from Cloudinary URL:', fileUrl);
        return false;
      }
      
      // Handle local file deletion
      const relativePath = fileUrl.replace("/uploads/", "");
      const filePath = join(this.uploadDir, relativePath);
      
      if (existsSync(filePath)) {
        await unlink(filePath);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  /**
   * Upload candidate CV (using Cloudinary)
   */
  static async uploadCandidateCv(
    file: File,
    candidateId: string,
    cvName: string
  ): Promise<UploadResult & { fileSize?: number; mimeType?: string; publicId?: string }> {
    try {
      // Validate file type
      if (!cvConstraints.allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: `Invalid file type. Allowed types: PDF, DOC, DOCX`
        };
      }

      // Validate file size
      if (file.size > cvConstraints.maxFileSize) {
        return {
          success: false,
          error: `File size exceeds limit of ${cvConstraints.maxFileSize / 1024 / 1024}MB`
        };
      }

      // Upload to Cloudinary
      const cloudinaryService = CloudinaryService.getInstance();
      const uploadResult = await cloudinaryService.uploadCv(file, candidateId, cvName, file.name);
      
      if (!uploadResult.success) {
        return {
          success: false,
          error: uploadResult.error || "Failed to upload CV to Cloudinary"
        };
      }

      return {
        success: true,
        fileUrl: uploadResult.secureUrl || uploadResult.url!,
        fileSize: uploadResult.fileSize,
        mimeType: file.type,
        publicId: uploadResult.publicId
      };
    } catch (error) {
      console.error("Error uploading CV:", error);
      return {
        success: false,
        error: "Failed to upload CV"
      };
    }
  }

  /**
   * Get CV URL for preview/download (using Cloudinary)
   */
  static async getCvUrl(
    fileUrl: string,
    action: 'preview' | 'download' = 'preview',
    fileName?: string
  ): Promise<string | null> {
    try {
      console.log('🎯 Getting CV URL for:', { fileUrl, action, fileName });
      
      const cloudinaryService = CloudinaryService.getInstance();
      
      // Extract public ID from URL
      const publicId = cloudinaryService.extractPublicIdFromUrl(fileUrl);
      console.log('🔑 Extracted public ID:', publicId);
      
      if (!publicId) {
        console.log('⚠️ Could not extract public ID, returning original URL');
        // If we can't extract public ID, return the original URL
        return fileUrl;
      }
      
      // Generate CV URL for access
      const cvUrl = await cloudinaryService.getCvUrl(publicId, action, fileName);
      console.log('🔗 Generated CV URL:', cvUrl);
      
      return cvUrl;
    } catch (error) {
      console.error("Error generating CV URL:", error);
      return null;
    }
  }

  /**
   * Get all page URLs for a CV
   */
  static async getAllCvPageUrls(fileUrl: string): Promise<string[]> {
    try {
      const cloudinaryService = CloudinaryService.getInstance();
      
      // Extract public ID from URL
      const publicId = cloudinaryService.extractPublicIdFromUrl(fileUrl);
      
      if (!publicId) {
        console.log('⚠️ Could not extract public ID, returning single page');
        return [fileUrl];
      }
      
      // Get all page URLs
      const pageUrls = await cloudinaryService.getAllPageUrls(publicId);
      console.log('📄 Generated page URLs:', pageUrls.length, 'pages');
      
      return pageUrls;
    } catch (error) {
      console.error("Error getting all CV page URLs:", error);
      return [fileUrl]; // Fallback to original URL
    }
  }

  /**
   * Get page count for a CV
   */
  static async getCvPageCount(fileUrl: string): Promise<number> {
    try {
      const cloudinaryService = CloudinaryService.getInstance();
      
      // Extract public ID from URL
      const publicId = cloudinaryService.extractPublicIdFromUrl(fileUrl);
      
      if (!publicId) {
        return 1;
      }
      
      // Get page count
      const pageCount = await cloudinaryService.getPageCount(publicId);
      console.log('📄 CV page count:', pageCount);
      
      return pageCount;
    } catch (error) {
      console.error("Error getting CV page count:", error);
      return 1;
    }
  }

  /**
   * Delete CV from Cloudinary
   */
  static async deleteCvFromCloudinary(fileUrl: string): Promise<boolean> {
    try {
      const cloudinaryService = CloudinaryService.getInstance();
      
      // Extract public ID from URL
      const publicId = cloudinaryService.extractPublicIdFromUrl(fileUrl);
      
      if (!publicId) {
        console.error("Could not extract public ID from URL:", fileUrl);
        return false;
      }
      
      // Delete from Cloudinary
      return await cloudinaryService.deleteCv(publicId);
    } catch (error) {
      console.error("Error deleting CV from Cloudinary:", error);
      return false;
    }
  }

  /**
   * Validate CV file before upload
   */
  static validateCvFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!cvConstraints.allowedTypes.includes(file.type)) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !cvConstraints.allowedExtensions.includes(`.${extension}`)) {
        return {
          valid: false,
          error: "Invalid file format. Please upload a PDF, DOC, or DOCX file"
        };
      }
    }

    // Check file size
    if (file.size > cvConstraints.maxFileSize) {
      return {
        valid: false,
        error: `File size must not exceed ${cvConstraints.maxFileSize / 1024 / 1024}MB`
      };
    }

    // Check file name length
    if (file.name.length > 255) {
      return {
        valid: false,
        error: "File name is too long"
      };
    }

    return { valid: true };
  }

  /**
   * Validate business license / legal document before upload
   */
  static validateBusinessLicenseFile(file: File): { valid: boolean; error?: string } {
    const extension = this.getFileExtension(file.name);

    if (
      !mediaConstraints.document.allowedTypes.includes(file.type) &&
      !mediaConstraints.document.allowedExtensions.includes(extension)
    ) {
      return {
        valid: false,
        error: 'Invalid file format. Please upload a PDF, JPG, JPEG, or PNG file',
      };
    }

    if (file.size > mediaConstraints.document.maxSize) {
      return {
        valid: false,
        error: `File size must not exceed ${mediaConstraints.document.maxSize / 1024 / 1024}MB`,
      };
    }

    return { valid: true };
  }

  /**
   * Upload legal document for company verification
   */
  static async uploadBusinessLicense(file: File, companyId: string): Promise<UploadResult> {
    try {
      const validationResult = this.validateBusinessLicenseFile(file);
      if (!validationResult.valid) {
        return {
          success: false,
          error: validationResult.error,
        };
      }

      const cloudinaryService = CloudinaryService.getInstance();
      const uploadResult = await cloudinaryService.uploadCompanyDocument(
        file,
        companyId,
        'business-license',
        file.name
      );

      if (!uploadResult.success || !uploadResult.secureUrl) {
        return {
          success: false,
          error: uploadResult.error || 'Failed to upload business license',
        };
      }

      return {
        success: true,
        fileUrl: uploadResult.secureUrl,
      };
    } catch (error) {
      console.error('Error uploading business license:', error);
      return {
        success: false,
        error: 'Failed to upload business license',
      };
    }
  }
}

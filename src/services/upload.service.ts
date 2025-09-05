import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { generateUniqueFilename } from "@/lib/utils/company-utils";
import { mediaConstraints } from "@/types/company";

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

export class UploadService {
  private static uploadDir = join(process.cwd(), "public", "uploads");

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
   * Upload company logo
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

      // Generate unique filename
      const filename = generateUniqueFilename(file.name, `company_${companyId}_logo`);
      
      // Ensure directory exists
      const uploadPath = await this.ensureUploadDir("companies/logos");
      const filePath = join(uploadPath, filename);
      
      // Convert File to Buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Return public URL
      const fileUrl = `/uploads/companies/logos/${filename}`;
      
      return {
        success: true,
        fileUrl
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
   * Upload company cover image
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

      // Generate unique filename
      const filename = generateUniqueFilename(file.name, `company_${companyId}_cover`);
      
      // Ensure directory exists
      const uploadPath = await this.ensureUploadDir("companies/covers");
      const filePath = join(uploadPath, filename);
      
      // Convert File to Buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Return public URL
      const fileUrl = `/uploads/companies/covers/${filename}`;
      
      return {
        success: true,
        fileUrl
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
   * Upload company gallery images
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
        // Generate unique filename
        const filename = generateUniqueFilename(file.name, `company_${companyId}_gallery`);
        
        // Ensure directory exists
        const uploadPath = await this.ensureUploadDir("companies/gallery");
        const filePath = join(uploadPath, filename);
        
        // Convert File to Buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Add to URLs
        urls.push(`/uploads/companies/gallery/${filename}`);
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
   * Delete file
   */
  static async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      // Convert URL to file path
      const relativePath = fileUrl.replace("/uploads/", "");
      const filePath = join(this.uploadDir, relativePath);
      
      if (existsSync(filePath)) {
        const { unlink } = await import("fs/promises");
        await unlink(filePath);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }
}

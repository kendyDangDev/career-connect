import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma';
import {
  UploadCandidateCvInput,
  UpdateCandidateCvInput,
  GetCandidateCvsQuery,
  cvConstraints,
} from '@/lib/validations/candidate/cv.validation';
import { UploadService } from '@/services/upload.service';

export class CandidateCvService {
  /**
   * Get candidate CVs with pagination and filtering
   */
  static async getCandidateCvs({
    candidateId,
    page = 1,
    limit = 10,
    sortBy = 'uploadedAt',
    sortOrder = 'desc',
    search,
  }: GetCandidateCvsQuery & { candidateId: string }) {
    try {
      // Build where clause
      const where: Prisma.CandidateCvWhereInput = {
        candidateId,
        ...(search && {
          OR: [
            { cvName: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      // Build order by
      const orderBy: Prisma.CandidateCvOrderByWithRelationInput = {};
      if (sortBy === 'cvName') {
        orderBy.cvName = sortOrder;
      } else if (sortBy === 'uploadedAt') {
        orderBy.uploadedAt = sortOrder;
      } else if (sortBy === 'fileSize') {
        orderBy.fileSize = sortOrder;
      } else if (sortBy === 'viewCount') {
        orderBy.viewCount = sortOrder;
      }

      // Get total count
      const total = await prisma.candidateCv.count({ where });

      // Calculate pagination
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;

      // Get CVs
      const cvs = await prisma.candidateCv.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      });

      // Get statistics
      const statistics = await this.getCandidateStatistics(candidateId);

      return {
        cvs,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
        statistics,
      };
    } catch (error) {
      console.error('Error getting candidate CVs:', error);
      throw new Error('Failed to retrieve CVs');
    }
  }

  /**
   * Get candidate CV statistics
   */
  static async getCandidateStatistics(candidateId: string) {
    try {
      const [stats, primaryCv] = await Promise.all([
        prisma.candidateCv.aggregate({
          where: { candidateId },
          _count: { id: true },
          _sum: { fileSize: true, viewCount: true },
        }),
        prisma.candidateCv.findFirst({
          where: { candidateId, isPrimary: true },
          select: { id: true },
        }),
      ]);

      return {
        totalCvs: stats._count.id,
        totalFileSize: stats._sum.fileSize || 0,
        totalViews: stats._sum.viewCount || 0,
        primaryCvId: primaryCv?.id || null,
      };
    } catch (error) {
      console.error('Error getting CV statistics:', error);
      throw new Error('Failed to get CV statistics');
    }
  }

  /**
   * Get single CV by ID
   */
  static async getCandidateCvById(cvId: string, candidateId: string) {
    try {
      const cv = await prisma.candidateCv.findFirst({
        where: {
          id: cvId,
          candidateId,
        },
      });

      if (!cv) {
        throw new Error('CV not found');
      }

      // Update view count and last viewed
      await prisma.candidateCv.update({
        where: { id: cvId },
        data: {
          viewCount: { increment: 1 },
          lastViewedAt: new Date(),
        },
      });

      return cv;
    } catch (error) {
      console.error('Error getting CV by ID:', error);
      throw error;
    }
  }

  /**
   * Create new CV record after file upload
   */
  static async createCandidateCv(
    candidateId: string,
    data: UploadCandidateCvInput & {
      fileUrl: string;
      fileSize: number;
      mimeType: string;
    }
  ) {
    try {
      // Check CV count limit
      const cvCount = await prisma.candidateCv.count({
        where: { candidateId },
      });

      if (cvCount >= cvConstraints.maxCvCount) {
        throw new Error(`Maximum ${cvConstraints.maxCvCount} CVs allowed per candidate`);
      }

      // If this is the first CV or marked as primary, unset other primary CVs
      if (data.isPrimary || cvCount === 0) {
        await prisma.candidateCv.updateMany({
          where: { candidateId },
          data: { isPrimary: false },
        });
      }

      // Create CV record
      const cv = await prisma.candidateCv.create({
        data: {
          candidateId,
          cvName: data.cvName,
          fileUrl: data.fileUrl,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
          isPrimary: data.isPrimary || cvCount === 0,
          description: data.description,
        },
      });

      return cv;
    } catch (error) {
      console.error('Error creating CV record:', error);
      throw error;
    }
  }

  /**
   * Update CV information
   */
  static async updateCandidateCv(
    cvId: string,
    candidateId: string,
    data: UpdateCandidateCvInput
  ) {
    try {
      // Check if CV exists and belongs to candidate
      const existingCv = await prisma.candidateCv.findFirst({
        where: { id: cvId, candidateId },
      });

      if (!existingCv) {
        throw new Error('CV not found');
      }

      // If setting as primary, unset other primary CVs
      if (data.isPrimary === true) {
        await prisma.candidateCv.updateMany({
          where: {
            candidateId,
            id: { not: cvId },
          },
          data: { isPrimary: false },
        });
      }

      // Update CV
      const updatedCv = await prisma.candidateCv.update({
        where: { id: cvId },
        data: {
          ...(data.cvName && { cvName: data.cvName }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.isPrimary !== undefined && { isPrimary: data.isPrimary }),
        },
      });

      return updatedCv;
    } catch (error) {
      console.error('Error updating CV:', error);
      throw error;
    }
  }

  /**
   * Delete CV
   */
  static async deleteCandidateCv(cvId: string, candidateId: string) {
    try {
      // Get CV to delete
      const cv = await prisma.candidateCv.findFirst({
        where: { id: cvId, candidateId },
      });

      if (!cv) {
        throw new Error('CV not found');
      }

      // Delete file from Cloudinary storage
      const deleteSuccess = await UploadService.deleteCvFromCloudinary(cv.fileUrl);
      if (!deleteSuccess) {
        console.warn(`Failed to delete CV from Cloudinary: ${cv.fileUrl}`);
      }

      // If this was the primary CV, set another as primary
      if (cv.isPrimary) {
        const nextCv = await prisma.candidateCv.findFirst({
          where: {
            candidateId,
            id: { not: cvId },
          },
          orderBy: { uploadedAt: 'desc' },
        });

        if (nextCv) {
          await prisma.candidateCv.update({
            where: { id: nextCv.id },
            data: { isPrimary: true },
          });
        }
      }

      // Delete CV record
      await prisma.candidateCv.delete({
        where: { id: cvId },
      });

      return { success: true, message: 'CV deleted successfully' };
    } catch (error) {
      console.error('Error deleting CV:', error);
      throw error;
    }
  }

  /**
   * Set CV as primary
   */
  static async setPrimaryCv(cvId: string, candidateId: string) {
    try {
      // Check if CV exists and belongs to candidate
      const cv = await prisma.candidateCv.findFirst({
        where: { id: cvId, candidateId },
      });

      if (!cv) {
        throw new Error('CV not found');
      }

      // Unset all other primary CVs
      await prisma.candidateCv.updateMany({
        where: {
          candidateId,
          id: { not: cvId },
        },
        data: { isPrimary: false },
      });

      // Set this CV as primary
      const updatedCv = await prisma.candidateCv.update({
        where: { id: cvId },
        data: { isPrimary: true },
      });

      return updatedCv;
    } catch (error) {
      console.error('Error setting primary CV:', error);
      throw error;
    }
  }

  /**
   * Get primary CV for a candidate
   */
  static async getPrimaryCv(candidateId: string) {
    try {
      const primaryCv = await prisma.candidateCv.findFirst({
        where: {
          candidateId,
          isPrimary: true,
        },
      });

      return primaryCv;
    } catch (error) {
      console.error('Error getting primary CV:', error);
      throw new Error('Failed to get primary CV');
    }
  }

  /**
   * Check if candidate has reached CV limit
   */
  static async hasReachedCvLimit(candidateId: string): Promise<boolean> {
    try {
      const count = await prisma.candidateCv.count({
        where: { candidateId },
      });
      return count >= cvConstraints.maxCvCount;
    } catch (error) {
      console.error('Error checking CV limit:', error);
      return true; // Return true to be safe
    }
  }

  /**
   * Migrate legacy CV URL to new CV system
   */
  static async migrateLegacyCv(candidateId: string, cvFileUrl: string) {
    try {
      // Check if migration is needed
      const existingCvs = await prisma.candidateCv.count({
        where: { candidateId },
      });

      if (existingCvs > 0) {
        return null; // Already has CVs in new system
      }

      // Create CV record from legacy URL
      const cv = await prisma.candidateCv.create({
        data: {
          candidateId,
          cvName: 'My CV (Migrated)',
          fileUrl: cvFileUrl,
          fileSize: 0, // Unknown for legacy
          mimeType: 'application/pdf', // Assume PDF
          isPrimary: true,
          description: 'Migrated from previous CV system',
        },
      });

      return cv;
    } catch (error) {
      console.error('Error migrating legacy CV:', error);
      return null;
    }
  }
}
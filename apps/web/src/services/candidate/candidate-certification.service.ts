import { prisma } from '@/lib/prisma';
import { 
  CandidateCertification,
  Prisma
} from '@/generated/prisma';
import {
  CreateCandidateCertificationInput,
  UpdateCandidateCertificationInput,
  GetCandidateCertificationParams,
  CandidateCertificationWithRelations,
  BulkCreateCandidateCertificationInput,
  CandidateCertificationResponse,
  CertificationStatistics,
  CertificationSummary
} from '@/types/candidate/certification.types';

export class CandidateCertificationService {
  /**
   * Get all certification records for a candidate
   */
  static async getCandidateCertifications({
    candidateId,
    sortBy = 'issueDate',
    sortOrder = 'desc',
    isExpired,
    isValid
  }: GetCandidateCertificationParams): Promise<CandidateCertificationResponse> {
    const orderBy: Prisma.CandidateCertificationOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    const where: Prisma.CandidateCertificationWhereInput = { candidateId };
    
    // Filter by expiry status
    const now = new Date();
    if (isExpired === true) {
      where.expiryDate = {
        lt: now
      };
    } else if (isValid === true) {
      where.OR = [
        { expiryDate: null },
        { expiryDate: { gte: now } }
      ];
    }

    const certifications = await prisma.candidateCertification.findMany({
      where,
      orderBy,
      select: {
        id: true,
        candidateId: true,
        certificationName: true,
        issuingOrganization: true,
        issueDate: true,
        expiryDate: true,
        credentialId: true,
        credentialUrl: true,
        createdAt: true
      }
    });

    return {
      certifications: certifications as CandidateCertificationWithRelations[],
      total: certifications.length
    };
  }

  /**
   * Get a single certification record by ID
   */
  static async getCandidateCertificationById(
    id: string,
    candidateId: string
  ): Promise<CandidateCertificationWithRelations | null> {
    const certification = await prisma.candidateCertification.findFirst({
      where: { 
        id,
        candidateId 
      }
    });

    return certification as CandidateCertificationWithRelations | null;
  }

  /**
   * Create a new certification record
   */
  static async createCandidateCertification(
    candidateId: string,
    data: CreateCandidateCertificationInput
  ): Promise<CandidateCertificationWithRelations> {
    // Check if candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId }
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Validate date logic
    if (data.expiryDate && data.issueDate > data.expiryDate) {
      throw new Error('Expiry date must be after issue date');
    }

    // Create the certification record
    const certification = await prisma.candidateCertification.create({
      data: {
        candidateId,
        ...data
      }
    });

    return certification as CandidateCertificationWithRelations;
  }

  /**
   * Bulk create certification records
   */
  static async bulkCreateCandidateCertifications(
    candidateId: string,
    data: BulkCreateCandidateCertificationInput
  ): Promise<CandidateCertificationResponse> {
    // Check if candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId }
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Validate all certification data
    data.certifications.forEach((cert, index) => {
      if (cert.expiryDate && cert.issueDate > cert.expiryDate) {
        throw new Error(`Certification at index ${index}: Expiry date must be after issue date`);
      }
    });

    // Create certification records
    await prisma.candidateCertification.createMany({
      data: data.certifications.map(cert => ({
        candidateId,
        ...cert
      }))
    });

    // Return all certification records
    return this.getCandidateCertifications({ candidateId });
  }

  /**
   * Update a certification record
   */
  static async updateCandidateCertification(
    id: string,
    candidateId: string,
    data: UpdateCandidateCertificationInput
  ): Promise<CandidateCertificationWithRelations> {
    // Check if the certification belongs to the candidate
    const existingCertification = await prisma.candidateCertification.findFirst({
      where: { id, candidateId }
    });

    if (!existingCertification) {
      throw new Error('Certification record not found or does not belong to candidate');
    }

    // Validate date logic if dates are being updated
    if (data.issueDate || data.expiryDate !== undefined) {
      const issueDate = data.issueDate || existingCertification.issueDate;
      const expiryDate = data.expiryDate !== undefined ? data.expiryDate : existingCertification.expiryDate;
      
      if (expiryDate && issueDate > expiryDate) {
        throw new Error('Expiry date must be after issue date');
      }
    }

    // Update the certification record
    const updatedCertification = await prisma.candidateCertification.update({
      where: { id },
      data
    });

    return updatedCertification as CandidateCertificationWithRelations;
  }

  /**
   * Delete a certification record
   */
  static async deleteCandidateCertification(
    id: string,
    candidateId: string
  ): Promise<void> {
    // Check if the certification belongs to the candidate
    const existingCertification = await prisma.candidateCertification.findFirst({
      where: { id, candidateId }
    });

    if (!existingCertification) {
      throw new Error('Certification record not found or does not belong to candidate');
    }

    await prisma.candidateCertification.delete({
      where: { id }
    });
  }

  /**
   * Delete multiple certification records
   */
  static async deleteMultipleCandidateCertifications(
    certificationIds: string[],
    candidateId: string
  ): Promise<number> {
    const result = await prisma.candidateCertification.deleteMany({
      where: {
        id: { in: certificationIds },
        candidateId
      }
    });

    return result.count;
  }

  /**
   * Get certification statistics for a candidate
   */
  static async getCandidateCertificationStatistics(
    candidateId: string
  ): Promise<CertificationStatistics> {
    const certifications = await prisma.candidateCertification.findMany({
      where: { candidateId }
    });

    const now = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    // Calculate statistics
    const validCertifications = certifications.filter(cert => 
      !cert.expiryDate || cert.expiryDate >= now
    ).length;

    const expiredCertifications = certifications.filter(cert => 
      cert.expiryDate && cert.expiryDate < now
    ).length;

    const expiringInNextMonth = certifications.filter(cert => 
      cert.expiryDate && 
      cert.expiryDate >= now && 
      cert.expiryDate <= oneMonthFromNow
    ).length;

    // Group by organization
    const byOrganization = certifications.reduce((acc, cert) => {
      acc[cert.issuingOrganization] = (acc[cert.issuingOrganization] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCertifications: certifications.length,
      validCertifications,
      expiredCertifications,
      expiringInNextMonth,
      byOrganization
    };
  }

  /**
   * Get certification summary for a candidate
   */
  static async getCandidateCertificationSummary(
    candidateId: string
  ): Promise<CertificationSummary> {
    const stats = await this.getCandidateCertificationStatistics(candidateId);
    
    // Get top organizations
    const topOrganizations = Object.entries(stats.byOrganization)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([org]) => org);

    return {
      total: stats.totalCertifications,
      valid: stats.validCertifications,
      expired: stats.expiredCertifications,
      topOrganizations
    };
  }

  /**
   * Check if certification is expiring soon
   */
  static async checkExpiringCertifications(
    candidateId: string,
    daysAhead: number = 30
  ): Promise<CandidateCertificationWithRelations[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const expiringCertifications = await prisma.candidateCertification.findMany({
      where: {
        candidateId,
        expiryDate: {
          gte: now,
          lte: futureDate
        }
      },
      orderBy: {
        expiryDate: 'asc'
      }
    });

    return expiringCertifications as CandidateCertificationWithRelations[];
  }

  /**
   * Check if candidate has specific certifications
   */
  static async checkCertificationRequirement(
    candidateId: string,
    requiredCertifications: string[]
  ): Promise<boolean> {
    const candidateCertifications = await prisma.candidateCertification.findMany({
      where: { 
        candidateId,
        OR: [
          { expiryDate: null },
          { expiryDate: { gte: new Date() } }
        ]
      },
      select: { 
        certificationName: true,
        issuingOrganization: true
      }
    });

    return requiredCertifications.every(required => 
      candidateCertifications.some(cert =>
        cert.certificationName.toLowerCase().includes(required.toLowerCase()) ||
        cert.issuingOrganization.toLowerCase().includes(required.toLowerCase())
      )
    );
  }
}

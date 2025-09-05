import { prisma } from '@/lib/prisma';
import { 
  CandidateEducation,
  Prisma,
  DegreeType
} from '@/generated/prisma';
import {
  CreateCandidateEducationInput,
  UpdateCandidateEducationInput,
  GetCandidateEducationParams,
  CandidateEducationWithRelations,
  BulkCreateCandidateEducationInput,
  CandidateEducationResponse,
  EducationStatistics
} from '@/types/candidate/education.types';

export class CandidateEducationService {
  /**
   * Get all education records for a candidate
   */
  static async getCandidateEducation({
    candidateId,
    sortBy = 'startDate',
    sortOrder = 'desc',
    includeDescription = true
  }: GetCandidateEducationParams): Promise<CandidateEducationResponse> {
    const orderBy: Prisma.CandidateEducationOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    const education = await prisma.candidateEducation.findMany({
      where: { candidateId },
      orderBy,
      select: {
        id: true,
        candidateId: true,
        institutionName: true,
        degreeType: true,
        fieldOfStudy: true,
        startDate: true,
        endDate: true,
        gpa: true,
        description: includeDescription,
        createdAt: true
      }
    });

    return {
      education: education as CandidateEducationWithRelations[],
      total: education.length
    };
  }

  /**
   * Get a single education record by ID
   */
  static async getCandidateEducationById(
    id: string,
    candidateId: string
  ): Promise<CandidateEducationWithRelations | null> {
    const education = await prisma.candidateEducation.findFirst({
      where: { 
        id,
        candidateId 
      }
    });

    return education as CandidateEducationWithRelations | null;
  }

  /**
   * Create a new education record
   */
  static async createCandidateEducation(
    candidateId: string,
    data: CreateCandidateEducationInput
  ): Promise<CandidateEducationWithRelations> {
    // Check if candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId }
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Create the education record
    const education = await prisma.candidateEducation.create({
      data: {
        candidateId,
        ...data
      }
    });

    return education as CandidateEducationWithRelations;
  }

  /**
   * Bulk create education records
   */
  static async bulkCreateCandidateEducation(
    candidateId: string,
    data: BulkCreateCandidateEducationInput
  ): Promise<CandidateEducationResponse> {
    // Check if candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId }
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Create education records
    await prisma.candidateEducation.createMany({
      data: data.education.map(edu => ({
        candidateId,
        ...edu
      }))
    });

    // Return all education records
    return this.getCandidateEducation({ candidateId });
  }

  /**
   * Update an education record
   */
  static async updateCandidateEducation(
    id: string,
    candidateId: string,
    data: UpdateCandidateEducationInput
  ): Promise<CandidateEducationWithRelations> {
    // Check if the education belongs to the candidate
    const existingEducation = await prisma.candidateEducation.findFirst({
      where: { id, candidateId }
    });

    if (!existingEducation) {
      throw new Error('Education record not found or does not belong to candidate');
    }

    // Validate date logic if dates are being updated
    if (data.startDate || data.endDate) {
      const startDate = data.startDate || existingEducation.startDate;
      const endDate = data.endDate !== undefined ? data.endDate : existingEducation.endDate;
      
      if (endDate && startDate > endDate) {
        throw new Error('End date must be after start date');
      }
    }

    // Update the education record
    const updatedEducation = await prisma.candidateEducation.update({
      where: { id },
      data
    });

    return updatedEducation as CandidateEducationWithRelations;
  }

  /**
   * Delete an education record
   */
  static async deleteCandidateEducation(
    id: string,
    candidateId: string
  ): Promise<void> {
    // Check if the education belongs to the candidate
    const existingEducation = await prisma.candidateEducation.findFirst({
      where: { id, candidateId }
    });

    if (!existingEducation) {
      throw new Error('Education record not found or does not belong to candidate');
    }

    await prisma.candidateEducation.delete({
      where: { id }
    });
  }

  /**
   * Delete multiple education records
   */
  static async deleteMultipleCandidateEducation(
    educationIds: string[],
    candidateId: string
  ): Promise<number> {
    const result = await prisma.candidateEducation.deleteMany({
      where: {
        id: { in: educationIds },
        candidateId
      }
    });

    return result.count;
  }

  /**
   * Get education statistics for a candidate
   */
  static async getCandidateEducationStatistics(
    candidateId: string
  ): Promise<EducationStatistics> {
    const education = await prisma.candidateEducation.findMany({
      where: { candidateId }
    });

    // Calculate statistics
    const byDegreeType = education.reduce((acc, edu) => {
      acc[edu.degreeType] = (acc[edu.degreeType] || 0) + 1;
      return acc;
    }, {} as Record<DegreeType, number>);

    const gpaValues = education
      .filter(edu => edu.gpa !== null)
      .map(edu => edu.gpa as number);
    
    const averageGPA = gpaValues.length > 0
      ? gpaValues.reduce((sum, gpa) => sum + gpa, 0) / gpaValues.length
      : undefined;

    const currentlyStudying = education.filter(edu => !edu.endDate).length;
    const completed = education.filter(edu => edu.endDate).length;

    return {
      totalEducation: education.length,
      byDegreeType,
      averageGPA: averageGPA ? Math.round(averageGPA * 100) / 100 : undefined,
      currentlyStudying,
      completed
    };
  }

  /**
   * Check if candidate has minimum education requirement
   */
  static async checkEducationRequirement(
    candidateId: string,
    requiredDegreeType: DegreeType
  ): Promise<boolean> {
    // Define degree level hierarchy
    const degreeHierarchy: Record<DegreeType, number> = {
      CERTIFICATE: 1,
      DIPLOMA: 2,
      BACHELOR: 3,
      MASTER: 4,
      PHD: 5
    };

    const requiredLevel = degreeHierarchy[requiredDegreeType];
    
    const candidateEducation = await prisma.candidateEducation.findMany({
      where: { candidateId },
      select: { degreeType: true }
    });

    return candidateEducation.some(edu => 
      degreeHierarchy[edu.degreeType] >= requiredLevel
    );
  }
}

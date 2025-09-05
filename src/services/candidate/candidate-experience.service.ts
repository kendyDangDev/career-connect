import { prisma } from '@/lib/prisma';
import { 
  CandidateExperience,
  Prisma,
  EmploymentType
} from '@/generated/prisma';
import {
  CreateCandidateExperienceInput,
  UpdateCandidateExperienceInput,
  GetCandidateExperienceParams,
  CandidateExperienceWithRelations,
  BulkCreateCandidateExperienceInput,
  CandidateExperienceResponse,
  ExperienceStatistics,
  ExperienceSummary
} from '@/types/candidate/experience.types';

export class CandidateExperienceService {
  /**
   * Get all experience records for a candidate
   */
  static async getCandidateExperience({
    candidateId,
    sortBy = 'startDate',
    sortOrder = 'desc',
    includeDescription = true,
    isCurrent
  }: GetCandidateExperienceParams): Promise<CandidateExperienceResponse> {
    const orderBy: Prisma.CandidateExperienceOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    const where: Prisma.CandidateExperienceWhereInput = { candidateId };
    if (isCurrent !== undefined) {
      where.isCurrent = isCurrent;
    }

    const experiences = await prisma.candidateExperience.findMany({
      where,
      orderBy,
      select: {
        id: true,
        candidateId: true,
        companyName: true,
        positionTitle: true,
        employmentType: true,
        startDate: true,
        endDate: true,
        isCurrent: true,
        description: includeDescription,
        achievements: includeDescription,
        createdAt: true
      }
    });

    return {
      experiences: experiences as CandidateExperienceWithRelations[],
      total: experiences.length
    };
  }

  /**
   * Get a single experience record by ID
   */
  static async getCandidateExperienceById(
    id: string,
    candidateId: string
  ): Promise<CandidateExperienceWithRelations | null> {
    const experience = await prisma.candidateExperience.findFirst({
      where: { 
        id,
        candidateId 
      }
    });

    return experience as CandidateExperienceWithRelations | null;
  }

  /**
   * Create a new experience record
   */
  static async createCandidateExperience(
    candidateId: string,
    data: CreateCandidateExperienceInput
  ): Promise<CandidateExperienceWithRelations> {
    // Check if candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId }
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Validate date logic
    if (data.isCurrent && data.endDate) {
      throw new Error('Current position cannot have an end date');
    }
    if (!data.isCurrent && !data.endDate) {
      throw new Error('Non-current position must have an end date');
    }

    // Create the experience record
    const experience = await prisma.candidateExperience.create({
      data: {
        candidateId,
        ...data
      }
    });

    // Update candidate's total experience years
    await this.updateCandidateExperienceYears(candidateId);

    return experience as CandidateExperienceWithRelations;
  }

  /**
   * Bulk create experience records
   */
  static async bulkCreateCandidateExperience(
    candidateId: string,
    data: BulkCreateCandidateExperienceInput
  ): Promise<CandidateExperienceResponse> {
    // Check if candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId }
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Validate all experience data
    data.experiences.forEach((exp, index) => {
      if (exp.isCurrent && exp.endDate) {
        throw new Error(`Experience at index ${index}: Current position cannot have an end date`);
      }
      if (!exp.isCurrent && !exp.endDate) {
        throw new Error(`Experience at index ${index}: Non-current position must have an end date`);
      }
    });

    // Create experience records
    await prisma.candidateExperience.createMany({
      data: data.experiences.map(exp => ({
        candidateId,
        ...exp
      }))
    });

    // Update candidate's total experience years
    await this.updateCandidateExperienceYears(candidateId);

    // Return all experience records
    return this.getCandidateExperience({ candidateId });
  }

  /**
   * Update an experience record
   */
  static async updateCandidateExperience(
    id: string,
    candidateId: string,
    data: UpdateCandidateExperienceInput
  ): Promise<CandidateExperienceWithRelations> {
    // Check if the experience belongs to the candidate
    const existingExperience = await prisma.candidateExperience.findFirst({
      where: { id, candidateId }
    });

    if (!existingExperience) {
      throw new Error('Experience record not found or does not belong to candidate');
    }

    // Validate date logic if dates are being updated
    const isCurrent = data.isCurrent !== undefined ? data.isCurrent : existingExperience.isCurrent;
    const endDate = data.endDate !== undefined ? data.endDate : existingExperience.endDate;
    const startDate = data.startDate || existingExperience.startDate;
    
    if (isCurrent && endDate) {
      throw new Error('Current position cannot have an end date');
    }
    if (!isCurrent && !endDate) {
      throw new Error('Non-current position must have an end date');
    }
    if (endDate && startDate > endDate) {
      throw new Error('End date must be after start date');
    }

    // Update the experience record
    const updatedExperience = await prisma.candidateExperience.update({
      where: { id },
      data
    });

    // Update candidate's total experience years
    await this.updateCandidateExperienceYears(candidateId);

    return updatedExperience as CandidateExperienceWithRelations;
  }

  /**
   * Delete an experience record
   */
  static async deleteCandidateExperience(
    id: string,
    candidateId: string
  ): Promise<void> {
    // Check if the experience belongs to the candidate
    const existingExperience = await prisma.candidateExperience.findFirst({
      where: { id, candidateId }
    });

    if (!existingExperience) {
      throw new Error('Experience record not found or does not belong to candidate');
    }

    await prisma.candidateExperience.delete({
      where: { id }
    });

    // Update candidate's total experience years
    await this.updateCandidateExperienceYears(candidateId);
  }

  /**
   * Delete multiple experience records
   */
  static async deleteMultipleCandidateExperience(
    experienceIds: string[],
    candidateId: string
  ): Promise<number> {
    const result = await prisma.candidateExperience.deleteMany({
      where: {
        id: { in: experienceIds },
        candidateId
      }
    });

    // Update candidate's total experience years
    await this.updateCandidateExperienceYears(candidateId);

    return result.count;
  }

  /**
   * Get experience statistics for a candidate
   */
  static async getCandidateExperienceStatistics(
    candidateId: string
  ): Promise<ExperienceStatistics> {
    const experiences = await prisma.candidateExperience.findMany({
      where: { candidateId }
    });

    // Calculate statistics
    const byEmploymentType = experiences.reduce((acc, exp) => {
      acc[exp.employmentType] = (acc[exp.employmentType] || 0) + 1;
      return acc;
    }, {} as Record<EmploymentType, number>);

    const currentJobs = experiences.filter(exp => exp.isCurrent).length;
    
    // Calculate total years and average duration
    let totalMonths = 0;
    experiences.forEach(exp => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                    (end.getMonth() - start.getMonth());
      totalMonths += months;
    });

    const totalYears = Math.floor(totalMonths / 12);
    const averageJobDuration = experiences.length > 0 ? 
      Math.round(totalMonths / experiences.length) : 0;

    return {
      totalExperiences: experiences.length,
      byEmploymentType,
      totalYearsOfExperience: totalYears,
      currentJobs,
      averageJobDuration
    };
  }

  /**
   * Get experience summary for a candidate
   */
  static async getCandidateExperienceSummary(
    candidateId: string
  ): Promise<ExperienceSummary> {
    const experiences = await prisma.candidateExperience.findMany({
      where: { candidateId },
      select: {
        companyName: true,
        positionTitle: true,
        startDate: true,
        endDate: true,
        isCurrent: true
      }
    });

    // Calculate total years
    let totalMonths = 0;
    experiences.forEach(exp => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                    (end.getMonth() - start.getMonth());
      totalMonths += months;
    });

    const totalYears = Math.floor(totalMonths / 12);

    // Get unique positions and companies
    const positions = [...new Set(experiences.map(exp => exp.positionTitle))];
    const companies = [...new Set(experiences.map(exp => exp.companyName))];

    return {
      totalYears,
      positions,
      companies
    };
  }

  /**
   * Update candidate's total experience years
   */
  private static async updateCandidateExperienceYears(
    candidateId: string
  ): Promise<void> {
    const summary = await this.getCandidateExperienceSummary(candidateId);
    
    await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        experienceYears: summary.totalYears
      }
    });
  }

  /**
   * Check if candidate has minimum experience requirement
   */
  static async checkExperienceRequirement(
    candidateId: string,
    requiredYears: number,
    specificPositions?: string[]
  ): Promise<boolean> {
    const summary = await this.getCandidateExperienceSummary(candidateId);
    
    if (summary.totalYears < requiredYears) {
      return false;
    }

    if (specificPositions && specificPositions.length > 0) {
      return specificPositions.some(position => 
        summary.positions.some(candidatePosition =>
          candidatePosition.toLowerCase().includes(position.toLowerCase())
        )
      );
    }

    return true;
  }
}

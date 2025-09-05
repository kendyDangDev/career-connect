import { prisma } from '@/lib/prisma';
import { 
  CandidateSkill,
  Prisma,
  ProficiencyLevel
} from '@/generated/prisma';
import {
  CreateCandidateSkillInput,
  UpdateCandidateSkillInput,
  GetCandidateSkillsParams,
  CandidateSkillWithRelations,
  BulkCreateCandidateSkillsInput,
  CandidateSkillsResponse
} from '@/types/candidate/skill.types';

export class CandidateSkillService {
  /**
   * Get all skills for a candidate
   */
  static async getCandidateSkills({
    candidateId,
    includeSkillDetails = true
  }: GetCandidateSkillsParams): Promise<CandidateSkillsResponse> {
    const skills = await prisma.candidateSkill.findMany({
      where: { candidateId },
      include: {
        skill: includeSkillDetails
      },
      orderBy: [
        { skill: { category: 'asc' } },
        { proficiencyLevel: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Group skills by category
    const groupedSkills = skills.reduce((acc, skill) => {
      const category = skill.skill.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    }, {} as Record<string, CandidateSkillWithRelations[]>);

    return {
      skills: skills as CandidateSkillWithRelations[],
      groupedSkills,
      total: skills.length
    };
  }

  /**
   * Get a single candidate skill by ID
   */
  static async getCandidateSkillById(
    id: string,
    candidateId: string
  ): Promise<CandidateSkillWithRelations | null> {
    const skill = await prisma.candidateSkill.findFirst({
      where: { 
        id,
        candidateId 
      },
      include: {
        skill: true
      }
    });

    return skill as CandidateSkillWithRelations | null;
  }

  /**
   * Create a new candidate skill
   */
  static async createCandidateSkill(
    candidateId: string,
    data: CreateCandidateSkillInput
  ): Promise<CandidateSkillWithRelations> {
    // Check if candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId }
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Check if skill exists
    const skill = await prisma.skill.findUnique({
      where: { id: data.skillId }
    });

    if (!skill) {
      throw new Error('Skill not found');
    }

    // Check if candidate already has this skill
    const existingSkill = await prisma.candidateSkill.findUnique({
      where: {
        candidateId_skillId: {
          candidateId,
          skillId: data.skillId
        }
      }
    });

    if (existingSkill) {
      throw new Error('Candidate already has this skill');
    }

    // Create the skill
    const candidateSkill = await prisma.candidateSkill.create({
      data: {
        candidateId,
        ...data
      },
      include: {
        skill: true
      }
    });

    return candidateSkill as CandidateSkillWithRelations;
  }

  /**
   * Bulk create candidate skills
   */
  static async bulkCreateCandidateSkills(
    candidateId: string,
    data: BulkCreateCandidateSkillsInput
  ): Promise<CandidateSkillsResponse> {
    // Check if candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId }
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Validate all skill IDs exist
    const skillIds = data.skills.map(s => s.skillId);
    const validSkills = await prisma.skill.findMany({
      where: { id: { in: skillIds } }
    });

    if (validSkills.length !== skillIds.length) {
      throw new Error('One or more skills not found');
    }

    // Get existing skills to avoid duplicates
    const existingSkills = await prisma.candidateSkill.findMany({
      where: {
        candidateId,
        skillId: { in: skillIds }
      }
    });

    const existingSkillIds = new Set(existingSkills.map(s => s.skillId));
    const newSkills = data.skills.filter(s => !existingSkillIds.has(s.skillId));

    if (newSkills.length === 0) {
      throw new Error('All skills already exist for this candidate');
    }

    // Create new skills
    await prisma.candidateSkill.createMany({
      data: newSkills.map(skill => ({
        candidateId,
        ...skill
      }))
    });

    // Return all skills
    return this.getCandidateSkills({ candidateId });
  }

  /**
   * Update a candidate skill
   */
  static async updateCandidateSkill(
    id: string,
    candidateId: string,
    data: UpdateCandidateSkillInput
  ): Promise<CandidateSkillWithRelations> {
    // Check if the skill belongs to the candidate
    const existingSkill = await prisma.candidateSkill.findFirst({
      where: { id, candidateId }
    });

    if (!existingSkill) {
      throw new Error('Skill not found or does not belong to candidate');
    }

    // Update the skill
    const updatedSkill = await prisma.candidateSkill.update({
      where: { id },
      data,
      include: {
        skill: true
      }
    });

    return updatedSkill as CandidateSkillWithRelations;
  }

  /**
   * Delete a candidate skill
   */
  static async deleteCandidateSkill(
    id: string,
    candidateId: string
  ): Promise<void> {
    // Check if the skill belongs to the candidate
    const existingSkill = await prisma.candidateSkill.findFirst({
      where: { id, candidateId }
    });

    if (!existingSkill) {
      throw new Error('Skill not found or does not belong to candidate');
    }

    await prisma.candidateSkill.delete({
      where: { id }
    });
  }

  /**
   * Delete multiple candidate skills
   */
  static async deleteMultipleCandidateSkills(
    skillIds: string[],
    candidateId: string
  ): Promise<number> {
    const result = await prisma.candidateSkill.deleteMany({
      where: {
        id: { in: skillIds },
        candidateId
      }
    });

    return result.count;
  }

  /**
   * Get skill suggestions based on candidate's profile
   */
  static async getSkillSuggestions(
    candidateId: string,
    limit: number = 10
  ): Promise<any[]> {
    // Get candidate's current skills
    const currentSkills = await prisma.candidateSkill.findMany({
      where: { candidateId },
      select: { skillId: true }
    });

    const currentSkillIds = currentSkills.map(s => s.skillId);

    // Get candidate's job applications to find related skills
    const applications = await prisma.application.findMany({
      where: { candidateId },
      include: {
        job: {
          include: {
            jobSkills: {
              include: {
                skill: true
              }
            }
          }
        }
      },
      take: 20
    });

    // Extract skills from job applications
    const suggestedSkillIds = new Set<string>();
    applications.forEach(app => {
      app.job.jobSkills.forEach(jobSkill => {
        if (!currentSkillIds.includes(jobSkill.skillId)) {
          suggestedSkillIds.add(jobSkill.skillId);
        }
      });
    });

    // Get the suggested skills
    const suggestedSkills = await prisma.skill.findMany({
      where: {
        id: { in: Array.from(suggestedSkillIds) },
        isActive: true
      },
      take: limit
    });

    return suggestedSkills;
  }

  /**
   * Validate skill proficiency progression
   */
  static async validateSkillProgression(
    candidateId: string,
    skillId: string,
    newProficiencyLevel: ProficiencyLevel
  ): Promise<boolean> {
    const existingSkill = await prisma.candidateSkill.findUnique({
      where: {
        candidateId_skillId: {
          candidateId,
          skillId
        }
      }
    });

    if (!existingSkill) {
      return true; // New skill, any level is valid
    }

    // Define proficiency level order
    const levelOrder: Record<ProficiencyLevel, number> = {
      BEGINNER: 1,
      INTERMEDIATE: 2,
      ADVANCED: 3,
      EXPERT: 4
    };

    const currentLevel = levelOrder[existingSkill.proficiencyLevel];
    const newLevel = levelOrder[newProficiencyLevel];

    // Allow progression or maintaining current level
    return newLevel >= currentLevel;
  }
}

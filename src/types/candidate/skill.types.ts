import { CandidateSkill, Skill, ProficiencyLevel } from '@/generated/prisma';

export interface CandidateSkillWithRelations extends CandidateSkill {
  skill: Skill;
}

export interface GetCandidateSkillsParams {
  candidateId: string;
  includeSkillDetails?: boolean;
}

export interface CreateCandidateSkillInput {
  skillId: string;
  proficiencyLevel: ProficiencyLevel;
  yearsExperience?: number;
}

export interface UpdateCandidateSkillInput {
  proficiencyLevel?: ProficiencyLevel;
  yearsExperience?: number;
}

export interface BulkCreateCandidateSkillsInput {
  skills: CreateCandidateSkillInput[];
}

export interface CandidateSkillsResponse {
  skills: CandidateSkillWithRelations[];
  groupedSkills: Record<string, CandidateSkillWithRelations[]>;
  total: number;
}

export interface DeleteMultipleSkillsInput {
  skillIds: string[];
}

export interface SkillSuggestion {
  id: string;
  name: string;
  category: string;
  description?: string;
  relevanceScore?: number;
}

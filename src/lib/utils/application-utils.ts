import { 
  ApplicationFilterCriteria, 
  ScoringConfig, 
  MatchDetails,
  ApplicationListItem 
} from "@/types/employer/application";
import { ApplicationStatus, ProficiencyLevel, RequiredLevel } from "@/generated/prisma";

/**
 * Calculate match score for a candidate based on job requirements
 */
export function calculateMatchScore(
  candidate: any,
  jobRequirements: any,
  config: ScoringConfig
): { score: number; details: MatchDetails } {
  const breakdown = {
    skills: calculateSkillsScore(candidate.skills || [], jobRequirements.skills || []),
    experience: calculateExperienceScore(
      candidate.experienceYears || 0,
      jobRequirements.experienceLevel
    ),
    education: calculateEducationScore(
      candidate.education || [],
      jobRequirements.educationRequirements
    ),
    salary: calculateSalaryScore(
      candidate.expectedSalaryMin,
      candidate.expectedSalaryMax,
      jobRequirements.salaryMin,
      jobRequirements.salaryMax
    ),
    location: calculateLocationScore(
      candidate,
      jobRequirements
    ),
    availability: calculateAvailabilityScore(candidate.availabilityStatus)
  };

  // Calculate weighted overall score
  const totalWeight = 
    config.skillsWeight +
    config.experienceWeight +
    config.educationWeight +
    config.salaryExpectationWeight +
    config.locationWeight +
    config.availabilityWeight;

  const overallScore = Math.round(
    (breakdown.skills.score * config.skillsWeight +
     breakdown.experience.score * config.experienceWeight +
     breakdown.education.score * config.educationWeight +
     breakdown.salary.score * config.salaryExpectationWeight +
     breakdown.location.score * config.locationWeight +
     breakdown.availability.score * config.availabilityWeight) / totalWeight
  );

  // Generate insights
  const strengths = generateStrengths(breakdown);
  const concerns = generateConcerns(breakdown);
  const recommendation = getRecommendation(overallScore);

  return {
    score: overallScore,
    details: {
      overallScore,
      breakdown,
      strengths,
      concerns,
      recommendation
    }
  };
}

/**
 * Calculate skills matching score
 */
function calculateSkillsScore(
  candidateSkills: any[],
  requiredSkills: any[]
): any {
  if (!requiredSkills.length) {
    return { score: 100, matched: [], missing: [], details: [] };
  }

  const matched: string[] = [];
  const missing: string[] = [];
  const details: any[] = [];
  let totalScore = 0;
  let totalWeight = 0;

  requiredSkills.forEach(reqSkill => {
    const weight = getSkillWeight(reqSkill.requiredLevel);
    totalWeight += weight;

    const candidateSkill = candidateSkills.find(
      cs => cs.skillId === reqSkill.skillId || cs.skill?.id === reqSkill.skillId
    );

    if (candidateSkill) {
      const levelScore = compareSkillLevels(
        candidateSkill.proficiencyLevel,
        reqSkill.requiredLevel
      );
      
      const yearsScore = candidateSkill.yearsExperience >= (reqSkill.minYearsExperience || 0) 
        ? 100 : (candidateSkill.yearsExperience / (reqSkill.minYearsExperience || 1)) * 100;
      
      const skillScore = (levelScore * 0.7 + yearsScore * 0.3);
      totalScore += skillScore * weight;
      
      matched.push(reqSkill.skill?.name || reqSkill.skillId);
      details.push({
        skillName: reqSkill.skill?.name || reqSkill.skillId,
        required: reqSkill.requiredLevel === RequiredLevel.REQUIRED,
        candidateLevel: candidateSkill.proficiencyLevel,
        requiredLevel: reqSkill.requiredLevel,
        match: skillScore >= 70
      });
    } else {
      missing.push(reqSkill.skill?.name || reqSkill.skillId);
      details.push({
        skillName: reqSkill.skill?.name || reqSkill.skillId,
        required: reqSkill.requiredLevel === RequiredLevel.REQUIRED,
        requiredLevel: reqSkill.requiredLevel,
        match: false
      });
    }
  });

  return {
    score: totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0,
    matched,
    missing,
    details
  };
}

/**
 * Get weight for skill based on required level
 */
function getSkillWeight(requiredLevel: RequiredLevel): number {
  switch (requiredLevel) {
    case RequiredLevel.REQUIRED:
      return 3;
    case RequiredLevel.PREFERRED:
      return 2;
    case RequiredLevel.NICE_TO_HAVE:
      return 1;
    default:
      return 1;
  }
}

/**
 * Compare skill proficiency levels
 */
function compareSkillLevels(candidateLevel: string, requiredLevel: string): number {
  const levels = {
    [ProficiencyLevel.BEGINNER]: 1,
    [ProficiencyLevel.INTERMEDIATE]: 2,
    [ProficiencyLevel.ADVANCED]: 3,
    [ProficiencyLevel.EXPERT]: 4
  };

  const candidateScore = levels[candidateLevel] || 1;
  const requiredScore = levels[requiredLevel] || 2;

  if (candidateScore >= requiredScore) return 100;
  return (candidateScore / requiredScore) * 100;
}

/**
 * Calculate experience score
 */
function calculateExperienceScore(
  candidateYears: number,
  requiredLevel: string
): any {
  const requiredYears = getRequiredExperience(requiredLevel);
  
  if (candidateYears >= requiredYears) {
    return {
      score: 100,
      required: requiredYears,
      actual: candidateYears,
      relevantExperience: []
    };
  }

  const score = Math.round((candidateYears / requiredYears) * 100);
  return {
    score,
    required: requiredYears,
    actual: candidateYears,
    relevantExperience: []
  };
}

/**
 * Get required years of experience based on level
 */
function getRequiredExperience(level: string): number {
  switch (level) {
    case 'ENTRY':
      return 0;
    case 'MID':
      return 3;
    case 'SENIOR':
      return 5;
    case 'LEAD':
      return 8;
    case 'EXECUTIVE':
      return 10;
    default:
      return 2;
  }
}

/**
 * Calculate education score
 */
function calculateEducationScore(
  candidateEducation: any[],
  requirements: any
): any {
  if (!requirements || candidateEducation.length === 0) {
    return {
      score: 50, // Neutral score if not specified
      matchedDegree: false,
      matchedField: false,
      details: "Education not specified"
    };
  }

  // Simple implementation - can be enhanced
  return {
    score: 80,
    matchedDegree: true,
    matchedField: true,
    details: "Education matches requirements"
  };
}

/**
 * Calculate salary expectation score
 */
function calculateSalaryScore(
  candidateMin?: number | null,
  candidateMax?: number | null,
  jobMin?: number | null,
  jobMax?: number | null
): any {
  if (!candidateMin && !candidateMax) {
    return {
      score: 100, // Assume negotiable
      withinBudget: true,
      percentDifference: 0
    };
  }

  if (!jobMin && !jobMax) {
    return {
      score: 100, // No budget specified
      withinBudget: true,
      percentDifference: 0
    };
  }

  const candidateAvg = ((candidateMin || 0) + (candidateMax || candidateMin || 0)) / 2;
  const jobAvg = ((jobMin || 0) + (jobMax || jobMin || 0)) / 2;

  if (candidateMin && jobMax && candidateMin <= jobMax) {
    const overlap = Math.min(candidateMax || candidateMin, jobMax || 0) - 
                   Math.max(candidateMin || 0, jobMin || 0);
    const score = overlap > 0 ? 100 : Math.max(0, 100 - Math.abs(candidateAvg - jobAvg) / jobAvg * 100);
    
    return {
      score: Math.round(score),
      withinBudget: candidateMin <= (jobMax || Infinity),
      percentDifference: Math.round((candidateAvg - jobAvg) / jobAvg * 100)
    };
  }

  return {
    score: 0,
    withinBudget: false,
    percentDifference: Math.round((candidateAvg - jobAvg) / jobAvg * 100)
  };
}

/**
 * Calculate location and work type score
 */
function calculateLocationScore(candidate: any, job: any): any {
  let score = 100;
  let matchesLocation = true;
  let matchesWorkType = true;

  // Check location match
  if (job.locationCity && candidate.user?.profile?.city) {
    matchesLocation = job.locationCity === candidate.user.profile.city;
    if (!matchesLocation) score -= 30;
  }

  // Check work type match
  if (job.workLocationType && candidate.preferredLocationType) {
    matchesWorkType = isWorkTypeCompatible(
      candidate.preferredLocationType,
      job.workLocationType
    );
    if (!matchesWorkType) score -= 20;
  }

  return {
    score: Math.max(0, score),
    matchesLocation,
    matchesWorkType
  };
}

/**
 * Check if work types are compatible
 */
function isWorkTypeCompatible(candidatePref: string, jobType: string): boolean {
  if (candidatePref === jobType) return true;
  if (candidatePref === 'HYBRID' && (jobType === 'REMOTE' || jobType === 'ONSITE')) return true;
  if (jobType === 'HYBRID' && (candidatePref === 'REMOTE' || candidatePref === 'ONSITE')) return true;
  return false;
}

/**
 * Calculate availability score
 */
function calculateAvailabilityScore(status: string): any {
  const score = status === 'AVAILABLE' ? 100 : status === 'PASSIVE' ? 70 : 30;
  
  return {
    score,
    isAvailable: status === 'AVAILABLE',
    startDate: status === 'AVAILABLE' ? 'Immediate' : 'To be discussed'
  };
}

/**
 * Generate strengths based on match breakdown
 */
function generateStrengths(breakdown: any): string[] {
  const strengths = [];
  
  if (breakdown.skills.score >= 80) {
    strengths.push(`Strong skill match (${breakdown.skills.matched.length} matching skills)`);
  }
  if (breakdown.experience.score === 100) {
    strengths.push(`Meets experience requirements (${breakdown.experience.actual} years)`);
  }
  if (breakdown.salary.score >= 90) {
    strengths.push("Salary expectations within budget");
  }
  if (breakdown.availability.score === 100) {
    strengths.push("Available immediately");
  }
  
  return strengths;
}

/**
 * Generate concerns based on match breakdown
 */
function generateConcerns(breakdown: any): string[] {
  const concerns = [];
  
  if (breakdown.skills.score < 50) {
    concerns.push(`Missing key skills: ${breakdown.skills.missing.slice(0, 3).join(', ')}`);
  }
  if (breakdown.experience.score < 70) {
    concerns.push(`Limited experience (${breakdown.experience.actual} years vs ${breakdown.experience.required} required)`);
  }
  if (breakdown.salary.score < 50) {
    concerns.push("Salary expectations above budget");
  }
  if (!breakdown.location.matchesLocation) {
    concerns.push("Different location than job");
  }
  
  return concerns;
}

/**
 * Get recommendation based on overall score
 */
function getRecommendation(score: number): 'STRONG_MATCH' | 'GOOD_MATCH' | 'POTENTIAL_MATCH' | 'POOR_MATCH' {
  if (score >= 85) return 'STRONG_MATCH';
  if (score >= 70) return 'GOOD_MATCH';
  if (score >= 50) return 'POTENTIAL_MATCH';
  return 'POOR_MATCH';
}

/**
 * Apply filters to applications
 */
export function filterApplications(
  applications: ApplicationListItem[],
  filters: ApplicationFilterCriteria
): ApplicationListItem[] {
  return applications.filter(app => {
    // Status filter
    if (filters.status?.length && !filters.status.includes(app.status)) {
      return false;
    }

    // Experience filter
    if (filters.experienceYears) {
      const years = app.candidate.experienceYears || 0;
      if (filters.experienceYears.min !== undefined && years < filters.experienceYears.min) {
        return false;
      }
      if (filters.experienceYears.max !== undefined && years > filters.experienceYears.max) {
        return false;
      }
    }

    // Salary filter
    if (filters.expectedSalary) {
      const minSalary = app.candidate.expectedSalaryMin;
      const maxSalary = app.candidate.expectedSalaryMax;
      
      if (filters.expectedSalary.max !== undefined && minSalary && minSalary > filters.expectedSalary.max) {
        return false;
      }
      if (filters.expectedSalary.min !== undefined && maxSalary && maxSalary < filters.expectedSalary.min) {
        return false;
      }
    }

    // Rating filter
    if (filters.hasRating && !app.rating) {
      return false;
    }
    if (filters.minRating && (!app.rating || app.rating < filters.minRating)) {
      return false;
    }

    // Notes filter
    if (filters.hasNotes && !app.recruiterNotes) {
      return false;
    }

    // Interview filter
    if (filters.hasInterview && !app.interviewScheduledAt) {
      return false;
    }

    // Date range filter
    if (filters.appliedDateRange) {
      const appliedDate = new Date(app.appliedAt);
      if (filters.appliedDateRange.from && appliedDate < new Date(filters.appliedDateRange.from)) {
        return false;
      }
      if (filters.appliedDateRange.to && appliedDate > new Date(filters.appliedDateRange.to)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort applications
 */
export function sortApplications(
  applications: ApplicationListItem[],
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): ApplicationListItem[] {
  const sorted = [...applications].sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case 'appliedAt':
        compareValue = new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();
        break;
      case 'matchScore':
        compareValue = (a.matchScore || 0) - (b.matchScore || 0);
        break;
      case 'status':
        compareValue = a.status.localeCompare(b.status);
        break;
      case 'rating':
        compareValue = (a.rating || 0) - (b.rating || 0);
        break;
      case 'candidate':
        const nameA = `${a.candidate.user.firstName || ''} ${a.candidate.user.lastName || ''}`.trim();
        const nameB = `${b.candidate.user.firstName || ''} ${b.candidate.user.lastName || ''}`.trim();
        compareValue = nameA.localeCompare(nameB);
        break;
    }

    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  return sorted;
}

/**
 * Get default scoring configuration
 */
export function getDefaultScoringConfig(): ScoringConfig {
  return {
    skillsWeight: 35,
    experienceWeight: 25,
    educationWeight: 15,
    salaryExpectationWeight: 10,
    locationWeight: 10,
    availabilityWeight: 5
  };
}

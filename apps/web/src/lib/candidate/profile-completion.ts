import type { CandidateProfileData } from '@/types/candidate/profile.types';

export function getCandidateProfileCompletionScore(values: CandidateProfileData): number {
  const completionChecklist = [
    Boolean(values.user.firstName && values.user.lastName),
    Boolean(values.user.phone),
    Boolean(values.profile.city),
    Boolean(values.profile.country),
    Boolean(values.profile.bio),
    Boolean(values.profile.linkedinUrl),
    Boolean(values.profile.githubUrl),
    Boolean(values.candidate.currentPosition),
    typeof values.candidate.experienceYears === 'number',
    typeof values.candidate.expectedSalaryMin === 'number',
    typeof values.candidate.expectedSalaryMax === 'number',
    Boolean(values.candidate.preferredWorkType),
    Boolean(values.candidate.preferredLocationType),
    Boolean(values.candidate.cvFileUrl),
  ];

  return Math.round(
    (completionChecklist.filter(Boolean).length / completionChecklist.length) * 100
  );
}

import type { CandidateProfileData } from '@/types/candidate/profile.types';

import type { CandidateProfileUserRecord } from './profile.data';

const toDateInputValue = (value: Date | null | undefined) =>
  value ? value.toISOString().slice(0, 10) : null;

const toNumber = (value: { toString(): string } | number | null | undefined) =>
  value === null || value === undefined ? null : Number(value.toString());

export const mapCandidateProfileRecord = (
  user: CandidateProfileUserRecord
): CandidateProfileData => ({
  user: {
    id: user.id,
    email: user.email,
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    phone: user.phone ?? null,
    avatarUrl: user.avatarUrl ?? null,
  },
  profile: {
    dateOfBirth: toDateInputValue(user.profile?.dateOfBirth),
    gender: user.profile?.gender ?? null,
    address: user.profile?.address ?? null,
    city: user.profile?.city ?? null,
    province: user.profile?.province ?? null,
    country: user.profile?.country ?? 'Vietnam',
    bio: user.profile?.bio ?? null,
    websiteUrl: user.profile?.websiteUrl ?? null,
    linkedinUrl: user.profile?.linkedinUrl ?? null,
    githubUrl: user.profile?.githubUrl ?? null,
    portfolioUrl: user.profile?.portfolioUrl ?? null,
  },
  candidate: {
    currentPosition: user.candidate?.currentPosition ?? null,
    experienceYears: user.candidate?.experienceYears ?? null,
    expectedSalaryMin: toNumber(user.candidate?.expectedSalaryMin),
    expectedSalaryMax: toNumber(user.candidate?.expectedSalaryMax),
    currency: user.candidate?.currency ?? 'VND',
    availabilityStatus: user.candidate?.availabilityStatus ?? 'AVAILABLE',
    preferredWorkType: user.candidate?.preferredWorkType ?? null,
    preferredLocationType: user.candidate?.preferredLocationType ?? null,
    cvFileUrl: user.candidate?.cvFileUrl ?? null,
  },
  stats: {
    skills: user.candidate?._count.skills ?? 0,
    experience: user.candidate?._count.experience ?? 0,
    education: user.candidate?._count.education ?? 0,
    certifications: user.candidate?._count.certifications ?? 0,
    cvs: user.candidate?._count.cvs ?? 0,
  },
});

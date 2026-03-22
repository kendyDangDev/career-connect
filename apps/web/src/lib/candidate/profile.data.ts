import type { Prisma } from '@/generated/prisma';

export const candidateProfileSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  avatarUrl: true,
  profile: true,
  candidate: {
    select: {
      currentPosition: true,
      experienceYears: true,
      expectedSalaryMin: true,
      expectedSalaryMax: true,
      currency: true,
      availabilityStatus: true,
      preferredWorkType: true,
      preferredLocationType: true,
      cvFileUrl: true,
      _count: {
        select: {
          skills: true,
          experience: true,
          education: true,
          certifications: true,
          cvs: true,
        },
      },
    },
  },
} satisfies Prisma.UserSelect;

export type CandidateProfileUserRecord = Prisma.UserGetPayload<{
  select: typeof candidateProfileSelect;
}>;

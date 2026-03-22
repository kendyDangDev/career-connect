import type {
  AvailabilityStatusValue,
  GenderValue,
  PreferredLocationTypeValue,
  PreferredWorkTypeValue,
} from '@/lib/validations/candidate/profile.validation';

export interface CandidateProfileData {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    avatarUrl: string | null;
  };
  profile: {
    dateOfBirth: string | null;
    gender: GenderValue | null;
    address: string | null;
    city: string | null;
    province: string | null;
    country: string | null;
    bio: string | null;
    websiteUrl: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    portfolioUrl: string | null;
  };
  candidate: {
    currentPosition: string | null;
    experienceYears: number | null;
    expectedSalaryMin: number | null;
    expectedSalaryMax: number | null;
    currency: string;
    availabilityStatus: AvailabilityStatusValue;
    preferredWorkType: PreferredWorkTypeValue | null;
    preferredLocationType: PreferredLocationTypeValue | null;
    cvFileUrl: string | null;
  };
  stats: {
    skills: number;
    experience: number;
    education: number;
    certifications: number;
    cvs: number;
  };
}

export type CandidateProfileFormValues = CandidateProfileData;

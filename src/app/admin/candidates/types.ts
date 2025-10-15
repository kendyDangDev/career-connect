// Enums and Types
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type AvailabilityStatus = 'AVAILABLE' | 'NOT_AVAILABLE' | 'PASSIVE';
export type PreferredWorkType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE';
export type PreferredLocationType = 'ONSITE' | 'REMOTE' | 'HYBRID';
export type ProficiencyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type DegreeType =
  | 'HIGH_SCHOOL'
  | 'ASSOCIATE'
  | 'BACHELOR'
  | 'MASTER'
  | 'DOCTORATE'
  | 'OTHER';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'INTERNSHIP';

// Candidate interfaces
export interface CandidateEducation {
  id: string;
  institutionName: string;
  degreeType: DegreeType;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
  description?: string;
}

export interface CandidateExperience {
  id: string;
  companyName: string;
  positionTitle: string;
  employmentType: EmploymentType;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  achievements?: string;
}

export interface CandidateSkill {
  id: string;
  skill: {
    id: string;
    name: string;
    category?: string;
  };
  proficiencyLevel: ProficiencyLevel;
  yearsExperience?: number;
}

export interface CandidateCertification {
  id: string;
  certificationName: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface Candidate {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;

  // Profile info
  profile?: {
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    address?: string;
    city?: string;
    province?: string;
    country?: string;
    bio?: string;
    websiteUrl?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  };

  // Candidate specific info
  candidateInfo?: {
    id: string;
    currentPosition?: string;
    experienceYears?: number;
    expectedSalaryMin?: number;
    expectedSalaryMax?: number;
    currency?: string;
    availabilityStatus: AvailabilityStatus;
    preferredWorkType?: PreferredWorkType;
    preferredLocationType?: PreferredLocationType;
    cvFileUrl?: string;
    coverLetter?: string;

    // Related data
    education?: CandidateEducation[];
    experience?: CandidateExperience[];
    skills?: CandidateSkill[];
    certifications?: CandidateCertification[];
  };
}

export interface CandidateListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  status: UserStatus;
  createdAt: string;
  candidateInfo?: {
    currentPosition?: string;
    experienceYears?: number;
    availabilityStatus: AvailabilityStatus;
    preferredWorkType?: PreferredWorkType;
    skills?: Array<{
      skill: { name: string };
    }>;
  };
}

export interface CandidatesQuery {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  availabilityStatus?: string;
  preferredWorkType?: string;
  minExperience?: number;
  maxExperience?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CandidatesResponse {
  success: boolean;
  data: CandidateListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Labels for display
export const availabilityStatusLabels: Record<AvailabilityStatus, string> = {
  AVAILABLE: 'Sẵn sàng',
  NOT_AVAILABLE: 'Không sẵn sàng',
  PASSIVE: 'Bị động',
};

export const availabilityStatusColors: Record<
  AvailabilityStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  AVAILABLE: 'default',
  NOT_AVAILABLE: 'destructive',
  BUSY: 'secondary',
  CONSIDERING: 'outline',
};

export const preferredWorkTypeLabels: Record<PreferredWorkType, string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  CONTRACT: 'Hợp đồng',
  FREELANCE: 'Freelance',
};

export const preferredLocationTypeLabels: Record<PreferredLocationType, string> = {
  ONSITE: 'Tại văn phòng',
  REMOTE: 'Từ xa',
  HYBRID: 'Kết hợp',
};

export const proficiencyLevelLabels: Record<ProficiencyLevel, string> = {
  BEGINNER: 'Mới bắt đầu',
  INTERMEDIATE: 'Trung bình',
  ADVANCED: 'Nâng cao',
  EXPERT: 'Chuyên gia',
};

export const degreeTypeLabels: Record<DegreeType, string> = {
  HIGH_SCHOOL: 'Trung học',
  ASSOCIATE: 'Cao đẳng',
  BACHELOR: 'Cử nhân',
  MASTER: 'Thạc sĩ',
  DOCTORATE: 'Tiến sĩ',
  OTHER: 'Khác',
};

export const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  CONTRACT: 'Hợp đồng',
  FREELANCE: 'Freelance',
  INTERNSHIP: 'Thực tập',
};

export const userStatusLabels: Record<UserStatus, string> = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Không hoạt động',
  SUSPENDED: 'Tạm khóa',
};

export const userStatusColors: Record<UserStatus, 'default' | 'secondary' | 'destructive'> = {
  ACTIVE: 'default',
  INACTIVE: 'secondary',
  SUSPENDED: 'destructive',
};

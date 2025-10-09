// Application Status enum
export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  SCREENING = 'SCREENING',
  INTERVIEWING = 'INTERVIEWING',
  OFFERED = 'OFFERED',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

// Company interface
export interface Company {
  id: string;
  companyName: string;
  logoUrl?: string;
}

// Job interface
export interface Job {
  id: string;
  title: string;
  company: Company;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  location?: string;
  workLocationType?: 'ONSITE' | 'REMOTE' | 'HYBRID';
  jobType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  deadline?: string;
}

// User interface
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  userType?: 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
}

// User Profile interface
export interface UserProfile {
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  city?: string;
  province?: string;
  bio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

// Skill interface
export interface Skill {
  id: string;
  name: string;
  category: 'TECHNICAL' | 'SOFT_SKILL' | 'LANGUAGE';
}

// Candidate Skill interface
export interface CandidateSkill {
  skill: Skill;
  proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  yearsExperience?: number;
}

// Education interface
export interface Education {
  id: string;
  institutionName: string;
  degreeType: 'HIGH_SCHOOL' | 'ASSOCIATE' | 'BACHELOR' | 'MASTER' | 'DOCTORATE';
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isCurrentlyStudying: boolean;
  gpa?: number;
}

// Experience interface
export interface Experience {
  id: string;
  companyName: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrentPosition: boolean;
  description?: string;
}

// Candidate interface
export interface Candidate {
  id: string;
  currentPosition?: string;
  experienceYears?: number;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  availabilityStatus?: 'AVAILABLE' | 'OPEN_TO_OFFERS' | 'NOT_AVAILABLE';
  preferredWorkType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE';
  preferredLocationType?: 'ONSITE' | 'REMOTE' | 'ONSITE_REMOTE';
  cvFileUrl?: string;
  user: User & { profile?: UserProfile };
  skills?: CandidateSkill[];
  education?: Education[];
  experiences?: Experience[];
}

// Timeline Entry interface
export interface TimelineEntry {
  id: string;
  status: ApplicationStatus;
  note?: string;
  createdAt: string;
  changedBy: string;
  user: {
    firstName: string;
    lastName: string;
    userType: 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
  };
}

// Application interface
export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  userId: string;
  status: ApplicationStatus;
  appliedAt: string;
  statusUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
  cvFileUrl?: string;
  coverLetter?: string;
  rating?: number;
  recruiterNotes?: string;
  interviewScheduledAt?: string;
  job: Job;
  candidate?: Candidate;
  timeline?: TimelineEntry[];
}

// API Response interfaces
export interface ApplicationsResponse {
  success: boolean;
  message: string;
  data: {
    applications: Application[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ApplicationDetailResponse {
  success: boolean;
  message: string;
  data: Application;
}

export interface ApplicationStatsResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    byStatus: Record<ApplicationStatus, number>;
  };
}

// Filter interfaces
export interface ApplicationsFilters {
  page?: number;
  limit?: number;
  sortBy?: 'appliedAt' | 'statusUpdatedAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: ApplicationStatus | ApplicationStatus[];
  jobId?: string;
  candidateId?: string;
}

// Update application request
export interface UpdateApplicationRequest {
  status?: ApplicationStatus;
  note?: string;
  rating?: number;
  recruiterNotes?: string;
  interviewScheduledAt?: string;
}

// Error response
export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
}
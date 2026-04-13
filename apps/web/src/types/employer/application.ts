import { Application, ApplicationStatus, Candidate, User, Job } from '@/generated/prisma';

// Application list item with candidate info
export interface ApplicationListItem {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  appliedAt: Date;
  statusUpdatedAt: Date;
  cvFileUrl?: string | null;
  coverLetter?: string | null;
  rating?: number | null;
  recruiterNotes?: string | null;
  interviewScheduledAt?: Date | null;
  candidate: {
    id: string;
    currentPosition?: string | null;
    experienceYears?: number | null;
    expectedSalaryMin?: number | null;
    expectedSalaryMax?: number | null;
    user: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      email: string;
      phone?: string | null;
      avatarUrl?: string | null;
    };
    skills?: {
      skill: {
        id: string;
        name: string;
      };
      proficiencyLevel: string;
      yearsExperience?: number | null;
    }[];
  };
  matchScore?: number; // AI scoring result
  matchDetails?: MatchDetails;
}

// Detailed application with full relations
export interface ApplicationDetail extends Application {
  job: {
    id: string;
    title: string;
    company: {
      id: string;
      companyName: string;
    };
  };
  candidate: {
    id: string;
    currentPosition?: string | null;
    experienceYears?: number | null;
    expectedSalaryMin?: number | null;
    expectedSalaryMax?: number | null;
    availabilityStatus: string;
    preferredWorkType?: string | null;
    preferredLocationType?: string | null;
    cvFileUrl?: string | null;
    user: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      email: string;
      phone?: string | null;
      avatarUrl?: string | null;
      profile?: {
        dateOfBirth?: Date | null;
        gender?: string | null;
        address?: string | null;
        city?: string | null;
        province?: string | null;
        bio?: string | null;
        linkedinUrl?: string | null;
        githubUrl?: string | null;
        portfolioUrl?: string | null;
      } | null;
    };
    skills: {
      skill: {
        id: string;
        name: string;
        category: string;
      };
      proficiencyLevel: string;
      yearsExperience?: number | null;
    }[];
    education: {
      id: string;
      institutionName: string;
      degreeType: string;
      fieldOfStudy: string;
      startDate: Date;
      endDate?: Date | null;
      gpa?: number | null;
    }[];
    experience: {
      id: string;
      companyName: string;
      positionTitle: string;
      employmentType: string;
      startDate: Date;
      endDate?: Date | null;
      isCurrent: boolean;
      description?: string | null;
    }[];
  };
  timeline: {
    id: string;
    status: ApplicationStatus;
    note?: string | null;
    changedBy: string;
    createdAt: Date;
  }[];
}

// Filter criteria for applications
export interface ApplicationFilterCriteria {
  status?: ApplicationStatus[];
  experienceYears?: {
    min?: number;
    max?: number;
  };
  expectedSalary?: {
    min?: number;
    max?: number;
  };
  skills?: {
    skillId: string;
    requiredLevel?: string;
    minYears?: number;
  }[];
  education?: {
    degreeTypes?: string[];
    fieldsOfStudy?: string[];
  };
  location?: {
    cities?: string[];
    provinces?: string[];
  };
  availability?: string[];
  workType?: string[];
  locationType?: string[];
  appliedDateRange?: {
    from?: string;
    to?: string;
  };
  hasRating?: boolean;
  minRating?: number;
  hasNotes?: boolean;
  hasInterview?: boolean;
}

// Scoring configuration
export interface ScoringConfig {
  skillsWeight: number; // 0-100
  experienceWeight: number; // 0-100
  educationWeight: number; // 0-100
  salaryExpectationWeight: number; // 0-100
  locationWeight: number; // 0-100
  availabilityWeight: number; // 0-100
  customCriteria?: {
    field: string;
    weight: number;
    targetValue: any;
  }[];
}

// Match details from AI scoring
export interface MatchDetails {
  overallScore: number; // 0-100
  breakdown: {
    skills: {
      score: number;
      matched: string[];
      missing: string[];
      details: {
        skillName: string;
        required: boolean;
        candidateLevel?: string;
        requiredLevel: string;
        match: boolean;
      }[];
    };
    experience: {
      score: number;
      required: number;
      actual: number;
      relevantExperience: string[];
    };
    education: {
      score: number;
      matchedDegree: boolean;
      matchedField: boolean;
      details: string;
    };
    salary: {
      score: number;
      withinBudget: boolean;
      percentDifference?: number;
    };
    location: {
      score: number;
      matchesLocation: boolean;
      matchesWorkType: boolean;
    };
    availability: {
      score: number;
      isAvailable: boolean;
      startDate?: string;
    };
  };
  strengths: string[];
  concerns: string[];
  recommendation: 'STRONG_MATCH' | 'GOOD_MATCH' | 'POTENTIAL_MATCH' | 'POOR_MATCH';
}

// Application list response
export interface ApplicationListResponse {
  applications: ApplicationListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: ApplicationStats;
  filters: ApplicationFilterCriteria;
}

// Application statistics
export interface ApplicationStats {
  total: number;
  byStatus: {
    status: ApplicationStatus;
    count: number;
    percentage: number;
  }[];
  averageMatchScore: number;
  topCandidates: number;
  newToday: number;
  pendingReview: number;
  scheduledInterviews: number;
}

// Status update DTO
export interface UpdateApplicationStatusDTO {
  status?: ApplicationStatus;
  notes?: string;
  rating?: number; // 1-5
  interviewScheduledAt?: Date | string;
  notifyCandidate?: boolean;
}

export interface ApplicationEmailNotificationResult {
  attempted: boolean;
  sent: boolean;
  warning?: string;
}

export interface UpdateApplicationStatusResult {
  updated: boolean;
  emailNotification: ApplicationEmailNotificationResult;
}

// Bulk update DTO
export interface BulkUpdateApplicationsDTO {
  applicationIds: string[];
  action: 'UPDATE_STATUS' | 'ADD_RATING' | 'ADD_TAG';
  status?: ApplicationStatus;
  rating?: number;
  tag?: string;
  notes?: string;
  notifyCandidates?: boolean;
}

// Note DTO
export interface AddApplicationNoteDTO {
  note: string;
  isPrivate?: boolean; // Internal note vs shared with team
}

// Query parameters for listing
export interface ApplicationListParams {
  page?: number;
  limit?: number;
  sortBy?: 'appliedAt' | 'matchScore' | 'status' | 'rating' | 'candidate';
  sortOrder?: 'asc' | 'desc';
  search?: string; // Search in candidate name, email
  filter?: ApplicationFilterCriteria;
  includeMatchScores?: boolean;
}

// Candidate comparison
export interface CandidateComparison {
  candidates: {
    applicationId: string;
    candidateInfo: ApplicationListItem['candidate'];
    matchScore: number;
    matchDetails: MatchDetails;
  }[];
  comparisonMatrix: {
    criteria: string;
    candidates: {
      applicationId: string;
      value: any;
      score: number;
    }[];
  }[];
  recommendation: string[];
}

// Export data format
export interface ApplicationExportData {
  applicationId: string;
  candidateName: string;
  email: string;
  phone?: string;
  appliedDate: string;
  status: string;
  matchScore?: number;
  rating?: number;
  currentPosition?: string;
  experienceYears?: number;
  skills: string;
  education: string;
  expectedSalary?: string;
  notes?: string;
}

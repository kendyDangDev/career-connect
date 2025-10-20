// Job Detail Types
export interface JobDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  requirements: string;
  benefits: string | null;
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
  workLocationType: 'ONSITE' | 'REMOTE' | 'HYBRID';
  experienceLevel: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  salaryNegotiable: boolean;
  address: string;
  locationCity: string | null;
  locationProvince: string | null;
  locationCountry: string;
  applicationDeadline: string | null;
  status: 'PENDING' | 'ACTIVE' | 'CLOSED' | 'REJECTED';
  featured: boolean;
  urgent: boolean;
  viewCount: number;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  closedAt: string | null;

  // Relations
  company: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    verified: boolean;
  };

  createdBy: {
    id: string;
    fullName: string;
    email: string;
  };

  _count: {
    applications: number;
    savedJobs: number;
  };
}

// Job Detail Response
export interface JobDetailResponse {
  success: boolean;
  data: JobDetail;
}

// Update Job Data
export interface UpdateJobData {
  title?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  jobType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
  workLocationType?: 'ONSITE' | 'REMOTE' | 'HYBRID';
  experienceLevel?: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  salaryNegotiable?: boolean;
  address?: string;
  locationCity?: string;
  locationProvince?: string;
  locationCountry?: string;
  applicationDeadline?: string;
  status?: 'PENDING' | 'ACTIVE' | 'CLOSED' | 'REJECTED';
  featured?: boolean;
  urgent?: boolean;
}

// Update Job Response
export interface UpdateJobResponse {
  success: boolean;
  message: string;
  data: JobDetail;
}

// Job Statistics
export interface JobStats {
  totalViews: number;
  totalApplications: number;
  newApplications: number;
  interviewingCount: number;
  hiredCount: number;
  rejectedCount: number;
  averageTimeToHire: number | null;
}

// Job Application Item
export interface JobApplicationItem {
  id: string;
  status: 'PENDING' | 'REVIEWING' | 'INTERVIEWING' | 'OFFERED' | 'HIRED' | 'REJECTED';
  appliedAt: string;
  reviewedAt: string | null;
  notes: string | null;

  candidate: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    headline: string | null;
  };

  resume: {
    id: string;
    url: string;
    fileName: string;
  } | null;
}

// Job Applications List Response
export interface JobApplicationsResponse {
  success: boolean;
  data: {
    applications: JobApplicationItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    stats: {
      pending: number;
      reviewing: number;
      interviewing: number;
      offered: number;
      hired: number;
      rejected: number;
    };
  };
}

// Application Update Data
export interface UpdateApplicationData {
  status?:
    | 'APPLIED'
    | 'SCREENING'
    | 'INTERVIEWING'
    | 'OFFERED'
    | 'HIRED'
    | 'REJECTED'
    | 'WITHDRAWN';
  notes?: string;
  rating?: number;
  interviewScheduledAt?: string;
  notifyCandidate?: boolean;
}

// Delete Job Response
export interface DeleteJobResponse {
  success: boolean;
  message: string;
}

// Application List Item (from API)
export interface ApplicationListItemAPI {
  id: string;
  jobId: string;
  candidateId: string;
  status: 'PENDING' | 'REVIEWING' | 'INTERVIEWING' | 'OFFERED' | 'HIRED' | 'REJECTED';
  appliedAt: string;
  statusUpdatedAt: string;
  cvFileUrl?: string | null;
  coverLetter?: string | null;
  rating?: number | null;
  recruiterNotes?: string | null;
  interviewScheduledAt?: string | null;
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
  matchScore?: number;
}

// Application Stats
export interface ApplicationStatsAPI {
  total: number;
  byStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
  averageMatchScore: number;
  topCandidates: number;
  newToday: number;
  pendingReview: number;
  scheduledInterviews: number;
}

// Applications List Response (from API)
export interface ApplicationsListResponse {
  success: boolean;
  data: {
    applications: ApplicationListItemAPI[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    stats: ApplicationStatsAPI;
  };
}

// Update Application Status Data
export interface UpdateApplicationStatusData {
  status: 'PENDING' | 'REVIEWING' | 'INTERVIEWING' | 'OFFERED' | 'HIRED' | 'REJECTED';
  notes?: string;
  rating?: number;
  interviewScheduledAt?: string;
  notifyCandidate?: boolean;
}

// Bulk Update Applications Data
export interface BulkUpdateApplicationsData {
  applicationIds: string[];
  action: 'UPDATE_STATUS' | 'ADD_RATING' | 'ADD_TAG';
  status?: 'PENDING' | 'REVIEWING' | 'INTERVIEWING' | 'OFFERED' | 'HIRED' | 'REJECTED';
  rating?: number;
  tag?: string;
  notes?: string;
  notifyCandidates?: boolean;
}

// Application Detail (Full info)
export interface ApplicationDetailAPI {
  id: string;
  jobId: string;
  candidateId: string;
  status: 'PENDING' | 'REVIEWING' | 'INTERVIEWING' | 'OFFERED' | 'HIRED' | 'REJECTED';
  appliedAt: string;
  statusUpdatedAt: string;
  cvFileUrl?: string | null;
  coverLetter?: string | null;
  rating?: number | null;
  recruiterNotes?: string | null;
  interviewScheduledAt?: string | null;
  job: {
    id: string;
    title: string;
    company: {
      id: string;
      name: string;
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
        dateOfBirth?: string | null;
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
      startDate: string;
      endDate?: string | null;
      gpa?: number | null;
    }[];
    experience: {
      id: string;
      companyName: string;
      positionTitle: string;
      employmentType: string;
      startDate: string;
      endDate?: string | null;
      isCurrent: boolean;
      description?: string | null;
    }[];
  };
  timeline?: {
    id: string;
    status: string;
    note?: string | null;
    changedBy: string;
    createdAt: string;
  }[];
}

// Application Detail Response
export interface ApplicationDetailResponse {
  success: boolean;
  data: ApplicationDetailAPI;
}

// API Error Response
export interface ApiErrorResponse {
  success: false;
  error: string;
  errors?: Record<string, string[]>;
}

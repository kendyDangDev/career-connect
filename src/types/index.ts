// Re-export Prisma generated types
export * from '../generated/prisma'

// Additional type definitions for API responses and forms
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// User Profile Management Types
export interface UserProfileFormData {
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: Date
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
  address?: string
  city?: string
  province?: string
  country?: string
  bio?: string
  websiteUrl?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
}

export interface UserProfileWithAvatar extends UserProfileFormData {
  avatarUrl?: string
}

// Candidate Profile Types
export interface CandidateProfileFormData {
  currentPosition?: string
  experienceYears?: number
  expectedSalaryMin?: number
  expectedSalaryMax?: number
  currency?: string
  availabilityStatus?: 'AVAILABLE' | 'NOT_AVAILABLE' | 'PASSIVE'
  preferredWorkType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE'
  preferredLocationType?: 'ONSITE' | 'REMOTE' | 'HYBRID'
  coverLetter?: string
}

// Skills Types
export interface CandidateSkillFormData {
  skillId: string
  proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  yearsExperience?: number
}

export interface SkillWithProficiency {
  id: string
  name: string
  category: 'TECHNICAL' | 'SOFT' | 'LANGUAGE' | 'TOOL'
  proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  yearsExperience?: number
}

// Education Types
export interface CandidateEducationFormData {
  institutionName: string
  degreeType: 'BACHELOR' | 'MASTER' | 'PHD' | 'DIPLOMA' | 'CERTIFICATE'
  fieldOfStudy: string
  startDate: Date
  endDate?: Date
  gpa?: number
  description?: string
}

// Experience Types
export interface CandidateExperienceFormData {
  companyName: string
  positionTitle: string
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
  startDate: Date
  endDate?: Date
  isCurrent?: boolean
  description?: string
  achievements?: string
}

// Certification Types
export interface CandidateCertificationFormData {
  certificationName: string
  issuingOrganization: string
  issueDate: Date
  expiryDate?: Date
  credentialId?: string
  credentialUrl?: string
}

// File Upload Types
export interface FileUploadResponse {
  url: string
  fileName: string
  fileSize: number
  mimeType: string
}

export interface AvatarUploadRequest {
  file: File
  userId: string
}

export interface CVUploadRequest {
  file: File
  candidateId: string
}

// Privacy Settings Types
export interface PrivacySettings {
  profileVisibility: 'PUBLIC' | 'PRIVATE' | 'RECRUITERS_ONLY'
  contactInfoVisible: boolean
  experienceVisible: boolean
  educationVisible: boolean
  skillsVisible: boolean
  allowMessages: boolean
  allowJobAlerts: boolean
}

// Social Media Integration Types
export interface SocialMediaLinks {
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  websiteUrl?: string
}

// Job Types
export interface JobFormData {
  title: string
  description: string
  requirements: string
  benefits?: string
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
  workLocationType: 'ONSITE' | 'REMOTE' | 'HYBRID'
  experienceLevel: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE'
  salaryMin?: number
  salaryMax?: number
  currency?: string
  salaryNegotiable?: boolean
  locationCity?: string
  locationProvince?: string
  locationCountry?: string
  applicationDeadline?: Date
  featured?: boolean
  urgent?: boolean
}

export interface JobWithDetails {
  id: string
  title: string
  slug: string
  description: string
  requirements: string
  benefits?: string
  jobType: string
  workLocationType: string
  experienceLevel: string
  salaryMin?: number
  salaryMax?: number
  currency?: string
  salaryNegotiable: boolean
  locationCity?: string
  locationProvince?: string
  locationCountry?: string
  applicationDeadline?: Date
  status: string
  viewCount: number
  applicationCount: number
  featured: boolean
  urgent: boolean
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  company: {
    id: string
    companyName: string
    companySlug: string
    logoUrl?: string
    city?: string
    province?: string
  }
  jobSkills: Array<{
    skill: {
      id: string
      name: string
      category: string
    }
    requiredLevel: string
    minYearsExperience?: number
  }>
  jobCategories: Array<{
    category: {
      id: string
      name: string
      slug: string
    }
  }>
}

// Application Types
export interface ApplicationFormData {
  jobId: string
  coverLetter?: string
  cvFileUrl?: string
}

export interface ApplicationWithDetails {
  id: string
  coverLetter?: string
  cvFileUrl?: string
  status: string
  appliedAt: Date
  statusUpdatedAt: Date
  recruiterNotes?: string
  rating?: number
  interviewScheduledAt?: Date
  job: {
    id: string
    title: string
    company: {
      id: string
      companyName: string
      logoUrl?: string
    }
  }
  timeline: Array<{
    status: string
    note?: string
    createdAt: Date
    user: {
      firstName?: string
      lastName?: string
    }
  }>
}

// Company Types
export interface CompanyFormData {
  companyName: string
  companySlug: string
  industryId?: string
  companySize?: 'STARTUP_1_10' | 'SMALL_11_50' | 'MEDIUM_51_200' | 'LARGE_201_500' | 'ENTERPRISE_500_PLUS'
  websiteUrl?: string
  description?: string
  address?: string
  city?: string
  province?: string
  country?: string
  phone?: string
  email?: string
  foundedYear?: number
}

export interface CompanyWithDetails {
  id: string
  companyName: string
  companySlug: string
  companySize?: string
  websiteUrl?: string
  description?: string
  logoUrl?: string
  coverImageUrl?: string
  address?: string
  city?: string
  province?: string
  country?: string
  phone?: string
  email?: string
  foundedYear?: number
  verificationStatus: string
  createdAt: Date
  updatedAt: Date
  industry?: {
    id: string
    name: string
    slug: string
  }
  _count: {
    jobs: number
    companyFollowers: number
    companyReviews: number
  }
}

// Review Types
export interface CompanyReviewFormData {
  rating: number
  title: string
  reviewText: string
  pros?: string
  cons?: string
  workLifeBalanceRating?: number
  salaryBenefitRating?: number
  managementRating?: number
  cultureRating?: number
  isAnonymous?: boolean
  employmentStatus: 'CURRENT' | 'FORMER'
  positionTitle?: string
  employmentLength?: string
}

export interface InterviewReviewFormData {
  companyId: string
  jobId?: string
  overallRating: number
  difficultyRating: number
  experienceDescription: string
  interviewQuestions?: string
  processDescription?: string
  outcome: 'OFFER' | 'REJECTION' | 'PENDING'
  recommendation: boolean
  isAnonymous?: boolean
}

// Search and Filter Types
export interface JobSearchFilters {
  query?: string
  location?: string
  jobType?: string[]
  workLocationType?: string[]
  experienceLevel?: string[]
  salaryMin?: number
  salaryMax?: number
  companySize?: string[]
  industries?: string[]
  skills?: string[]
  categories?: string[]
  featured?: boolean
  urgent?: boolean
  sortBy?: 'relevance' | 'date' | 'salary' | 'company'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface CompanySearchFilters {
  query?: string
  location?: string
  industries?: string[]
  companySize?: string[]
  verificationStatus?: string[]
  sortBy?: 'relevance' | 'name' | 'size' | 'founded'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Notification Types
export interface NotificationWithDetails {
  id: string
  type: string
  title: string
  message: string
  data?: any
  isRead: boolean
  createdAt: Date
}

// Message Types
export interface MessageFormData {
  recipientId: string
  subject: string
  content: string
  messageType: 'APPLICATION_MESSAGE' | 'INQUIRY' | 'SYSTEM'
  relatedApplicationId?: string
}

export interface MessageWithDetails {
  id: string
  subject: string
  content: string
  messageType: string
  isRead: boolean
  createdAt: Date
  sender: {
    id: string
    firstName?: string
    lastName?: string
    avatarUrl?: string
  }
  recipient: {
    id: string
    firstName?: string
    lastName?: string
    avatarUrl?: string
  }
  relatedApplication?: {
    id: string
    job: {
      title: string
    }
  }
}

// Dashboard Stats Types
export interface CandidateDashboardStats {
  totalApplications: number
  pendingApplications: number
  interviewsScheduled: number
  profileViews: number
  savedJobs: number
  jobAlerts: number
}

export interface RecruiterDashboardStats {
  activeJobs: number
  totalApplications: number
  pendingApplications: number
  scheduledInterviews: number
  companiesManaged: number
  jobViews: number
}

export interface AdminDashboardStats {
  totalUsers: number
  totalJobs: number
  totalCompanies: number
  totalApplications: number
  activeUsers: number
  newUsersThisWeek: number
  newJobsThisWeek: number
  newCompaniesThisWeek: number
}

// Error Types
export interface ValidationError {
  field: string
  message: string
}

export interface ApiError {
  code: string
  message: string
  details?: ValidationError[]
}

// Pagination Types
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

// Form State Types
export interface FormState<T> {
  data: T
  errors: Record<string, string>
  isSubmitting: boolean
  isDirty: boolean
}

// Session Types (extending NextAuth)
export interface ExtendedUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  userType: 'CANDIDATE' | 'EMPLOYER' | 'ADMIN'
  emailVerified: boolean
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
}

export interface ExtendedSession {
  user: ExtendedUser
  expires: string
}

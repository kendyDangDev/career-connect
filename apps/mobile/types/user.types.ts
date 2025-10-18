// User & UserProfile Types
export enum UserType {
  CANDIDATE = "CANDIDATE",
  EMPLOYER = "EMPLOYER", 
  ADMIN = "ADMIN"
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED"
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
  PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY"
}

export interface User {
  id: string;                    // CUID
  email: string;                 // Unique email address
  firstName?: string;            // User's first name
  lastName?: string;             // User's last name
  phone?: string;                // Vietnamese phone number format
  avatarUrl?: string;            // Profile picture URL
  userType: UserType;            // CANDIDATE | EMPLOYER | ADMIN
  status: UserStatus;            // ACTIVE | INACTIVE | SUSPENDED
  emailVerified: boolean;        // Email verification status
  phoneVerified: boolean;        // Phone verification status
  createdAt: string;             // Account creation timestamp
  updatedAt: string;             // Last update timestamp
  profile?: UserProfile;         // Associated user profile (optional)
}

export interface UserProfile {
  id: string;                    // CUID
  userId: string;                // Reference to User
  dateOfBirth?: string;          // Birth date
  gender?: Gender;               // MALE | FEMALE | OTHER | PREFER_NOT_TO_SAY
  address?: string;              // Street address
  city?: string;                 // City
  province?: string;             // Province
  country?: string;              // Default: "Vietnam"
  bio?: string;                  // Biography/description
  websiteUrl?: string;           // Personal website
  linkedinUrl?: string;          // LinkedIn profile
  githubUrl?: string;            // GitHub profile
  portfolioUrl?: string;         // Portfolio website
  createdAt: string;             // Profile creation timestamp
  updatedAt: string;             // Last update timestamp
  user?: User;                   // Associated user data
}

// Request/Response Types
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  userType?: UserType;
}

export interface UpdateUserProfileRequest {
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  bio?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserResponse {
  success: boolean;
  data?: User;
  error?: string;
  message?: string;
}

export interface UserProfileResponse {
  success: boolean;
  data?: UserProfile;
  error?: string;
  message?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UsersListResponse {
  data: User[];
  meta: PaginationMeta;
}

// Query Parameters
export interface UsersListParams {
  page?: number;
  limit?: number;
  search?: string;
  userType?: UserType;
  status?: UserStatus;
  sortBy?: 'createdAt' | 'updatedAt' | 'email' | 'firstName' | 'lastName';
  sortOrder?: 'asc' | 'desc';
}
export type UserType = 'ADMIN' | 'EMPLOYER' | 'CANDIDATE';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  userType: UserType;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: {
    city: string | null;
    province: string | null;
    country: string | null;
  };
  companyUsers?: Array<{
    company: {
      id: string;
      companyName: string;
    };
  }>;
  candidate?: {
    id: string;
    currentPosition: string | null;
    experienceYears: number | null;
  };
}

export interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: UserType;
  status: UserStatus;
  password?: string;
}

export interface UsersQuery {
  page: number;
  limit: number;
  search?: string;
  userType?: string;
  status?: string;
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

export interface UsersResponse {
  success: boolean;
  data: User[];
  pagination: PaginationInfo;
}

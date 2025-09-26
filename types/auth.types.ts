export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  userType: "CANDIDATE" | "EMPLOYER" | "ADMIN";
  emailVerified: boolean;
  phoneVerified: boolean | Date | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  avatarUrl: string | null;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
  error?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface VerifyEmailCredentials {
  token: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  error?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    emailVerified: boolean | null;
  };
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  error?: string;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
  };
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (
    credentials: RegisterCredentials
  ) => Promise<RegisterResponse | undefined>;
  verifyEmail: (
    credentials: VerifyEmailCredentials
  ) => Promise<VerifyEmailResponse | undefined>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
  getToken: () => Promise<string | null>;
  // Development only
  setMockUser?: (user: User | null) => void;
}

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type {
  User,
  UserProfile,
  UpdateUserRequest,
  UpdateUserProfileRequest,
  ChangePasswordRequest,
  UserResponse,
  UserProfileResponse,
  UsersListParams,
  UsersListResponse
} from "@/types/user.types";

interface ApiError {
  success: false;
  error: string;
  details?: any;
}

class UserService {
  private baseURL: string;
  private tokenKey = "authToken";
  private timeout = 30000;

  constructor() {
    // Get API URL - prioritize environment variable
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

    // For web development, use relative URL to avoid CORS
    if (Platform.OS === 'web' && __DEV__) {
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        this.baseURL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
      }
    }

    console.log('[UserService] Initialized with baseURL:', this.baseURL);
  }

  private async getStoredToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // For web, use localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(this.tokenKey);
        }
        return null;
      } else {
        // For mobile, use SecureStore
        return await SecureStore.getItemAsync(this.tokenKey);
      }
    } catch (error) {
      console.error('[UserService] Error getting stored token:', error);
      return null;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T | ApiError> {
    try {
      const token = await this.getStoredToken();
      
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), this.timeout);
      });

      const fetchPromise = fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      const response = (await Promise.race([
        fetchPromise,
        timeoutPromise,
      ])) as Response;

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Request failed with status ${response.status}`,
          details: data.details,
        };
      }

      return data;
    } catch (error) {
      console.error(`[UserService] Request error for ${endpoint}:`, error);
      
      if (error instanceof Error) {
        if (error.message === "Network request failed") {
          return {
            success: false,
            error: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.",
          };
        }
        if (error.message === "Request timeout") {
          return {
            success: false,
            error: "Yêu cầu quá thời gian chờ. Vui lòng thử lại.",
          };
        }
      }
      
      return {
        success: false,
        error: "Đã có lỗi không xác định xảy ra. Vui lòng thử lại.",
      };
    }
  }

  // Get list of users (paginated)
  async getUsers(params?: UsersListParams): Promise<UsersListResponse | ApiError> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof UsersListParams];
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/users${queryString ? `?${queryString}` : ''}`;

    return await this.makeRequest<UsersListResponse>(endpoint);
  }

  // Get user by ID
  async getUserById(userId: string): Promise<UserResponse | ApiError> {
    return await this.makeRequest<UserResponse>(`/api/users/${userId}`);
  }

  // Get current user
  async getCurrentUser(): Promise<UserResponse | ApiError> {
    const token = await this.getStoredToken();
    if (!token) {
      return {
        success: false,
        error: "Không tìm thấy token xác thực",
      };
    }

    // Decode JWT to get user ID (basic implementation)
    // In production, you might want to use a proper JWT library
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.userId) {
        return await this.getUserById(payload.userId);
      }
    } catch (error) {
      console.error('[UserService] Error decoding token:', error);
    }

    // Fallback: call a /me endpoint if available
    return await this.makeRequest<UserResponse>('/api/users/me');
  }

  // Update user
  async updateUser(userId: string, data: UpdateUserRequest): Promise<UserResponse | ApiError> {
    return await this.makeRequest<UserResponse>(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Change password
  async changePassword(userId: string, data: ChangePasswordRequest): Promise<{ message: string } | ApiError> {
    return await this.makeRequest<{ message: string }>(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfileResponse | ApiError> {
    return await this.makeRequest<UserProfileResponse>(`/api/users/${userId}/profile`);
  }

  // Create or update user profile
  async updateUserProfile(userId: string, data: UpdateUserProfileRequest): Promise<UserProfileResponse | ApiError> {
    return await this.makeRequest<UserProfileResponse>(`/api/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete user profile (admin only)
  async deleteUserProfile(userId: string): Promise<{ message: string } | ApiError> {
    return await this.makeRequest<{ message: string }>(`/api/users/${userId}/profile`, {
      method: 'DELETE',
    });
  }

  // Upload avatar
  async uploadAvatar(userId: string, imageUri: string): Promise<{ avatarUrl: string } | ApiError> {
    try {
      const token = await this.getStoredToken();
      
      const formData = new FormData();
      
      // For React Native
      if (Platform.OS !== 'web') {
        formData.append('avatar', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        } as any);
      } else {
        // For web, convert to blob
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('avatar', blob, 'avatar.jpg');
      }

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), this.timeout);
      });

      const fetchPromise = fetch(`${this.baseURL}/api/users/${userId}/avatar`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const response = (await Promise.race([
        fetchPromise,
        timeoutPromise,
      ])) as Response;

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Không thể tải lên ảnh đại diện',
        };
      }

      return data;
    } catch (error) {
      console.error('[UserService] Upload avatar error:', error);
      return {
        success: false,
        error: 'Đã có lỗi xảy ra khi tải lên ảnh đại diện',
      };
    }
  }

  // Mock data for development
  getMockUserProfile(): UserProfile {
    return {
      id: "mock-profile-id",
      userId: "mock-user-id",
      dateOfBirth: "1990-01-01T00:00:00Z",
      gender: "MALE" as any,
      address: "123 Nguyễn Huệ",
      city: "Hồ Chí Minh",
      province: "Hồ Chí Minh",
      country: "Vietnam",
      bio: "Experienced software developer with 5+ years in web and mobile development. Passionate about creating user-friendly applications.",
      websiteUrl: "https://myportfolio.com",
      linkedinUrl: "https://linkedin.com/in/username",
      githubUrl: "https://github.com/username",
      portfolioUrl: "https://portfolio.dev",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };
  }
}

export default new UserService();
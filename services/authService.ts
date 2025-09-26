import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import Constants from "expo-constants";
import type {
  LoginCredentials,
  RegisterCredentials,
  VerifyEmailCredentials,
  RegisterResponse,
  VerifyEmailResponse,
  AuthResponse,
  User,
} from "@/types/auth.types";

interface ApiError {
  success: false;
  error: string;
  details?: any;
}

class AuthService {
  private baseURL: string;
  private tokenKey = "authToken";
  private userKey = "userData";
  private timeout = 30000; // 30 seconds timeout

  constructor() {
    // Get API URL - prioritize environment variable
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

    // For web development, use relative URL to avoid CORS
    if (Platform.OS === 'web' && __DEV__) {
      // Check if we're running on localhost
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        // Use the backend URL directly if it's on the same machine
        // Or use a proxy URL if you have one configured
        this.baseURL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
      }
    }

    console.log('[AuthService] Initialized with baseURL:', this.baseURL);
    console.log('[AuthService] Platform:', Platform.OS);
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), this.timeout);
      });

      // Call login endpoint
      const loginUrl = `${this.baseURL}/api/auth/mobile/login`;
      console.log('[AuthService] Attempting login to:', loginUrl);
      console.log('[AuthService] Login credentials email:', credentials.email.toLowerCase().trim());
      
      const requestBody = JSON.stringify({
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password,
      });
      
      console.log('[AuthService] Request body:', requestBody);
      
      const fetchPromise = fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: requestBody,
      });

      const response = (await Promise.race([
        fetchPromise,
        timeoutPromise,
      ])) as Response;

      const data: any = await response.json();
      
      // Debug: Log the entire response
      console.log('[AuthService] Login response:', JSON.stringify(data, null, 2));
      console.log('[AuthService] Response status:', response.status);
      console.log('[AuthService] Response ok:', response.ok);

      if (!response.ok || !data.success) {
        // Handle specific error cases
        const errorMessage = this.getErrorMessage(response.status, data);
        throw new Error(errorMessage);
      }
      
      // Debug: Check if token exists in response
      console.log('[AuthService] Token in response:', data.data?.token ? 'Present' : 'Missing');
      console.log('[AuthService] AccessToken in response:', data.data?.accessToken ? 'Present' : 'Missing');
      console.log('[AuthService] RefreshToken in response:', data.data?.refreshToken ? 'Present' : 'Missing');
      console.log('[AuthService] User in response:', data.data?.user ? 'Present' : 'Missing');

      // Store user data and token locally
      await this.saveUserData(data.data.user);
      
      // Save token if provided - check both 'token' and 'accessToken' fields
      const token = data.data.token || data.data.accessToken;
      if (token) {
        console.log('[AuthService] Saving token to storage...');
        await this.setSecureItem(this.tokenKey, token);
        console.log('[AuthService] Token saved successfully');
        
        // Also save refresh token if provided
        if (data.data.refreshToken) {
          console.log('[AuthService] Saving refresh token...');
          await this.setSecureItem('refreshToken', data.data.refreshToken);
        }
      } else {
        console.warn('[AuthService] WARNING: No token received from login API!');
        console.warn('[AuthService] This will cause authentication issues for subsequent API calls');
      }

      // Return the token (either 'token' or 'accessToken' field)
      const returnToken = data.data.token || data.data.accessToken;
      
      return {
        success: true,
        user: data.data.user,
        token: returnToken,
      };
    } catch (error) {
      console.error("Login error:", error);

      if (error instanceof Error) {
        // Handle network errors
        if (error.message === "Network request failed") {
          return {
            success: false,
            error:
              "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.",
          };
        }

        if (error.message === "Request timeout") {
          return {
            success: false,
            error: "Yêu cầu đăng nhập quá thời gian chờ. Vui lòng thử lại.",
          };
        }

        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: "Đã có lỗi không xác định xảy ra. Vui lòng thử lại.",
      };
    }
  }

  async logout(): Promise<void> {
    try {
      const token = await this.getStoredToken();

      // Call logout endpoint with token
      await fetch(`${this.baseURL}/api/auth/mobile/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      // Clear local storage
      await this.clearAuthData();
    } catch (error) {
      console.error("Logout error:", error);
      // Clear local data anyway
      await this.clearAuthData();
    }
  }

  async getStoredUser(): Promise<User | null> {
    try {
      const userDataString = await this.getSecureItem(this.userKey);
      if (userDataString) {
        return JSON.parse(userDataString);
      }
      return null;
    } catch (error) {
      console.error("Error getting stored user:", error);
      return null;
    }
  }

  async getStoredToken(): Promise<string | null> {
    try {
      return await this.getSecureItem(this.tokenKey);
    } catch (error) {
      console.error("Error getting stored token:", error);
      return null;
    }
  }

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), this.timeout);
      });

      // Build request body, excluding empty optional fields
      const requestBody: any = {
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password,
        confirmPassword: credentials.confirmPassword,
        firstName: credentials.firstName.trim(),
        lastName: credentials.lastName.trim(),
        acceptTerms: credentials.acceptTerms,
        acceptPrivacy: credentials.acceptPrivacy,
      };

      // Only include phone if it has a value
      if (credentials.phone && credentials.phone.trim()) {
        requestBody.phone = credentials.phone.trim();
      }

      // Only include dateOfBirth if it has a value
      if (credentials.dateOfBirth && credentials.dateOfBirth.trim()) {
        requestBody.dateOfBirth = credentials.dateOfBirth.trim();
      }

      // Call register endpoint with timeout
      const fetchPromise = fetch(`${this.baseURL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const response = (await Promise.race([
        fetchPromise,
        timeoutPromise,
      ])) as Response;
      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          message:
            data.message ||
            "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
          user: data.user,
        };
      }

      // Handle errors
      return {
        success: false,
        message: data.error || this.getErrorMessage(response.status, data),
        user: {
          id: "",
          email: "",
          firstName: "",
          lastName: "",
          emailVerified: null,
        },
      };
    } catch (error) {
      console.error("Register error:", error);

      if (error instanceof Error) {
        if (error.message === "Network request failed") {
          throw new Error(
            "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet."
          );
        }

        if (error.message === "Request timeout") {
          throw new Error(
            "Yêu cầu đăng ký quá thời gian chờ. Vui lòng thử lại."
          );
        }

        throw error;
      }

      throw new Error("Đã có lỗi không xác định xảy ra. Vui lòng thử lại.");
    }
  }

  async verifyEmail(
    credentials: VerifyEmailCredentials
  ): Promise<VerifyEmailResponse> {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), this.timeout);
      });

      // Call verify email endpoint
      const fetchPromise = fetch(`${this.baseURL}/api/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          token: credentials.token,
        }),
      });

      const response = (await Promise.race([
        fetchPromise,
        timeoutPromise,
      ])) as Response;
      const data = await response.json();

      if (response.ok && data.success) {
        // Save user data if provided
        if (data.user && data.token) {
          await this.saveAuthData(data.user, data.token);
        }

        return {
          success: true,
          message: data.message || "Email đã được xác thực thành công!",
          user: data.user,
        };
      }

      // Handle errors
      return {
        success: false,
        message: data.error || "Mã xác thực không hợp lệ hoặc đã hết hạn.",
        user: {
          id: "",
          email: "",
          emailVerified: false,
        },
      };
    } catch (error) {
      console.error("Verify email error:", error);

      if (error instanceof Error) {
        if (error.message === "Network request failed") {
          throw new Error(
            "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet."
          );
        }

        if (error.message === "Request timeout") {
          throw new Error(
            "Yêu cầu xác thực quá thời gian chờ. Vui lòng thử lại."
          );
        }

        throw error;
      }

      throw new Error("Đã có lỗi không xác định xảy ra. Vui lòng thử lại.");
    }
  }

  async checkAuthStatus(): Promise<boolean> {
    try {
      // Check for stored token
      const token = await this.getStoredToken();
      
      if (!token) {
        console.log('[AuthService] No token found');
        return false;
      }

      // Verify session with backend using token
      const response = await fetch(`${this.baseURL}/api/auth/mobile/verify`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success && data.data.user) {
        // Update stored user data
        await this.setSecureItem(this.userKey, JSON.stringify(data.data.user));
        return true;
      }

      // Token invalid, clear data
      await this.clearAuthData();
      return false;
    } catch (error) {
      console.error("Error checking auth status:", error);
      return false;
    }
  }

  private async setSecureItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        // Fallback to localStorage for web
        console.log(`[AuthService] Setting item in localStorage: ${key}`);
        localStorage.setItem(key, value);
      } else {
        console.log(`[AuthService] Setting item in SecureStore: ${key}`);
        // For physical devices, use WHEN_UNLOCKED for better compatibility
        await SecureStore.setItemAsync(key, value, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED
        });
      }
    } catch (error) {
      console.error(`[AuthService] Error setting secure item ${key}:`, error);
      // Fallback to AsyncStorage if SecureStore fails (Expo Go issue)
      if (Platform.OS !== 'web') {
        try {
          console.warn(`[AuthService] Falling back to AsyncStorage for ${key}`);
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          await AsyncStorage.setItem(key, value);
        } catch (fallbackError) {
          console.error(`[AuthService] AsyncStorage fallback also failed:`, fallbackError);
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  private async getSecureItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        // Fallback to localStorage for web
        return localStorage.getItem(key);
      } else {
        // Try SecureStore first - use WHEN_UNLOCKED for physical devices
        const value = await SecureStore.getItemAsync(key, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED
        });
        if (value) return value;
        
        // Fallback to AsyncStorage if SecureStore returns null
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          const asyncValue = await AsyncStorage.getItem(key);
          if (asyncValue) {
            console.log(`[AuthService] Retrieved ${key} from AsyncStorage fallback`);
            // Migrate to SecureStore if possible
            try {
              await SecureStore.setItemAsync(key, asyncValue, {
                keychainAccessible: SecureStore.WHEN_UNLOCKED
              });
              console.log(`[AuthService] Migrated ${key} to SecureStore`);
            } catch (e) {
              console.warn(`[AuthService] Could not migrate ${key} to SecureStore`);
            }
          }
          return asyncValue;
        } catch {
          return null;
        }
      }
    } catch (error) {
      console.error(`[AuthService] Error getting secure item ${key}:`, error);
      // Try AsyncStorage as fallback
      if (Platform.OS !== 'web') {
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          return await AsyncStorage.getItem(key);
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  private async removeSecureItem(key: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        // Fallback to localStorage for web
        localStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED
        });
        // Also try to remove from AsyncStorage fallback
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          await AsyncStorage.removeItem(key);
        } catch {
          // Ignore AsyncStorage errors
        }
      }
    } catch (error) {
      console.error(`[AuthService] Error removing secure item ${key}:`, error);
      // Try AsyncStorage as fallback
      if (Platform.OS !== 'web') {
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          await AsyncStorage.removeItem(key);
        } catch {
          // Ignore errors
        }
      }
    }
  }

  private async saveAuthData(user: User, token: string): Promise<void> {
    try {
      await this.setSecureItem(this.tokenKey, token);
      await this.setSecureItem(this.userKey, JSON.stringify(user));
    } catch (error) {
      console.error("Error saving auth data:", error);
      throw new Error("Không thể lưu thông tin đăng nhập");
    }
  }
  
  private async saveUserData(user: User): Promise<void> {
    try {
      await this.setSecureItem(this.userKey, JSON.stringify(user));
    } catch (error) {
      console.error("Error saving user data:", error);
      throw new Error("Không thể lưu thông tin người dùng");
    }
  }

  private async clearAuthData(): Promise<void> {
    try {
      await this.removeSecureItem(this.tokenKey);
      await this.removeSecureItem(this.userKey);
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  }

  private getErrorMessage(status: number, data: ApiError): string {
    // Return API error message if available
    if (data.error) {
      return data.error;
    }

    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        return "Thông tin đăng nhập không hợp lệ.";
      case 401:
        return "Email hoặc mật khẩu không chính xác.";
      case 403:
        return "Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt.";
      case 404:
        return "Không tìm thấy tài khoản với email này.";
      case 429:
        return "Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau.";
      case 500:
      case 502:
      case 503:
        return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
      default:
        return "Đăng nhập thất bại. Vui lòng thử lại.";
    }
  }

  // Get current base URL for debugging
  getBaseURL(): string {
    return this.baseURL;
  }
}

export const authService = new AuthService();

import { authService } from "@/services/authService";
import type {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  RegisterResponse,
  User,
  VerifyEmailCredentials,
  VerifyEmailResponse,
} from "@/types/auth.types";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";

export const useAuth = () => {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Check authentication status on mount
  useEffect(() => {
    console.log('[useAuth] Component mounted, checking auth status...');
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log("[useAuth] Checking auth status...");
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const user = await authService.getStoredUser();
      const token = await authService.getStoredToken();
      
      console.log('[useAuth] Retrieved from storage:', {
        hasUser: !!user,
        hasToken: !!token,
        userEmail: user?.email
      });

      if (user && token) {
        const isValid = await authService.checkAuthStatus();
        console.log('[useAuth] Auth validation result:', isValid);
        
        if (isValid) {
          console.log('[useAuth] Setting authenticated state with user:', user.email);
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          console.log('[useAuth] Token invalid, clearing auth state');
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } else {
        // For development: Use mock user if no stored user (remove in production)
        // if (__DEV__) {
        //   console.log("[DEV] No stored user, using mock user for testing");
        //   setAuthState({
        //     user: mockUser,
        //     token: null, // Mock user doesn't have a real token
        //     isAuthenticated: true,
        //     isLoading: false,
        //     error: null,
        //   });
        // } else {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Không thể kiểm tra trạng thái đăng nhập",
      });
    }
  };

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await authService.login(credentials);

        if (response.success && response.user) {
          console.log('[useAuth] Login successful, updating state...');
          
          // Update state first
          setAuthState({
            user: response.user,
            token: response.token || null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Return success response without navigation
          // Let the login screen handle navigation
          return response;
        } else {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: response.error || "Đăng nhập thất bại",
          });
          return response;
        }
      } catch (error) {
        console.error("Login error:", error);
        const errorMessage = error instanceof Error ? error.message : "Đã có lỗi xảy ra";
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: errorMessage,
        });
        return {
          success: false,
          error: errorMessage
        };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      await authService.logout();

      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      // Navigate to login screen
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local state even if logout fails
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Đã có lỗi khi đăng xuất",
      });
      router.replace("/(auth)/login");
    }
  }, [router]);

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  // Get token for API calls that require authentication
  const getToken = useCallback(async (): Promise<string | null> => {
    // First try to get from current state
    if (authState.token) {
      return authState.token;
    }

    // If not in state, get from storage
    const storedToken = await authService.getStoredToken();
    if (storedToken) {
      // Update state with the token
      setAuthState((prev) => ({ ...prev, token: storedToken }));
      return storedToken;
    }

    return null;
  }, [authState.token]);

  // For development testing only
  const setMockUser = useCallback((user: User | null) => {
    if (__DEV__) {
      setAuthState({
        user,
        token: null, // Mock user doesn't have a real token
        isAuthenticated: !!user,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const register = useCallback(
    async (
      credentials: RegisterCredentials
    ): Promise<RegisterResponse | undefined> => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await authService.register(credentials);

        if (response.success) {
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
            error: null,
          }));
          return response;
        } else {
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
            error: response.error || "Đăng ký thất bại",
          }));
          return response;
        }
      } catch (error) {
        console.error("Register error:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Đã có lỗi xảy ra khi đăng ký";
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return {
          success: false,
          message: errorMessage,
          user: {
            id: "",
            email: "",
            firstName: "",
            lastName: "",
            emailVerified: null,
          },
        };
      }
    },
    []
  );

  const verifyEmail = useCallback(
    async (
      credentials: VerifyEmailCredentials
    ): Promise<VerifyEmailResponse | undefined> => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await authService.verifyEmail(credentials);

        if (response.success && response.user) {
          // Update user state after successful verification
          const fullUser = await authService.getStoredUser();
          const token = await authService.getStoredToken();

          if (fullUser) {
            setAuthState({
              user: { ...fullUser, emailVerified: true },
              token: token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            setAuthState((prev) => ({
              ...prev,
              isLoading: false,
              error: null,
            }));
          }
          return response;
        } else {
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
            error: response.error || "Xác thực email thất bại",
          }));
          return response;
        }
      } catch (error) {
        console.error("Verify email error:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Đã có lỗi xảy ra khi xác thực email";
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return {
          success: false,
          message: errorMessage,
          user: {
            id: "",
            email: "",
            emailVerified: false,
          },
        };
      }
    },
    []
  );

  return {
    ...authState,
    login,
    register,
    verifyEmail,
    logout,
    clearError,
    checkAuthStatus,
    getToken,
    // Development only
    ...(__DEV__ && { setMockUser }),
  };
};

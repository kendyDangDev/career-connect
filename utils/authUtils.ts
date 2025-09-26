import { authService } from "@/services/authService";

/**
 * Utility helper để tạo headers cho API calls có authentication
 */
export const createAuthHeaders = async (
  additionalHeaders: Record<string, string> = {}
) => {
  const token = await authService.getStoredToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...additionalHeaders,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Wrapper cho fetch với authentication tự động
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
) => {
  const headers = await createAuthHeaders(
    options.headers as Record<string, string>
  );

  return fetch(url, {
    ...options,
    headers,
  });
};

/**
 * Kiểm tra xem response có phải là lỗi authentication không
 */
export const isAuthError = (response: Response): boolean => {
  return response.status === 401 || response.status === 403;
};

/**
 * Xử lý response và tự động logout nếu token expired
 */
export const handleAuthResponse = async (
  response: Response
): Promise<Response> => {
  if (isAuthError(response)) {
    // Token có thể đã expired, clear auth data
    await authService.logout();
    // Optionally redirect to login
    // router.replace("/(auth)/login");
  }

  return response;
};

import { Platform } from "react-native";

/**
 * Get the appropriate API URL based on platform and environment
 * Handles CORS issues for web development
 */
export const getApiUrl = (): string => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
  
  // For web platform
  if (Platform.OS === "web") {
    // Check if running on localhost
    if (typeof window !== "undefined") {
      const isLocalhost = window.location.hostname === "localhost" || 
                         window.location.hostname === "127.0.0.1";
      
      if (isLocalhost) {
        // Use localhost for API to avoid CORS issues
        console.log("[ApiConfig] Web on localhost detected, using localhost:3000");
        return "http://localhost:3000";
      }
    }
  }
  
  // For mobile platforms or production web
  console.log(`[ApiConfig] Using configured URL: ${configuredUrl}`);
  return configuredUrl;
};

/**
 * Get socket configuration based on platform
 */
export const getSocketConfig = () => {
  const isWeb = Platform.OS === "web";
  const isLocalhost = typeof window !== "undefined" && 
                     (window.location?.hostname === "localhost" || 
                      window.location?.hostname === "127.0.0.1");
  
  return {
    // Disable withCredentials for web localhost to avoid CORS issues
    withCredentials: !(isWeb && isLocalhost),
    // Use localhost URL for web dev
    url: getApiUrl(),
    // Transport preference
    transports: isWeb ? ["polling", "websocket"] : ["websocket", "polling"],
  };
};
import axios, { AxiosInstance, AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../stores/authStore";
import Constants from "expo-constants";

// API base URL - reads from environment variable with fallback
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl;

console.log("🌐 Using API URL:", API_BASE_URL);
console.log("📱 Environment:", __DEV__ ? "Development" : "Production");

// Create axios instance with improved configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 30000,
  // Allow axios to follow redirects
  maxRedirects: 5,
  // Validate status codes
  validateStatus: (status) => status >= 200 && status < 500,
});

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await AsyncStorage.getItem("refresh_token");
    if (!refreshToken) return null;

    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      { refresh_token: refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data || {};
    if (!access_token) return null;

    await AsyncStorage.setItem("access_token", access_token);
    if (refresh_token) {
      await AsyncStorage.setItem("refresh_token", refresh_token);
    }
    if (expires_in) {
      const expiresAt = Date.now() + expires_in * 1000;
      await AsyncStorage.setItem("access_token_expires_at", `${expiresAt}`);
    }

    return access_token as string;
  } catch (error) {
    console.warn("Token refresh failed:", error);
    return null;
  }
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Compatibility rewrite: map any stale /auth/profile calls to /auth/me
      if (typeof config.url === "string") {
        const u = config.url;
        if (u === "/auth/profile" || u.endsWith("/auth/profile")) {
          config.url = u.replace(/\/auth\/profile$/, "/auth/me");
        }
      }
    } catch (error) {
      console.error("Error getting token from storage:", error);
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful requests for debugging
    if (__DEV__) {
      console.log(
        `✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${
          response.status
        }`
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    // Network error handling
    if (!error.response) {
      const errorDetails = {
        message: error.message,
        code: error.code,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullUrl: `${error.config?.baseURL}${error.config?.url}`,
      };

      console.error("❌ Network Error Details:", errorDetails);

      // Provide more specific error messages based on error type
      let userMessage = "Network error - Unable to reach the server.";

      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        userMessage =
          "Connection timeout - The server is taking too long to respond. Please try again.";
      } else if (error.code === "ERR_NETWORK") {
        userMessage =
          "Network error - Unable to reach the server. Please check your internet connection.";
      } else if (
        error.code === "ENOTFOUND" ||
        error.message.includes("Network request failed")
      ) {
        userMessage =
          "Cannot find server - Please check your internet connection and try again.";
      } else if (
        error.message.includes("SSL") ||
        error.message.includes("certificate")
      ) {
        userMessage =
          "Secure connection failed - There may be an issue with the server's security certificate.";
      } else if (!error.response) {
        userMessage =
          "Cannot connect to server. Please check your internet connection and try again.";
      }

      // Override error message for user display
      error.message = userMessage;

      return Promise.reject(error);
    }

    // Handle HTTP errors
    console.error("🚫 API Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });

    if (error.response?.status === 401) {
      const originalRequest = error.config;
      const requestUrl = originalRequest?.url || "";
      const isAuthRequest =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/refresh") ||
        requestUrl.includes("/auth/logout");

      if (!originalRequest || isAuthRequest || (originalRequest as any)._retry) {
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshAccessToken();
      }

      const newToken = await refreshPromise;
      isRefreshing = false;

      if (newToken) {
        (originalRequest as any)._retry = true;
        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${newToken}`,
        };
        return apiClient.request(originalRequest);
      }

      console.log("🔒 Unauthorized - clearing tokens and logging out");
      try {
        await AsyncStorage.multiRemove(["access_token", "refresh_token", "access_token_expires_at"]);
        useAuthStore.getState().logout();
      } catch (storageError) {
        console.error("Error clearing storage:", storageError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Test API connectivity before attempting requests
 * Useful for diagnosing network issues
 */
export const testConnection = async (): Promise<{
  success: boolean;
  error?: string;
  latency?: number;
}> => {
  const startTime = Date.now();
  try {
    // Try to reach the healthcheck endpoint
    const healthUrl = API_BASE_URL.replace("/api/v1", "/api/healthcheck");
    await axios.get(healthUrl, {
      timeout: 10000,
      headers: {
        Accept: "application/json",
      },
    });
    const latency = Date.now() - startTime;
    console.log(`✅ Connection test successful (${latency}ms)`);
    return { success: true, latency };
  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error(`❌ Connection test failed (${latency}ms):`, error.message);
    return {
      success: false,
      error: error.message,
      latency,
    };
  }
};

export default apiClient;

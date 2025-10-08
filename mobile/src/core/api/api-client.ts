import axios, { AxiosInstance, AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../stores/authStore";

// API base URL - update this to your backend URL
const API_BASE_URL = "http://192.168.1.12:8000/api/v1"; // Development - your backend server IP

console.log("Using API URL:", API_BASE_URL);

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

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
  (response) => response,
  async (error: AxiosError) => {
    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });

    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log("Unauthorized - clearing tokens and logging out");
      try {
        await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
        useAuthStore.getState().logout();
      } catch (storageError) {
        console.error("Error clearing storage:", storageError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

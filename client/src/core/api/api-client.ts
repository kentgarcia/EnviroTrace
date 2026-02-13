// Client for FastAPI backend interactions
import axios, { AxiosError, AxiosInstance } from "axios";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";

// API base URL - will default to localhost:8000 if env variable is not set
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://envirotrace-production.up.railway.app/api/v1";

// Log the API URL for debugging
console.log("Using API URL:", API_BASE_URL);

// Create an axios instance for our API calls
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    (config as any).metadata = { startTime: Date.now() };
    const { token } = useAuthStore.getState();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => {
    const meta = (response.config as any)?.metadata;
    if (meta?.startTime) {
      const durationMs = Date.now() - meta.startTime;
      console.log(
        `API ${response.config.method?.toUpperCase()} ${response.config.url} - ${durationMs}ms`
      );
    }
    return response;
  },
  (error: AxiosError) => {
    // Log the error for debugging
    const meta = (error.config as any)?.metadata;
    if (meta?.startTime) {
      const durationMs = Date.now() - meta.startTime;
      console.error(
        `API ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${durationMs}ms (error)`
      );
    }
    console.error("API Error:", error.message, error.code, error.config?.url);

    // Handle unauthorized errors (401) - could trigger logout
    if (error.response?.status === 401) {
      useAuthStore.getState().resetStore();
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// ...existing code...

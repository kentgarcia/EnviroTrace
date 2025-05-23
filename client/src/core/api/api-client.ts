// Client for FastAPI backend interactions
import axios, { AxiosError, AxiosInstance } from "axios";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";

// API base URL - will default to localhost:8000 if env variable is not set
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

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
  (response) => response,
  (error: AxiosError) => {
    // Handle unauthorized errors (401) - could trigger logout
    if (error.response?.status === 401) {
      useAuthStore.getState().resetStore();
    }

    return Promise.reject(error);
  }
);

export default apiClient;

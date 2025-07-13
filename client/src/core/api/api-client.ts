// Client for FastAPI backend interactions
import axios, { AxiosError, AxiosInstance } from "axios";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";

// Type definitions
interface FeeCreate {
  category: string;
  rate: number;
  date_effective: string;
  offense_level: number;
}

interface FeeUpdate {
  category?: string;
  rate?: number;
  date_effective?: string;
  offense_level?: number;
}

// API base URL - will default to localhost:8000 if env variable is not set
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

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
    // Log the error for debugging
    console.error("API Error:", error.message, error.code, error.config?.url);

    // Handle unauthorized errors (401) - could trigger logout
    if (error.response?.status === 401) {
      useAuthStore.getState().resetStore();
    }

    return Promise.reject(error);
  }
);

export default apiClient;

export const fetchFees = async () => {
  const res = await apiClient.get("/fees");
  return res.data;
};

export const createFee = async (fee: FeeCreate) => {
  const res = await apiClient.post("/fees", fee);
  return res.data;
};

export const updateFee = async (fee_id: number, fee: FeeUpdate) => {
  const res = await apiClient.put(`/fees/${fee_id}`, fee);
  return res.data;
};

export const deleteFee = async (fee_id: number) => {
  const res = await apiClient.delete(`/fees/${fee_id}`);
  return res.data;
};

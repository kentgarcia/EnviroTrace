import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/api-client";

interface User {
  id: string;
  email: string;
  username?: string;
  role?: string;
  roles?: string[];
  assigned_roles?: string[];
  is_active?: boolean;
  full_name?: string;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  selectedDashboard: string | null;
  setSelectedDashboard: (dashboard: string | null) => Promise<void>;
  getUserRoles: () => string[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
  finalizeLogin: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  selectedDashboard: null,
  finalizeLogin: () => {
    const { user } = get();
    if (!user) {
      console.warn(
        "finalizeLogin called without an authenticated user context"
      );
      return;
    }
    set({ isAuthenticated: true });
  },

  setSelectedDashboard: async (dashboard: string | null) => {
    try {
      if (dashboard) {
        await AsyncStorage.setItem("selected_dashboard", dashboard);
      } else {
        await AsyncStorage.removeItem("selected_dashboard");
      }
    } catch (e) {
      console.warn("Failed to persist selected dashboard:", e);
    }
    set({ selectedDashboard: dashboard });
  },

  getUserRoles: () => {
    const user = get().user as User | null;
    if (!user) return [];
    const single = (user as any).role;
    const many = (user as any).roles;
    const assigned = (user as any).assigned_roles;
    if (Array.isArray(many) && many.length) return many as string[];
    if (Array.isArray(assigned) && assigned.length) return assigned as string[];
    if (typeof single === "string" && single) return [single];
    if (typeof many === "string" && many) return [many];
    return [];
  },

  login: async (username: string, password: string): Promise<boolean> => {
    try {
      set({ isLoading: true, error: null });

      console.log("🔐 Attempting login for user:", username);
      console.log("📍 API Base URL:", apiClient.defaults.baseURL);

      // Create form data for login
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      console.log("📤 Sending login request...");

      const response = await apiClient.post("/auth/login", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 second timeout for login
      });

      console.log("✅ Login response received:", response.status);

      const { access_token } = response.data;

      if (!access_token) {
        throw new Error("No access token received");
      }

      // Store token securely first
      await AsyncStorage.setItem("access_token", access_token);
      console.log("Token stored successfully");

      // Now fetch user profile with the token
      console.log("Fetching user profile...");
      const profileResponse = await apiClient.get("/auth/me");
      const user = profileResponse.data;

      console.log("Profile fetched. User role:", user.role);

      set({
        user,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        selectedDashboard: null,
      });

      console.log("Login completed successfully");
      return true;
    } catch (error: any) {
      console.error("❌ Login error:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
      });

      let message = "Login failed";

      // Prioritize user-friendly messages
      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        message =
          "Connection timeout. Please check your internet connection and try again.";
      } else if (
        error.code === "ERR_NETWORK" ||
        error.message.includes("Network request failed")
      ) {
        message =
          "Network error - Unable to reach the server. Please check your internet connection.";
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 422
      ) {
        // Authentication errors from server
        message =
          error.response?.data?.detail || "Invalid username or password";
      } else if (error.response?.data?.detail) {
        message = error.response.data.detail;
      } else if (error.message) {
        message = error.message;
      }

      set({
        error: message,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
      return false;
    }
  },

  logout: async () => {
    try {
      console.log("Logging out user");

      // Clear stored tokens
      await AsyncStorage.multiRemove([
        "access_token",
        "refresh_token",
        "selected_dashboard",
      ]);
      console.log("Tokens cleared from storage");

      set({
        user: null,
        isAuthenticated: false,
        error: null,
        selectedDashboard: null,
      });

      console.log("Logout completed");
    } catch (error) {
      console.error("Logout error:", error);

      // Even if there's an error, still clear the local state
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });

      const token = await AsyncStorage.getItem("access_token");
      console.log("Checking auth. Token exists:", !!token);

      if (!token) {
        console.log("No token found, user not authenticated");
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      console.log("Token found, verifying with server");
      const response = await apiClient.get("/auth/me");
      const user = response.data;

      console.log("Profile retrieved. User role:", user.role);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Load previously selected dashboard if available
      try {
        const saved = await AsyncStorage.getItem("selected_dashboard");
        if (saved) set({ selectedDashboard: saved });
      } catch (e) {
        console.warn("Failed to load selected dashboard:", e);
      }

      console.log("Auth check completed successfully");
    } catch (error: any) {
      console.error("Auth check error:", error);

      // If auth check fails, logout the user
      await get().logout();
      set({ isLoading: false });
    }
  },

  refreshProfile: async () => {
    try {
      if (!get().isAuthenticated) {
        return;
      }

      console.log("Refreshing user profile");
      const response = await apiClient.get("/auth/me");
      const user = response.data;

      set({ user });
      console.log("Profile refreshed successfully");
    } catch (error) {
      console.error("Profile refresh error:", error);
      // Don't logout on profile refresh error, just log it
    }
  },

  clearError: () => {
    console.log("Clearing auth error");
    set({ error: null });
  },
}));

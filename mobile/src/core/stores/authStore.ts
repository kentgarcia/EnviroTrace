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
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  selectedDashboard: null,

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

      // Create form data for login
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      console.log("Attempting login for user:", username);

      const response = await apiClient.post("/auth/login", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Raw login response:", response.data);

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
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      console.log("Login completed successfully");
      return true;
    } catch (error: any) {
      console.error("Login error:", error);

      let message = "Login failed";
      if (error.response?.data?.detail) {
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

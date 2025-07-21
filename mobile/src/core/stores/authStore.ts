import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/api-client";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  is_active: boolean;
  full_name?: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
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
      const profileResponse = await apiClient.get("/auth/profile");
      const user = profileResponse.data;

      console.log("Profile fetched. User role:", user.role);

      // Check if user has required role for government emission
      const userRole = user.role || user.roles || "";
      const hasRequiredRole =
        userRole === "admin" ||
        userRole === "government_emission" ||
        (Array.isArray(userRole) &&
          (userRole.includes("admin") ||
            userRole.includes("government_emission")));

      if (!hasRequiredRole) {
        console.log("Access denied. User role:", userRole);
        // Clear the token since user doesn't have access
        await AsyncStorage.removeItem("access_token");
        set({
          error: "Access denied. Government emission role required.",
          isLoading: false,
          isAuthenticated: false,
          user: null,
        });
        return false;
      }

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

      // Try to call logout endpoint if possible
      try {
        await apiClient.post("/auth/logout");
      } catch (error) {
        console.log("Logout endpoint call failed (may be expected):", error);
      }

      // Clear stored tokens
      await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
      console.log("Tokens cleared from storage");

      set({
        user: null,
        isAuthenticated: false,
        error: null,
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
      const response = await apiClient.get("/auth/profile");
      const user = response.data;

      console.log("Profile retrieved. User role:", user.role);

      // Check role again on auth check
      const userRole = user.role || user.roles || "";
      const hasRequiredRole =
        userRole === "admin" ||
        userRole === "government_emission" ||
        (Array.isArray(userRole) &&
          (userRole.includes("admin") ||
            userRole.includes("government_emission")));

      if (!hasRequiredRole) {
        console.log("Access denied on auth check. User role:", userRole);
        await get().logout();
        return;
      }

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

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
      const response = await apiClient.get("/auth/profile");
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

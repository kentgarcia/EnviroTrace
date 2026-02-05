import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/api-client";
import { checkNetworkConnectivity } from "../utils/network";

interface User {
  id: string;
  email: string;
  username?: string;
  role?: string;
  roles?: string[];
  assigned_roles?: string[];
  permissions?: string[];
  is_super_admin?: boolean;
  isSuperAdmin?: boolean;
  is_approved?: boolean;
  email_confirmed_at?: string | null;
  is_active?: boolean;
  full_name?: string;
  created_at?: string;
}

const USER_STORAGE_KEY = "auth_user_profile";

const persistUserProfile = async (user: User | null) => {
  try {
    if (!user) {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      return;
    }
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.warn("Failed to persist user profile:", error);
  }
};

const loadPersistedUser = async (): Promise<User | null> => {
  try {
    const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch (error) {
    console.warn("Failed to load persisted user profile:", error);
    return null;
  }
};

const persistTokens = async (tokens: {
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresIn?: number | null;
}) => {
  if (tokens.accessToken !== undefined) {
    if (tokens.accessToken) {
      await AsyncStorage.setItem("access_token", tokens.accessToken);
    } else {
      await AsyncStorage.removeItem("access_token");
    }
  }
  if (tokens.refreshToken !== undefined) {
    if (tokens.refreshToken) {
      await AsyncStorage.setItem("refresh_token", tokens.refreshToken);
    } else {
      await AsyncStorage.removeItem("refresh_token");
    }
  }
  if (tokens.expiresIn !== undefined) {
    if (tokens.expiresIn) {
      const expiresAt = Date.now() + tokens.expiresIn * 1000;
      await AsyncStorage.setItem("access_token_expires_at", `${expiresAt}`);
    } else {
      await AsyncStorage.removeItem("access_token_expires_at");
    }
  }
};

const refreshSession = async (): Promise<string | null> => {
  try {
    const refreshToken = await AsyncStorage.getItem("refresh_token");
    if (!refreshToken) return null;

    const response = await apiClient.post("/auth/refresh", {
      refresh_token: refreshToken,
    });

    const { access_token, refresh_token, expires_in } = response.data || {};
    if (!access_token) return null;

    await persistTokens({
      accessToken: access_token,
      refreshToken: refresh_token || refreshToken,
      expiresIn: expires_in || null,
    });

    return access_token as string;
  } catch (error) {
    console.warn("Failed to refresh session:", error);
    return null;
  }
};

const extractRoles = (user: User | null): string[] => {
  if (!user) return [];
  const single = (user as any).role;
  const many = (user as any).roles;
  const assigned = (user as any).assigned_roles;
  if (Array.isArray(many) && many.length) return many as string[];
  if (Array.isArray(assigned) && assigned.length) return assigned as string[];
  if (typeof single === "string" && single) return [single];
  if (typeof many === "string" && many) return [many];
  return [];
};

const normalizePermissions = (user: User | null): string[] => {
  if (!user?.permissions || !Array.isArray(user.permissions)) return [];
  return user.permissions;
};

const resolveIsSuperAdmin = (user: User | null): boolean => {
  if (!user) return false;
  const flag = user.is_super_admin ?? user.isSuperAdmin;
  if (typeof flag === "boolean") return flag;
  const roles = extractRoles(user);
  return roles.includes("admin") || roles.includes("super_admin");
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: string[];
  isSuperAdmin: boolean;
  selectedDashboard: string | null;
  setSelectedDashboard: (dashboard: string | null) => Promise<void>;
  getUserRoles: () => string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
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
  permissions: [],
  isSuperAdmin: false,
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
    return extractRoles(get().user as User | null);
  },

  hasPermission: (permission: string) => {
    if (get().isSuperAdmin) return true;
    return get().permissions.includes(permission);
  },

  hasAnyPermission: (permissions: string[]) => {
    if (get().isSuperAdmin) return true;
    const userPermissions = get().permissions;
    return permissions.some((perm) => userPermissions.includes(perm));
  },

  hasAllPermissions: (permissions: string[]) => {
    if (get().isSuperAdmin) return true;
    const userPermissions = get().permissions;
    return permissions.every((perm) => userPermissions.includes(perm));
  },

  login: async (username: string, password: string): Promise<boolean> => {
    try {
      set({ isLoading: true, error: null });

      console.log("🔐 Attempting login for user:", username);
      console.log("📍 API Base URL:", apiClient.defaults.baseURL);

      // Get device information
      const deviceName = `${
        require("expo-constants").default.deviceName || "Unknown Device"
      }`;

      // Create form data for login
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      console.log("📤 Sending login request...");

      const response = await apiClient.post("/auth/login", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-Device-Type": "mobile",
          "X-Device-Name": deviceName,
        },
        timeout: 30000, // 30 second timeout for login
      });

      console.log("✅ Login response received:", response.status);

      const { access_token, refresh_token, expires_in } = response.data;

      if (!access_token) {
        throw new Error("No access token received");
      }

      // Store token securely first
      await persistTokens({
        accessToken: access_token,
        refreshToken: refresh_token || null,
        expiresIn: expires_in || null,
      });
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
        permissions: normalizePermissions(user),
        isSuperAdmin: resolveIsSuperAdmin(user),
        selectedDashboard: null,
      });
      await persistUserProfile(user);

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
        permissions: [],
        isSuperAdmin: false,
      });
      await persistUserProfile(null);
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
        "access_token_expires_at",
        "selected_dashboard",
      ]);
      console.log("Tokens cleared from storage");

      set({
        user: null,
        isAuthenticated: false,
        error: null,
        permissions: [],
        isSuperAdmin: false,
        selectedDashboard: null,
      });
      await persistUserProfile(null);

      console.log("Logout completed");
    } catch (error) {
      console.error("Logout error:", error);

      // Even if there's an error, still clear the local state
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        permissions: [],
        isSuperAdmin: false,
      });
      await persistUserProfile(null);
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

      const network = await checkNetworkConnectivity();
      if (!network.isConnected) {
        const persisted = await loadPersistedUser();
        set({
          user: persisted,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          permissions: normalizePermissions(persisted),
          isSuperAdmin: resolveIsSuperAdmin(persisted),
        });
        try {
          const saved = await AsyncStorage.getItem("selected_dashboard");
          if (saved) set({ selectedDashboard: saved });
        } catch (e) {
          console.warn("Failed to load selected dashboard:", e);
        }
        return;
      }

      console.log("Token found, verifying with server");
      let response = await apiClient.get("/auth/me");
      let user = response.data;
      if (response.status === 401) {
        const refreshed = await refreshSession();
        if (refreshed) {
          response = await apiClient.get("/auth/me");
          user = response.data;
        }
      }

      if (response.status !== 200) {
        throw new Error("Unable to validate session");
      }

      console.log("Profile retrieved. User role:", user.role);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        permissions: normalizePermissions(user),
        isSuperAdmin: resolveIsSuperAdmin(user),
      });
      await persistUserProfile(user);

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
      const refreshed = await refreshSession();
      if (refreshed) {
        try {
          const response = await apiClient.get("/auth/me");
          const user = response.data;
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            permissions: normalizePermissions(user),
            isSuperAdmin: resolveIsSuperAdmin(user),
          });
          await persistUserProfile(user);
          return;
        } catch (retryError) {
          console.error("Auth retry failed:", retryError);
        }
      }
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

      set({
        user,
        permissions: normalizePermissions(user),
        isSuperAdmin: resolveIsSuperAdmin(user),
      });
      await persistUserProfile(user);
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

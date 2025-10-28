// Auth service for FastAPI backend
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback } from "react";
import apiClient from "./api-client";
import { UserData, UserRole } from "@/integrations/types/userData";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";

// Interface for login data
interface LoginCredentials {
  email: string;
  password: string;
}

// Interface for registration data
interface RegisterCredentials {
  email: string;
  password: string;
}

// Interface for token response
interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Login user with email and password
const loginUser = async (
  credentials: LoginCredentials
): Promise<TokenResponse> => {
  console.log("Attempting login with email:", credentials.email);

  const formData = new URLSearchParams();
  formData.append("username", credentials.email); // FastAPI OAuth2 expects 'username'
  formData.append("password", credentials.password);

  // Detect device type
  const deviceType = "desktop";
  const deviceName = navigator.userAgent.includes("Electron")
    ? "Electron Desktop App"
    : `${navigator.platform} - ${navigator.userAgent.split(" ")[0]}`;

  try {
    const { data } = await apiClient.post<TokenResponse>(
      "/auth/login",
      formData.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Device-Type": deviceType,
          "X-Device-Name": deviceName,
        },
      }
    );
    console.log("Login successful, received token");
    return data;
  } catch (error) {
    console.error("Login error details:", error);
    throw error;
  }
};

// Register a new user
const registerUser = async (
  credentials: RegisterCredentials
): Promise<UserData> => {
  const { data } = await apiClient.post<UserData>(
    "/auth/register",
    credentials
  );
  return data;
};

// Get current user profile
const getCurrentUser = async (): Promise<UserData> => {
  const { data } = await apiClient.get<UserData>("/auth/me");
  return data;
};

// React Query Hooks
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Store the token
      useAuthStore.getState().setToken(data.access_token);

      // Fetch user data after successful login
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: (error) => {
      console.error("Login failed:", error);
      // Clear any existing auth data on login failure
      useAuthStore.getState().resetStore();
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: registerUser,
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });
}
export function useCurrentUser() {
  const { token } = useAuthStore();

  const query = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled: !!token, // Only run if token exists
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Handle successful data fetch
  useEffect(() => {
    if (query.data) {
      // Extract roles from user data (handle both roles and assigned_roles)
      const roles = query.data.assigned_roles || query.data.roles || [];

      // Update auth store with user data
      useAuthStore.getState().setRoles(roles as UserRole[]);
      useAuthStore.getState().setUserData({
        id: query.data.id,
        email: query.data.email,
        lastSignInAt: query.data.lastSignInAt || query.data.last_sign_in_at,
        isSuperAdmin:
          query.data.isSuperAdmin || query.data.is_super_admin || false,
      });
    }
  }, [query.data]);

  // Handle errors
  useEffect(() => {
    if (query.error) {
      console.error("Failed to fetch user data:", query.error);
      // Clear auth store on error (e.g., invalid token)
      if ((query.error as any)?.response?.status === 401) {
        useAuthStore.getState().resetStore();
      }
    }
  }, [query.error]);

  return query;
}

// Hook for logging out
export function useLogout() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    useAuthStore.getState().resetStore();
    queryClient.clear(); // Clear all queries
    return true;
  }, [queryClient]);
}

// Function for logging out (without using hooks - for compatibility)
export function logout() {
  useAuthStore.getState().resetStore();
  return true;
}

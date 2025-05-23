/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";
import { UserData, UserRole } from "@/integrations/types/userData";
import { useCurrentUser, useLogin, useRegister, logout } from "./auth-service";

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  try {
    // Use the login mutation directly without the hook (for compatibility)
    const loginMutation = useLogin();
    const tokenResponse = await loginMutation.mutateAsync({ email, password });

    // Since this is called outside of a component, we need to fetch user data manually
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"
      }/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    const user = await response.json();

    // Extract and store user roles
    const roles = user.roles || [];
    if (roles.length > 0) {
      useAuthStore.getState().setRoles(roles as UserRole[]);
    }

    // Store user data
    useAuthStore.getState().setUserData({
      id: user.id,
      email: user.email,
      lastSignInAt: user.lastSignInAt,
      isSuperAdmin: user.isSuperAdmin || false,
    });

    return {
      token: tokenResponse.access_token,
      user,
    };
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
}

/**
 * Register a new user
 */
export async function signUp(email: string, password: string) {
  try {
    // Use the register mutation directly (for compatibility)
    const registerMutation = useRegister();
    await registerMutation.mutateAsync({ email, password });

    // After registration, sign in to get the token
    return signIn(email, password);
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    // Use the logout function from auth-service
    logout();
    return true;
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
}

/**
 * Get the current user data from the API
 */
export async function getCurrentUser(): Promise<UserData> {
  try {
    const { token } = useAuthStore.getState();

    if (!token) {
      throw new Error("No authentication token");
    }

    // Fetch current user manually (for compatibility with old code)
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"
      }/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    const data = await response.json();

    // Extract and store user roles
    const roles = data.roles || [];
    if (roles.length > 0) {
      useAuthStore.getState().setRoles(roles as UserRole[]);
    }

    // Store user data
    useAuthStore.getState().setUserData({
      id: data.id,
      email: data.email,
      lastSignInAt: data.lastSignInAt,
      isSuperAdmin: data.isSuperAdmin || false,
    });

    return data;
  } catch (error) {
    console.error("Get current user error:", error);
    throw error;
  }
}

// Note: Duplicate signUp and signOut functions removed as they are already defined above

/**
 * Hook for authentication state and methods
 * This updated version uses TanStack Query underneath while maintaining
 * the same API for backwards compatibility with existing code
 */
export function useAuth() {
  const { token } = useAuthStore();

  // Use TanStack Query hooks for auth operations
  const { data: user, isLoading, isError, error } = useCurrentUser();

  // Effect to handle auth errors
  useEffect(() => {
    if (isError) {
      const authError = error as Error;
      console.error("Auth error:", authError?.message);
      useAuthStore.getState().resetStore();
    }
  }, [isError, error]);

  // Effect to handle successful auth
  useEffect(() => {
    if (user && token && typeof user === "object" && "id" in user) {
      // Make sure user data is in sync with auth store
      useAuthStore.getState().setUserData({
        id: (user as any).id,
        email: (user as any).email,
        lastSignInAt: (user as any).lastSignInAt,
        isSuperAdmin: (user as any).isSuperAdmin || false,
      });

      if ((user as any).roles) {
        useAuthStore.getState().setRoles((user as any).roles as UserRole[]);
      }
    }
  }, [user, token]);

  return {
    user,
    loading: isLoading,
    isAuthenticated: !!token && !!user,
    error: isError ? error : null,
    signIn,
    signUp,
    signOut,
  };
}

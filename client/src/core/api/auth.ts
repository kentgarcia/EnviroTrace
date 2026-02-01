/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";
import { UserData, UserRole } from "@/integrations/types/userData";
import {
  useCurrentUser,
  useLogin,
  useRegister,
  useLogout,
} from "./auth-service";

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

    // Extract and store user roles (handle both roles and assigned_roles)
    const roles = user.assigned_roles || user.roles || [];
    if (roles.length > 0) {
      useAuthStore.getState().setRoles(roles as UserRole[]);
    }

    // Extract and store user permissions
    const permissions = user.permissions || [];
    useAuthStore.getState().setPermissions(permissions);

    // Store user data (handle both camelCase and snake_case fields)
    useAuthStore.getState().setUserData({
      id: user.id,
      email: user.email,
      lastSignInAt: user.lastSignInAt || user.last_sign_in_at,
      isSuperAdmin: user.isSuperAdmin || user.is_super_admin || false,
      permissions: permissions,
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

    // Extract and store user roles (handle both roles and assigned_roles)
    const roles = data.assigned_roles || data.roles || [];
    if (roles.length > 0) {
      useAuthStore.getState().setRoles(roles as UserRole[]);
    }

    // Extract and store user permissions
    const permissions = data.permissions || [];
    useAuthStore.getState().setPermissions(permissions);

    // Store user data (handle both camelCase and snake_case fields)
    useAuthStore.getState().setUserData({
      id: data.id,
      email: data.email,
      lastSignInAt: data.lastSignInAt || data.last_sign_in_at,
      isSuperAdmin: data.isSuperAdmin || data.is_super_admin || false,
      permissions: permissions,
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
  const currentUserQuery = useCurrentUser();
  const logoutFn = useLogout();
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = currentUserQuery ?? {
    data: null,
    isLoading: false,
    isError: false,
    error: null,
  };

  // Custom signOut function that uses the logout hook
  const signOut = useCallback(async () => {
    try {
      logoutFn();
      return true;
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }, [logoutFn]);

  // Effect to handle auth errors
  useEffect(() => {
    if (isError && error) {
      const authError = error as Error;
      console.error("Auth error:", authError?.message);
      useAuthStore.getState().resetStore();
    }
  }, [isError, error]);

  // Effect to handle successful auth
  useEffect(() => {
    if (user && token && typeof user === "object" && "id" in user) {
      // Create a normalized user data object with our expected property names
      const userData: UserData = {
        id: (user as any).id,
        email: (user as any).email,
        lastSignInAt:
          (user as any).lastSignInAt || (user as any).last_sign_in_at,
        isSuperAdmin:
          (user as any).isSuperAdmin || (user as any).is_super_admin || false,
        // Map both types of role structures
        roles: (user as any).roles || [],
        assigned_roles: (user as any).assigned_roles || [],
        // Map permissions
        permissions: (user as any).permissions || [],
      };

      // Store user data in auth store
      useAuthStore.getState().setUserData(userData);

      // Use assigned_roles if available, otherwise use roles (keep one source of truth in auth store)
      const rolesArray = userData.assigned_roles?.length
        ? userData.assigned_roles
        : userData.roles || [];

      if (rolesArray.length > 0) {
        useAuthStore.getState().setRoles(rolesArray);
      }

      // Store permissions
      const permissions = userData.permissions || [];
      useAuthStore.getState().setPermissions(permissions);
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

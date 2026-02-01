import { UserData, UserRole } from "@/integrations/types/userData";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  roles: UserRole[];
  permissions: string[];
  userId: string | null;
  email: string | null;
  lastSignInAt: string | null;
  isSuperAdmin: boolean;

  // Token operations
  setToken: (token: string | null) => void;
  clearToken: () => void;

  // User role operations
  setRoles: (roles: UserRole[]) => void;
  hasRole: (role: UserRole) => boolean;
  clearRoles: () => void;

  // User permission operations
  setPermissions: (permissions: string[]) => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  clearPermissions: () => void;

  // User data operations
  setUserData: (userData: Partial<UserData>) => void;
  clearUserData: () => void;

  // Reset the entire store
  resetStore: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // State
      token: null,
      roles: [],
      permissions: [],
      userId: null,
      email: null,
      lastSignInAt: null,
      isSuperAdmin: false,

      // Token operations
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),

      // User role operations
      setRoles: (roles) => set({ roles }),
      hasRole: (role) => get().roles.includes(role),
      clearRoles: () => set({ roles: [] }),

      // User permission operations
      setPermissions: (permissions) => set({ permissions }),
      hasPermission: (permission) => {
        // Super admins have all permissions
        if (get().isSuperAdmin) return true;
        return get().permissions.includes(permission);
      },
      hasAnyPermission: (permissions) => {
        // Super admins have all permissions
        if (get().isSuperAdmin) return true;
        const userPermissions = get().permissions;
        return permissions.some((perm) => userPermissions.includes(perm));
      },
      hasAllPermissions: (permissions) => {
        // Super admins have all permissions
        if (get().isSuperAdmin) return true;
        const userPermissions = get().permissions;
        return permissions.every((perm) => userPermissions.includes(perm));
      },
      clearPermissions: () => set({ permissions: [] }),

      // User data operations
      setUserData: (userData) =>
        set({
          userId: userData.id || get().userId,
          email: userData.email || get().email,
          lastSignInAt:
            userData.lastSignInAt ||
            userData.last_sign_in_at ||
            get().lastSignInAt,
          isSuperAdmin:
            userData.isSuperAdmin !== undefined
              ? userData.isSuperAdmin
              : userData.is_super_admin !== undefined
              ? userData.is_super_admin
              : get().isSuperAdmin,
          permissions: userData.permissions || get().permissions,
        }),
      clearUserData: () =>
        set({
          userId: null,
          email: null,
          lastSignInAt: null,
          isSuperAdmin: false,
          permissions: [],
        }),

      // Reset entire store
      resetStore: () =>
        set({
          token: null,
          roles: [],
          permissions: [],
          userId: null,
          email: null,
          lastSignInAt: null,
          isSuperAdmin: false,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);

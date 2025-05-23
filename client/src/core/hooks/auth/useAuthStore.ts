import { UserData, UserRole } from "@/integrations/types/userData";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  roles: UserRole[];
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
      clearRoles: () => set({ roles: [] }), // User data operations
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
        }),
      clearUserData: () =>
        set({
          userId: null,
          email: null,
          lastSignInAt: null,
          isSuperAdmin: false,
        }),

      // Reset entire store
      resetStore: () =>
        set({
          token: null,
          roles: [],
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

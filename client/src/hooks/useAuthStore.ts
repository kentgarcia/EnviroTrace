import { UserRole } from "@/integrations/types/userData";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  roles: UserRole[];
  setToken: (token: string | null) => void;
  clearToken: () => void;
  setRoles: (roles: UserRole[]) => void;
  clearRoles: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      roles: [],
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
      setRoles: (roles) => set({ roles }),
      clearRoles: () => set({ roles: [] }),
    }),
    {
      name: "auth-storage",
    }
  )
);

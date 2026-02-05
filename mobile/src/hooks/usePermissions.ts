import { useAuthStore } from "../core/stores/authStore";

export function usePermissions() {
  const {
    permissions,
    isSuperAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  } = useAuthStore();

  return {
    permissions,
    isSuperAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    can: (entity: string, action: string) => {
      return hasPermission(`${entity}.${action}`);
    },
    canAny: (entity: string, actions: string[]) => {
      const perms = actions.map((action) => `${entity}.${action}`);
      return hasAnyPermission(perms);
    },
    canAll: (entity: string, actions: string[]) => {
      const perms = actions.map((action) => `${entity}.${action}`);
      return hasAllPermissions(perms);
    },
  };
}

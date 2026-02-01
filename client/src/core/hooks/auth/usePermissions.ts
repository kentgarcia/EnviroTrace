import { useAuthStore } from "./useAuthStore";

/**
 * Hook to check permissions for the current user
 */
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
    /**
     * Check if user can perform a specific action on an entity
     * @param entity - Entity name (e.g., 'vehicle', 'office', 'tree')
     * @param action - Action name (e.g., 'create', 'view', 'update', 'delete')
     */
    can: (entity: string, action: string) => {
      return hasPermission(`${entity}.${action}`);
    },
    /**
     * Check if user can perform any of the specified actions on an entity
     */
    canAny: (entity: string, actions: string[]) => {
      const perms = actions.map((action) => `${entity}.${action}`);
      return hasAnyPermission(perms);
    },
    /**
     * Check if user can perform all of the specified actions on an entity
     */
    canAll: (entity: string, actions: string[]) => {
      const perms = actions.map((action) => `${entity}.${action}`);
      return hasAllPermissions(perms);
    },
  };
}

/**
 * Permission constants for type-safe permission checking in the frontend
 * These should match the permissions defined in the backend migration
 */

export const PERMISSIONS = {
  // Admin Module
  USER_ACCOUNT: {
    CREATE: "user_account.create",
    VIEW: "user_account.view",
    UPDATE: "user_account.update",
    DELETE: "user_account.delete",
  },
  ROLE: {
    VIEW: "role.view",
    UPDATE: "role.update",
  },
  PERMISSION: {
    VIEW: "permission.view",
    UPDATE: "permission.update",
  },
  AUDIT_LOG: {
    VIEW: "audit_log.view",
  },
  SESSION: {
    VIEW: "session.view",
    DELETE: "session.delete",
  },
  DASHBOARD: {
    VIEW: "dashboard.view",
  },

  // Emission Module
  OFFICE: {
    CREATE: "office.create",
    VIEW: "office.view",
    UPDATE: "office.update",
    DELETE: "office.delete",
  },
  VEHICLE: {
    CREATE: "vehicle.create",
    VIEW: "vehicle.view",
    UPDATE: "vehicle.update",
    DELETE: "vehicle.delete",
  },
  TEST: {
    CREATE: "test.create",
    VIEW: "test.view",
    UPDATE: "test.update",
    DELETE: "test.delete",
  },
  SCHEDULE: {
    CREATE: "schedule.create",
    VIEW: "schedule.view",
    UPDATE: "schedule.update",
    DELETE: "schedule.delete",
  },

  // Urban Greening Module
  TREE_SPECIES: {
    CREATE: "tree_species.create",
    VIEW: "tree_species.view",
    UPDATE: "tree_species.update",
    DELETE: "tree_species.delete",
  },
  TREE: {
    CREATE: "tree.create",
    VIEW: "tree.view",
    UPDATE: "tree.update",
    DELETE: "tree.delete",
  },
  TREE_PROJECT: {
    CREATE: "tree_project.create",
    VIEW: "tree_project.view",
    UPDATE: "tree_project.update",
    DELETE: "tree_project.delete",
  },
  TREE_REQUEST: {
    CREATE: "tree_request.create",
    VIEW: "tree_request.view",
    UPDATE: "tree_request.update",
    DELETE: "tree_request.delete",
  },
  MONITORING_LOG: {
    CREATE: "monitoring_log.create",
    VIEW: "monitoring_log.view",
  },
  URBAN_PROJECT: {
    CREATE: "urban_project.create",
    VIEW: "urban_project.view",
    UPDATE: "urban_project.update",
    DELETE: "urban_project.delete",
  },
  PLANTING: {
    CREATE: "planting.create",
    VIEW: "planting.view",
    UPDATE: "planting.update",
    DELETE: "planting.delete",
  },
  SAPLING_COLLECTION: {
    CREATE: "sapling_collection.create",
    VIEW: "sapling_collection.view",
    UPDATE: "sapling_collection.update",
    DELETE: "sapling_collection.delete",
  },
  FEE: {
    CREATE: "fee.create",
    VIEW: "fee.view",
    UPDATE: "fee.update",
    DELETE: "fee.delete",
  },
  PROCESSING_STANDARD: {
    CREATE: "processing_standard.create",
    VIEW: "processing_standard.view",
    UPDATE: "processing_standard.update",
    DELETE: "processing_standard.delete",
  },
} as const;

/**
 * Helper type to get all permission strings
 */
type PermissionObject = typeof PERMISSIONS;
type PermissionCategory = PermissionObject[keyof PermissionObject];
export type Permission = PermissionCategory[keyof PermissionCategory];

/**
 * Check if a string is a valid permission
 */
export function isValidPermission(permission: string): permission is Permission {
  const allPermissions = Object.values(PERMISSIONS).flatMap((category) =>
    Object.values(category)
  );
  return allPermissions.includes(permission as Permission);
}

/**
 * Get all permissions as a flat array
 */
export function getAllPermissions(): string[] {
  return Object.values(PERMISSIONS).flatMap((category) =>
    Object.values(category)
  );
}

/**
 * Get permissions by module
 */
export function getPermissionsByModule(
  module: "admin" | "emission" | "urban_greening"
): string[] {
  switch (module) {
    case "admin":
      return [
        ...Object.values(PERMISSIONS.USER_ACCOUNT),
        ...Object.values(PERMISSIONS.ROLE),
        ...Object.values(PERMISSIONS.PERMISSION),
        ...Object.values(PERMISSIONS.AUDIT_LOG),
        ...Object.values(PERMISSIONS.SESSION),
        ...Object.values(PERMISSIONS.DASHBOARD),
      ];
    case "emission":
      return [
        ...Object.values(PERMISSIONS.OFFICE),
        ...Object.values(PERMISSIONS.VEHICLE),
        ...Object.values(PERMISSIONS.TEST),
        ...Object.values(PERMISSIONS.SCHEDULE),
      ];
    case "urban_greening":
      return [
        ...Object.values(PERMISSIONS.TREE_SPECIES),
        ...Object.values(PERMISSIONS.TREE),
        ...Object.values(PERMISSIONS.TREE_PROJECT),
        ...Object.values(PERMISSIONS.TREE_REQUEST),
        ...Object.values(PERMISSIONS.MONITORING_LOG),
        ...Object.values(PERMISSIONS.URBAN_PROJECT),
        ...Object.values(PERMISSIONS.PLANTING),
        ...Object.values(PERMISSIONS.SAPLING_COLLECTION),
        ...Object.values(PERMISSIONS.FEE),
        ...Object.values(PERMISSIONS.PROCESSING_STANDARD),
      ];
    default:
      return [];
  }
}

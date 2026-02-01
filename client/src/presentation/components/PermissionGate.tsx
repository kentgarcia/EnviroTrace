import { ReactNode } from "react";
import { usePermissions } from "@/core/hooks/auth/usePermissions";

interface PermissionGateProps {
  /**
   * Required permission(s). Can be a single permission or array of permissions.
   * If array, user needs ANY of the permissions (OR logic)
   */
  permission: string | string[];
  /**
   * If true, requires ALL permissions in the array (AND logic)
   * Only applies when permission is an array
   */
  requireAll?: boolean;
  /**
   * Content to render when user has permission
   */
  children: ReactNode;
  /**
   * Optional content to render when user lacks permission
   */
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 * Super admins always pass permission checks
 * 
 * @example
 * ```tsx
 * <PermissionGate permission="vehicle.create">
 *   <CreateVehicleButton />
 * </PermissionGate>
 * 
 * <PermissionGate permission={["vehicle.update", "vehicle.delete"]}>
 *   <EditVehicleButton />
 * </PermissionGate>
 * 
 * <PermissionGate permission={["office.view", "office.update"]} requireAll>
 *   <AdminPanel />
 * </PermissionGate>
 * 
 * <PermissionGate 
 *   permission="test.delete" 
 *   fallback={<span>No permission</span>}
 * >
 *   <DeleteButton />
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  permission,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissions();

  let hasAccess = false;

  if (typeof permission === "string") {
    hasAccess = hasPermission(permission);
  } else if (Array.isArray(permission)) {
    hasAccess = requireAll
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

interface CanProps {
  /**
   * Entity to check permission for (e.g., 'vehicle', 'office')
   */
  entity: string;
  /**
   * Action(s) to check. Can be single action or array.
   * If array, user needs ANY action (OR logic)
   */
  action: string | string[];
  /**
   * If true, requires ALL actions in the array (AND logic)
   * Only applies when action is an array
   */
  requireAll?: boolean;
  /**
   * Content to render when user has permission
   */
  children: ReactNode;
  /**
   * Optional content to render when user lacks permission
   */
  fallback?: ReactNode;
}

/**
 * Convenience component for entity-action permission checks
 * 
 * @example
 * ```tsx
 * <Can entity="vehicle" action="create">
 *   <CreateButton />
 * </Can>
 * 
 * <Can entity="office" action={["update", "delete"]}>
 *   <EditPanel />
 * </Can>
 * ```
 */
export function Can({
  entity,
  action,
  requireAll = false,
  children,
  fallback = null,
}: CanProps) {
  const permissions =
    typeof action === "string"
      ? `${entity}.${action}`
      : action.map((a) => `${entity}.${a}`);

  return (
    <PermissionGate
      permission={permissions}
      requireAll={requireAll}
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}

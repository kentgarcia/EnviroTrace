import { createRoute } from "@tanstack/react-router";
import { rootRoute, requireAuth, requireRoleOrPermissions } from "@/presentation/routeTree";
import DashboardLayout from "@/presentation/components/shared/layout/DashboardLayout";
import { PERMISSIONS } from "@/core/utils/permissions";

import { AdminOverview } from "./pages/overview/AdminOverview";
import { UserManagement } from "./pages/user-management/UserManagement";
import { SessionManagement } from "./pages/session-management/SessionManagement";
import { AuditLogs } from "./pages/audit-logs/AuditLogs";
import { PermissionManagementNew as PermissionManagement } from "./pages/permission-management/PermissionManagement";
import AdminSettings from "./pages/settings/AdminSettings";

const adminLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/admin",
    component: () => <DashboardLayout dashboardType="admin" />,
    beforeLoad: () => {
        requireAuth();
        requireRoleOrPermissions(["admin"], [
            PERMISSIONS.USER_ACCOUNT.VIEW,
            PERMISSIONS.ROLE.VIEW,
            PERMISSIONS.PERMISSION.VIEW,
            PERMISSIONS.AUDIT_LOG.VIEW,
            PERMISSIONS.SESSION.VIEW,
            PERMISSIONS.DASHBOARD.VIEW,
        ]);
    },
});

const adminOverviewRoute = createRoute({
    getParentRoute: () => adminLayoutRoute,
    path: "overview",
    component: AdminOverview,
});

const userManagementRoute = createRoute({
    getParentRoute: () => adminLayoutRoute,
    path: "user-management",
    component: UserManagement,
});

const sessionManagementRoute = createRoute({
    getParentRoute: () => adminLayoutRoute,
    path: "session-management",
    component: SessionManagement,
});

const auditLogsRoute = createRoute({
    getParentRoute: () => adminLayoutRoute,
    path: "audit-logs",
    component: AuditLogs,
});

const permissionManagementRoute = createRoute({
    getParentRoute: () => adminLayoutRoute,
    path: "permission-management",
    component: PermissionManagement,
});

const adminSettingsRoute = createRoute({
    getParentRoute: () => adminLayoutRoute,
    path: "settings",
    component: AdminSettings,
});

adminLayoutRoute.addChildren([
    adminOverviewRoute,
    userManagementRoute,
    sessionManagementRoute,
    auditLogsRoute,
    permissionManagementRoute,
    adminSettingsRoute
]);

export const adminRoutes = [adminLayoutRoute];


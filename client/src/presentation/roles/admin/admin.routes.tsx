import { createRoute } from "@tanstack/react-router";
import { rootRoute, requireAuth, requireRole } from "@/presentation/routeTree";
import DashboardLayout from "@/presentation/components/shared/layout/DashboardLayout";

import { AdminOverview } from "./pages/overview/AdminOverview";
import { UserManagement } from "./pages/user-management/UserManagement";
import { SessionManagement } from "./pages/session-management/SessionManagement";
import { AuditLogs } from "./pages/audit-logs/AuditLogs";

const adminLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/admin",
    component: () => <DashboardLayout dashboardType="admin" />,
    beforeLoad: () => {
        requireAuth();
        requireRole(["admin"]);
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

adminLayoutRoute.addChildren([
    adminOverviewRoute,
    userManagementRoute,
    sessionManagementRoute,
    auditLogsRoute
]);

export const adminRoutes = [adminLayoutRoute];


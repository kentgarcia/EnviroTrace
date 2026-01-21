import { createRoute } from "@tanstack/react-router";
import { rootRoute, requireAuth, requireRole } from "@/presentation/routeTree";
import DashboardLayout from "@/presentation/components/shared/layout/DashboardLayout";

import { AdminOverview } from "./pages/overview/AdminOverview";
import { UserManagement } from "./pages/user-management/UserManagement";
import { SessionManagement } from "./pages/session-management/SessionManagement";

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

adminLayoutRoute.addChildren([
    adminOverviewRoute,
    userManagementRoute,
    sessionManagementRoute
]);

export const adminRoutes = [adminLayoutRoute];


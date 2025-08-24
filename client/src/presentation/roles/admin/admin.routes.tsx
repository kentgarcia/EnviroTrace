import { createRoute, RouteComponent } from "@tanstack/react-router";
import { rootRoute, requireAuth, requireRole } from "@/presentation/routeTree";

import { AdminOverview } from "./pages/overview/AdminOverview";
import { UserManagement } from "./pages/user-management/UserManagement";
import AdminSettings from "./pages/settings/AdminSettings";
import ActivityLogs from "./pages/logs/ActivityLogs";
import SecurityManagement from "./pages/security/SecurityManagement";
import DataManagement from "./pages/data/DataManagement";

const createAdminRoute = (path: string, component: RouteComponent) => {
    return createRoute({
        getParentRoute: () => rootRoute,
        path,
        beforeLoad: () => {
            requireAuth();
            requireRole(["admin"]);
        },
        component,
    });
};

export const adminRoutes = [
    createAdminRoute("/admin/overview", AdminOverview),
    createAdminRoute("/admin/user-management", UserManagement),
    createAdminRoute("/admin/settings", AdminSettings),
    createAdminRoute("/admin/logs", ActivityLogs),
    createAdminRoute("/admin/security", SecurityManagement),
    createAdminRoute("/admin/data", DataManagement),
];

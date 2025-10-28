import { createRoute, RouteComponent } from "@tanstack/react-router";
import { rootRoute, requireAuth, requireRole } from "@/presentation/routeTree";

import { AdminOverview } from "./pages/overview/AdminOverview";
import { UserManagement } from "./pages/user-management/UserManagement";
import { SessionManagement } from "./pages/session-management/SessionManagement";

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
    createAdminRoute("/admin/session-management", SessionManagement),
];

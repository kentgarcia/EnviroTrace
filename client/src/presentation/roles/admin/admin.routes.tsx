import { createRoute, RouteComponent } from "@tanstack/react-router";
import AdminDashboard from "@/presentation/roles/admin/pages/Overview";
import AdminUserManagement from "@/presentation/roles/admin/pages/AdminUserManagement";
import AdminSettings from "@/presentation/roles/admin/pages/AdminSettings";
import AdminLogs from "@/presentation/roles/admin/pages/AdminLogs";
import { rootRoute, requireAuth, requireRole } from "@/presentation/routeTree";

const createAdminRoute = (path: string, component: RouteComponent) => {
  return createRoute({
    getParentRoute: () => rootRoute,
    path,
    beforeLoad: () => {
      requireAuth();
      requireRole(
        ["admin"],
        "Access denied. You need admin role to access this page"
      );
    },
    component,
  });
};

export const adminRoutes = [
  createAdminRoute("/admin/overview", AdminDashboard),
  createAdminRoute("/admin/user-management", AdminUserManagement),
  createAdminRoute("/admin/users", AdminUserManagement),
  createAdminRoute("/admin/settings", AdminSettings),
  createAdminRoute("/admin/logs", AdminLogs),
];

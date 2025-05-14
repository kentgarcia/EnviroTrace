import { RouteComponent, createRoute } from "@tanstack/react-router";
import { rootRoute, requireAuth, requireRole } from "@/presentation/routeTree";
import UrbanOverview from "@/presentation/roles/urban/pages/Overview";
import SeedlingRequestsPage from "@/presentation/roles/urban/pages/SeedlingRequests";

const createTreeManagementRoute = (path: string, component: RouteComponent) => {
  return createRoute({
    getParentRoute: () => rootRoute,
    path,
    beforeLoad: () => {
      requireAuth();
      requireRole(["admin", "tree_management"]);
    },
    component,
  });
};

export const urbanGreeningRoute = [
  createTreeManagementRoute("/tree-management/overview", UrbanOverview),
  createTreeManagementRoute(
    "/tree-management/seedling-requests",
    SeedlingRequestsPage
  ),
];

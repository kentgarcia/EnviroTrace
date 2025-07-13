import { createRoute, RouteComponent } from "@tanstack/react-router";
import { rootRoute, requireAuth, requireRole } from "@/presentation/routeTree";

import UrbanGreeningOverview from "./pages/Overview";
import MonitoringRequests from "./pages/MonitoringRequests";
import UrbanGreeningRecords from "./pages/Records";

const createUrbanGreeningRoute = (path: string, component: RouteComponent) => {
  return createRoute({
    getParentRoute: () => rootRoute,
    path,
    beforeLoad: () => {
      requireAuth();
      requireRole(["admin", "urban_greening"]);
    },
    component,
  });
};

export const urbanGreeningRoute = [
  createUrbanGreeningRoute("/urban-greening/overview", UrbanGreeningOverview),
  createUrbanGreeningRoute(
    "/urban-greening/monitoring-requests",
    MonitoringRequests
  ),
  createUrbanGreeningRoute("/urban-greening/records", UrbanGreeningRecords),
];

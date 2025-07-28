import InspectionReports from "./pages/inspection/InspectionReports";
import { createRoute, RouteComponent } from "@tanstack/react-router";
import { rootRoute, requireAuth, requireRole } from "@/presentation/routeTree";

import UrbanGreeningOverview from "./pages/Overview";
import MonitoringRequests from "./pages/monitoring-requests/MonitoringRequests";
import UrbanGreeningRecords from "./pages/Records";
import DataGridTestingPage from "./pages/DataGridTesting";

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
  createUrbanGreeningRoute("/urban-greening/data-grid-testing", DataGridTestingPage),
  createUrbanGreeningRoute("/urban-greening/inspection-reports", InspectionReports),
];

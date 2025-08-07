import InspectionReports from "./pages/inspection/InspectionReports";
import { createRoute, RouteComponent } from "@tanstack/react-router";
import { rootRoute, requireAuth, requireRole } from "@/presentation/routeTree";

//import UrbanGreeningOverview from "./pages/Overview";
import { UrbanGreeningOverview } from "./pages/overview/UrbanGreeningOverview";
import MonitoringRequests from "./pages/monitoring-requests/MonitoringRequests";
import FeeRecords from "./pages/fee-records/FeeRecords";
import TreeManagement from "./pages/tree-management/TreeManagement";
import PlantingRecords from "./pages/planting-records/PlantingRecords";

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
  createUrbanGreeningRoute("/urban-greening/inspection-reports", InspectionReports),
  createUrbanGreeningRoute("/urban-greening/fee-records", FeeRecords),
  createUrbanGreeningRoute("/urban-greening/tree-management", TreeManagement),
  createUrbanGreeningRoute("/urban-greening/planting-records", PlantingRecords),
];

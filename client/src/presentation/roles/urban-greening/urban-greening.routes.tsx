import { createRoute, RouteComponent } from "@tanstack/react-router";
import { rootRoute, requireAuth, requireRole } from "@/presentation/routeTree";

import { UrbanGreeningOverview } from "./pages/overview/UrbanGreeningOverview";
import FeeRecords from "./pages/fee-records/FeeRecords";
import TreeInventoryPage from "./pages/tree-inventory/TreeInventoryPage";
import TreeRequestsPage from "./pages/tree-requests/TreeRequestsPage";
import GreeningProjectsPage from "./pages/greening-projects/GreeningProjectsPage";

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
  // Main dashboard - new streamlined view
  createUrbanGreeningRoute("/urban-greening/overview", UrbanGreeningOverview),
  
  // Tree Inventory - central registry
  createUrbanGreeningRoute("/urban-greening/tree-inventory", TreeInventoryPage),
  
  // Module 2: Tree Management Requests (cutting, pruning, violations)
  createUrbanGreeningRoute("/urban-greening/tree-requests", TreeRequestsPage),
  
  // Module 3: Urban Greening Projects (replacement & new planting)
  createUrbanGreeningRoute("/urban-greening/greening-projects", GreeningProjectsPage),
  
  // Supporting modules
  createUrbanGreeningRoute("/urban-greening/fee-records", FeeRecords),
];

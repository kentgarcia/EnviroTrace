import { createRoute } from "@tanstack/react-router";
import { rootRoute, requireAuth, requireRole } from "@/presentation/routeTree";
import DashboardLayout from "@/presentation/components/shared/layout/DashboardLayout";

import { UrbanGreeningOverview } from "./pages/overview/UrbanGreeningOverview";
import FeeRecords from "./pages/fee-records/FeeRecords";
import TreeInventoryPage from "./pages/tree-inventory/TreeInventoryPage";
import ISOTreeRequestsPage from "./pages/tree-requests/ISOTreeRequestsPage";
import ProcessingStandardsSettings from "./pages/tree-requests/components/ProcessingStandardsSettings";
import GreeningProjectsPage from "./pages/greening-projects/GreeningProjectsPage";
import UrbanGreeningSettings from "./pages/settings/UrbanGreeningSettings";
import SpeciesManagementPage from "./pages/species/SpeciesManagementPage";
import UrbanGreeningReports from "./pages/reports/UrbanGreeningReports";

const urbanGreeningLayout = createRoute({
    getParentRoute: () => rootRoute,
    path: "/urban-greening",
    component: () => <DashboardLayout dashboardType="urban-greening" />,
    beforeLoad: () => {
        requireAuth();
        requireRole(["admin", "urban_greening"]);
    },
});

const overviewRoute = createRoute({
    getParentRoute: () => urbanGreeningLayout,
    path: "overview",
    component: UrbanGreeningOverview,
});

const treeInventoryRoute = createRoute({
    getParentRoute: () => urbanGreeningLayout,
    path: "tree-inventory",
    component: TreeInventoryPage,
});

const treeRequestsRoute = createRoute({
    getParentRoute: () => urbanGreeningLayout,
    path: "tree-requests",
    component: ISOTreeRequestsPage,
});

const processingStandardsRoute = createRoute({
    getParentRoute: () => urbanGreeningLayout,
    path: "processing-standards",
    component: ProcessingStandardsSettings,
});

const greeningProjectsRoute = createRoute({
    getParentRoute: () => urbanGreeningLayout,
    path: "greening-projects",
    component: GreeningProjectsPage,
});

const feeRecordsRoute = createRoute({
    getParentRoute: () => urbanGreeningLayout,
    path: "fee-records",
    component: FeeRecords,
});

const settingsRoute = createRoute({
    getParentRoute: () => urbanGreeningLayout,
    path: "settings",
    component: UrbanGreeningSettings,
});

const speciesManagementRoute = createRoute({
    getParentRoute: () => urbanGreeningLayout,
    path: "species",
    component: SpeciesManagementPage,
});

const reportsRoute = createRoute({
    getParentRoute: () => urbanGreeningLayout,
    path: "reports",
    component: UrbanGreeningReports,
});

urbanGreeningLayout.addChildren([
    overviewRoute,
    treeInventoryRoute,
    treeRequestsRoute,
    processingStandardsRoute,
    greeningProjectsRoute,
    feeRecordsRoute,
    settingsRoute,
    speciesManagementRoute,
    reportsRoute
]);

export const urbanGreeningRoute = [urbanGreeningLayout];


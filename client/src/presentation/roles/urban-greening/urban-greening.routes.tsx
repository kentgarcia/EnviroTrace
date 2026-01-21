import { createRoute } from "@tanstack/react-router";
import { rootRoute, requireAuth, requireRole } from "@/presentation/routeTree";
import DashboardLayout from "@/presentation/components/shared/layout/DashboardLayout";

import { UrbanGreeningOverview } from "./pages/overview/UrbanGreeningOverview";
import FeeRecords from "./pages/fee-records/FeeRecords";
import TreeInventoryPage from "./pages/tree-inventory/TreeInventoryPage";
import ISOTreeRequestsPage from "./pages/tree-requests/ISOTreeRequestsPage";
import ProcessingStandardsSettings from "./pages/tree-requests/components/ProcessingStandardsSettings";
import GreeningProjectsPage from "./pages/greening-projects/GreeningProjectsPage";
import AboutPage from "./pages/about/AboutPage";
import HelpSupportPage from "./pages/help/HelpSupportPage";

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

const aboutRoute = createRoute({
    getParentRoute: () => urbanGreeningLayout,
    path: "about",
    component: AboutPage,
});

const helpSupportRoute = createRoute({
    getParentRoute: () => urbanGreeningLayout,
    path: "help-support",
    component: HelpSupportPage,
});

urbanGreeningLayout.addChildren([
    overviewRoute,
    treeInventoryRoute,
    treeRequestsRoute,
    processingStandardsRoute,
    greeningProjectsRoute,
    feeRecordsRoute,
    aboutRoute,
    helpSupportRoute
]);

export const urbanGreeningRoute = [urbanGreeningLayout];


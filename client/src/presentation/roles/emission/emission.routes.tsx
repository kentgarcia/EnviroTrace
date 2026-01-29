import { createRoute } from "@tanstack/react-router";
import { rootRoute, requireAuth, requireRole } from "@/presentation/routeTree";
import DashboardLayout from "@/presentation/components/shared/layout/DashboardLayout";

import { EmissionOverview } from "@/presentation/roles/emission/pages/overview/EmissionOverview";
import VehiclesPage from "@/presentation/roles/emission/pages/Vehicles";
import QuarterlyTestingPage from "@/presentation/roles/emission/pages/QuarterlyTesting";
import OfficesPage from "@/presentation/roles/emission/pages/Offices";
import TestedVehiclesDetailPage from "@/presentation/roles/emission/pages/TestedVehiclesDetailPage";
import ComplianceDetailPage from "@/presentation/roles/emission/pages/ComplianceDetailPage";
import DepartmentsDetailPage from "@/presentation/roles/emission/pages/DepartmentsDetailPage";
import EmissionReports from "@/presentation/roles/emission/pages/reports/EmissionReports";
import GovernmentEmissionSettings from "@/presentation/roles/emission/pages/settings/GovernmentEmissionSettings";

const emissionLayout = createRoute({
    getParentRoute: () => rootRoute,
    path: "/government-emission",
    component: () => <DashboardLayout dashboardType="government-emission" />,
    beforeLoad: () => {
        requireAuth();
        requireRole(["admin", "government_emission"]);
    },
});

const overviewRoute = createRoute({
    getParentRoute: () => emissionLayout,
    path: "overview",
    component: EmissionOverview,
});

const vehiclesRoute = createRoute({
    getParentRoute: () => emissionLayout,
    path: "vehicles",
    component: VehiclesPage,
});

const quarterlyTestingRoute = createRoute({
    getParentRoute: () => emissionLayout,
    path: "quarterly-testing",
    component: QuarterlyTestingPage,
});

const officesRoute = createRoute({
    getParentRoute: () => emissionLayout,
    path: "offices",
    component: OfficesPage,
});

const reportsRoute = createRoute({
    getParentRoute: () => emissionLayout,
    path: "reports",
    component: EmissionReports,
});

const settingsRoute = createRoute({
    getParentRoute: () => emissionLayout,
    path: "settings",
    component: GovernmentEmissionSettings,
});

// Detail pages
const testedVehiclesRoute = createRoute({
    getParentRoute: () => emissionLayout,
    path: "tested-vehicles",
    component: TestedVehiclesDetailPage,
});

const complianceRoute = createRoute({
    getParentRoute: () => emissionLayout,
    path: "compliance",
    component: ComplianceDetailPage,
});

const departmentsRoute = createRoute({
    getParentRoute: () => emissionLayout,
    path: "departments",
    component: DepartmentsDetailPage,
});

emissionLayout.addChildren([
    overviewRoute,
    vehiclesRoute,
    quarterlyTestingRoute,
    officesRoute,
    reportsRoute,
    settingsRoute,
    testedVehiclesRoute,
    complianceRoute,
    departmentsRoute
]);

export const govEmissionRoute = [emissionLayout];


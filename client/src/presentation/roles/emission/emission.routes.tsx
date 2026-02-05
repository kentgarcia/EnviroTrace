import { createRoute } from "@tanstack/react-router";
import { rootRoute, requireAuth, requireRole, requirePermission, requirePermissions } from "@/presentation/routeTree";
import DashboardLayout from "@/presentation/components/shared/layout/DashboardLayout";
import { PERMISSIONS } from "@/core/utils/permissions";

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

const emissionViewPermissions = [
    PERMISSIONS.OFFICE.VIEW,
    PERMISSIONS.VEHICLE.VIEW,
    PERMISSIONS.TEST.VIEW,
    PERMISSIONS.SCHEDULE.VIEW,
];

const overviewRoute = createRoute({
    getParentRoute: () => emissionLayout,
    path: "overview",
    component: EmissionOverview,
    beforeLoad: () => {
        requirePermission(emissionViewPermissions);
    },
});

const vehiclesRoute = createRoute({
    getParentRoute: () => emissionLayout,
    path: "vehicles",
    component: VehiclesPage,
    beforeLoad: () => {
        requirePermission(PERMISSIONS.VEHICLE.VIEW);
    },
});

const quarterlyTestingRoute = createRoute({
    getParentRoute: () => emissionLayout,
    path: "quarterly-testing",
    component: QuarterlyTestingPage,
    beforeLoad: () => {
        requirePermissions(
            [PERMISSIONS.VEHICLE.VIEW, PERMISSIONS.TEST.VIEW, PERMISSIONS.OFFICE.VIEW],
            true
        );
    },
});

const officesRoute = createRoute({
    getParentRoute: () => emissionLayout,
    path: "offices",
    component: OfficesPage,
    beforeLoad: () => {
        requirePermission(PERMISSIONS.OFFICE.VIEW);
    },
});

const reportsRoute = createRoute({
    getParentRoute: () => emissionLayout,
    path: "reports",
    component: EmissionReports,
    beforeLoad: () => {
        requirePermissions(
            [PERMISSIONS.VEHICLE.VIEW, PERMISSIONS.TEST.VIEW, PERMISSIONS.OFFICE.VIEW],
            true
        );
    },
});

const settingsRoute = createRoute({
    getParentRoute: () => emissionLayout,
    path: "settings",
    component: GovernmentEmissionSettings,
    beforeLoad: () => {
        requirePermission(PERMISSIONS.SCHEDULE.VIEW);
    },
});

// Detail pages
const testedVehiclesRoute = createRoute({
    getParentRoute: () => emissionLayout,
    path: "tested-vehicles",
    component: TestedVehiclesDetailPage,
    beforeLoad: () => {
        requirePermission(emissionViewPermissions);
    },
});

const complianceRoute = createRoute({
    getParentRoute: () => emissionLayout,
    path: "compliance",
    component: ComplianceDetailPage,
    beforeLoad: () => {
        requirePermission(emissionViewPermissions);
    },
});

const departmentsRoute = createRoute({
    getParentRoute: () => emissionLayout,
    path: "departments",
    component: DepartmentsDetailPage,
    beforeLoad: () => {
        requirePermission(emissionViewPermissions);
    },
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


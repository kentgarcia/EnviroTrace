import { RouteComponent, createRoute } from "@tanstack/react-router";
import { rootRoute, requireAuth, requireRole } from "@/presentation/routeTree";
import { EmissionOverview } from "@/presentation/roles/emission/pages/overview/EmissionOverview";
import VehiclesPage from "@/presentation/roles/emission/pages/Vehicles";
import QuarterlyTestingPage from "@/presentation/roles/emission/pages/QuarterlyTesting";
import OfficesPage from "@/presentation/roles/emission/pages/Offices";
import VehiclesDetailPage from "@/presentation/roles/emission/pages/VehiclesDetailPage";
import TestedVehiclesDetailPage from "@/presentation/roles/emission/pages/TestedVehiclesDetailPage";
import ComplianceDetailPage from "@/presentation/roles/emission/pages/ComplianceDetailPage";
import DepartmentsDetailPage from "@/presentation/roles/emission/pages/DepartmentsDetailPage";
import EmissionReports from "@/presentation/roles/emission/pages/reports/EmissionReports";

const createGovEmissionRoute = (path: string, component: RouteComponent) => {
  return createRoute({
    getParentRoute: () => rootRoute,
    path,
    beforeLoad: () => {
      requireAuth();
      requireRole(["admin", "government_emission"]);
    },
    component,
  });
};

export const govEmissionRoute = [
  createGovEmissionRoute("/government-emission/overview", EmissionOverview),
  createGovEmissionRoute("/government-emission/vehicles", VehiclesPage),
  createGovEmissionRoute(
    "/government-emission/quarterly-testing",
    QuarterlyTestingPage
  ),
  createGovEmissionRoute("/government-emission/offices", OfficesPage),
  createGovEmissionRoute("/government-emission/reports", EmissionReports),
  createGovEmissionRoute("/government-emission/settings", EmissionOverview),
  // Detail pages for stat card navigation
  createGovEmissionRoute("/government-emission/vehicles-detail", VehiclesDetailPage),
  createGovEmissionRoute("/government-emission/tested-vehicles", TestedVehiclesDetailPage),
  createGovEmissionRoute("/government-emission/compliance", ComplianceDetailPage),
  createGovEmissionRoute("/government-emission/departments", DepartmentsDetailPage),
];

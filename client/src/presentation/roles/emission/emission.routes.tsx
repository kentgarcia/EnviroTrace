import { RouteComponent, createRoute } from "@tanstack/react-router";
import { rootRoute, requireAuth, requireRole } from "@/presentation/routeTree";
//import GovEmissionOverview from "@/presentation/roles/emission/pages/Overview";
import VehiclesPage from "@/presentation/roles/emission/pages/Vehicles";
import QuarterlyTestingPage from "@/presentation/roles/emission/pages/QuarterlyTesting";
// import OfficesPage from "@/presentation/roles/emission/pages/Offices";

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
  //createGovEmissionRoute("/government-emission/overview", GovEmissionOverview),
  createGovEmissionRoute("/government-emission/vehicles", VehiclesPage),
  createGovEmissionRoute(
    "/government-emission/quarterly-testing",
    QuarterlyTestingPage
  ),
  // createGovEmissionRoute("/government-emission/offices", OfficesPage),
  // createGovEmissionRoute("/government-emission/reports", GovEmissionOverview),
  // createGovEmissionRoute("/government-emission/settings", GovEmissionOverview),
];

import { createRoute, RouteComponent } from "@tanstack/react-router";
import { rootRoute, requireAuth, requireRole } from "@/presentation/routeTree";
import AirQualityOverview from "@/presentation/roles/belching/pages/Overview";
import SmokeBelcher from "@/presentation/roles/belching/pages/SmokeBelcher";
import AccountControlPage from "@/presentation/roles/belching/pages/AccountControl";
import FeeControlPage from "@/presentation/roles/belching/pages/FeeControl";
import OrderOfPayments from "@/presentation/roles/belching/pages/OrderOfPayments";
import ReportsPage from "@/presentation/roles/belching/pages/Reports";

const createSmokeBelchingRoute = (path: string, component: RouteComponent) => {
  return createRoute({
    getParentRoute: () => rootRoute,
    path,
    beforeLoad: () => {
      requireAuth();
      requireRole(["admin", "air_quality"]);
    },
    component,
  });
};

export const smokeBelchingRoute = [
  createSmokeBelchingRoute("/smoke-belching/overview", AirQualityOverview),
  createSmokeBelchingRoute("/smoke-belching/smoke-belcher", SmokeBelcher),
  createSmokeBelchingRoute(
    "/smoke-belching/account-control",
    AccountControlPage
  ),
  createSmokeBelchingRoute("/smoke-belching/fee-control", FeeControlPage),
  createSmokeBelchingRoute(
    "/smoke-belching/order-of-payments",
    OrderOfPayments
  ),
  createSmokeBelchingRoute("/smoke-belching/reports", ReportsPage),
];

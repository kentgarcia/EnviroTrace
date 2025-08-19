import { createRoute, RouteComponent } from "@tanstack/react-router";
import { rootRoute, requireAuth, requireRole } from "@/presentation/routeTree";

import { AirQualityOverview } from "./pages/overview/AirQualityOverview";
import FeeControl from "./pages/fee-control/components/FeeControl";
import { SmokeBelcherManagement } from "./pages/smoke-belcher/SmokeBelcherManagement";
import SmokeBelcher from "./pages/SmokeBelcher";
import { RecordsAndFiles } from "./pages/records-and-files/RecordsAndFiles";
import GarageTesting from "./pages/GarageTesting";
import OrderOfPayment from "./pages/OrderOfPayment";
import OffendersReport from "./pages/OffendersReport";

const createAirQualityRoute = (path: string, component: RouteComponent) => {
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

export const airQualityRoute = [
  createAirQualityRoute("/air-quality/overview", AirQualityOverview),
  createAirQualityRoute("/air-quality/fee-control", FeeControl),
  createAirQualityRoute("/air-quality/smoke-belcher", SmokeBelcherManagement),
  createAirQualityRoute("/air-quality/smoke-belcher-legacy", SmokeBelcher),
  createAirQualityRoute("/air-quality/records-and-file", RecordsAndFiles),
  createAirQualityRoute("/air-quality/garage-testing", GarageTesting),
  createAirQualityRoute("/air-quality/order-of-payment", OrderOfPayment),
  createAirQualityRoute("/air-quality/reports", OffendersReport),
];

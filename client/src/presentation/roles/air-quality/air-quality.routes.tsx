import { createRoute, RouteComponent } from "@tanstack/react-router";
import { rootRoute, requireAuth, requireRole } from "@/presentation/routeTree";

import AirQualityOverview from "./pages/Overview";
import FeeControl from "./pages/fee-control/components/FeeControl";
import SmokeBelcher from "./pages/SmokeBelcher";
import RecordsAndFile from "./pages/RecordsAndFile";
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
  createAirQualityRoute("/air-quality/smoke-belcher", SmokeBelcher),
  createAirQualityRoute("/air-quality/records-and-file", RecordsAndFile),
  createAirQualityRoute("/air-quality/garage-testing", GarageTesting),
  createAirQualityRoute("/air-quality/order-of-payment", OrderOfPayment),
  createAirQualityRoute("/air-quality/reports", OffendersReport),
];

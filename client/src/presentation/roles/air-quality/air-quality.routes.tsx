import { createRoute, RouteComponent } from "@tanstack/react-router";
import { rootRoute, requireAuth, requireRole } from "@/presentation/routeTree";

import { AirQualityOverview } from "./pages/overview/AirQualityOverview";
import FeeControl from "./pages/fee-control/components/FeeControl";
import { SmokeBelcherManagement } from "./pages/smoke-belcher/SmokeBelcherManagement";
import SmokeBelcher from "./pages/SmokeBelcher";
import DriverQuery from "./pages/driver-query/DriverQuery";
import GarageTesting from "./pages/GarageTesting";
import OrderOfPaymentList from "./pages/order-of-payment/OrderOfPaymentList";
import OrderOfPaymentDetails from "./pages/order-of-payment/OrderOfPaymentDetails";
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
  createAirQualityRoute("/air-quality/driver-query", DriverQuery),
  createAirQualityRoute("/air-quality/garage-testing", GarageTesting),
  createAirQualityRoute("/air-quality/order-of-payment", OrderOfPaymentList),
  createAirQualityRoute("/air-quality/order-of-payment/$orderId", OrderOfPaymentDetails),
  createAirQualityRoute("/air-quality/reports", OffendersReport),
];

import {
  createRootRoute,
  createRoute,
  createRouter,
  RouteComponent,
} from "@tanstack/react-router";
import { useAuthStore } from "@/hooks/auth/useAuthStore";
import { toast } from "sonner";
import SignIn from "@/pages/SignIn";
import DashboardSelection from "@/pages/DashboardSelection";
import ProfilePage from "@/pages/ProfilePage";
import AdminUserManagement from "@/pages/dashboards/admin/AdminUserManagement";
import GovEmissionOverview from "@/pages/dashboards/emission/Overview";
import VehiclesPage from "@/pages/dashboards/emission/Vehicles";
import QuarterlyTestingPage from "@/pages/dashboards/emission/QuarterlyTesting";
import OfficesPage from "@/pages/dashboards/emission/Offices";
import SeedlingRequestsPage from "@/pages/dashboards/urban/SeedlingRequests";
import NotFound from "@/pages/NotFound";
import { UserRole } from "@/integrations/types/userData";
import { redirect } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import UrbanOverview from "@/pages/dashboards/urban/Overview";
import AdminDashboard from "@/pages/dashboards/admin/Overview";
import AdminSettings from "@/pages/dashboards/admin/AdminSettings";
import AdminLogs from "@/pages/dashboards/admin/AdminLogs";
import AirQualityOverview from "@/pages/dashboards/belching/Overview";
import SmokeBelcher from "@/pages/dashboards/belching/SmokeBelcher";
import AccountControlPage from "@/pages/dashboards/belching/AccountControl";
import FeeControlPage from "@/pages/dashboards/belching/FeeControl";
import ReportsPage from "@/pages/dashboards/belching/Reports";

// Create a root route
const rootRoute = createRootRoute({
  component: () => {
    return <Outlet />;
  },
});

// Reusable guard functions
const requireAuth = () => {
  if (!useAuthStore.getState().token) {
    throw redirect({
      to: "/",
      replace: true,
    });
  }
};

const requireRole = (
  allowedRoles: UserRole[],
  errorMessage: string = "Access denied. You need appropriate role to access this page"
) => {
  const roles = useAuthStore.getState().roles;
  if (!roles.some((role) => allowedRoles.includes(role))) {
    toast.error(errorMessage, {
      duration: 5000,
      id: "access-denied",
    });
    throw redirect({
      to: "/dashboard-selection",
      replace: true,
    });
  }
};

// Define routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: SignIn,
});

const dashboardSelectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard-selection",
  beforeLoad: requireAuth,
  component: DashboardSelection,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  beforeLoad: requireAuth,
  component: ProfilePage,
});

// Admin routes
const createAdminRoute = (path: string, component: RouteComponent) => {
  return createRoute({
    getParentRoute: () => rootRoute,
    path,
    beforeLoad: () => {
      requireAuth();
      requireRole(
        ["admin"],
        "Access denied. You need admin role to access this page"
      );
    },
    component,
  });
};

const adminOverviewRoute = createAdminRoute("/admin/overview", AdminDashboard);

const userManagementRoute = createAdminRoute(
  "/admin/user-management",
  AdminUserManagement
);

const adminUsersRoute = createAdminRoute("/admin/users", AdminUserManagement);

const adminSettingsRoute = createAdminRoute("/admin/settings", AdminSettings);

const adminLogsRoute = createAdminRoute("/admin/logs", AdminLogs);

// Government Emission routes
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

const govEmissionOverviewRoute = createGovEmissionRoute(
  "/government-emission/overview",
  GovEmissionOverview
);
const vehiclesPageRoute = createGovEmissionRoute(
  "/government-emission/vehicles",
  VehiclesPage
);
const quarterlyTestingRoute = createGovEmissionRoute(
  "/government-emission/quarterly-testing",
  QuarterlyTestingPage
);
const officesRoute = createGovEmissionRoute(
  "/government-emission/offices",
  OfficesPage
);
const reportsRoute = createGovEmissionRoute(
  "/government-emission/reports",
  GovEmissionOverview
);
const settingsRoute = createGovEmissionRoute(
  "/government-emission/settings",
  GovEmissionOverview
);

// Urban Greening / Tree Management routes
const createTreeManagementRoute = (path: string, component: RouteComponent) => {
  return createRoute({
    getParentRoute: () => rootRoute,
    path,
    beforeLoad: () => {
      requireAuth();
      requireRole(["admin", "tree_management"]);
    },
    component,
  });
};

const treeManagementRoute = createTreeManagementRoute(
  "/tree-management/overview",
  UrbanOverview
);
const seedlingRequestsRoute = createTreeManagementRoute(
  "/tree-management/seedling-requests",
  SeedlingRequestsPage
);

// Air Quality routes
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

const airQualityOverviewRoute = createAirQualityRoute(
  "/air-quality/overview",
  AirQualityOverview
);

// Smoke Belching routes
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

const smokeBelchingOverviewRoute = createSmokeBelchingRoute(
  "/smoke-belching/overview",
  AirQualityOverview
);

const smokeBelcherRoute = createSmokeBelchingRoute(
  "/smoke-belching/smoke-belcher",
  SmokeBelcher
);

const accountControlRoute = createSmokeBelchingRoute(
  "/smoke-belching/account-control",
  AccountControlPage
);

const feeControlRoute = createSmokeBelchingRoute(
  "/smoke-belching/fee-control",
  FeeControlPage
);

const smokeBelchingReportsRoute = createSmokeBelchingRoute(
  "/smoke-belching/reports",
  ReportsPage
);

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: NotFound,
});

// Create and export the router
export const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardSelectionRoute,
  profileRoute,
  adminOverviewRoute,
  adminSettingsRoute,
  adminLogsRoute,
  userManagementRoute,
  adminUsersRoute,
  govEmissionOverviewRoute,
  vehiclesPageRoute,
  quarterlyTestingRoute,
  officesRoute,
  reportsRoute,
  settingsRoute,
  seedlingRequestsRoute,
  treeManagementRoute,
  airQualityOverviewRoute,
  smokeBelchingOverviewRoute,
  smokeBelcherRoute,
  accountControlRoute,
  feeControlRoute,
  smokeBelchingReportsRoute,
  notFoundRoute,
]);

// Create the router instance
export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingComponent: () => (
    <div className="p-4 flex justify-center">
      <div className="animate-pulse text-gray-500">Loading...</div>
    </div>
  ),
  defaultErrorComponent: ({ error }) => (
    <div className="p-4 text-red-500">
      <h1>Error: {error.message}</h1>
    </div>
  ),
});

// Register the router for maximum type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Router instance is ready to be used by RouterProvider

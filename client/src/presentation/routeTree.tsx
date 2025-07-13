import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";
import { toast } from "sonner";
import SignIn from "@/presentation/pages/public/SignIn";
import DashboardSelection from "@/presentation/pages/public/DashboardSelection";
import ProfilePage from "@/presentation/pages/public/ProfilePage";
import NotFound from "@/presentation/pages/public/NotFound";
import { UserRole } from "@/integrations/types/userData";
import { redirect } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
// import { adminRoutes } from "@/presentation/roles/admin/admin.routes";
// import { smokeBelchingRoute } from "./roles/belching/belching.routes";
import { govEmissionRoute } from "./roles/emission/emission.routes";
import { airQualityRoute } from "./roles/air-quality/air-quality.routes";
import { urbanGreeningRoute } from "./roles/urban-greening/urban-greening.routes";
import Unauthorized from "./pages/public/Unauthorized";

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

const unauthorizedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/403",
  component: Unauthorized,
});

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
  ...airQualityRoute,
  // ...adminRoutes,
  // ...smokeBelchingRoute,
  ...govEmissionRoute,
  ...urbanGreeningRoute,
  unauthorizedRoute,
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

// Export rootRoute, requireAuth, and requireRole for reuse
export { rootRoute, requireAuth, requireRole };

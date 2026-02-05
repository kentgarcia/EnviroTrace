import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";
import { toast } from "sonner";
import SignIn from "@/presentation/pages/public/SignIn";
import VerifyEmail from "@/presentation/pages/public/VerifyEmail";
import PendingApproval from "@/presentation/pages/public/PendingApproval";
import SignUp from "@/presentation/pages/public/SignUp";
import DashboardSelection from "@/presentation/pages/public/DashboardSelection";
import ProfilePage from "@/presentation/pages/public/ProfilePage";
import TermsOfService from "@/presentation/pages/public/TermsOfService";
import PrivacyPolicy from "@/presentation/pages/public/PrivacyPolicy";
import NotFound from "@/presentation/pages/public/NotFound";
import { UserRole } from "@/integrations/types/userData";
import { redirect } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import { adminRoutes } from "@/presentation/roles/admin/admin.routes";
import { govEmissionRoute } from "./roles/emission/emission.routes";
import { urbanGreeningRoute } from "./roles/urban-greening/urban-greening.routes";
import Unauthorized from "./pages/public/Unauthorized";
import TitleBar from "@/presentation/components/shared/layout/TitleBar";
import { RefreshProvider } from "@/core/services/refresh-service";
import { GlobalContextMenu } from "@/presentation/components/shared/global/GlobalContextMenu";
import { useKeyboardShortcuts } from "@/core/hooks/useKeyboardShortcuts";

// Root component with providers
const RootComponent = () => {
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <GlobalContextMenu>
      <div style={{ width: '100%', height: '100vh' }}>
        <TitleBar />
        <div
          style={{
            paddingTop: 40,
            overflow: "hidden",
            height: "100vh",
          }}
        >
          <Outlet />
        </div>
      </div>
    </GlobalContextMenu>
  );
};

// Create a root route
const rootRoute = createRootRoute({
  component: () => (
    <RefreshProvider>
      <RootComponent />
    </RefreshProvider>
  ),
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
  const { roles, isSuperAdmin } = useAuthStore.getState();
  
  // Super admins bypass role checks
  if (isSuperAdmin) {
    return;
  }
  
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

const requirePermission = (
  requiredPermissions: string | string[],
  errorMessage: string = "Access denied. You don't have the required permissions"
) => {
  const { permissions, isSuperAdmin, hasPermission, hasAnyPermission } =
    useAuthStore.getState();

  // Super admins bypass permission checks
  if (isSuperAdmin) {
    return;
  }

  // Check permissions
  let hasAccess = false;
  if (typeof requiredPermissions === "string") {
    hasAccess = hasPermission(requiredPermissions);
  } else if (Array.isArray(requiredPermissions)) {
    hasAccess = hasAnyPermission(requiredPermissions);
  }

  if (!hasAccess) {
    toast.error(errorMessage, {
      duration: 5000,
      id: "permission-denied",
    });
    throw redirect({
      to: "/dashboard-selection",
      replace: true,
    });
  }
};

const requirePermissions = (
  requiredPermissions: string[],
  requireAll: boolean = false,
  errorMessage: string = "Access denied. You don't have the required permissions"
) => {
  const { permissions, isSuperAdmin } = useAuthStore.getState();
  
  // Super admins bypass all permission checks
  if (isSuperAdmin) {
    return;
  }
  
  const hasPermission = requireAll
    ? requiredPermissions.every((perm) => permissions.includes(perm))
    : requiredPermissions.some((perm) => permissions.includes(perm));
  
  if (!hasPermission) {
    toast.error(errorMessage, {
      duration: 5000,
      id: "access-denied-permission",
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

const verifyEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify-email",
  component: VerifyEmail,
});

const pendingApprovalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pending-approval",
  component: PendingApproval,
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sign-up",
  component: SignUp,
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

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: TermsOfService,
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: PrivacyPolicy,
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sign-in",
  component: SignIn,
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
  signInRoute,
  signUpRoute,
  verifyEmailRoute,
  pendingApprovalRoute,
  dashboardSelectionRoute,
  profileRoute,
  termsRoute,
  privacyRoute,
  ...adminRoutes,
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
export { rootRoute, requireAuth, requireRole, requirePermission, requirePermissions };

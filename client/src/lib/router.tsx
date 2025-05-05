import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { toast } from 'sonner';
import SignIn from '@/pages/SignIn';
import DashboardSelection from '@/pages/DashboardSelection';
import ProfilePage from '@/pages/ProfilePage';
import UserManagement from '@/pages/admin/UserManagement';
import AdminUserManagement from '@/pages/admin/AdminUserManagement';
import GovEmissionOverview from '@/pages/dashboards/emission/Overview';
import VehiclesPage from '@/pages/dashboards/emission/Vehicles';
import QuarterlyTestingPage from '@/pages/dashboards/emission/QuarterlyTesting';
import OfficesPage from '@/pages/dashboards/emission/Offices';
import NotFound from '@/pages/NotFound';
import { UserRole } from '@/integrations/types/userData';
import { redirect } from '@tanstack/react-router';
import { Outlet } from '@tanstack/react-router';

// Create a root route
const rootRoute = createRootRoute({
    component: () => {
        return <Outlet />;
    },
});

// Create authentication guards
const isAuthenticated = () => {
    const token = useAuthStore.getState().token;
    return token !== null;
};

const hasRole = (allowedRoles: UserRole[]) => {
    const roles = useAuthStore.getState().roles;
    return roles.some(role => allowedRoles.includes(role));
};

// Define routes
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: SignIn
});

const dashboardSelectionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard-selection',
    beforeLoad: async () => {
        if (!isAuthenticated()) {
            throw redirect({
                to: '/',
                replace: true
            });
        }
    },
    component: DashboardSelection
});

const profileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/profile',
    beforeLoad: async () => {
        if (!isAuthenticated()) {
            throw redirect({
                to: '/',
                replace: true
            });
        }
    },
    component: ProfilePage
});

// Admin routes
const userManagementRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin/user-management',
    beforeLoad: async () => {
        if (!isAuthenticated()) {
            throw redirect({
                to: '/',
                replace: true
            });
        }
        if (!hasRole(['admin'])) {
            toast.error('Access denied. You need admin role to access this page', {
                duration: 5000,
                id: 'access-denied'
            });
            throw redirect({
                to: '/dashboard-selection',
                replace: true
            });
        }
    },
    component: UserManagement
});

const adminUsersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin/users',
    beforeLoad: async () => {
        if (!isAuthenticated()) {
            throw redirect({
                to: '/',
                replace: true
            });
        }
        if (!hasRole(['admin'])) {
            toast.error('Access denied. You need admin role to access this page', {
                duration: 5000,
                id: 'access-denied'
            });
            throw redirect({
                to: '/dashboard-selection',
                replace: true
            });
        }
    },
    component: AdminUserManagement
});

// Government Emission routes
const govEmissionOverviewRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/government-emission/overview',
    beforeLoad: async () => {
        if (!isAuthenticated()) {
            throw redirect({
                to: '/',
                replace: true
            });
        }
        if (!hasRole(['admin', 'government_emission'])) {
            toast.error('Access denied. You need appropriate role to access this page', {
                duration: 5000,
                id: 'access-denied'
            });
            throw redirect({
                to: '/dashboard-selection',
                replace: true
            });
        }
    },
    component: GovEmissionOverview
});

const vehiclesPageRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/government-emission/vehicles',
    beforeLoad: async () => {
        if (!isAuthenticated()) {
            throw redirect({
                to: '/',
                replace: true
            });
        }
        if (!hasRole(['admin', 'government_emission'])) {
            toast.error('Access denied. You need appropriate role to access this page', {
                duration: 5000,
                id: 'access-denied'
            });
            throw redirect({
                to: '/dashboard-selection',
                replace: true
            });
        }
    },
    component: VehiclesPage
});

const quarterlyTestingRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/government-emission/quarterly-testing',
    beforeLoad: async () => {
        if (!isAuthenticated()) {
            throw redirect({
                to: '/',
                replace: true
            });
        }
        if (!hasRole(['admin', 'government_emission'])) {
            toast.error('Access denied. You need appropriate role to access this page', {
                duration: 5000,
                id: 'access-denied'
            });
            throw redirect({
                to: '/dashboard-selection',
                replace: true
            });
        }
    },
    component: QuarterlyTestingPage
});

const officesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/government-emission/offices',
    beforeLoad: async () => {
        if (!isAuthenticated()) {
            throw redirect({
                to: '/',
                replace: true
            });
        }
        if (!hasRole(['admin', 'government_emission'])) {
            toast.error('Access denied. You need appropriate role to access this page', {
                duration: 5000,
                id: 'access-denied'
            });
            throw redirect({
                to: '/dashboard-selection',
                replace: true
            });
        }
    },
    component: OfficesPage
});

const reportsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/government-emission/reports',
    beforeLoad: async () => {
        if (!isAuthenticated()) {
            throw redirect({
                to: '/',
                replace: true
            });
        }
        if (!hasRole(['admin', 'government_emission'])) {
            toast.error('Access denied. You need appropriate role to access this page', {
                duration: 5000,
                id: 'access-denied'
            });
            throw redirect({
                to: '/dashboard-selection',
                replace: true
            });
        }
    },
    component: GovEmissionOverview
});

const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/government-emission/settings',
    beforeLoad: async () => {
        if (!isAuthenticated()) {
            throw redirect({
                to: '/',
                replace: true
            });
        }
        if (!hasRole(['admin', 'government_emission'])) {
            toast.error('Access denied. You need appropriate role to access this page', {
                duration: 5000,
                id: 'access-denied'
            });
            throw redirect({
                to: '/dashboard-selection',
                replace: true
            });
        }
    },
    component: GovEmissionOverview
});

const notFoundRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '*',
    component: NotFound
});

// Create and export the router
export const routeTree = rootRoute.addChildren([
    indexRoute,
    dashboardSelectionRoute,
    profileRoute,
    userManagementRoute,
    adminUsersRoute,
    govEmissionOverviewRoute,
    vehiclesPageRoute,
    quarterlyTestingRoute,
    officesRoute,
    reportsRoute,
    settingsRoute,
    notFoundRoute
]);

// Create the router instance
export const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    // This is the key addition - a defaultPendingComponent to show during route transitions
    defaultPendingComponent: () => (
        <div className="p-4 flex justify-center">
            <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
    ),
    // Add defaultErrorComponent to handle errors
    defaultErrorComponent: ({ error }) => (
        <div className="p-4 text-red-500">
            <h1>Error: {error.message}</h1>
        </div>
    ),
});

// Register the router for maximum type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

// Router instance is ready to be used by RouterProvider
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import SignIn from "./pages/SignIn";
import DashboardSelection from "./pages/DashboardSelection";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProfilePage from "./pages/ProfilePage";
import UserManagement from "./pages/admin/UserManagement";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import AirQualityOverview from "./pages/dashboards/air-quality/Overview";
import AirQualityRecords from "./pages/dashboards/air-quality/Records";
import TreeManagementOverview from "./pages/dashboards/tree-management/Overview";
import TreeManagementRecords from "./pages/dashboards/tree-management/Records";
import TreePlantingPage from "./pages/dashboards/tree-management/Planting";
import SaplingRequestsPage from "./pages/dashboards/tree-management/Requests";
import GovEmissionOverview from "./pages/dashboards/government-emission/Overview";
import VehiclesPage from "./pages/dashboards/emission/Vehicles";
import QuarterlyTestingPage from "./pages/dashboards/old/government-emission/QuarterlyTesting";
import OfficesPage from "./pages/dashboards/old/government-emission/Offices";
import NotFound from "./pages/NotFound";
import { useAuthStore } from "./hooks/useAuthStore";
import { RoleProtectedRoute } from "./components/auth/RoleProtectedRoute";

// Lazy loaded components
const NetworkStatus = lazy(() => import("./components/layout/NetworkStatus").then(module => ({
  default: module.NetworkStatus
})));

// Configure React Query with offline support
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 60 * 60 * 1000, // 1 hour (formerly called cacheTime)
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true
    },
  },
});

// Basic protected route wrapper for authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = token !== null;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SignIn />} />

          {/* Protected routes */}
          <Route path="/dashboard-selection" element={
            <ProtectedRoute>
              <DashboardSelection />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/user-management" element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </RoleProtectedRoute>
          } />

          <Route path="/admin/users" element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminUserManagement />
            </RoleProtectedRoute>
          } />

          {/* Air Quality Dashboard Routes */}
          <Route path="/air-quality/overview" element={
            <RoleProtectedRoute allowedRoles={['admin', 'air_quality']}>
              <AirQualityOverview />
            </RoleProtectedRoute>
          } />
          <Route path="/air-quality/records" element={
            <RoleProtectedRoute allowedRoles={['admin', 'air_quality']}>
              <AirQualityRecords />
            </RoleProtectedRoute>
          } />
          <Route path="/air-quality/settings" element={
            <RoleProtectedRoute allowedRoles={['admin', 'air_quality']}>
              <AirQualityOverview />
            </RoleProtectedRoute>
          } />

          {/* Tree Management Dashboard Routes */}
          <Route path="/tree-management/overview" element={
            <RoleProtectedRoute allowedRoles={['admin', 'tree_management']}>
              <TreeManagementOverview />
            </RoleProtectedRoute>
          } />
          <Route path="/tree-management/records" element={
            <RoleProtectedRoute allowedRoles={['admin', 'tree_management']}>
              <TreeManagementRecords />
            </RoleProtectedRoute>
          } />
          <Route path="/tree-management/planting" element={
            <RoleProtectedRoute allowedRoles={['admin', 'tree_management']}>
              <TreePlantingPage />
            </RoleProtectedRoute>
          } />
          <Route path="/tree-management/requests" element={
            <RoleProtectedRoute allowedRoles={['admin', 'tree_management']}>
              <SaplingRequestsPage />
            </RoleProtectedRoute>
          } />
          <Route path="/tree-management/reports" element={
            <RoleProtectedRoute allowedRoles={['admin', 'tree_management']}>
              <TreeManagementOverview />
            </RoleProtectedRoute>
          } />
          <Route path="/tree-management/settings" element={
            <RoleProtectedRoute allowedRoles={['admin', 'tree_management']}>
              <TreeManagementOverview />
            </RoleProtectedRoute>
          } />

          {/* Government Emission Dashboard Routes */}
          <Route path="/government-emission/overview" element={
            <RoleProtectedRoute allowedRoles={['admin', 'government_emission']}>
              <GovEmissionOverview />
            </RoleProtectedRoute>
          } />
          <Route path="/government-emission/vehicles" element={
            <RoleProtectedRoute allowedRoles={['admin', 'government_emission']}>
              <VehiclesPage />
            </RoleProtectedRoute>
          } />
          <Route path="/government-emission/quarterly-testing" element={
            <RoleProtectedRoute allowedRoles={['admin', 'government_emission']}>
              <QuarterlyTestingPage />
            </RoleProtectedRoute>
          } />
          <Route path="/government-emission/offices" element={
            <RoleProtectedRoute allowedRoles={['admin', 'government_emission']}>
              <OfficesPage />
            </RoleProtectedRoute>
          } />
          <Route path="/government-emission/reports" element={
            <RoleProtectedRoute allowedRoles={['admin', 'government_emission']}>
              <GovEmissionOverview />
            </RoleProtectedRoute>
          } />
          <Route path="/government-emission/settings" element={
            <RoleProtectedRoute allowedRoles={['admin', 'government_emission']}>
              <GovEmissionOverview />
            </RoleProtectedRoute>
          } />

          {/* Not found route */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <Suspense fallback={null}>
          <NetworkStatus />
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

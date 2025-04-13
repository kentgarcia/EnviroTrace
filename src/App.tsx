
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
import TreeManagementPlanting from "./pages/dashboards/tree-management/Planting";
import TreeManagementRequests from "./pages/dashboards/tree-management/Requests";
import GovEmissionOverview from "./pages/dashboards/government-emission/Overview";
import GovernmentEmissionRecords from "./pages/dashboards/government-emission/Records";
import VehiclesPage from "./pages/dashboards/government-emission/Vehicles";
import QuarterlyTestingPage from "./pages/dashboards/government-emission/QuarterlyTesting";
import OfficesPage from "./pages/dashboards/government-emission/Offices";
import NotFound from "./pages/NotFound";

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

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Check if user is authenticated from supabase session
  const isAuthenticated = localStorage.getItem("sb-trjtbptzqqxmnydzknol-auth-token") !== null;
  
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
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/users" element={
            <ProtectedRoute>
              <AdminUserManagement />
            </ProtectedRoute>
          } />
          
          {/* Air Quality Dashboard Routes */}
          <Route path="/air-quality/overview" element={
            <ProtectedRoute>
              <AirQualityOverview />
            </ProtectedRoute>
          } />
          <Route path="/air-quality/records" element={
            <ProtectedRoute>
              <AirQualityRecords />
            </ProtectedRoute>
          } />
          <Route path="/air-quality/reports" element={
            <ProtectedRoute>
              <AirQualityOverview />
            </ProtectedRoute>
          } />
          <Route path="/air-quality/settings" element={
            <ProtectedRoute>
              <AirQualityOverview />
            </ProtectedRoute>
          } />
          
          {/* Tree Management Dashboard Routes */}
          <Route path="/tree-management/overview" element={
            <ProtectedRoute>
              <TreeManagementOverview />
            </ProtectedRoute>
          } />
          <Route path="/tree-management/records" element={
            <ProtectedRoute>
              <TreeManagementRecords />
            </ProtectedRoute>
          } />
          <Route path="/tree-management/planting" element={
            <ProtectedRoute>
              <TreeManagementPlanting />
            </ProtectedRoute>
          } />
          <Route path="/tree-management/requests" element={
            <ProtectedRoute>
              <TreeManagementRequests />
            </ProtectedRoute>
          } />
          <Route path="/tree-management/reports" element={
            <ProtectedRoute>
              <TreeManagementOverview />
            </ProtectedRoute>
          } />
          <Route path="/tree-management/settings" element={
            <ProtectedRoute>
              <TreeManagementOverview />
            </ProtectedRoute>
          } />
          
          {/* Government Emission Dashboard Routes */}
          <Route path="/government-emission/overview" element={
            <ProtectedRoute>
              <GovEmissionOverview />
            </ProtectedRoute>
          } />
          <Route path="/government-emission/records" element={
            <ProtectedRoute>
              <GovernmentEmissionRecords />
            </ProtectedRoute>
          } />
          <Route path="/government-emission/vehicles" element={
            <ProtectedRoute>
              <VehiclesPage />
            </ProtectedRoute>
          } />
          <Route path="/government-emission/quarterly-testing" element={
            <ProtectedRoute>
              <QuarterlyTestingPage />
            </ProtectedRoute>
          } />
          <Route path="/government-emission/offices" element={
            <ProtectedRoute>
              <OfficesPage />
            </ProtectedRoute>
          } />
          <Route path="/government-emission/reports" element={
            <ProtectedRoute>
              <GovEmissionOverview />
            </ProtectedRoute>
          } />
          <Route path="/government-emission/settings" element={
            <ProtectedRoute>
              <GovEmissionOverview />
            </ProtectedRoute>
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

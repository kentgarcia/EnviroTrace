
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import DashboardSelection from "./pages/DashboardSelection";
import AirQualityOverview from "./pages/dashboards/air-quality/Overview";
import AirQualityRecords from "./pages/dashboards/air-quality/Records";
import TreeManagementOverview from "./pages/dashboards/tree-management/Overview";
import TreeManagementRecords from "./pages/dashboards/tree-management/Records";
import GovEmissionOverview from "./pages/dashboards/government-emission/Overview";
import GovernmentEmissionRecords from "./pages/dashboards/government-emission/Records";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("ems-auth") !== null;
  
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

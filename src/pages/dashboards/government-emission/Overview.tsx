
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { YearSelector } from "@/components/dashboards/government-emission/YearSelector";
import { EmissionStatCards } from "@/components/dashboards/government-emission/EmissionStatCards";
import { RecentTestsTable } from "@/components/dashboards/government-emission/RecentTestsTable";
import { EmissionCharts } from "@/components/dashboards/government-emission/EmissionCharts";
import { OfficeComplianceTable } from "@/components/dashboards/government-emission/OfficeComplianceTable";
import { EmissionHistoryTrend } from "@/components/dashboards/government-emission/EmissionHistoryTrend";
import { EmissionTestSchedule } from "@/components/dashboards/government-emission/EmissionTestSchedule";
import { ExportToSheet } from "@/components/dashboards/government-emission/ExportToSheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { useEmissionDashboard } from "@/hooks/useEmissionDashboard";

export default function GovernmentEmissionOverview() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState<number | "All">("All");
  const [availableYears, setAvailableYears] = useState<number[]>(
    Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
  );
  
  // Use the dashboard hook with proper types
  const {
    loading: isLoading,
    quarterStats,
    complianceByOffice,
    recentTests,
    totalVehicles,
    totalPassed,
    totalFailed,
    complianceRate,
    engineTypeData,
    vehicleTypeData,
    data,
    error,
    refetch
  } = useEmissionDashboard(selectedYear, selectedQuarter === "All" ? undefined : selectedQuarter);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  // Fetch data when selected filters change
  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [selectedYear, selectedQuarter, refetch, user]);

  const handleYearChange = (year: string) => {
    setSelectedYear(parseInt(year));
  };

  const handleQuarterChange = (quarter: string) => {
    setSelectedQuarter(quarter === "All" ? "All" : parseInt(quarter));
  };
  
  const handleExportData = async () => {
    toast.success("Data export started");
    // This would be replaced with actual export logic
    setTimeout(() => {
      toast.success("Data exported successfully");
    }, 1500);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Provide default values to avoid undefined errors
  const officeDepartments = complianceByOffice ? complianceByOffice.length : 0;
  const safeComplianceRate = complianceRate || 0;
  const safeTotalVehicles = totalVehicles || 0;
  const safeTotalPassed = totalPassed || 0;
  const safeTotalFailed = totalFailed || 0;
  
  // Calculate total tested vehicles
  const testedVehicles = safeTotalPassed + safeTotalFailed;
  
  // Ensure we have valid arrays for chart data
  const safeQuarterStats = quarterStats || [];
  const safeEngineTypeData = engineTypeData || [];
  const safeVehicleTypeData = vehicleTypeData || [];
  const safeComplianceByOffice = complianceByOffice || [];
  const safeRecentTests = recentTests || [];
  const safeYearlyTrends = data?.yearlyTrends || [];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="government-emission" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardNavbar />
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Emission Testing Dashboard</h1>
                <p className="text-muted-foreground">
                  Monitor and analyze government vehicle emission test data
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <YearSelector
                  selectedYear={selectedYear}
                  selectedQuarter={selectedQuarter}
                  availableYears={availableYears}
                  onYearChange={handleYearChange}
                  onQuarterChange={handleQuarterChange}
                  showQuarters={true}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center min-h-[500px]">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : error ? (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="text-center p-6">
                    <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Data</h3>
                    <p className="text-muted-foreground mb-4">{error.message || "Failed to load dashboard data"}</p>
                    <Button onClick={refetch}>Retry</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <EmissionStatCards
                  totalVehicles={safeTotalVehicles}
                  testedVehicles={testedVehicles}
                  passRate={safeComplianceRate}
                  officeDepartments={officeDepartments}
                />

                <EmissionCharts
                  quarterStats={safeQuarterStats}
                  engineTypeData={safeEngineTypeData}
                  vehicleTypeData={safeVehicleTypeData}
                  selectedYear={selectedYear}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <RecentTestsTable recentTests={safeRecentTests} />
                  <OfficeComplianceTable complianceData={safeComplianceByOffice} />
                </div>

                <div className="grid grid-cols-1 gap-6 mb-6">
                  <EmissionHistoryTrend historyData={safeYearlyTrends} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <EmissionTestSchedule
                    selectedYear={selectedYear}
                  />
                  <ExportToSheet onExport={handleExportData} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

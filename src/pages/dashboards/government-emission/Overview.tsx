
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const { user, loading } = useAuth();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState<number | "All">("All");
  const [availableYears, setAvailableYears] = useState<number[]>(
    Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
  );
  
  // Use the dashboard hook
  const {
    isLoading,
    quarterStats,
    complianceData,
    recentTests,
    totalVehicles,
    testedVehicles,
    passRate,
    officeDepartments,
    pastYearData,
    engineTypeData,
    vehicleTypeData,
    error,
    fetchData
  } = useEmissionDashboard(selectedYear, selectedQuarter === "All" ? undefined : selectedQuarter);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // Fetch data when selected filters change
  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedQuarter]);

  const handleYearChange = (year: string) => {
    setSelectedYear(parseInt(year));
  };

  const handleQuarterChange = (quarter: string) => {
    setSelectedQuarter(quarter === "All" ? "All" : parseInt(quarter));
  };
  
  const handleScheduleChange = () => {
    // Refresh data when schedules are updated
    fetchData();
  };

  const handleExportData = async () => {
    toast.success("Data export started");
    // This would be replaced with actual export logic
    setTimeout(() => {
      toast.success("Data exported successfully");
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

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
                    <Button onClick={fetchData}>Retry</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <EmissionStatCards
                  totalVehicles={totalVehicles}
                  testedVehicles={testedVehicles}
                  passRate={passRate}
                  officeDepartments={officeDepartments}
                />

                <EmissionCharts
                  quarterStats={quarterStats}
                  engineTypeData={engineTypeData}
                  vehicleTypeData={vehicleTypeData}
                  selectedYear={selectedYear}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <RecentTestsTable tests={recentTests} />
                  <OfficeComplianceTable data={complianceData} />
                </div>

                <div className="grid grid-cols-1 gap-6 mb-6">
                  <EmissionHistoryTrend data={pastYearData} />
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


import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { EmissionStatCards } from "@/components/dashboards/government-emission/EmissionStatCards";
import { EmissionCharts } from "@/components/dashboards/government-emission/EmissionCharts";
import { OfficeComplianceTable } from "@/components/dashboards/government-emission/OfficeComplianceTable";
import { EmissionHistoryTrend } from "@/components/dashboards/government-emission/EmissionHistoryTrend";
import { RecentTestsTable } from "@/components/dashboards/government-emission/RecentTestsTable";
import { YearSelector } from "@/components/dashboards/government-emission/YearSelector";
import { useEmissionDashboard } from "@/hooks/useEmissionDashboard";

const currentYear = new Date().getFullYear();
const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function GovEmissionOverview() {
  const navigate = useNavigate();
  const { user, userData, loading } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  
  // Use our custom hook to fetch and process dashboard data
  const dashboardData = useEmissionDashboard(selectedYear);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    } else if (user && userData && 
              !userData.roles.includes('admin') && 
              !userData.roles.includes('government-emission')) {
      navigate("/dashboard-selection");
      toast.error("You don't have access to this dashboard");
    }
  }, [user, userData, loading, navigate]);

  const handleYearChange = (value: string) => {
    setSelectedYear(parseInt(value));
  };

  if (loading || dashboardData.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="government-emission" />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <header className="mb-8 flex flex-wrap justify-between items-center">
              <div>
                <h1 className="text-3xl font-semibold">Government Emission Dashboard</h1>
                <p className="text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <YearSelector 
                  selectedYear={selectedYear} 
                  availableYears={availableYears}
                  onYearChange={handleYearChange}
                />
              </div>
            </header>

            <section>
              <h2 className="text-xl font-semibold mb-4">Emission Overview ({selectedYear})</h2>
              <EmissionStatCards
                totalVehicles={dashboardData.totalVehicles}
                totalPassed={dashboardData.totalPassed}
                totalFailed={dashboardData.totalFailed}
                complianceRate={dashboardData.complianceRate}
              />
            </section>

            <EmissionCharts
              quarterStats={dashboardData.quarterStats}
              engineTypeData={dashboardData.engineTypeData}
              vehicleTypeData={dashboardData.vehicleTypeData}
              selectedYear={selectedYear}
            />

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <OfficeComplianceTable
                complianceData={dashboardData.complianceByOffice}
                selectedYear={selectedYear}
              />
              <EmissionHistoryTrend 
                quarterStats={dashboardData.quarterStats} 
              />
            </section>

            <RecentTestsTable 
              recentTests={dashboardData.recentTests} 
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

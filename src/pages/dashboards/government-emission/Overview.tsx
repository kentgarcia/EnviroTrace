
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmissionStatCards } from "@/components/dashboards/government-emission/EmissionStatCards";
import { EmissionCharts } from "@/components/dashboards/government-emission/EmissionCharts";
import { RecentTestsTable } from "@/components/dashboards/government-emission/RecentTestsTable";
import { EmissionTestSchedule } from "@/components/dashboards/government-emission/EmissionTestSchedule";
import { EmissionHistoryTrend } from "@/components/dashboards/government-emission/EmissionHistoryTrend";
import { ExportToSheet } from "@/components/dashboards/government-emission/ExportToSheet";
import { YearSelector } from "@/components/dashboards/government-emission/YearSelector";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEmissionDashboard } from "@/hooks/useEmissionDashboard";
import { useQuery } from "@tanstack/react-query";
import { type EmissionData } from "@/hooks/useEmissionDashboard";

export default function GovEmissionOverview() {
  const { 
    selectedYear, 
    setSelectedYear,
    isOffline,
    emissionData
  } = useEmissionDashboard();

  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery<EmissionData, Error>({
    queryKey: ['emissionData', selectedYear],
    queryFn: async () => {
      // In a production app, this would fetch from an API
      // For now, we return the data from the hook
      return emissionData as EmissionData;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !isOffline,
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar dashboardType="government-emission" />
        <div className="flex-1 p-6 bg-gray-50">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Government Emission Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor and analyze vehicle emission compliance for government fleets
            </p>
          </div>

          {isOffline && (
            <Alert variant="warning" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Offline Mode</AlertTitle>
              <AlertDescription>
                You are currently offline. Some data may not be up to date.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <YearSelector 
              selectedYear={selectedYear} 
              onYearChange={setSelectedYear} 
            />
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </Button>
              <ExportToSheet data={data} />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <EmissionStatCards 
              data={data} 
              isLoading={isLoading} 
              error={error}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card className="col-span-full lg:col-span-2">
              <CardHeader>
                <CardTitle>Quarterly Emission Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <EmissionCharts 
                  data={data?.quarterlyData} 
                  isLoading={isLoading}
                  error={error}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <EmissionTestSchedule 
                  data={data?.upcomingTests} 
                  isLoading={isLoading}
                  error={error}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Emission Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentTestsTable 
                  data={data?.recentTests} 
                  isLoading={isLoading}
                  error={error}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Historical Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <EmissionHistoryTrend 
                data={data?.historicalTrend} 
                isLoading={isLoading}
                error={error}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarProvider>
  );
}

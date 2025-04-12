
import { useState } from "react";
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
import { useQuery, useQueries } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Suspense, lazy } from "react";
import { SkeletonCard } from "@/components/ui/skeleton-card";

// Data types
interface EmissionStat {
  label: string;
  value: number;
  change: number;
}

interface EmissionData {
  stats: {
    totalVehicles: EmissionStat;
    testedVehicles: EmissionStat;
    complianceRate: EmissionStat;
    failRate: EmissionStat;
  };
  quarterlyData: Array<{
    quarter: number;
    passed: number;
    failed: number;
    name: string;
  }>;
  upcomingTests: Array<{
    id: string;
    location: string;
    quarter: number;
    assignedPersonnel: string;
    scheduledDate: string;
  }>;
  recentTests: Array<{
    id: string;
    plateNumber: string;
    officeName: string;
    testDate: string;
    result: boolean;
  }>;
  historicalTrend: Array<{
    year: number;
    complianceRate: number;
    totalVehicles: number;
  }>;
}

// Lazy loaded components for deferred rendering
const LazyEmissionHistoryTrend = lazy(() => import("@/components/dashboards/government-emission/EmissionHistoryTrend").then(
  (module) => ({ default: module.EmissionHistoryTrend })
));

export default function GovEmissionOverview() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const availableYears = [selectedYear - 2, selectedYear - 1, selectedYear, selectedYear + 1];
  const { isOffline } = useNetworkStatus();

  // Main data query with optimized payload
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['emissionOverview', selectedYear],
    queryFn: async () => {
      if (isOffline) {
        throw new Error("You are offline. Data cannot be fetched.");
      }

      // Parallel data fetching for different data sets
      const [vehiclesResult, testsResult, schedulesResult, recentTestsResult] = await Promise.all([
        // Get vehicle count - only select ID for counting
        supabase.from('vehicles').select('id', { count: 'exact', head: true }),
        
        // Get tests data for the selected year - minimal field selection
        supabase.from('emission_tests')
          .select('id,result,quarter')
          .eq('year', selectedYear),
          
        // Get upcoming test schedules - minimal field selection
        supabase.from('emission_test_schedules')
          .select('id,location,quarter,assigned_personnel,conducted_on')
          .eq('year', selectedYear)
          .order('quarter', { ascending: true })
          .limit(5),
          
        // Get recent tests - minimal field selection
        supabase.from('vehicle_summary_view')
          .select('id,plate_number,office_name,latest_test_date,latest_test_result')
          .order('latest_test_date', { ascending: false })
          .limit(5)
      ]);

      if (vehiclesResult.error || testsResult.error || schedulesResult.error || recentTestsResult.error) {
        throw new Error("Error fetching data");
      }

      const totalVehicles = vehiclesResult.count || 0;
      const testsData = testsResult.data || [];
      const schedulesData = schedulesResult.data || [];
      const recentTestsData = recentTestsResult.data || [];

      // Process tests data
      const testedVehicles = testsData.length;
      const passedTests = testsData.filter(test => test.result).length;
      const failedTests = testedVehicles - passedTests;
      const complianceRate = totalVehicles > 0 ? Math.round((passedTests / totalVehicles) * 100) : 0;
      const failRate = testedVehicles > 0 ? Math.round((failedTests / testedVehicles) * 100) : 0;

      // Process quarterly data
      const quarterlyData = [1, 2, 3, 4].map(quarter => {
        const quarterTests = testsData.filter(test => test.quarter === quarter);
        const passed = quarterTests.filter(test => test.result).length;
        const failed = quarterTests.length - passed;
        return {
          quarter,
          passed,
          failed,
          name: `Q${quarter}`
        };
      });

      // Process upcoming tests
      const upcomingTests = schedulesData.map(schedule => ({
        id: schedule.id,
        location: schedule.location,
        quarter: schedule.quarter,
        assignedPersonnel: schedule.assigned_personnel,
        scheduledDate: schedule.conducted_on
      }));

      // Process recent tests
      const recentTests = recentTestsData.map(test => ({
        id: test.id,
        plateNumber: test.plate_number || 'Unknown',
        officeName: test.office_name || 'Unknown',
        testDate: test.latest_test_date || 'N/A',
        result: test.latest_test_result
      }));

      // Create historical trend data (mocked for now)
      const historicalTrend = [
        { year: selectedYear - 2, complianceRate: 82, totalVehicles: 450 },
        { year: selectedYear - 1, complianceRate: 87, totalVehicles: 475 },
        { year: selectedYear, complianceRate, totalVehicles }
      ];

      // Construct return data object
      const emissionData: EmissionData = {
        stats: {
          totalVehicles: {
            label: 'Total Vehicles',
            value: totalVehicles,
            change: 5.2, // Mocked change percentage
          },
          testedVehicles: {
            label: 'Tested Vehicles',
            value: testedVehicles,
            change: 12.3, // Mocked change percentage
          },
          complianceRate: {
            label: 'Compliance Rate',
            value: complianceRate,
            change: 3.1, // Mocked change percentage
          },
          failRate: {
            label: 'Fail Rate',
            value: failRate,
            change: -2.4, // Mocked change percentage
          },
        },
        quarterlyData,
        upcomingTests,
        recentTests,
        historicalTrend,
      };
      
      return emissionData;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
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
            <Alert variant="destructive" className="mb-6">
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
              availableYears={availableYears}
            />
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Loading...' : 'Refresh Data'}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <SkeletonCard key={`stat-skeleton-${i}`} headerHeight={6} contentHeight={12} />
              ))
            ) : error ? (
              <div className="col-span-full p-4 bg-red-50 text-red-600 rounded-md">
                Error loading statistics: {error.message}
              </div>
            ) : (
              <EmissionStatCards stats={data?.stats} />
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card className="col-span-full lg:col-span-2">
              <CardHeader>
                <CardTitle>Quarterly Emission Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px]">
                    <div className="animate-pulse bg-muted h-full w-full rounded-md"></div>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-50 text-red-600 rounded-md">
                    Error loading charts: {error.message}
                  </div>
                ) : (
                  <EmissionCharts data={data?.quarterlyData} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tests</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={`schedule-skeleton-${i}`} className="animate-pulse space-y-1">
                        <div className="h-5 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-50 text-red-600 rounded-md">
                    Error loading schedule: {error.message}
                  </div>
                ) : (
                  <EmissionTestSchedule tests={data?.upcomingTests} />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Emission Tests</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="w-full">
                    <div className="animate-pulse space-y-2">
                      <div className="h-8 bg-muted rounded w-full"></div>
                      {Array(4).fill(0).map((_, i) => (
                        <div key={`table-skeleton-${i}`} className="h-10 bg-muted rounded w-full"></div>
                      ))}
                    </div>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-50 text-red-600 rounded-md">
                    Error loading test data: {error.message}
                  </div>
                ) : (
                  <RecentTestsTable tests={data?.recentTests} />
                )}
              </CardContent>
            </Card>
          </div>

          <Suspense fallback={<SkeletonCard headerHeight={6} contentHeight={24} />}>
            <Card>
              <CardHeader>
                <CardTitle>Historical Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px]">
                    <div className="animate-pulse bg-muted h-full w-full rounded-md"></div>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-50 text-red-600 rounded-md">
                    Error loading historical trends: {error.message}
                  </div>
                ) : (
                  <LazyEmissionHistoryTrend data={data?.historicalTrend} />
                )}
              </CardContent>
            </Card>
          </Suspense>
        </div>
      </div>
    </SidebarProvider>
  );
}

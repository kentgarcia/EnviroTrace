import { useState, useEffect, useMemo } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { SkeletonTable } from "@/components/ui/skeleton-table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { YearSelectorWrapper } from "@/components/dashboards/government-emission/YearSelectorWrapper";
import { EmissionStatCardsWrapper } from "@/components/dashboards/government-emission/EmissionStatCardsWrapper";
import { EmissionChartsWrapper } from "@/components/dashboards/government-emission/EmissionChartsWrapper";
import { EmissionTestScheduleWrapper } from "@/components/dashboards/government-emission/EmissionTestScheduleWrapper";
import { RecentTestsTableWrapper } from "@/components/dashboards/government-emission/RecentTestsTableWrapper";
import { z } from "zod";
import { toast } from "sonner";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { useTauriStore } from "@/hooks/useTauriStore";

const dashboardDataSchema = z.object({
  stats: z.object({
    totalVehicles: z.number(),
    testedVehicles: z.number(),
    complianceRate: z.number(),
    failRate: z.number(),
    officeDepartments: z.number(),
  }),
  quarterlyData: z.array(
    z.object({
      quarter: z.string(),
      pass: z.number(),
      fail: z.number(),
    })
  ),
  upcomingTests: z.array(
    z.object({
      id: z.string(),
      vehicleId: z.string(),
      department: z.string(),
      scheduledDate: z.string(),
    })
  ),
  recentTests: z.array(
    z.object({
      id: z.string(),
      vehicleId: z.string(),
      testDate: z.string(),
      result: z.boolean(),
    })
  ),
  historyData: z.array(
    z.object({
      year: z.number(),
      rate: z.number(),
    })
  ),
  engineTypeData: z.array(
    z.object({
      type: z.string(),
      count: z.number(),
    })
  ),
  wheelCountData: z.array(
    z.object({
      count: z.number(),
      wheelCount: z.number(),
    })
  ),
});

export default function GovEmissionOverview() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [offlineData, setOfflineData] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(false);
  const { get, set, save } = useTauriStore();

  // Fetch available years dynamically from emission_tests table
  useEffect(() => {
    async function fetchYears() {
      const { data, error } = await supabase
        .from("emission_tests")
        .select("year");
      if (!error && data) {
        const years = Array.from(new Set(data.map((row: any) => row.year))).filter(Boolean).sort((a, b) => b - a);
        setAvailableYears(years);
      }
    }
    fetchYears();
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    updateOnlineStatus();
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  // Try to load cached data if offline
  useEffect(() => {
    if (isOffline) {
      get(`govEmissionDashboard_${selectedYear}`).then((cached: any) => {
        if (cached) setOfflineData(cached);
      });
    } else {
      setOfflineData(null);
    }
  }, [isOffline, selectedYear, get]);

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["govEmissionDashboard", selectedYear],
    queryFn: async () => {
      type DashboardData = {
        stats: {
          totalVehicles: number;
          testedVehicles: number;
          complianceRate: number;
          failRate: number;
          officeDepartments: number;
        };
        quarterlyData: Array<{
          quarter: string;
          pass: number;
          fail: number;
        }>;
        upcomingTests: Array<{
          id: string;
          vehicleId: string;
          department: string;
          scheduleddate: string;
        }>;
        recentTests: Array<{
          id: string;
          vehicleid: string;
          test_date: string;
          result: boolean;
        }>;
        historyData: Array<{
          year: number;
          rate: number;
        }>;
        engineTypeData: Array<{
          type: string;
          count: number;
        }>;
        wheelCountData: Array<{
          count: number;
          wheel_count: number;
        }>;
      };

      const { data, error } = await supabase.rpc("fetch_dashboard_data", { selected_year: selectedYear });
      if (error) {
        toast.error("Failed to fetch dashboard data");
        throw error;
      }

      const dashboard = data as DashboardData;

      const parsedData = dashboardDataSchema.parse({
        stats: {
          totalVehicles: dashboard.stats.totalVehicles,
          testedVehicles: dashboard.stats.testedVehicles,
          complianceRate: dashboard.stats.complianceRate,
          failRate: dashboard.stats.failRate,
          officeDepartments: dashboard.stats.officeDepartments,
        },
        quarterlyData: dashboard.quarterlyData.map((item) => ({
          quarter: item.quarter,
          pass: item.pass,
          fail: item.fail,
        })),
        upcomingTests: dashboard.upcomingTests.map((item) => ({
          id: item.id,
          vehicleId: item.vehicleId,
          department: item.department,
          scheduledDate: item.scheduleddate,
        })),
        recentTests: dashboard.recentTests.map((item) => ({
          id: item.id,
          vehicleId: item.vehicleid,
          testDate: item.test_date,
          result: item.result,
        })),
        historyData: dashboard.historyData.map((item) => ({
          year: item.year,
          rate: item.rate,
        })),
        engineTypeData: dashboard.engineTypeData.map((item) => ({
          type: item.type,
          count: item.count,
        })),
        wheelCountData: dashboard.wheelCountData.map((item) => ({
          wheelCount: item.wheel_count,
          count: item.count,
        })),
      });

      // Save to Tauri Store for offline use
      await set(`govEmissionDashboard_${selectedYear}`, parsedData);
      await save();
      return parsedData;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
    enabled: !isOffline, // Don't fetch if offline
  });

  const displayData = isOffline ? offlineData : dashboardData;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="government-emission" />
        <div className="flex-1 overflow-auto">
          <DashboardNavbar dashboardTitle="Government Emission Dashboard" />
          <div className="p-6">
            <main>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-semibold">Dashboard Overview</h1>
                  <p className="text-muted-foreground">Monitor and manage emission testing for government vehicles</p>
                  {isOffline && (
                    <div className="text-sm text-yellow-600 mt-2">Offline mode: showing last available data</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <YearSelectorWrapper
                    selectedYear={selectedYear}
                    onYearChange={(year) => setSelectedYear(Number(year))}
                    availableYears={availableYears}
                  />
                </div>
              </div>

              <div className="space-y-8">
                {/* Stats Cards */}
                <section>
                  {isLoading && !displayData ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <SkeletonCard key={i} headerHeight={6} contentHeight={12} />
                      ))}
                    </div>
                  ) : (
                    <EmissionStatCardsWrapper
                      totalVehicles={displayData?.stats.totalVehicles ?? 0}
                      testedVehicles={displayData?.stats.testedVehicles ?? 0}
                      passRate={displayData?.stats.complianceRate ?? 0}
                      officeDepartments={displayData?.stats.officeDepartments ?? 0}
                      subtitle={`Showing data for ${selectedYear} emissions testing`}
                    />
                  )}
                </section>

                {/* Charts Section */}
                <section>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold mb-1">Quarterly Emission Test Results</CardTitle>
                      <CardDescription>
                        Pass and fail rates across quarters
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      {isLoading && !displayData ? (
                        <div className="h-[300px] w-full flex items-center justify-center">
                          <Skeleton className="h-[300px] w-full" />
                        </div>
                      ) : (
                        <EmissionChartsWrapper
                          quarterlyData={displayData?.quarterlyData.map((data) => ({
                            name: data.quarter,
                            passed: data.pass,
                            failed: data.fail,
                            total: data.pass + data.fail,
                          })) || []}
                          engineTypeData={displayData?.engineTypeData.map(data => ({ name: data.type, value: data.count })) || []}
                          wheelCountData={displayData?.wheelCountData.map(data => ({ wheelCount: data.wheelCount, count: data.count })) || []}
                          selectedYear={selectedYear}
                        />
                      )}
                    </CardContent>
                  </Card>
                </section>

                {/* Two Column Layout */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Upcoming Tests */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Upcoming Emission Tests</CardTitle>
                      <CardDescription>
                        Tests scheduled in the next 30 days
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoading && !displayData ? (
                        <SkeletonTable rows={5} columns={3} />
                      ) : (
                        <EmissionTestScheduleWrapper
                          selectedYear={selectedYear}
                        />
                      )}
                    </CardContent>
                  </Card>

                  {/* Right Column - Recent Tests */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Test Results</CardTitle>
                      <CardDescription>Latest emission test results</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoading && !displayData ? (
                        <SkeletonTable rows={5} columns={4} />
                      ) : (
                        <RecentTestsTableWrapper
                          recentTests={displayData?.recentTests || []}
                        />
                      )}
                    </CardContent>
                  </Card>
                </section>
      
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

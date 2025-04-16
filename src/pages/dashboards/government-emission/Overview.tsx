import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
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
import { EmissionHistoryTrendWrapper } from "@/components/dashboards/government-emission/EmissionHistoryTrendWrapper";
import { z } from "zod";
import { toast } from "sonner";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";

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
  const [selectedQuarter, setSelectedQuarter] = useState("All");
  const [availableYears, setAvailableYears] = useState<number[]>([]);

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

      return parsedData;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="government-emission" />
        <div className="flex-1 overflow-auto">
          <DashboardNavbar />
          <div className="p-6">
            <header className="mb-8">
              <h1 className="text-3xl font-semibold">Government Vehicle Emission Dashboard</h1>
              <p className="text-muted-foreground">Monitor and manage emission testing for government vehicles</p>
            </header>

            <main>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">Dashboard Overview</h2>
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground">
                    {isLoading ? (
                      <Skeleton className="h-5 w-48" />
                    ) : (
                      `Showing data for ${selectedYear} emissions testing${selectedQuarter !== "All" ? ", Q" + selectedQuarter : ""}`
                    )}
                  </div>
                  <YearSelectorWrapper
                    selectedYear={selectedYear}
                    onYearChange={(year) => setSelectedYear(Number(year))}
                    availableYears={availableYears}
                    selectedQuarter={selectedQuarter === "All" ? "All" : Number(selectedQuarter)}
                    onQuarterChange={(quarter) => setSelectedQuarter(quarter)}
                    showQuarters={true}
                  />
                </div>
              </div>

              <div className="space-y-8">
                {/* Stats Cards */}
                <section>
                  {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <SkeletonCard key={i} headerHeight={6} contentHeight={12} />
                      ))}
                    </div>
                  ) : (
                    <EmissionStatCardsWrapper
                      totalVehicles={dashboardData?.stats.totalVehicles ?? 0}
                      testedVehicles={dashboardData?.stats.testedVehicles ?? 0}
                      passRate={dashboardData?.stats.complianceRate ?? 0}
                      officeDepartments={dashboardData?.stats.officeDepartments ?? 0}
                    />
                  )}
                </section>

                {/* Charts Section */}
                <section>
                  <Card>
                    <CardHeader>
                      <CardTitle>Quarterly Emission Test Results</CardTitle>
                      <CardDescription>
                        Pass and fail rates across quarters
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      {isLoading ? (
                        <div className="h-[300px] w-full flex items-center justify-center">
                          <Skeleton className="h-[300px] w-full" />
                        </div>
                      ) : (
                        <EmissionChartsWrapper
                          quarterlyData={dashboardData?.quarterlyData.map((data) => ({
                            name: data.quarter,
                            passed: data.pass,
                            failed: data.fail,
                            total: data.pass + data.fail,
                          })) || []}
                          engineTypeData={dashboardData?.engineTypeData.map(data => ({ name: data.type, value: data.count })) || []}
                          wheelCountData={dashboardData?.wheelCountData.map(data => ({ wheelCount: data.wheelCount, count: data.count })) || []}
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
                      {isLoading ? (
                        <SkeletonTable rows={5} columns={3} />
                      ) : (
                        <EmissionTestScheduleWrapper
                          selectedYear={selectedYear}
                          selectedQuarter={selectedQuarter === "All" ? undefined : Number(selectedQuarter)}
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
                      {isLoading ? (
                        <SkeletonTable rows={5} columns={4} />
                      ) : (
                        <RecentTestsTableWrapper
                          recentTests={dashboardData?.recentTests || []}
                        />
                      )}
                    </CardContent>
                  </Card>
                </section>

                {/* Historical Trend */}
                <section>
                  <Card>
                    <CardHeader>
                      <CardTitle>Historical Compliance Trend</CardTitle>
                      <CardDescription>
                        Year-over-year compliance rate comparison
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      {isLoading ? (
                        <div className="h-[300px] w-full flex items-center justify-center">
                          <Skeleton className="h-[300px] w-full" />
                        </div>
                      ) : (
                        <EmissionHistoryTrendWrapper
                          historyData={dashboardData?.historyData || []}
                        />
                      )}
                    </CardContent>
                  </Card>
                </section>

                {/* Export Section */}
                <section>
                  <Card>
                    <CardHeader>
                      <CardTitle>Export Data</CardTitle>
                      <CardDescription>
                        Download emission testing data for reporting
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4">
                        <Button variant="outline">Export to Excel</Button>
                        <Button variant="outline">Export to PDF</Button>
                        <Button variant="outline">Export to CSV</Button>
                      </div>
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

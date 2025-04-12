import { useState } from "react";
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

export default function GovEmissionOverview() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['govEmissionDashboard', selectedYear],
    queryFn: async () => {
      // In a real app, this would fetch from your API with the selected year
      // For demo purposes, we'll simulate a delay and return mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data structure
      return {
        stats: {
          totalVehicles: 1248,
          testedVehicles: 987,
          complianceRate: 79.2,
          failRate: 8.5
        },
        quarterlyData: [
          { quarter: 'Q1', pass: 230, fail: 20 },
          { quarter: 'Q2', pass: 245, fail: 25 },
          { quarter: 'Q3', pass: 260, fail: 15 },
          { quarter: 'Q4', pass: 252, fail: 18 }
        ],
        upcomingTests: [
          { id: 1, vehicleId: 'GV-2023-001', department: 'Public Works', scheduledDate: '2023-06-15' },
          { id: 2, vehicleId: 'GV-2023-042', department: 'Parks & Recreation', scheduledDate: '2023-06-18' },
          { id: 3, vehicleId: 'GV-2023-108', department: 'Water District', scheduledDate: '2023-06-22' },
          { id: 4, vehicleId: 'GV-2023-156', department: 'Fire Department', scheduledDate: '2023-06-25' },
          { id: 5, vehicleId: 'GV-2023-201', department: 'Police Department', scheduledDate: '2023-06-28' }
        ],
        recentTests: [
          { id: 1, vehicleId: 'GV-2023-198', testDate: '2023-06-01', result: 'Pass', emissions: '1.2g/km' },
          { id: 2, vehicleId: 'GV-2023-045', testDate: '2023-06-02', result: 'Fail', emissions: '4.8g/km' },
          { id: 3, vehicleId: 'GV-2023-112', testDate: '2023-06-03', result: 'Pass', emissions: '1.5g/km' },
          { id: 4, vehicleId: 'GV-2023-078', testDate: '2023-06-04', result: 'Pass', emissions: '1.1g/km' },
          { id: 5, vehicleId: 'GV-2023-156', testDate: '2023-06-05', result: 'Pass', emissions: '1.3g/km' }
        ],
        historyData: [
          { year: 2019, rate: 68 },
          { year: 2020, rate: 72 },
          { year: 2021, rate: 75 },
          { year: 2022, rate: 77 },
          { year: 2023, rate: 79 }
        ]
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="government-emission" />
        <div className="flex-1 overflow-auto">
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
                      `Showing data for ${selectedYear} emissions testing`
                    )}
                  </div>
                  <YearSelectorWrapper
                    selectedYear={selectedYear}
                    onYearChange={(year) => setSelectedYear(Number(year))}
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
                      totalVehicles={dashboardData?.stats.totalVehicles}
                      testedVehicles={dashboardData?.stats.testedVehicles}
                      complianceRate={dashboardData?.stats.complianceRate}
                      failRate={dashboardData?.stats.failRate}
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
                          quarterlyData={dashboardData?.quarterlyData || []}
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
                          schedules={dashboardData?.upcomingTests || []}
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

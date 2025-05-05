import { useState, useEffect, lazy, Suspense } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmissionDashboard } from "@/hooks/useEmissionDashboard";
import { YearSelectorWrapper } from "@/components/dashboards/emission/overview/YearSelectorWrapper";
import { EmissionStatCardsWrapper } from "@/components/dashboards/emission/overview/EmissionStatCardsWrapper";
import { toast } from "sonner";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { useEmissionStore } from "@/hooks/useEmissionStore";
import { NetworkStatus } from "@/components/layout/NetworkStatus";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

// Lazy-loaded components for better performance
const EmissionChartsWrapper = lazy(() =>
    import("@/components/dashboards/emission/overview/EmissionChartsWrapper").then(
        module => ({ default: module.EmissionChartsWrapper })
    )
);

const EmissionHistoryTrendWrapper = lazy(() =>
    import("@/components/dashboards/emission/overview/EmissionHistoryTrendWrapper").then(
        module => ({ default: module.EmissionHistoryTrendWrapper })
    )
);

const EmissionTestScheduleWrapper = lazy(() =>
    import("@/components/dashboards/emission/overview/EmissionTestScheduleWrapper").then(
        module => ({ default: module.EmissionTestScheduleWrapper })
    )
);

const RecentTestsTableWrapper = lazy(() =>
    import("@/components/dashboards/emission/overview/RecentTestsTableWrapper").then(
        module => ({ default: module.RecentTestsTableWrapper })
    )
);

// Component for skeleton loading placeholders
const LoadingSkeleton = ({ type }: { type: 'chart' | 'table' | 'component' }) => {
    if (type === 'chart') {
        return <Skeleton className="w-full h-[300px] rounded-md" />;
    } else if (type === 'table') {
        return (
            <div className="space-y-2">
                <Skeleton className="w-full h-10 rounded-md" />
                <Skeleton className="w-full h-10 rounded-md" />
                <Skeleton className="w-full h-10 rounded-md" />
                <Skeleton className="w-full h-10 rounded-md" />
                <Skeleton className="w-full h-10 rounded-md" />
            </div>
        );
    } else {
        return <Skeleton className="w-full h-40 rounded-md" />;
    }
};

export default function GovEmissionOverview() {
    // Get year and quarter from Zustand store
    const { selectedYear, selectedQuarter, actions } = useEmissionStore();
    const { isOffline } = useNetworkStatus();

    // Check for available years to populate year selector
    const [availableYears, setAvailableYears] = useState<number[]>([]);

    // Use our custom hook to fetch emission dashboard data
    const {
        data,
        loading,
        error,
        totalVehicles,
        totalPassed,
        totalFailed,
        complianceRate,
        quarterStats,
        engineTypeData,
        vehicleTypeData,
        complianceByOffice,
        recentTests
    } = useEmissionDashboard(selectedYear, selectedQuarter);

    // When the component mounts, populate the available years
    useEffect(() => {
        // Get the current year and previous 4 years
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
        setAvailableYears(years);
    }, []);

    // Handle errors in data fetching
    useEffect(() => {
        if (error) {
            toast.error("Failed to load dashboard data");
            console.error("Error loading emission dashboard data:", error);
        }
    }, [error]);

    // Format data for charts
    const quarterlyChartData = quarterStats.map(q => ({
        name: q.name,
        passed: q.passed,
        failed: q.failed,
        total: q.passed + q.failed
    }));

    // Mocked data for history trend
    const historyData = [
        { year: selectedYear - 2, complianceRate: 82, totalVehicles: 450 },
        { year: selectedYear - 1, complianceRate: 87, totalVehicles: 475 },
        { year: selectedYear, complianceRate, totalVehicles }
    ];

    // Format wheel count data for chart
    const wheelCountData = vehicleTypeData
        .filter(item => !isNaN(parseInt(item.name)))
        .map(item => ({
            wheelCount: parseInt(item.name),
            count: item.value
        }));

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
                                    <p className="text-muted-foreground">
                                        Monitor and manage emission testing for government vehicles
                                    </p>
                                    {isOffline && (
                                        <div className="text-sm bg-yellow-50 text-yellow-800 px-2 py-1 mt-2 rounded-md flex items-center">
                                            <span className="mr-1">⚠️</span> Offline mode: showing cached data
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <YearSelectorWrapper
                                        selectedYear={selectedYear}
                                        onYearChange={(year) => actions.setSelectedYear(Number(year))}
                                        availableYears={availableYears}
                                    />
                                </div>
                            </div>

                            <div className="space-y-8">
                                {/* Statistics Cards Section */}
                                <section>
                                    {loading ? (
                                        <LoadingSkeleton type="component" />
                                    ) : (
                                        <EmissionStatCardsWrapper
                                            totalVehicles={totalVehicles}
                                            testedVehicles={totalPassed + totalFailed}
                                            passRate={complianceRate}
                                            officeDepartments={complianceByOffice.length}
                                            subtitle={`Showing data for ${selectedYear}${selectedQuarter ? ` Q${selectedQuarter}` : ''}`}
                                        />
                                    )}
                                </section>

                                {/* Charts Section */}
                                <Suspense fallback={<LoadingSkeleton type="chart" />}>
                                    <section>
                                        {loading ? (
                                            <LoadingSkeleton type="chart" />
                                        ) : (
                                            <EmissionChartsWrapper
                                                quarterlyData={quarterlyChartData}
                                                engineTypeData={engineTypeData}
                                                wheelCountData={wheelCountData}
                                                selectedYear={selectedYear}
                                            />
                                        )}
                                    </section>
                                </Suspense>

                                {/* Two Column Layout */}
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column - Test Schedule */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Emission Test Schedules</CardTitle>
                                            <CardDescription>
                                                Planned testing for vehicles
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Suspense fallback={<LoadingSkeleton type="table" />}>
                                                {loading ? (
                                                    <LoadingSkeleton type="table" />
                                                ) : (
                                                    <EmissionTestScheduleWrapper
                                                        selectedYear={selectedYear}
                                                        selectedQuarter={selectedQuarter}
                                                    />
                                                )}
                                            </Suspense>
                                        </CardContent>
                                    </Card>

                                    {/* Right Column - Recent Tests */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Recent Test Results</CardTitle>
                                            <CardDescription>Latest emission test results</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Suspense fallback={<LoadingSkeleton type="table" />}>
                                                {loading ? (
                                                    <LoadingSkeleton type="table" />
                                                ) : (
                                                    <RecentTestsTableWrapper recentTests={recentTests} />
                                                )}
                                            </Suspense>
                                        </CardContent>
                                    </Card>
                                </section>

                                {/* Historical Trend Chart */}
                                <Suspense fallback={<LoadingSkeleton type="chart" />}>
                                    <section>
                                        {loading ? (
                                            <LoadingSkeleton type="chart" />
                                        ) : (
                                            <EmissionHistoryTrendWrapper historyData={historyData} />
                                        )}
                                    </section>
                                </Suspense>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
            <NetworkStatus />
        </SidebarProvider>
    );
}
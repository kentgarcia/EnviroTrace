import { lazy, Suspense, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, FileSpreadsheet } from "lucide-react";
import { PeriodSelector } from "@/components/dashboards/emission/offices/PeriodSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { useOffices } from "@/hooks/offices/useOffices";

// Lazy load components for better performance
const ComplianceSummaryCard = lazy(() =>
    import("@/components/dashboards/emission/offices/ComplianceSummaryCard").then(
        (module) => ({ default: module.ComplianceSummaryCard })
    )
);

const OfficeComplianceTable = lazy(() =>
    import("@/components/dashboards/emission/offices/OfficeComplianceTable").then(
        (module) => ({ default: module.OfficeComplianceTable })
    )
);

// Fallback loading component for lazy loaded components
const LoadingFallback = () => (
    <div className="space-y-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-6">
                    <Skeleton className="h-20 w-full" />
                </Card>
            ))}
        </div>
        <Card className="p-6">
            <Skeleton className="h-[400px] w-full" />
        </Card>
    </div>
);

export default function OfficesPage() {
    const [activeTab, setActiveTab] = useState("overview");

    const {
        officeData,
        isLoading,
        errorMessage,
        filters,
        handleFilterChange,
        refetch,
        summaryStats
    } = useOffices();

    // Handle refreshing the data
    const handleRefresh = () => {
        refetch();
    };

    // Memoize handlers to prevent them from being recreated on every render
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        handleFilterChange({ searchTerm: e.target.value });
    }, [handleFilterChange]);

    const handleYearChange = useCallback((year: number) => {
        handleFilterChange({ year });
    }, [handleFilterChange]);

    const handleQuarterChange = useCallback((quarter: number | undefined) => {
        handleFilterChange({ quarter });
    }, [handleFilterChange]);

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Government Offices</h1>
                    <p className="text-sm text-muted-foreground">
                        Monitor emission compliance across government offices
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <PeriodSelector
                    year={filters.year}
                    quarter={filters.quarter}
                    onYearChange={handleYearChange}
                    onQuarterChange={handleQuarterChange}
                />

                <div className="flex gap-2">
                    <div className="relative w-full sm:w-[300px]">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search offices..."
                            className="pl-8"
                            value={filters.searchTerm || ''}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span className="sr-only">Refresh</span>
                    </Button>
                    <Button variant="outline" size="icon">
                        <FileSpreadsheet className="h-4 w-4" />
                        <span className="sr-only">Export</span>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <Suspense fallback={<LoadingFallback />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="p-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-muted-foreground">Total Offices</span>
                                    <span className="text-2xl font-bold">{summaryStats.totalOffices}</span>
                                </div>
                            </Card>
                            <Card className="p-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-muted-foreground">Total Vehicles</span>
                                    <span className="text-2xl font-bold">{summaryStats.totalVehicles}</span>
                                </div>
                            </Card>
                            <Card className="p-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-muted-foreground">Compliant Offices</span>
                                    <span className="text-2xl font-bold">{summaryStats.totalCompliant}</span>
                                </div>
                            </Card>
                            <Card className="p-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-muted-foreground">Overall Compliance</span>
                                    <span className="text-2xl font-bold">{summaryStats.overallComplianceRate}%</span>
                                </div>
                            </Card>
                        </div>

                        <Card>
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-4">Office Compliance</h2>
                                <OfficeComplianceTable
                                    officeData={officeData}
                                    isLoading={isLoading}
                                    errorMessage={errorMessage}
                                />
                            </div>
                        </Card>
                    </Suspense>
                </TabsContent>

                <TabsContent value="analytics">
                    <Card className="p-6">
                        <h3 className="text-lg font-medium">Analytics Dashboard</h3>
                        <p className="text-muted-foreground">
                            Detailed analytics coming soon.
                        </p>
                    </Card>
                </TabsContent>

                <TabsContent value="reports">
                    <Card className="p-6">
                        <h3 className="text-lg font-medium">Compliance Reports</h3>
                        <p className="text-muted-foreground">
                            Reports will be available soon.
                        </p>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
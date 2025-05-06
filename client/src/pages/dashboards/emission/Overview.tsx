import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/emissions/useDashboardData";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { NetworkStatus } from "@/components/layout/NetworkStatus";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EChartsPieChart } from "@/components/dashboard/EChartsPieChart";
import { EChartsBarChart } from "@/components/dashboard/EChartsBarChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { CarFront, BarChart3, Building2, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Component for skeleton loading placeholders
const LoadingSkeleton = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Skeleton className="w-full h-[120px] rounded-md" />
                <Skeleton className="w-full h-[120px] rounded-md" />
                <Skeleton className="w-full h-[120px] rounded-md" />
                <Skeleton className="w-full h-[120px] rounded-md" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="w-full h-[300px] rounded-md" />
                <Skeleton className="w-full h-[300px] rounded-md" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="w-full h-[350px] rounded-md" />
                <Skeleton className="w-full h-[350px] rounded-md" />
            </div>
        </div>
    );
};

const GovEmissionOverview: React.FC = () => {
    // State for year and quarter selection
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedQuarter, setSelectedQuarter] = useState<number | undefined>(undefined);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { toast } = useToast();

    // Available years for selection - last 5 years
    const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

    // Use our dashboard data hook to fetch all required data
    const { data, loading, error } = useDashboardData(selectedYear, selectedQuarter);

    // Format for display
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat().format(num);
    };

    // Function to handle manual refresh
    const handleRefresh = () => {
        setIsRefreshing(true);
        // Force a re-render by toggling the year and then setting it back
        const tempYear = selectedYear;
        setSelectedYear(tempYear - 1);

        setTimeout(() => {
            setSelectedYear(tempYear);
            setIsRefreshing(false);
            toast({
                title: "Dashboard Refreshed",
                description: "The dashboard data has been refreshed."
            });
        }, 100);
    };

    useEffect(() => {
        // Log detailed error information when an error occurs
        if (error) {
            console.error("Dashboard data error details:", {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
        }
    }, [error]);

    if (error) {
        return (
            <SidebarProvider>
                <div className="flex min-h-screen w-full">
                    <AppSidebar dashboardType="government-emission" />
                    <div className="flex-1 overflow-auto">
                        <DashboardNavbar dashboardTitle="Government Emission Dashboard" />
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-3xl font-semibold">Dashboard Overview</h1>
                                <Button
                                    variant="outline"
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    Refresh Data
                                </Button>
                            </div>
                            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
                                <h3 className="font-medium">Error Loading Dashboard Data</h3>
                                <p className="mb-2">There was a problem connecting to the server. Please try again later or contact support if the issue persists.</p>
                                <details className="text-sm">
                                    <summary className="cursor-pointer font-medium">Technical Details</summary>
                                    <p className="mt-2 font-mono text-xs bg-red-100 p-2 rounded">
                                        {error.message}
                                    </p>
                                </details>
                            </div>

                            <div className="p-6 bg-muted/50 rounded-md text-center">
                                <p className="text-muted-foreground mb-4">
                                    You can try selecting a different year or quarter, or click the refresh button above.
                                </p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    <Select
                                        value={selectedYear.toString()}
                                        onValueChange={(value) => setSelectedYear(Number(value))}
                                    >
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue placeholder="Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableYears.map((year) => (
                                                <SelectItem key={year} value={year.toString()}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={selectedQuarter ? selectedQuarter.toString() : "all"}
                                        onValueChange={(value) =>
                                            setSelectedQuarter(value === "all" ? undefined : Number(value))
                                        }
                                    >
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue placeholder="Quarter" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Quarters</SelectItem>
                                            <SelectItem value="1">Q1</SelectItem>
                                            <SelectItem value="2">Q2</SelectItem>
                                            <SelectItem value="3">Q3</SelectItem>
                                            <SelectItem value="4">Q4</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <NetworkStatus />
            </SidebarProvider>
        );
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar dashboardType="government-emission" />
                <div className="flex-1 overflow-auto">
                    <DashboardNavbar dashboardTitle="Government Emission Dashboard" />
                    <div className="p-6">
                        <main>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                <div>
                                    <h1 className="text-3xl font-semibold">Dashboard Overview</h1>
                                    <p className="text-muted-foreground">
                                        Monitor and manage emission testing for government vehicles
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-wrap gap-2">
                                        <Select
                                            value={selectedYear.toString()}
                                            onValueChange={(value) => setSelectedYear(Number(value))}
                                        >
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue placeholder="Year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableYears.map((year) => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={selectedQuarter ? selectedQuarter.toString() : "all"}
                                            onValueChange={(value) =>
                                                setSelectedQuarter(value === "all" ? undefined : Number(value))
                                            }
                                        >
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue placeholder="Quarter" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Quarters</SelectItem>
                                                <SelectItem value="1">Q1</SelectItem>
                                                <SelectItem value="2">Q2</SelectItem>
                                                <SelectItem value="3">Q3</SelectItem>
                                                <SelectItem value="4">Q4</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={handleRefresh}
                                        disabled={isRefreshing || loading}
                                    >
                                        <RefreshCw className={`h-4 w-4 mr-2 ${(isRefreshing || loading) ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </Button>
                                </div>
                            </div>

                            {loading ? (
                                <LoadingSkeleton />
                            ) : (
                                <div className="space-y-6">
                                    {/* Statistics Cards Section */}
                                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <StatCard
                                            title="Total Vehicles"
                                            value={formatNumber(data.totalVehicles)}
                                            icon={<CarFront className="h-5 w-5" />}
                                            iconClassName="bg-blue-50 text-blue-700"
                                        />
                                        <StatCard
                                            title="Tested Vehicles"
                                            value={formatNumber(data.testedVehicles)}
                                            icon={<CheckCircle className="h-5 w-5" />}
                                            iconClassName="bg-green-50 text-green-700"
                                        />
                                        <StatCard
                                            title="Compliance Rate"
                                            value={`${data.complianceRate}%`}
                                            icon={<BarChart3 className="h-5 w-5" />}
                                            iconClassName="bg-purple-50 text-purple-700"
                                        />
                                        <StatCard
                                            title="Office Departments"
                                            value={formatNumber(data.officeDepartments)}
                                            icon={<Building2 className="h-5 w-5" />}
                                            iconClassName="bg-amber-50 text-amber-700"
                                        />
                                    </section>

                                    {/* First row of charts - Pie charts */}
                                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <EChartsPieChart
                                            title="Vehicles by Engine Type"
                                            data={data.engineTypeData}
                                            height={300}
                                            colors={['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']}
                                        />
                                        <EChartsPieChart
                                            title="Vehicles by Wheel Count"
                                            data={data.wheelCountData}
                                            height={300}
                                            colors={['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe']}
                                        />
                                    </section>

                                    {/* Second row of charts - Bar charts */}
                                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <EChartsBarChart
                                            title="Vehicles by Type"
                                            data={data.vehicleTypeData}
                                            height={350}
                                            layout="horizontal"
                                            color="#2563eb"
                                            valueFormatter={(value) => value.toString()}
                                        />
                                        <EChartsBarChart
                                            title="Compliance by Office"
                                            data={data.officeComplianceData}
                                            height={350}
                                            layout="horizontal"
                                            color="#7c3aed"
                                            valueFormatter={(value) => `${value}%`}
                                        />
                                    </section>
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </div>
            <NetworkStatus />
        </SidebarProvider>
    );
};

export default GovEmissionOverview;
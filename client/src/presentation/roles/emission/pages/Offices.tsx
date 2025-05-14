import { useState, useCallback, memo, useMemo } from "react";
import { Input } from "@/presentation/components/shared/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/presentation/components/shared/ui/tabs";
import { Card } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Search, RefreshCw, FileSpreadsheet } from "lucide-react";
import { YearSelector } from "@/presentation/roles/emission/components/offices/YearSelector";
import { OfficeComplianceTable } from "@/presentation/roles/emission/components/offices/OfficeComplianceTable";
import { useOffices } from "@/hooks/offices/useOffices";
import { AppSidebar } from "@/presentation/components/shared/layout/AppSidebar";
import { SidebarProvider } from "@/presentation/components/shared/ui/sidebar";
import { DashboardNavbar } from "@/presentation/components/shared/layout/DashboardNavbar";

// Memoize the statistic cards to prevent unnecessary re-renders
const StatCard = memo(
  ({ title, value }: { title: string; value: string | number }) => (
    <Card className="p-6">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{title}</span>
        <span className="text-2xl font-bold">{value}</span>
      </div>
    </Card>
  )
);

StatCard.displayName = "StatCard";

export default function OfficesPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const {
    officeData,
    isLoading,
    errorMessage,
    filters,
    handleFilterChange,
    refetch,
    summaryStats,
  } = useOffices();

  // Generate available years for the YearSelector (current year and 5 years back)
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => currentYear - i);
  }, []);

  // Memoize handlers to prevent them from being recreated on every render
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFilterChange({ searchTerm: e.target.value });
    },
    [handleFilterChange]
  );

  const handleYearChange = useCallback(
    (yearStr: string) => {
      handleFilterChange({ year: parseInt(yearStr, 10) });
    },
    [handleFilterChange]
  );

  const handleQuarterChange = useCallback(
    (quarterStr: string) => {
      if (quarterStr === "all") {
        handleFilterChange({ quarter: undefined });
      } else {
        handleFilterChange({ quarter: parseInt(quarterStr, 10) });
      }
    },
    [handleFilterChange]
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="government-emission" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardNavbar />
          {/* Header Section */}
          <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
              Government Offices
            </h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                size="icon"
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
              <Button variant="outline" size="icon">
                <FileSpreadsheet className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Body Section */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
            {/* Controls Row: Search left, Filters right */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              {/* Search (left) */}
              <div className="relative flex items-center w-full md:w-auto justify-start bg-white rounded-md">
                <Search className="absolute left-3 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search offices..."
                  className="pl-8 max-w-xs w-[320px] bg-white"
                  value={filters.searchTerm || ""}
                  onChange={handleSearchChange}
                />
              </div>
              {/* Filters (right) */}
              <div className="flex flex-wrap gap-2 items-center justify-end">
                <YearSelector
                  selectedYear={filters.year}
                  availableYears={availableYears}
                  onYearChange={handleYearChange}
                  selectedQuarter={filters.quarter}
                  onQuarterChange={handleQuarterChange}
                />
              </div>
            </div>

            {/* Main Content */}
            <Tabs
              defaultValue="overview"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Offices"
                    value={summaryStats.totalOffices}
                  />
                  <StatCard
                    title="Total Vehicles"
                    value={summaryStats.totalVehicles}
                  />
                  <StatCard
                    title="Compliant Offices"
                    value={summaryStats.totalCompliant}
                  />
                  <StatCard
                    title="Overall Compliance"
                    value={`${summaryStats.overallComplianceRate}%`}
                  />
                </div>

                <Card className="mt-6">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Office Compliance
                    </h2>
                    <OfficeComplianceTable
                      officeData={officeData}
                      errorMessage={errorMessage}
                    />
                  </div>
                </Card>
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
        </div>
      </div>
    </SidebarProvider>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { NetworkStatus } from "@/components/layout/NetworkStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EChartsPieChart } from "@/components/dashboard/EChartsPieChart";
import { EChartsBarChart } from "@/components/dashboard/EChartsBarChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  FileText,
  Banknote,
  CalendarDays,
  TreePine,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { UrbanOverview } from "@/components/dashboards/urban/overview/UrbanOverview";
import { useUrbanOverview } from "@/hooks/urban/useUrbanOverview";

const Overview: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();

  const {
    data: urbanData,
    isLoading: isUrbanLoading,
    error: urbanError,
  } = useUrbanOverview(selectedYear);

  // Available years for selection - last 5 years
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Mock data for demonstration - replace with actual API calls
  const mockData = {
    inspectionReports: 156,
    totalFeesCollected: 1250000,
    monthlyFees: [
      { month: "Jan", amount: 95000 },
      { month: "Feb", amount: 105000 },
      { month: "Mar", amount: 110000 },
      { month: "Apr", amount: 98000 },
      { month: "May", amount: 115000 },
      { month: "Jun", amount: 125000 },
      { month: "Jul", amount: 118000 },
      { month: "Aug", amount: 112000 },
      { month: "Sep", amount: 108000 },
      { month: "Oct", amount: 102000 },
      { month: "Nov", amount: 95000 },
      { month: "Dec", amount: 100000 },
    ],
    latePayments: 23,
    requestTypes: [
      { name: "Tree Cutting", value: 45 },
      { name: "Tree Pruning", value: 30 },
      { name: "Ball-out", value: 25 },
    ],
    requestStatus: [
      { name: "On Hold", value: 15 },
      { name: "For Signature", value: 25 },
      { name: "Payment and Pick-up", value: 35 },
      { name: "Filed", value: 25 },
    ],
    treesToBeProcessed: [
      { type: "Narra", count: 12 },
      { type: "Acacia", count: 8 },
      { type: "Mahogany", count: 15 },
      { type: "Mango", count: 10 },
      { type: "Others", count: 5 },
    ],
    floralData: [
      { type: "Orchids", count: 150 },
      { type: "Ferns", count: 200 },
      { type: "Bromeliads", count: 100 },
      { type: "Anthuriums", count: 80 },
      { type: "Others", count: 70 },
    ],
  };

  // Function to handle manual refresh
  const handleRefresh = useCallback(() => {
    if (isRefreshing) return; // Prevent multiple refreshes

    setIsRefreshing(true);

    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Dashboard Refreshed",
        description: "The dashboard data has been refreshed.",
      });
    }, 1000);
  }, [isRefreshing, toast]);

  // Effect to handle year changes
  useEffect(() => {
    // Here you would typically fetch data for the selected year
    console.log(`Fetching data for year: ${selectedYear}`);
  }, [selectedYear]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="tree-management" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardNavbar />

          {/* Header Section */}
          <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
              Urban Management Overview
            </h1>
            <div className="flex items-center gap-4">
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
            <Tabs
              defaultValue="general"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="mb-6">
                <TabsTrigger value="general">General Overview</TabsTrigger>
                <TabsTrigger value="urban">Urban Overview</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard
                    title="Inspection Reports"
                    value={mockData.inspectionReports}
                    icon={<FileText className="h-4 w-4" />}
                    description="Total reports for the year"
                  />
                  <StatCard
                    title="Fees Collected"
                    value={`₱${mockData.totalFeesCollected.toLocaleString()}`}
                    icon={<Banknote className="h-4 w-4" />}
                    description="Total fees for the year"
                  />
                  <StatCard
                    title="Late Payments"
                    value={mockData.latePayments}
                    icon={<AlertTriangle className="h-4 w-4" />}
                    description="Clearance late payments"
                  />
                  <StatCard
                    title="Tree Requests"
                    value={mockData.requestTypes.reduce(
                      (sum, item) => sum + item.value,
                      0
                    )}
                    icon={<TreePine className="h-4 w-4" />}
                    description="Total requests for the year"
                  />
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Fees Collection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EChartsBarChart
                        data={mockData.monthlyFees.map((item) => ({
                          id: item.month,
                          label: item.month,
                          value: item.amount,
                        }))}
                        height={300}
                        title={""}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Request Types Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EChartsPieChart
                        data={mockData.requestTypes.map((item) => ({
                          id: item.name,
                          label: item.name,
                          value: item.value,
                        }))}
                        height={300}
                        title={""}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Request Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EChartsPieChart
                        data={mockData.requestStatus.map((item) => ({
                          id: item.name,
                          label: item.name,
                          value: item.value,
                        }))}
                        height={300}
                        title={""}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Trees to be Processed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EChartsBarChart
                        data={mockData.treesToBeProcessed.map((item) => ({
                          id: item.type,
                          label: item.type,
                          value: item.count,
                        }))}
                        height={300}
                        title={""}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row 3 */}
                <div className="grid grid-cols-1 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Urban Greening Floral Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EChartsBarChart
                        data={mockData.floralData.map((item) => ({
                          id: item.type,
                          label: item.type,
                          value: item.count,
                        }))}
                        height={300}
                        title={""}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="urban" className="space-y-6">
                {isUrbanLoading ? (
                  <Card className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </Card>
                ) : urbanError ? (
                  <Card className="p-6">
                    <div className="text-red-500">Error: {urbanError}</div>
                  </Card>
                ) : urbanData ? (
                  <UrbanOverview
                    plantSaplingsCollected={urbanData.plantSaplingsCollected}
                    urbanGreening={urbanData.urbanGreening}
                    urbanGreeningBreakdown={urbanData.urbanGreeningBreakdown}
                  />
                ) : null}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <NetworkStatus />
    </SidebarProvider>
  );
};

export default Overview;

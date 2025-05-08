import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { UrbanOverview } from "@/pages/dashboards/urban/components/overview/UrbanOverview";
import { useUrbanOverview } from "@/hooks/urban/useUrbanOverview";
import { YearSelector } from "@/pages/dashboards/emission/components/offices/YearSelector";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";

export default function UrbanPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data, isLoading, error } = useUrbanOverview(selectedYear);

  // Generate available years for the YearSelector (current year and 5 years back)
  const availableYears = Array.from(
    { length: 6 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar dashboardType="tree-management" />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar />
          <div className="flex-1 p-6 overflow-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Urban Management</h1>
                <YearSelector
                  selectedYear={selectedYear}
                  onYearChange={(year) => setSelectedYear(parseInt(year))}
                  availableYears={[]}
                  onQuarterChange={function (quarter: string): void {
                    throw new Error("Function not implemented.");
                  }}
                />
              </div>

              <Tabs
                defaultValue="overview"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="seedlings">Seedlings</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {isLoading ? (
                    <Card className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    </Card>
                  ) : error ? (
                    <Card className="p-6">
                      <div className="text-red-500">Error: {error}</div>
                    </Card>
                  ) : data ? (
                    <UrbanOverview
                      plantSaplingsCollected={data.plantSaplingsCollected}
                      urbanGreening={data.urbanGreening}
                      urbanGreeningBreakdown={data.urbanGreeningBreakdown}
                    />
                  ) : null}
                </TabsContent>

                <TabsContent value="seedlings">
                  <Card className="p-6">
                    <h3 className="text-lg font-medium">Seedling Management</h3>
                    <p className="text-muted-foreground">
                      Seedling management features coming soon.
                    </p>
                  </Card>
                </TabsContent>

                <TabsContent value="reports">
                  <Card className="p-6">
                    <h3 className="text-lg font-medium">Urban Reports</h3>
                    <p className="text-muted-foreground">
                      Urban management reports coming soon.
                    </p>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

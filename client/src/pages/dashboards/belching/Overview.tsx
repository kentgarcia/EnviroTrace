import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { NetworkStatus } from "@/components/layout/NetworkStatus";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, Cloud, UserCircle, Wallet, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import SmokeBelcherMenu from "./components/SmokeBelcherMenu";
import AccountControl from "./components/AccountControl";
import FeeControl from "./components/fee/FeeTable";
import Reports from "./components/Reports";

const AirQuality = () => {
  const [activeTab, setActiveTab] = useState("smoke-belcher");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Available years for selection - last 5 years
  const availableYears = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Dashboard Refreshed",
        description: "The dashboard data has been refreshed.",
      });
    }, 1000);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="smoke-belching" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardNavbar />

          {/* Header Section */}
          <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Smoke Belching Management
              </h1>
              <p className="text-muted-foreground">
                Monitor and manage smoke belching violations and compliance
              </p>
            </div>
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
          <div className="flex-1 overflow-auto p-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="smoke-belcher">
                  <Cloud className="h-4 w-4 mr-2" />
                  Smoke Belcher Menu
                </TabsTrigger>
                <TabsTrigger value="account">
                  <UserCircle className="h-4 w-4 mr-2" />
                  Account Control
                </TabsTrigger>
                <TabsTrigger value="fee">
                  <Wallet className="h-4 w-4 mr-2" />
                  Fee Control
                </TabsTrigger>
                <TabsTrigger value="reports">
                  <FileText className="h-4 w-4 mr-2" />
                  Reports
                </TabsTrigger>
              </TabsList>

              <TabsContent value="smoke-belcher" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Smoke Belcher Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SmokeBelcherMenu />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Control</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AccountControl />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fee" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Fee Control</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FeeControl
                      onViewRate={(rate) => {
                        // TODO: Implement view rate modal
                        console.log("View rate:", rate);
                      }}
                      onEditRate={(rate) => {
                        // TODO: Implement edit rate modal
                        console.log("Edit rate:", rate);
                      }}
                      onDeleteRate={(rate) => {
                        // TODO: Implement delete rate confirmation
                        console.log("Delete rate:", rate);
                      }}
                      onAddRate={() => {
                        // TODO: Implement add rate modal
                        console.log("Add new rate");
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Reports />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <NetworkStatus />
    </SidebarProvider>
  );
};

export default AirQuality;

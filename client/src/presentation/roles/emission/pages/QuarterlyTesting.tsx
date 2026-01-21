/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { BarChart3, Settings, Table, Users, RefreshCw } from "lucide-react";
import { Button } from "@/presentation/components/shared/ui/button";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import { cn } from "@/core/utils/utils";
import { Card } from "@/presentation/components/shared/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/presentation/components/shared/ui/tabs";
import { QuarterlyTestingFilters } from "@/presentation/roles/emission/components/quarterly/QuarterlyTestingFilters";
import VehicleTestingSpreadsheet from "@/presentation/roles/emission/components/quarterly/VehicleTestingSpreadsheet";
import { QuickTestForm } from "@/presentation/roles/emission/components/quarterly/QuickTestForm";
import { QuarterlyOverview } from "@/presentation/roles/emission/components/quarterly/QuarterlyOverview";
import { QuarterInfoEditor } from "@/presentation/roles/emission/components/quarterly/QuarterInfoEditor";
import { useRevampedQuarterlyTesting } from "@/presentation/roles/emission/components/quarterly/useRevampedQuarterlyTesting";

// Main Component
export default function QuarterlyTesting() {
  const [activeTab, setActiveTab] = useState("overview");

  const {
    // State
    selectedYear,
    selectedOffices,
    search,
    isQuickTestOpen,
    selectedVehicle,
    selectedQuarter,
    testToEdit,
    isSubmitting,

    // Data
    officeGroups,
    offices,
    availableYears,
    summaryStats,

    // Loading states
    isLoading,

    // Handlers
    handleYearChange,
    handleOfficeChange,
    setSearch,
    handleAddTest,
    handleEditTest,
    handleAddRemarks,
    handleSubmitTest,
    handleUpdateTest,
    handleBatchAddTests,
    handleBatchUpdateTests,
    handleExportData,
    setIsQuickTestOpen,
    refetchTests,
  } = useRevampedQuarterlyTesting();

  const handleRefresh = () => {
    refetchTests();
  };

  return (
    <>
      <div className="flex min-h-screen w-full">
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavBarContainer dashboardType="government-emission" />

          {/* Header Section */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
              <div className="shrink-0">
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                  Quarterly Testing
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Monitor and manage vehicle emission testing progress for {selectedYear}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="border border-gray-200 bg-white shadow-none rounded-lg h-9 w-9 flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 text-slate-600 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Toolbar / Tabs */}
            <div className="px-6 pb-0 flex flex-col gap-4 w-full mb-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                  <TabsTrigger 
                    value="overview" 
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="testing" 
                    disabled={selectedOffices.length === 0 || (!selectedOffices.includes("all") && selectedOffices.length === 0)}
                  >
                    <Table className="h-4 w-4 mr-2" />
                    Vehicle Testing
                  </TabsTrigger>
                  <TabsTrigger 
                    value="quarters" 
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Body Section */}
          <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
            <div className={cn(
              "w-full transition-all duration-300",
              activeTab === "testing" ? "p-4" : "p-8"
            )}>
              {/* Search and Filters */}
              <div className="mb-6">
                <QuarterlyTestingFilters
                  search={search}
                  onSearchChange={setSearch}
                  selectedYear={selectedYear}
                  availableYears={availableYears}
                  onYearChange={handleYearChange}
                  selectedOffices={selectedOffices}
                  offices={offices}
                  onOfficeChange={handleOfficeChange}
                  compact={false}
                />
              </div>

              <Tabs value={activeTab} className="w-full">
                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
                  <QuarterlyOverview
                    stats={summaryStats}
                    selectedYear={selectedYear}
                    officeGroups={officeGroups}
                    selectedOffices={selectedOffices}
                  />
                </TabsContent>

                {/* Manage Quarters Tab */}
                <TabsContent value="quarters" className="mt-0 focus-visible:outline-none">
                  <Card className="border border-slate-200 shadow-none bg-white p-6">
                    <QuarterInfoEditor selectedYear={selectedYear} />
                  </Card>
                </TabsContent>

                {/* Vehicle Testing Tab */}
                <TabsContent value="testing" className="mt-0 focus-visible:outline-none">
                  {(!selectedOffices.includes("all") && selectedOffices.length === 0) ? (
                    <Card className="border border-slate-200 shadow-none bg-white">
                      <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                          <Users className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">No Offices Selected</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mt-2">
                          Please select one or more offices from the filter above to view vehicle testing data.
                        </p>
                      </div>
                    </Card>
                  ) : (
                    <Card className="border border-slate-200 shadow-none bg-white overflow-hidden">
                      <div className="p-0">
                        <VehicleTestingSpreadsheet
                          officeGroups={officeGroups}
                          selectedYear={selectedYear}
                          isLoading={isLoading}
                          onUpdateTest={handleUpdateTest}
                          onAddRemarks={handleAddRemarks}
                          onLaunchQuickTest={(vehicleId, quarter, existingTest) => {
                            if (existingTest) {
                              handleEditTest(existingTest);
                            } else {
                              handleAddTest(vehicleId, quarter);
                            }
                          }}
                        />
                      </div>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Test Form Dialog */}
      <QuickTestForm
        isOpen={isQuickTestOpen}
        onClose={() => setIsQuickTestOpen(false)}
        vehicle={selectedVehicle}
        quarter={selectedQuarter}
        year={selectedYear}
        testToEdit={testToEdit}
        onSubmit={handleSubmitTest}
        isSubmitting={isSubmitting}
      />
    </>
  );
}

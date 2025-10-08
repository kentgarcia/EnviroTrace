/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { FileDown, BarChart3, Settings, Table } from "lucide-react";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import { Card } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/presentation/components/shared/ui/tabs";
import { QuarterlyTestingFilters } from "@/presentation/roles/emission/components/quarterly/QuarterlyTestingFilters";
import VehicleTestingSpreadsheet from "@/presentation/roles/emission/components/quarterly/VehicleTestingSpreadsheet";
import { QuickTestForm } from "@/presentation/roles/emission/components/quarterly/QuickTestForm";
import { QuarterlyTestingSummary } from "@/presentation/roles/emission/components/quarterly/QuarterlyTestingSummary";
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
  } = useRevampedQuarterlyTesting();

  return (
    <>
      <div className="flex min-h-screen w-full">
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavBarContainer dashboardType="government-emission" />

          {/* Header Section */}
          <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
              Quarterly Testing
            </h1>
            <div className="flex gap-2">
              <Button
                onClick={handleExportData}
                variant="outline"
                size="sm"
                disabled={officeGroups.length === 0}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          {/* Body Section */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
            {/* Filters */}
            <QuarterlyTestingFilters
              search={search}
              onSearchChange={setSearch}
              selectedYear={selectedYear}
              availableYears={availableYears}
              onYearChange={handleYearChange}
              selectedOffices={selectedOffices}
              offices={offices}
              onOfficeChange={handleOfficeChange}
            />

            {/* Tabs Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="quarters" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Manage Quarters
                </TabsTrigger>
                <TabsTrigger value="testing" className="flex items-center gap-2" disabled={selectedOffices.length === 0 || !selectedOffices.includes("all") && selectedOffices.length === 0}>
                  <Table className="h-4 w-4" />
                  Vehicle Testing
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <QuarterlyOverview
                  stats={summaryStats}
                  selectedYear={selectedYear}
                  officeGroups={officeGroups}
                  selectedOffices={selectedOffices}
                />
              </TabsContent>

              {/* Manage Quarters Tab */}
              <TabsContent value="quarters">
                <QuarterInfoEditor selectedYear={selectedYear} />
              </TabsContent>

              {/* Vehicle Testing Tab */}
              <TabsContent value="testing">
                {(!selectedOffices.includes("all") && selectedOffices.length === 0) ? (
                  <Card className="border border-gray-200 shadow-none rounded-none bg-white">
                    <div className="p-8 text-center">
                      <div className="text-gray-500 text-lg">
                        Please select one or more offices to view vehicle testing data
                      </div>
                      <div className="text-gray-400 text-sm mt-2">
                        Use the office filter above to continue, or select "All Offices" to view all data
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="border border-gray-200 shadow-none rounded-none bg-white">
                    <div className="p-6">
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

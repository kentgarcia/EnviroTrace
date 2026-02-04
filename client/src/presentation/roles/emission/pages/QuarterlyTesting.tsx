/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { BarChart3, Table, Users, RefreshCw } from "lucide-react";
import { Button } from "@/presentation/components/shared/ui/button";
import { cn } from "@/core/utils/utils";
import { Card } from "@/presentation/components/shared/ui/card";
import { QuarterlyTestingFilters } from "@/presentation/roles/emission/components/quarterly/QuarterlyTestingFilters";
import VehicleTestingSpreadsheet from "@/presentation/roles/emission/components/quarterly/VehicleTestingSpreadsheet";
import { QuickTestForm } from "@/presentation/roles/emission/components/quarterly/QuickTestForm";
import { QuarterlyOverview } from "@/presentation/roles/emission/components/quarterly/QuarterlyOverview";
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
      <div className="flex flex-col h-full overflow-hidden">
          {/* Header Section */}
          <div className="page-header-bg sticky top-0 z-10">
            <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
              <div className="shrink-0">
                <h1 className="text-xl font-semibold tracking-tight">
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
                  className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-none rounded-lg h-9 w-9 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 text-slate-600 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-6">
              <nav className="flex space-x-8 -mb-px">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "overview"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("testing")}
                  disabled={selectedOffices.length === 0}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "testing"
                      ? "border-blue-500 text-blue-600"
                      : selectedOffices.length === 0
                      ? "border-transparent text-gray-300 dark:text-gray-600 cursor-not-allowed"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <Table className="w-4 h-4 inline mr-2" />
                  Vehicle Testing
                </button>
              </nav>
            </div>
          </div>

          {/* Body Section */}
          <div className="flex-1 overflow-y-auto page-bg">
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

              {/* Overview Tab */}
              {activeTab === "overview" && (
                <QuarterlyOverview
                  stats={summaryStats}
                  selectedYear={selectedYear}
                  officeGroups={officeGroups}
                  selectedOffices={selectedOffices}
                />
              )}

              {/* Vehicle Testing Tab */}
              {activeTab === "testing" && (
                  (!selectedOffices.includes("all") && selectedOffices.length === 0) ? (
                    <Card className="border border-slate-200 dark:border-gray-700 shadow-none bg-white dark:bg-gray-900">
                      <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 dark:bg-gray-800 mb-4">
                          <Users className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">No Offices Selected</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2">
                          Please select one or more offices from the filter above to view vehicle testing data.
                        </p>
                      </div>
                    </Card>
                  ) : (
                    <Card className="border border-slate-200 dark:border-gray-700 shadow-none bg-white dark:bg-gray-900 overflow-hidden">
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
                  )
              )}
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

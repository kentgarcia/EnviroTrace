/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  ScheduleTable,
  QuarterlyTestingHeader,
  QuarterlyTestingFilters,
  QuarterlyTestingStats,
  QuarterlyTestingDialogs,
  useQuarterlyTestingLogic,
} from "@/presentation/roles/emission/components/quarterly";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import { Card } from "@/presentation/components/shared/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/presentation/components/shared/ui/alert";
import { NetworkStatus } from "@/presentation/components/shared/ui/network-status";

// Main Component
export default function QuarterlyTesting() {
  const {
    // State
    isAddScheduleOpen,
    setIsAddScheduleOpen,
    isEditScheduleOpen,
    setIsEditScheduleOpen,
    isAddTestOpen,
    setIsAddTestOpen,
    isEditTestOpen,
    setIsEditTestOpen,
    isDeleteScheduleOpen,
    setIsDeleteScheduleOpen,
    isDeleteTestOpen,
    setIsDeleteTestOpen,
    scheduleToEdit,
    setScheduleToEdit,
    testToEdit,
    setTestToEdit,
    testToDelete,
    setTestToDelete,
    scheduleToDelete,
    setScheduleToDelete,
    isSubmitting,
    search,
    setSearch,
    result,
    setResult,
    activeTab,
    selectedScheduleId,
    setSelectedScheduleId,

    // Data
    schedules,
    emissionTests,
    vehicles,
    isLoadingVehicles,
    selectedSchedule,
    isLoading,
    error,

    // Handlers
    handleAddSchedule,
    handleEditSchedule,
    handleDeleteSchedule,
    handleAddTest,
    handleEditTest,
    handleDeleteTest,
    handleExportTestResults,
    getVehicleByPlateOrId,
  } = useQuarterlyTestingLogic();
  return (
    <>
      <div className="flex min-h-screen w-full">
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavBarContainer dashboardType="government-emission" />

          {/* Header Section */}
          <QuarterlyTestingHeader
            onNewSchedule={() => setIsAddScheduleOpen(true)}
            onExportResults={handleExportTestResults}
            canExport={!!(selectedSchedule && emissionTests.length > 0)}
          />

          {/* Body Section */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
            {/* Controls Row: Search left, Filters right */}
            <QuarterlyTestingFilters
              search={search}
              onSearchChange={setSearch}
              result={result}
              onResultChange={setResult}
            />

            {/* Error Notice */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  There was a problem loading the quarterly testing data. Please
                  try again later.
                </AlertDescription>
              </Alert>
            )}

            {/* Main Content Card (Schedule Table) */}
            <Card className="mt-6 border border-gray-200 shadow-none rounded-none bg-white">
              <div className="p-6">
                <ScheduleTable
                  schedules={schedules}
                  isLoading={isLoading}
                  emissionTests={emissionTests}
                  selectedScheduleId={selectedScheduleId}
                  setSelectedScheduleId={setSelectedScheduleId}
                  onEditTest={(test) => {
                    setTestToEdit(test);
                    setIsEditTestOpen(true);
                  }}
                  onDeleteTest={(test) => {
                    setTestToDelete(test);
                    setIsDeleteTestOpen(true);
                  }}
                  onEditSchedule={(schedule) => {
                    setScheduleToEdit(schedule);
                    setIsEditScheduleOpen(true);
                  }}
                  onDeleteSchedule={(schedule) => {
                    setScheduleToDelete(schedule);
                    setIsDeleteScheduleOpen(true);
                  }}
                />
              </div>
            </Card>

            {/* Statistics Card */}
            <QuarterlyTestingStats
              emissionTests={emissionTests}
              isVisible={activeTab === "tests" && !!selectedSchedule}
            />
          </div>
        </div>
      </div>

      {/* All Dialogs */}
      <QuarterlyTestingDialogs
        // Schedule dialogs
        isAddScheduleOpen={isAddScheduleOpen}
        setIsAddScheduleOpen={setIsAddScheduleOpen}
        isEditScheduleOpen={isEditScheduleOpen}
        setIsEditScheduleOpen={setIsEditScheduleOpen}
        isDeleteScheduleOpen={isDeleteScheduleOpen}
        setIsDeleteScheduleOpen={setIsDeleteScheduleOpen}
        scheduleToEdit={scheduleToEdit}
        setScheduleToEdit={setScheduleToEdit}
        scheduleToDelete={scheduleToDelete}

        // Test dialogs
        isAddTestOpen={isAddTestOpen}
        setIsAddTestOpen={setIsAddTestOpen}
        isEditTestOpen={isEditTestOpen}
        setIsEditTestOpen={setIsEditTestOpen}
        isDeleteTestOpen={isDeleteTestOpen}
        setIsDeleteTestOpen={setIsDeleteTestOpen}
        testToEdit={testToEdit}
        setTestToEdit={setTestToEdit}
        testToDelete={testToDelete}

        // Form data
        vehicles={vehicles}
        isLoadingVehicles={isLoadingVehicles}
        selectedSchedule={selectedSchedule}
        isSubmitting={isSubmitting}

        // Handlers
        onAddSchedule={handleAddSchedule}
        onEditSchedule={handleEditSchedule}
        onDeleteSchedule={handleDeleteSchedule}
        onAddTest={handleAddTest}
        onEditTest={handleEditTest}
        onDeleteTest={handleDeleteTest}
        onSearchVehicle={getVehicleByPlateOrId}
      />

      <NetworkStatus />
    </>
  );
}

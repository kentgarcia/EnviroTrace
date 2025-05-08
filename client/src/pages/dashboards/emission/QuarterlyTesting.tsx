/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { format } from "date-fns";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { Plus, RefreshCw, AlertTriangle, FileDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { NetworkStatus } from "@/components/layout/NetworkStatus";
import {
  useQuarterlyTesting,
  TestSchedule,
  EmissionTest,
} from "@/hooks/quarterly/useQuarterlyTesting";
import { YearSelector } from "@/pages/dashboards/emission/components/quarterly/YearSelector";
import ScheduleTable from "@/pages/dashboards/emission/components/quarterly/ScheduleTable";
import ScheduleForm from "@/pages/dashboards/emission/components/quarterly/ScheduleForm";
import EmissionTestTable from "@/pages/dashboards/emission/components/quarterly/EmissionTestTable";
import EmissionTestForm from "@/pages/dashboards/emission/components/quarterly/EmissionTestForm";

// Main Component
export default function QuarterlyTesting() {
  // State for UI modals and dialogs
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);
  const [isAddTestOpen, setIsAddTestOpen] = useState(false);
  const [isEditTestOpen, setIsEditTestOpen] = useState(false);
  const [isDeleteScheduleOpen, setIsDeleteScheduleOpen] = useState(false);
  const [isDeleteTestOpen, setIsDeleteTestOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<TestSchedule | null>(
    null
  );
  const [testToEdit, setTestToEdit] = useState<EmissionTest | null>(null);
  const [testToDelete, setTestToDelete] = useState<EmissionTest | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<TestSchedule | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [result, setResult] = useState("");
  const [activeTab, setActiveTab] = useState<string>("schedule");
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null
  );

  // Get data and actions from our custom hook
  const {
    scheduleFilters,
    testFilters,
    schedules,
    emissionTests,
    vehicles,
    availableYears,
    isLoading,
    isLoadingVehicles,
    error,
    selectSchedule,
    handleYearChange,
    handleQuarterChange,
    refetchSchedules,
    refetchTests,
    addSchedule,
    editSchedule,
    removeSchedule,
    addTest,
    editTest,
    removeTest,
    getVehicleByPlateOrId,
  } = useQuarterlyTesting();

  // Derive selectedSchedule from schedules and selectedScheduleId
  const selectedSchedule =
    schedules.find((s) => s.id === selectedScheduleId) || null;
  // Simple filter logic for emission tests
  const filteredTests = emissionTests.filter((t) => {
    // Search by plate, driver, or office
    const searchMatch =
      t.vehicle?.plateNumber?.toLowerCase().includes(search.toLowerCase()) ||
      t.vehicle?.driverName?.toLowerCase().includes(search.toLowerCase()) ||
      t.vehicle?.officeName?.toLowerCase().includes(search.toLowerCase());
    // Result filter
    let resultMatch = true;
    if (result === "passed") resultMatch = t.result === true;
    else if (result === "failed") resultMatch = t.result === false;
    else if (result === "untested") resultMatch = t.result == null;
    return searchMatch && resultMatch;
  });

  // Schedule Management
  const handleViewTests = (schedule: TestSchedule) => {
    selectSchedule(schedule.id);
    setActiveTab("tests");
  };

  const handleAddSchedule = async (scheduleData: any) => {
    setIsSubmitting(true);
    try {
      await addSchedule(scheduleData);
      setIsAddScheduleOpen(false);
      toast.success(
        `Test schedule for Q${scheduleData.quarter}, ${scheduleData.year} has been created.`
      );
    } catch (error) {
      toast.error("Failed to create test schedule. Please try again.");
      console.error("Error creating schedule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSchedule = async (scheduleData: any) => {
    if (!scheduleToEdit) return;
    setIsSubmitting(true);

    try {
      await editSchedule(scheduleToEdit.id, scheduleData);
      setIsEditScheduleOpen(false);
      setScheduleToEdit(null);
      toast.success(
        `Test schedule for Q${scheduleData.quarter}, ${scheduleData.year} has been updated.`
      );
    } catch (error) {
      toast.error("Failed to update test schedule. Please try again.");
      console.error("Error updating schedule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!scheduleToDelete) return;
    setIsSubmitting(true);

    try {
      await removeSchedule(scheduleToDelete.id);
      setIsDeleteScheduleOpen(false);
      setScheduleToDelete(null);
      toast.success(
        `Test schedule for Q${scheduleToDelete.quarter}, ${scheduleToDelete.year} has been deleted.`
      );

      // If we deleted the selected schedule, clear selection
      if (selectedSchedule?.id === scheduleToDelete.id) {
        selectSchedule(null);
      }
    } catch (error) {
      toast.error("Failed to delete test schedule. Please try again.");
      console.error("Error deleting schedule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Test Management
  const handleAddTest = async (testData: any) => {
    setIsSubmitting(true);
    try {
      await addTest(testData);
      setIsAddTestOpen(false);
      toast.success("Vehicle emission test has been added successfully.");
    } catch (error) {
      toast.error("Failed to add vehicle test. Please try again.");
      console.error("Error adding test:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTest = async (testData: any) => {
    if (!testToEdit) return;
    setIsSubmitting(true);

    try {
      await editTest(testToEdit.id, testData);
      setIsEditTestOpen(false);
      setTestToEdit(null);
      toast.success("Vehicle emission test has been updated successfully.");
    } catch (error) {
      toast.error("Failed to update vehicle test. Please try again.");
      console.error("Error updating test:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTest = async () => {
    if (!testToDelete) return;
    setIsSubmitting(true);

    try {
      await removeTest(testToDelete.id);
      setIsDeleteTestOpen(false);
      setTestToDelete(null);
      toast.success("Vehicle emission test has been deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete vehicle test. Please try again.");
      console.error("Error deleting test:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export test results to CSV
  const handleExportTestResults = () => {
    if (!selectedSchedule || emissionTests.length === 0) {
      toast.error("No test data available to export");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Plate Number,Driver,Office,Test Date,Quarter,Year,Result\n";

    emissionTests.forEach((test) => {
      const dateValue = test.testDate;
      let date: Date;
      if (typeof dateValue === "number") {
        date = new Date(dateValue);
      } else if (typeof dateValue === "string" && /^\d+$/.test(dateValue)) {
        date = new Date(Number(dateValue));
      } else {
        date = new Date(dateValue);
      }
      const testDate = isNaN(date.getTime()) ? "" : format(date, "yyyy-MM-dd");
      const result = test.result ? "Passed" : "Failed";
      csvContent += `"${test.vehicle?.plateNumber || ""}","${
        test.vehicle?.driverName || ""
      }","${test.vehicle?.officeName || ""}","${testDate}","${test.quarter}","${
        test.year
      }","${result}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `emission_tests_Q${selectedSchedule.quarter}_${selectedSchedule.year}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Test data exported successfully");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="government-emission" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardNavbar dashboardTitle="Government Emission" />
          {/* Header Section */}
          <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
              Quarterly Testing
            </h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => refetchSchedules()}
                size="sm"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setIsAddScheduleOpen(true)}
                className="hidden md:inline-flex"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Schedule
              </Button>
              <Button
                onClick={handleExportTestResults}
                variant="outline"
                size="icon"
                disabled={!selectedSchedule || emissionTests.length === 0}
              >
                <FileDown className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Body Section */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
            {/* Controls Row: Search left, Filters right */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              {/* Search (left) */}
              <div className="relative flex items-center w-full md:w-auto justify-start bg-white rounded-md">
                <Input
                  placeholder="Search by plate, driver, or office..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 max-w-xs w-[320px] bg-white"
                />
                <span className="absolute left-3 text-gray-400">
                  <RefreshCw className="h-4 w-4" />
                </span>
              </div>
              {/* Filters (right) */}
              <div className="flex flex-wrap gap-2 items-center justify-end">
                <Button
                  variant="outline"
                  className="min-w-[120px] justify-between bg-white pr-8"
                >
                  {result
                    ? result === "passed"
                      ? "Passed"
                      : result === "failed"
                      ? "Failed"
                      : result === "untested"
                      ? "Not Tested"
                      : result
                    : "All Results"}
                  <span className="ml-2 text-gray-400 flex items-center">
                    <RefreshCw className="h-4 w-4" />
                  </span>
                </Button>
                {/* Add more filter dropdowns as needed */}
              </div>
            </div>

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
            <Card className="mt-6">
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
            {activeTab === "tests" &&
              selectedSchedule &&
              emissionTests.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                  <div className="p-4 border rounded-lg bg-slate-50">
                    <p className="text-sm text-muted-foreground">Total Tests</p>
                    <p className="text-3xl font-bold">{emissionTests.length}</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-green-50">
                    <p className="text-sm text-muted-foreground">Passed</p>
                    <p className="text-3xl font-bold text-green-700">
                      {emissionTests.filter((t) => t.result).length}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-red-50">
                    <p className="text-sm text-muted-foreground">Failed</p>
                    <p className="text-3xl font-bold text-red-700">
                      {emissionTests.filter((t) => !t.result).length}
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Schedule Dialogs */}
      <Dialog open={isAddScheduleOpen} onOpenChange={setIsAddScheduleOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create Test Schedule</DialogTitle>
            <DialogDescription>
              Add a new quarterly emission testing schedule
            </DialogDescription>
          </DialogHeader>

          <ScheduleForm
            onSubmit={handleAddSchedule}
            onCancel={() => setIsAddScheduleOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditScheduleOpen} onOpenChange={setIsEditScheduleOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Test Schedule</DialogTitle>
            <DialogDescription>
              Update the details for this testing schedule
            </DialogDescription>
          </DialogHeader>

          {scheduleToEdit && (
            <ScheduleForm
              initialValues={scheduleToEdit}
              onSubmit={handleEditSchedule}
              onCancel={() => {
                setIsEditScheduleOpen(false);
                setScheduleToEdit(null);
              }}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteScheduleOpen}
        onOpenChange={setIsDeleteScheduleOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test Schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this test schedule? This will also
              remove all associated vehicle tests. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSchedule}
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Test Dialogs */}
      <Dialog open={isAddTestOpen} onOpenChange={setIsAddTestOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Vehicle Test</DialogTitle>
            <DialogDescription>
              Record a new vehicle emission test result
            </DialogDescription>
          </DialogHeader>

          <EmissionTestForm
            onSubmit={handleAddTest}
            onCancel={() => setIsAddTestOpen(false)}
            isSubmitting={isSubmitting}
            vehicles={vehicles}
            isLoadingVehicles={isLoading}
            onSearchVehicle={getVehicleByPlateOrId}
            scheduleYear={selectedSchedule?.year}
            scheduleQuarter={selectedSchedule?.quarter}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditTestOpen} onOpenChange={setIsEditTestOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Vehicle Test</DialogTitle>
            <DialogDescription>
              Update the vehicle emission test result
            </DialogDescription>
          </DialogHeader>

          {testToEdit && (
            <EmissionTestForm
              initialValues={testToEdit}
              onSubmit={handleEditTest}
              onCancel={() => {
                setIsEditTestOpen(false);
                setTestToEdit(null);
              }}
              isSubmitting={isSubmitting}
              vehicles={vehicles}
              isLoadingVehicles={isLoading}
              onSearchVehicle={getVehicleByPlateOrId}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteTestOpen} onOpenChange={setIsDeleteTestOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle Test</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vehicle emission test? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTest}
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <NetworkStatus />
    </SidebarProvider>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, lazy, Suspense } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { NetworkStatus } from "@/components/layout/NetworkStatus";
import { useQuarterlyTesting, TestSchedule, EmissionTest } from "@/hooks/quarterly/useQuarterlyTesting";
import { YearSelector } from "@/components/dashboards/emission/quarterly/YearSelector";

const ScheduleTable = lazy(() => import("@/components/dashboards/emission/quarterly/ScheduleTable").then(
    module => ({ default: module.ScheduleTable })
));

const ScheduleForm = lazy(() => import("@/components/dashboards/emission/quarterly/ScheduleForm").then(
    module => ({ default: module.ScheduleForm })
));

const EmissionTestTable = lazy(() => import("@/components/dashboards/emission/quarterly/EmissionTestTable").then(
    module => ({ default: module.EmissionTestTable })
));

const EmissionTestForm = lazy(() => import("@/components/dashboards/emission/quarterly/EmissionTestForm").then(
    module => ({ default: module.EmissionTestForm })
));

// Skeleton components for loading states
const YearSelectorSkeleton = () => (
    <div className="flex gap-3 items-center">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
    </div>
);

const ScheduleTableSkeleton = () => (
    <div className="space-y-3">
        <div className="rounded-md border">
            <div className="h-10 bg-muted/5 px-4 flex items-center border-b">
                <div className="flex-1 grid grid-cols-5 gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-28" />
                </div>
            </div>
            {[...Array(5)].map((_, i) => (
                <div key={i} className="px-4 py-3 flex items-center border-b">
                    <div className="flex-1 grid grid-cols-5 gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-28" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const TestTableSkeleton = () => (
    <div className="space-y-3">
        <div className="rounded-md border">
            <div className="h-10 bg-muted/5 px-4 flex items-center border-b">
                <div className="flex-1 grid grid-cols-5 gap-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>
            {[...Array(5)].map((_, i) => (
                <div key={i} className="px-4 py-3 flex items-center border-b">
                    <div className="flex-1 grid grid-cols-5 gap-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const FormSkeleton = () => (
    <div className="space-y-4 py-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-2/3 mx-auto" />
    </div>
);

// Main Component
export default function QuarterlyTesting() {
    // State for UI modals and dialogs
    const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
    const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);
    const [isAddTestOpen, setIsAddTestOpen] = useState(false);
    const [isEditTestOpen, setIsEditTestOpen] = useState(false);
    const [isDeleteScheduleOpen, setIsDeleteScheduleOpen] = useState(false);
    const [isDeleteTestOpen, setIsDeleteTestOpen] = useState(false);
    const [scheduleToEdit, setScheduleToEdit] = useState<TestSchedule | null>(null);
    const [testToEdit, setTestToEdit] = useState<EmissionTest | null>(null);
    const [testToDelete, setTestToDelete] = useState<EmissionTest | null>(null);
    const [scheduleToDelete, setScheduleToDelete] = useState<TestSchedule | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [search, setSearch] = useState("");
    const [result, setResult] = useState("");
    const [activeTab, setActiveTab] = useState<string>("schedule");

    // Get data and actions from our custom hook
    const {
        scheduleFilters,
        testFilters,
        selectedScheduleId,
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
    const selectedSchedule = schedules.find(s => s.id === selectedScheduleId) || null;
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
            toast.success(`Test schedule for Q${scheduleData.quarter}, ${scheduleData.year} has been created.`);
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
            toast.success(`Test schedule for Q${scheduleData.quarter}, ${scheduleData.year} has been updated.`);
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
            toast.success(`Test schedule for Q${scheduleToDelete.quarter}, ${scheduleToDelete.year} has been deleted.`);

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

        emissionTests.forEach(test => {
            const testDate = format(new Date(test.testDate), 'yyyy-MM-dd');
            const result = test.result ? "Passed" : "Failed";

            csvContent += `"${test.vehicle?.plateNumber || ''}","${test.vehicle?.driverName || ''}","${test.vehicle?.officeName || ''}","${testDate}","${test.quarter}","${test.year}","${result}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `emission_tests_Q${selectedSchedule.quarter}_${selectedSchedule.year}.csv`);
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
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold">Quarterly Testing</h1>
                                <p className="text-muted-foreground">
                                    Manage quarterly emission testing schedules and results
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => refetchSchedules()} size="sm">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh
                                </Button>
                                <Button onClick={() => setIsAddScheduleOpen(true)} size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Schedule
                                </Button>
                            </div>
                        </div>

                        {/* Offline Mode Notice */}
                        {error && (
                            <Alert className="mb-4 bg-yellow-50 text-yellow-800 border-yellow-200">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Offline Mode</AlertTitle>
                                <AlertDescription>
                                    You're currently working offline. Changes will be saved locally and synced when you're back online.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Main Content Card */}
                        <Card className="mb-6">
                            <CardHeader className="pb-3">
                                <CardTitle>Testing Management</CardTitle>
                                <CardDescription>
                                    View and manage testing schedules and vehicle emission tests
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Tabs for Schedules and Tests */}
                                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="schedule">Test Schedules</TabsTrigger>
                                        <TabsTrigger
                                            value="tests"
                                            disabled={!selectedSchedule}
                                        >
                                            Vehicle Tests
                                            {selectedSchedule && (
                                                <Badge variant="outline" className="ml-2">
                                                    Q{selectedSchedule.quarter} {selectedSchedule.year}
                                                </Badge>
                                            )}
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Schedules Tab Content */}
                                    <TabsContent value="schedule" className="pt-4">
                                        <Suspense fallback={<ScheduleTableSkeleton />}>
                                            <ScheduleTable
                                                schedules={schedules}
                                                isLoading={isLoading}
                                                onViewTests={handleViewTests}
                                                onEditSchedule={(schedule) => {
                                                    setScheduleToEdit(schedule);
                                                    setIsEditScheduleOpen(true);
                                                }}
                                                onDeleteSchedule={(schedule) => {
                                                    setScheduleToDelete(schedule);
                                                    setIsDeleteScheduleOpen(true);
                                                }}
                                            />
                                        </Suspense>
                                    </TabsContent>

                                    {/* Tests Tab Content */}
                                    <TabsContent value="tests" className="pt-4">
                                        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-3">
                                            <div className="flex items-center gap-2">
                                                <YearSelector
                                                    selectedYear={testFilters.year || scheduleFilters.year}
                                                    availableYears={availableYears}
                                                    onYearChange={(year) => {
                                                        const y = parseInt(year, 10);
                                                        handleYearChange(y);
                                                    }}
                                                    selectedQuarter={typeof testFilters.quarter === 'number' ? testFilters.quarter : scheduleFilters.quarter}
                                                    onQuarterChange={(quarter) => {
                                                        if (quarter === "all") {
                                                            handleQuarterChange(undefined);
                                                        } else {
                                                            handleQuarterChange(parseInt(quarter, 10));
                                                        }
                                                    }}
                                                />
                                                <Input
                                                    placeholder="Search by plate, driver, or office..."
                                                    value={search}
                                                    onChange={e => setSearch(e.target.value)}
                                                    className="w-64"
                                                />
                                                <select value={result} onChange={e => setResult(e.target.value)}>
                                                    <option value="">All Results</option>
                                                    <option value="passed">Passed</option>
                                                    <option value="failed">Failed</option>
                                                    <option value="untested">Not Tested</option>
                                                </select>
                                                <Button onClick={() => setIsAddTestOpen(true)} size="sm">
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleExportTestResults}
                                                    disabled={emissionTests.length === 0}
                                                >
                                                    <FileDown className="h-4 w-4 mr-1" />
                                                    Export
                                                </Button>
                                            </div>
                                        </div>
                                        {selectedSchedule ? (
                                            <>
                                                <div className="space-y-1 mb-4">
                                                    <h3 className="text-lg font-medium">
                                                        Test Results: Q{selectedSchedule.quarter}, {selectedSchedule.year}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Location: {selectedSchedule.location} |
                                                        Personnel: {selectedSchedule.assignedPersonnel}
                                                    </p>
                                                </div>
                                                <Suspense fallback={<TestTableSkeleton />}>
                                                    <EmissionTestTable
                                                        tests={filteredTests}
                                                        isLoading={isLoading}
                                                        onEditTest={(test) => {
                                                            setTestToEdit(test);
                                                            setIsEditTestOpen(true);
                                                        }}
                                                        onDeleteTest={(test) => {
                                                            setTestToDelete(test);
                                                            setIsDeleteTestOpen(true);
                                                        }}
                                                    />
                                                </Suspense>
                                            </>
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                Select a schedule to view vehicle test results.
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        {/* Statistics Card */}
                        {activeTab === "tests" && selectedSchedule && emissionTests.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Test Summary</CardTitle>
                                    <CardDescription>Summary of emission test results</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="p-4 border rounded-lg bg-slate-50">
                                            <p className="text-sm text-muted-foreground">Total Tests</p>
                                            <p className="text-3xl font-bold">{emissionTests.length}</p>
                                        </div>

                                        <div className="p-4 border rounded-lg bg-green-50">
                                            <p className="text-sm text-muted-foreground">Passed</p>
                                            <p className="text-3xl font-bold text-green-700">
                                                {emissionTests.filter(t => t.result).length}
                                            </p>
                                        </div>

                                        <div className="p-4 border rounded-lg bg-red-50">
                                            <p className="text-sm text-muted-foreground">Failed</p>
                                            <p className="text-3xl font-bold text-red-700">
                                                {emissionTests.filter(t => !t.result).length}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
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

                    <Suspense fallback={<FormSkeleton />}>
                        <ScheduleForm
                            onSubmit={handleAddSchedule}
                            onCancel={() => setIsAddScheduleOpen(false)}
                            isSubmitting={isSubmitting}
                        />
                    </Suspense>
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
                        <Suspense fallback={<FormSkeleton />}>
                            <ScheduleForm
                                initialValues={scheduleToEdit}
                                onSubmit={handleEditSchedule}
                                onCancel={() => {
                                    setIsEditScheduleOpen(false);
                                    setScheduleToEdit(null);
                                }}
                                isSubmitting={isSubmitting}
                            />
                        </Suspense>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteScheduleOpen} onOpenChange={setIsDeleteScheduleOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Test Schedule</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this test schedule? This will also remove all associated vehicle tests.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
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

                    <Suspense fallback={<FormSkeleton />}>
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
                    </Suspense>
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
                        <Suspense fallback={<FormSkeleton />}>
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
                        </Suspense>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteTestOpen} onOpenChange={setIsDeleteTestOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Vehicle Test</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this vehicle emission test? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
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
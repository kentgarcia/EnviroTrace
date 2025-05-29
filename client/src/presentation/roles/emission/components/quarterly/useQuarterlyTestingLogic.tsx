import { useState, useMemo } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    useQuarterlyTesting,
    EmissionTest,
    TestSchedule,
} from "@/core/hooks/emission/useQuarterlyTesting";
import { useVehicles, TestScheduleInput } from "@/core/api/emission-service";

export const useQuarterlyTestingLogic = () => {
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
    const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);    // Get data and actions from our custom hook
    const {
        scheduleFilters,
        testFilters,
        availableYears,
        isLoading,
        error,
        selectSchedule,
        handleYearChange,
        handleQuarterChange,
        schedules,
        emissionTests, // Use the enhanced emission tests from main hook
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

    // Get vehicles data for test forms
    const { data: vehiclesData, isLoading: isLoadingVehicles } = useVehicles();
    const vehicles = useMemo(() => vehiclesData?.vehicles || [], [vehiclesData]);

    // Derive selectedSchedule from schedules and selectedScheduleId
    const selectedSchedule =
        schedules?.find((s) => s.id === selectedScheduleId) || null;

    // Simple filter logic for emission tests
    const filteredTests = emissionTests.filter((t) => {
        // Search by plate, driver, or office
        const searchMatch = t.vehicle?.plate_number?.toLowerCase().includes(search.toLowerCase()) ||
            t.vehicle?.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
            t.vehicle?.office_name?.toLowerCase().includes(search.toLowerCase());        // Result filter
        let resultMatch = true;
        if (result === "passed") resultMatch = t.result === true;
        else if (result === "failed") resultMatch = t.result === false;
        else if (result === "untested") resultMatch = t.result == null;
        else if (result === "all" || result === "") resultMatch = true;

        return searchMatch && resultMatch;
    });

    // Schedule Management
    const handleViewTests = (schedule: TestSchedule) => {
        selectSchedule(schedule.id);
        setActiveTab("tests");
    }; const handleAddSchedule = async (scheduleData: any) => {
        setIsSubmitting(true);
        try {
            // Convert camelCase form data to snake_case for backend
            const backendData: TestScheduleInput = {
                year: scheduleData.year,
                quarter: scheduleData.quarter,
                assigned_personnel: scheduleData.assignedPersonnel,
                conducted_on: scheduleData.conductedOn,
                location: scheduleData.location,
            };

            await addSchedule(backendData);
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
    }; const handleEditSchedule = async (scheduleData: any) => {
        if (!scheduleToEdit) return;
        setIsSubmitting(true);

        try {
            // Convert camelCase form data to snake_case for backend
            const backendData: Partial<TestScheduleInput> = {
                year: scheduleData.year,
                quarter: scheduleData.quarter,
                assigned_personnel: scheduleData.assignedPersonnel,
                conducted_on: scheduleData.conductedOn,
                location: scheduleData.location,
            };

            await editSchedule(scheduleToEdit.id, backendData);
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
    };    // Test Management
    const handleAddTest = async (testData: any) => {
        setIsSubmitting(true);
        try {
            // Transform camelCase form data to snake_case for backend (simplified schema)
            const backendData = {
                vehicle_id: testData.vehicleId,
                test_date: testData.testDate,
                year: testData.year,
                quarter: testData.quarter,
                result: testData.result,
            };

            await addTest(backendData);
            setIsAddTestOpen(false);
            toast.success("Vehicle emission test has been added successfully.");
        } catch (error) {
            toast.error("Failed to add vehicle test. Please try again.");
            console.error("Error adding test:", error);
        } finally {
            setIsSubmitting(false);
        }
    }; const handleEditTest = async (testData: any) => {
        if (!testToEdit) return;
        setIsSubmitting(true);

        try {
            // Transform camelCase form data to snake_case for backend (simplified schema)
            const backendData = {
                vehicle_id: testData.vehicleId,
                test_date: testData.testDate,
                year: testData.year,
                quarter: testData.quarter,
                result: testData.result,
            };

            await editTest(testToEdit.id, backendData);
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
            const dateValue = test.test_date;
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

            csvContent += `"${test.vehicle?.plate_number || ""}","${test.vehicle?.driver_name || ""
                }","${test.vehicle?.office_name || ""}","${testDate}","${test.quarter}","${test.year
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

    return {
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
        setActiveTab,
        selectedScheduleId,
        setSelectedScheduleId,        // Data
        schedules,
        emissionTests,
        filteredTests,
        vehicles,
        isLoadingVehicles,
        selectedSchedule,
        isLoading,
        error,

        // Year/Quarter filtering
        scheduleFilters,
        availableYears,
        handleYearChange,
        handleQuarterChange,

        // Handlers
        handleViewTests,
        handleAddSchedule,
        handleEditSchedule,
        handleDeleteSchedule,
        handleAddTest,
        handleEditTest,
        handleDeleteTest,
        handleExportTestResults,
        getVehicleByPlateOrId,
    };
};

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useVehicles, useOffices, EmissionTest, Vehicle, Office } from "@/core/api/emission-service";
import { useEmissionTests } from "@/core/hooks/emission/useQuarterlyTesting";
import apiClient from "@/core/api/api-client";
import { usePermissions } from "@/core/hooks/auth/usePermissions";

interface VehicleWithTests extends Vehicle {
    tests: {
        Q1: EmissionTest | null;
        Q2: EmissionTest | null;
        Q3: EmissionTest | null;
        Q4: EmissionTest | null;
    };
    remarks?: string;
}

interface OfficeGroup {
    office_id: string;
    office_name: string;
    vehicles: VehicleWithTests[];
}

interface TestFormData {
    vehicle_id: string;
    test_date: string;
    quarter: number;
    year: number;
    result: boolean;
    remarks?: string;
    co_level?: number;
    hc_level?: number;
    opacimeter_result?: number;
    technician_name?: string;
    testing_center?: string;
}

export const useRevampedQuarterlyTesting = () => {
    const currentYear = new Date().getFullYear();
    const { can } = usePermissions();

    const canCreateTest = can("test", "create");
    const canUpdateTest = can("test", "update");
    const canDeleteTest = can("test", "delete");
    const canUpdateRemarks = can("vehicle", "update");

    // State - Default to current year and all offices
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedOffices, setSelectedOffices] = useState<string[]>(["all"]);
    const [search, setSearch] = useState("");
    const [isQuickTestOpen, setIsQuickTestOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [selectedQuarter, setSelectedQuarter] = useState(1);
    const [selectedQuarterFilter, setSelectedQuarterFilter] = useState<string>("all");
    const [testToEdit, setTestToEdit] = useState<EmissionTest | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data hooks
    const { data: vehiclesData, isLoading: isLoadingVehicles } = useVehicles();
    const { data: officesData, isLoading: isLoadingOffices } = useOffices();
    const { data: testsData, isLoading: isLoadingTests, refetch: refetchTests } = useEmissionTests();

    const vehicles = vehiclesData?.vehicles || [];
    const offices = officesData?.offices || [];
    const tests = testsData || [];

    // Available years (2020 to current year + 1 for future)
    const availableYears = useMemo(() => {
        const startYear = 2020;
        const endYear = currentYear + 1;
        const years: number[] = [];
        for (let year = endYear; year >= startYear; year--) {
            years.push(year);
        }
        return years;
    }, [currentYear]);

    // Process vehicles with tests grouped by office
    const officeGroups = useMemo((): OfficeGroup[] => {
        let filteredVehicles = vehicles;

        // Filter by offices
        if (selectedOffices.length > 0 && !selectedOffices.includes("all")) {
            filteredVehicles = filteredVehicles.filter(v => selectedOffices.includes(v.office_id));
        }

        // Filter by search
        if (search) {
            const searchLower = search.toLowerCase();
            filteredVehicles = filteredVehicles.filter(v =>
                (v.plate_number?.toLowerCase().includes(searchLower) || false) ||
                (v.chassis_number?.toLowerCase().includes(searchLower) || false) ||
                (v.registration_number?.toLowerCase().includes(searchLower) || false) ||
                v.driver_name.toLowerCase().includes(searchLower) ||
                v.office?.name?.toLowerCase().includes(searchLower)
            );
        }

        // Group by office and add test data
        const officeMap = new Map<string, VehicleWithTests[]>();

        filteredVehicles.forEach(vehicle => {
            const officeId = vehicle.office_id;
            const officeName = vehicle.office?.name || "Unknown Office";

            if (!officeMap.has(officeId)) {
                officeMap.set(officeId, []);
            }

            // Find tests for this vehicle in the selected year
            const vehicleTests = tests.filter(
                test => test.vehicle_id === vehicle.id && test.year === selectedYear
            );

            const vehicleWithTests: VehicleWithTests = {
                ...vehicle,
                tests: {
                    Q1: vehicleTests.find(t => t.quarter === 1) || null,
                    Q2: vehicleTests.find(t => t.quarter === 2) || null,
                    Q3: vehicleTests.find(t => t.quarter === 3) || null,
                    Q4: vehicleTests.find(t => t.quarter === 4) || null,
                },
                remarks: "", // TODO: Implement remarks storage
            };

            officeMap.get(officeId)!.push(vehicleWithTests);
        });

        // Convert to array and sort
        return Array.from(officeMap.entries())
            .map(([officeId, vehicles]) => ({
                office_id: officeId,
                office_name: vehicles[0]?.office?.name || "Unknown Office",
                vehicles: vehicles.sort((a, b) => {
                    const idA = a.plate_number || a.chassis_number || a.registration_number || "";
                    const idB = b.plate_number || b.chassis_number || b.registration_number || "";
                    return idA.localeCompare(idB);
                }),
            }))
            .sort((a, b) => a.office_name.localeCompare(b.office_name));
    }, [vehicles, tests, selectedOffices, search, selectedYear]);

    // Handlers
    const handleYearChange = (year: string) => {
        setSelectedYear(parseInt(year, 10));
    };

    const handleQuarterChange = (quarter: string) => {
        setSelectedQuarterFilter(quarter);
    };

    const handleOfficeChange = (officeIds: string[]) => {
        setSelectedOffices(officeIds);
    };

    const handleAddTest = (vehicleId: string, quarter: number) => {
        if (!canCreateTest) {
            toast.error("You do not have permission to add tests.");
            return;
        }
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
            setSelectedVehicle(vehicle);
            setSelectedQuarter(quarter);
            setTestToEdit(null);
            setIsQuickTestOpen(true);
        }
    };

    const handleEditTest = (test: EmissionTest) => {
        if (!canUpdateTest) {
            toast.error("You do not have permission to edit tests.");
            return;
        }
        const vehicle = vehicles.find(v => v.id === test.vehicle_id);
        if (vehicle) {
            setSelectedVehicle(vehicle);
            setSelectedQuarter(test.quarter);
            setTestToEdit(test);
            setIsQuickTestOpen(true);
        }
    };

    const handleAddRemarks = async (vehicleId: string, remarks: string) => {
        if (!canUpdateRemarks) {
            toast.error("You do not have permission to update remarks.");
            return;
        }
        try {
            await apiClient.put(`/emission/vehicles/${vehicleId}/remarks/${selectedYear}`, {
                remarks
            });
            toast.success("Remarks updated successfully");
            // Note: Remarks will be refetched when needed since they're not part of the main data flow yet
        } catch (error) {
            console.error("Error updating remarks:", error);
            toast.error("Failed to update remarks");
        }
    };

    const handleSubmitTest = async (data: TestFormData) => {
        if (testToEdit && !canUpdateTest) {
            toast.error("You do not have permission to edit tests.");
            return;
        }
        if (!testToEdit && !canCreateTest) {
            toast.error("You do not have permission to add tests.");
            return;
        }
        setIsSubmitting(true);
        try {
            const testData = {
                vehicle_id: data.vehicle_id,
                test_date: data.test_date,
                year: data.year,
                quarter: data.quarter,
                result: data.result,
                remarks: data.remarks || "",
                co_level: data.co_level,
                hc_level: data.hc_level,
                opacimeter_result: data.opacimeter_result,
                technician_name: data.technician_name,
                testing_center: data.testing_center,
            };

            if (testToEdit) {
                // Update existing test
                await apiClient.put(`/emission/tests/${testToEdit.id}`, testData);
                toast.success("Test updated successfully");
            } else {
                // Create new test
                await apiClient.post("/emission/tests", testData);
                toast.success("Test added successfully");
            }

            await refetchTests();
            setIsQuickTestOpen(false);
            setTestToEdit(null);
            setSelectedVehicle(null);
        } catch (error) {
            console.error("Error submitting test:", error);
            toast.error(testToEdit ? "Failed to update test" : "Failed to add test");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateTest = async (vehicleId: string, quarter: number, result: boolean | null) => {
        try {
            const currentDate = new Date().toISOString().split('T')[0];

            // Find existing test for this vehicle and quarter
            const existingTest = tests.find(test =>
                test.vehicle_id === vehicleId &&
                test.quarter === quarter &&
                test.year === selectedYear
            );

            if (result === null) {
                if (!canDeleteTest) {
                    toast.error("You do not have permission to delete tests.");
                    return;
                }
                // Delete the test if setting to "Not Tested"
                if (existingTest) {
                    await apiClient.delete(`/emission/tests/${existingTest.id}`);
                }
            } else {
                if (existingTest && !canUpdateTest) {
                    toast.error("You do not have permission to edit tests.");
                    return;
                }
                if (!existingTest && !canCreateTest) {
                    toast.error("You do not have permission to add tests.");
                    return;
                }
                const testData = {
                    vehicle_id: vehicleId,
                    test_date: currentDate,
                    year: selectedYear,
                    quarter,
                    result,
                    remarks: "",
                };

                if (existingTest) {
                    // Update existing test
                    await apiClient.put(`/emission/tests/${existingTest.id}`, testData);
                } else {
                    // Create new test
                    await apiClient.post("/emission/tests", testData);
                }
            }

            await refetchTests();
        } catch (error) {
            console.error("Error updating test:", error);
            toast.error("Failed to update test");
        }
    };

    const handleBatchUpdateTests = async (vehicleIds: string[], quarter: number, result: boolean | null) => {
        if (result === null && !canDeleteTest) {
            toast.error("You do not have permission to delete tests.");
            return;
        }
        if (result !== null && !canUpdateTest && !canCreateTest) {
            toast.error("You do not have permission to edit tests.");
            return;
        }
        setIsSubmitting(true);
        try {
            const currentDate = new Date().toISOString().split('T')[0];

            const updatePromises = vehicleIds.map(async (vehicleId) => {
                // Find existing test for this vehicle and quarter
                const existingTest = tests.find(test =>
                    test.vehicle_id === vehicleId &&
                    test.quarter === quarter &&
                    test.year === selectedYear
                );

                if (result === null) {
                    // Delete the test if setting to "Not Tested"
                    if (existingTest) {
                        return apiClient.delete(`/emission/tests/${existingTest.id}`);
                    }
                } else {
                    const testData = {
                        vehicle_id: vehicleId,
                        test_date: currentDate,
                        year: selectedYear,
                        quarter,
                        result,
                        remarks: "",
                    };

                    if (existingTest) {
                        // Update existing test
                        return apiClient.put(`/emission/tests/${existingTest.id}`, testData);
                    } else {
                        // Create new test
                        return apiClient.post("/emission/tests", testData);
                    }
                }
            });

            await Promise.all(updatePromises.filter(Boolean));
            await refetchTests();

            const statusText = result === null ? 'NOT TESTED' : (result ? 'PASS' : 'FAIL');
            toast.success(`Successfully updated ${vehicleIds.length} vehicle(s) to ${statusText} for Q${quarter}`);
        } catch (error) {
            console.error("Error batch updating tests:", error);
            toast.error("Failed to update batch tests");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBatchAddTests = async (vehicleIds: string[], quarter: number, result: boolean) => {
        if (!canCreateTest) {
            toast.error("You do not have permission to add tests.");
            return;
        }
        setIsSubmitting(true);
        try {
            const currentDate = new Date().toISOString().split('T')[0];

            // Create test data for each vehicle
            const testPromises = vehicleIds.map(vehicleId => {
                const testData = {
                    vehicle_id: vehicleId,
                    test_date: currentDate,
                    year: selectedYear,
                    quarter,
                    result,
                    remarks: "",
                };
                return apiClient.post("/emission/tests", testData);
            });

            await Promise.all(testPromises);
            await refetchTests();

            toast.success(`Successfully added ${result ? 'PASS' : 'FAIL'} tests for ${vehicleIds.length} vehicle(s) in Q${quarter}`);
        } catch (error) {
            console.error("Error batch adding tests:", error);
            toast.error("Failed to add batch tests");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExportData = () => {
        try {
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Office,Plate Number,Driver,Vehicle Type,Q1 Status,Q1 Date,Q2 Status,Q2 Date,Q3 Status,Q3 Date,Q4 Status,Q4 Date,Remarks\n";

            officeGroups.forEach(office => {
                office.vehicles.forEach(vehicle => {
                    const q1 = vehicle.tests.Q1;
                    const q2 = vehicle.tests.Q2;
                    const q3 = vehicle.tests.Q3;
                    const q4 = vehicle.tests.Q4;

                    const formatTestData = (test: EmissionTest | null) => {
                        if (!test) return "Not Tested,";
                        const status = test.result ? "Passed" : "Failed";
                        const date = new Date(test.test_date).toLocaleDateString();
                        return `${status},${date}`;
                    };

                    csvContent += `"${office.office_name}","${vehicle.plate_number}","${vehicle.driver_name}","${vehicle.vehicle_type}",${formatTestData(q1)},${formatTestData(q2)},${formatTestData(q3)},${formatTestData(q4)},"${vehicle.remarks || ""}"\n`;
                });
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `emission_tests_${selectedYear}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Data exported successfully");
        } catch (error) {
            toast.error("Failed to export data");
        }
    };

    // Summary statistics
    const summaryStats = useMemo(() => {
        const stats = {
            totalVehicles: 0,
            totalTested: 0,
            totalPassed: 0,
            totalFailed: 0,
            totalUntested: 0,
            byQuarter: {
                Q1: { tested: 0, passed: 0, failed: 0 },
                Q2: { tested: 0, passed: 0, failed: 0 },
                Q3: { tested: 0, passed: 0, failed: 0 },
                Q4: { tested: 0, passed: 0, failed: 0 },
            }
        };

        const activeQuarters = selectedQuarterFilter === "all"
            ? ["Q1", "Q2", "Q3", "Q4"]
            : [selectedQuarterFilter];

        officeGroups.forEach(office => {
            office.vehicles.forEach(vehicle => {
                stats.totalVehicles++;

                let hasAnyTest = false;
                let hasPassedTest = false;
                let hasFailedTest = false;

                Object.entries(vehicle.tests).forEach(([quarter, test]) => {
                    if (!activeQuarters.includes(quarter)) {
                        return;
                    }
                    if (test) {
                        hasAnyTest = true;
                        const quarterKey = quarter as keyof typeof stats.byQuarter;
                        stats.byQuarter[quarterKey].tested++;

                        if (test.result) {
                            hasPassedTest = true;
                            stats.byQuarter[quarterKey].passed++;
                        } else {
                            hasFailedTest = true;
                            stats.byQuarter[quarterKey].failed++;
                        }
                    }
                });

                if (hasAnyTest) {
                    stats.totalTested++;
                    if (hasPassedTest && !hasFailedTest) {
                        stats.totalPassed++;
                    } else if (hasFailedTest) {
                        stats.totalFailed++;
                    }
                } else {
                    stats.totalUntested++;
                }
            });
        });

        return stats;
    }, [officeGroups, selectedQuarterFilter]);

    return {
        // Permissions
        canCreateTest,
        canUpdateTest,
        canDeleteTest,
        canUpdateRemarks,

        // State
        selectedYear,
        selectedOffices,
        search,
        isQuickTestOpen,
        selectedVehicle,
        selectedQuarter,
        selectedQuarterFilter,
        testToEdit,
        isSubmitting,

        // Data
        officeGroups,
        offices,
        availableYears,
        summaryStats,

        // Loading states
        isLoading: isLoadingVehicles || isLoadingOffices || isLoadingTests,

        // Handlers
        handleYearChange,
        handleQuarterChange,
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
    };
};

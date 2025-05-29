import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  EmissionTest as BaseEmissionTest,
  EmissionTestInput,
  TestSchedule as BaseTestSchedule,
  Vehicle,
  useEmissionTests as useBaseEmissionTests,
  useVehicles,
  useTestSchedules as useBaseTestSchedules,
  useAddEmissionTest,
} from "@/core/api/emission-service";
import apiClient from "@/core/api/api-client";

// Extend the EmissionTest type to include vehicle property
export interface EmissionTest extends BaseEmissionTest {
  vehicle?: {
    plate_number: string;
    driver_name: string;
    office_name: string;
    id: string;
  };
}

// Re-export the TestSchedule type
export type TestSchedule = BaseTestSchedule;

export interface QuarterlyTestingFilters {
  year?: number;
  quarter?: number;
  vehicleId?: string;
  result?: boolean;
  search?: string;
}

interface UseQuarterlyTestingOptions {
  initialYear?: number;
  initialQuarter?: number;
}

export interface TestScheduleInput {
  year: number;
  quarter: number;
  assigned_personnel: string;
  conducted_on: string;
  location: string;
}

export function useQuarterlyTesting(options: UseQuarterlyTestingOptions = {}) {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null
  );

  // State for filters
  const [scheduleFilters, setScheduleFilters] = useState({
    year: options.initialYear || currentYear,
    quarter: options.initialQuarter || getCurrentQuarter(),
  });

  const [testFilters, setTestFilters] = useState<QuarterlyTestingFilters>({
    year: options.initialYear || currentYear,
    quarter: options.initialQuarter || getCurrentQuarter(),
  });
  // Queries
  const { data: scheduleData, isLoading: isLoadingSchedules } =
    useBaseTestSchedules();
  const { data: testData, isLoading: isLoadingTests } = useBaseEmissionTests();
  const { data: vehicleData, isLoading: isLoadingVehicles } = useVehicles();

  // Get available years
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    if (scheduleData) {
      scheduleData.forEach((schedule) => years.add(schedule.year));
    }
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  }, [scheduleData]);

  // Filtered schedules
  const schedules = useMemo(() => {
    if (!scheduleData) return [];
    return scheduleData.filter(
      (schedule) =>
        schedule.year === scheduleFilters.year &&
        schedule.quarter === scheduleFilters.quarter
    );
  }, [scheduleData, scheduleFilters]); // Filtered tests - synchronized with schedule filters and enhanced with vehicle data
  const emissionTests = useMemo(() => {
    if (!testData) return [];

    let filtered = testData;

    // Always filter by the same year and quarter as the selected schedules
    filtered = filtered.filter(
      (test) =>
        test.year === scheduleFilters.year &&
        test.quarter === scheduleFilters.quarter
    );

    // Transform tests to include vehicle data
    const testsWithVehicles: EmissionTest[] = filtered.map((test) => {
      const vehicle = vehicleData?.vehicles?.find(
        (v) => v.id === test.vehicle_id
      );

      return {
        ...test,
        vehicle: vehicle
          ? {
              id: vehicle.id,
              plate_number: vehicle.plate_number,
              driver_name: vehicle.driver_name,
              office_name: vehicle.office?.name || "Unknown Office",
            }
          : undefined,
      };
    });

    // Apply additional filters from testFilters
    let finalFiltered = testsWithVehicles;

    if (testFilters.vehicleId) {
      finalFiltered = finalFiltered.filter(
        (test) => test.vehicle_id === testFilters.vehicleId
      );
    }
    if (testFilters.result !== undefined) {
      finalFiltered = finalFiltered.filter(
        (test) => test.result === testFilters.result
      );
    }
    if (testFilters.search) {
      const search = testFilters.search.toLowerCase();
      finalFiltered = finalFiltered.filter((test) => {
        return (
          test.vehicle?.plate_number.toLowerCase().includes(search) ||
          test.vehicle?.driver_name.toLowerCase().includes(search)
        );
      });
    }

    return finalFiltered;
  }, [testData, scheduleFilters, testFilters, vehicleData]);

  // Vehicle lookup helper
  const getVehicleByPlateOrId = async (searchTerm: string) => {
    const { data } = await apiClient.get<Vehicle[]>("/emission/vehicles", {
      params: {
        search: searchTerm,
        limit: 1,
      },
    });
    return data[0] || null;
  };

  // Mutations
  const addTestMutation = useAddEmissionTest();

  const addTest = async (testData: EmissionTestInput) => {
    return addTestMutation.mutateAsync(testData);
  };

  const editTest = async (id: string, testData: Partial<EmissionTestInput>) => {
    const response = await apiClient.put<EmissionTest>(
      `/emission/tests/${id}`,
      testData
    );
    await queryClient.invalidateQueries({ queryKey: ["emission-tests"] });
    return response.data;
  };

  const removeTest = async (id: string) => {
    await apiClient.delete(`/emission/tests/${id}`);
    await queryClient.invalidateQueries({ queryKey: ["emission-tests"] });
  };

  // Schedule mutations
  const addSchedule = async (scheduleData: TestScheduleInput) => {
    const response = await apiClient.post<TestSchedule>(
      "/emission/test-schedules",
      scheduleData
    );
    await queryClient.invalidateQueries({ queryKey: ["test-schedules"] });
    return response.data;
  };

  const editSchedule = async (
    id: string,
    scheduleData: Partial<TestScheduleInput>
  ) => {
    const response = await apiClient.put<TestSchedule>(
      `/emission/test-schedules/${id}`,
      scheduleData
    );
    await queryClient.invalidateQueries({ queryKey: ["test-schedules"] });
    return response.data;
  };

  const removeSchedule = async (id: string) => {
    await apiClient.delete(`/emission/test-schedules/${id}`);
    await queryClient.invalidateQueries({ queryKey: ["test-schedules"] });
  };

  // Filter handlers
  const handleYearChange = (year: number) => {
    setScheduleFilters((prev) => ({ ...prev, year }));
    setTestFilters((prev) => ({ ...prev, year }));
  };

  const handleQuarterChange = (quarter: number) => {
    setScheduleFilters((prev) => ({ ...prev, quarter }));
    setTestFilters((prev) => ({ ...prev, quarter }));
  };

  const handleVehicleFilter = (vehicleId: string | undefined) => {
    setTestFilters((prev) => ({ ...prev, vehicleId }));
  };

  const handleSearch = (search: string) => {
    setTestFilters((prev) => ({ ...prev, search }));
  };

  // Refetch helpers
  const refetchSchedules = () => {
    queryClient.invalidateQueries({ queryKey: ["test-schedules"] });
  };

  const refetchTests = () => {
    queryClient.invalidateQueries({ queryKey: ["emission-tests"] });
  };

  // Add selectSchedule function
  const selectSchedule = (scheduleId: string | null) => {
    setSelectedScheduleId(scheduleId);
  };

  return {
    // Data
    schedules,
    emissionTests,
    vehicles: vehicleData?.vehicles || [],
    availableYears,
    selectedScheduleId,
    error: undefined, // Add error property

    // Loading states
    isLoading: isLoadingSchedules || isLoadingTests,
    isLoadingVehicles,

    // Filter state and handlers
    scheduleFilters,
    testFilters,
    handleYearChange,
    handleQuarterChange,
    handleVehicleFilter,
    handleSearch,
    setSelectedScheduleId,
    selectSchedule, // Add selectSchedule function

    // Actions
    addSchedule,
    editSchedule,
    removeSchedule,
    addTest,
    editTest,
    removeTest,
    getVehicleByPlateOrId,

    // Refetch helpers
    refetchSchedules,
    refetchTests,
  };
}

// Helper function to get current quarter
function getCurrentQuarter(): number {
  const month = new Date().getMonth();
  return Math.floor(month / 3) + 1;
}

// Create a custom hook that enhances emission tests with vehicle data
export function useEmissionTests(
  params: { vehicleId?: string } = {},
  options = {}
) {
  const { data: rawTests, ...rest } = useBaseEmissionTests(params, options);
  const { data: vehicles } = useVehicles();

  // Transform the raw tests to include vehicle data
  const enhancedTests = useMemo(() => {
    if (!rawTests) return [];

    return rawTests.map((test) => ({
      ...test,
      vehicle: vehicles?.vehicles.find((v) => v.id === test.vehicle_id),
    })) as EmissionTest[];
  }, [rawTests, vehicles]);

  return { ...rest, data: enhancedTests };
}

export const useTestSchedules = useBaseTestSchedules;

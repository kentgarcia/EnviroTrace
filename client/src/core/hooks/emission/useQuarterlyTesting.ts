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
  scheduled_date: string;
  vehicle_id: string;
  notes?: string;
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
  }, [scheduleData, scheduleFilters]);

  // Filtered tests
  const emissionTests = useMemo(() => {
    if (!testData) return [];
    let filtered = testData;

    if (testFilters.year) {
      filtered = filtered.filter((test) => test.year === testFilters.year);
    }
    if (testFilters.quarter) {
      filtered = filtered.filter(
        (test) => test.quarter === testFilters.quarter
      );
    }
    if (testFilters.vehicleId) {
      filtered = filtered.filter(
        (test) => test.vehicle_id === testFilters.vehicleId
      );
    }
    if (testFilters.result !== undefined) {
      filtered = filtered.filter((test) => test.result === testFilters.result);
    }
    if (testFilters.search) {
      const search = testFilters.search.toLowerCase();
      filtered = filtered.filter((test) => {
        const vehicle = vehicleData?.vehicles?.find(
          (v) => v.id === test.vehicle_id
        );
        return (
          vehicle?.plate_number.toLowerCase().includes(search) ||
          vehicle?.driver_name.toLowerCase().includes(search)
        );
      });
    }

    return filtered;
  }, [testData, testFilters, vehicleData]);

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

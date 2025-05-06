import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import {
  GET_TEST_SCHEDULES,
  GET_EMISSION_TESTS,
  GET_VEHICLE_SUMMARIES,
  CREATE_TEST_SCHEDULE,
  UPDATE_TEST_SCHEDULE,
  DELETE_TEST_SCHEDULE,
  CREATE_EMISSION_TEST,
  UPDATE_EMISSION_TEST,
  DELETE_EMISSION_TEST,
  GET_VEHICLE_SUMMARY,
} from "@/lib/emission-api";

// Type definitions
export interface TestSchedule {
  id: string;
  year: number;
  quarter: number;
  assignedPersonnel: string;
  location: string;
  conductedOn: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestScheduleInput {
  year: number;
  quarter: number;
  assignedPersonnel: string;
  location: string;
  conductedOn: string;
}

export interface EmissionTest {
  id: string;
  vehicleId: string;
  testDate: string;
  quarter: number;
  year: number;
  result: boolean;
  createdAt?: string;
  updatedAt?: string;
  vehicle?: {
    id: string;
    plateNumber: string;
    driverName: string;
    officeName: string;
    vehicleType?: string;
    engineType?: string;
  };
}

export interface EmissionTestInput {
  vehicleId: string;
  testDate: string;
  quarter: number;
  year: number;
  result: boolean;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  driverName: string;
  contactNumber?: string;
  officeName: string;
  vehicleType: string;
  engineType: string;
  wheels: number;
}

export function useQuarterlyTesting() {
  // Local state instead of Zustand store
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null
  );
  const [scheduleFilters, setScheduleFilters] = useState<{
    year: number;
    quarter?: number;
  }>({
    year: new Date().getFullYear(),
  });
  // Use default values for testFilters to avoid undefined errors
  const [testFilters, setTestFilters] = useState<{
    year?: number;
    quarter?: number;
  }>({
    year: scheduleFilters.year,
    quarter: scheduleFilters.quarter,
  });

  // Fetch test schedules based on filters
  const {
    data: schedulesData,
    loading: isLoadingSchedules,
    error: scheduleError,
    refetch: refetchSchedules,
  } = useQuery(GET_TEST_SCHEDULES, {
    variables: { year: scheduleFilters.year, quarter: scheduleFilters.quarter },
    pollInterval: 1000 * 60 * 5, // 5 minutes
    fetchPolicy: "network-only",
  });

  // Extract test schedules
  const schedules = useMemo(() => {
    return schedulesData?.emissionTestSchedules || [];
  }, [schedulesData]);

  // Fetch emission tests for a specific schedule
  const {
    data: testsData,
    loading: isLoadingTests,
    error: testsError,
    refetch: refetchTests,
  } = useQuery(GET_EMISSION_TESTS, {
    variables: {
      filters: {
        year: testFilters.year || scheduleFilters.year,
        quarter:
          typeof testFilters.quarter === "number"
            ? testFilters.quarter
            : typeof scheduleFilters.quarter === "number"
            ? scheduleFilters.quarter
            : undefined,
      },
    },
    skip: isLoadingSchedules || !(testFilters.year || scheduleFilters.year),
    fetchPolicy: "network-only",
  });

  // Extract emission tests
  const emissionTests = useMemo(() => {
    return testsData?.emissionTests || [];
  }, [testsData]);

  // Fetch vehicles for test creation
  const {
    data: vehiclesData,
    loading: isLoadingVehicles,
    error: vehiclesError,
  } = useQuery(GET_VEHICLE_SUMMARIES, {
    fetchPolicy: "network-only",
  });

  // Extract vehicles
  const vehicles = useMemo(() => {
    return vehiclesData?.vehicleSummaries || [];
  }, [vehiclesData]);

  // Keep track of available years for the year selector
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    // Generate a range of years: current year - 2 to current year + 2
    return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  }, []);

  // Schedule selection handler
  const selectSchedule = (scheduleId: string | null) => {
    setSelectedScheduleId(scheduleId);
  };

  // Schedule filter handlers
  const handleYearChange = (year: number) => {
    setScheduleFilters((prev) => ({ ...prev, year }));
  };

  const handleQuarterChange = (quarter: number | undefined) => {
    setScheduleFilters((prev) => {
      if (quarter === undefined) {
        // Remove quarter from filters for 'all'
        const { quarter: _q, ...rest } = prev;
        return { ...rest };
      }
      return { ...prev, quarter };
    });
  };

  // When scheduleFilters change, update testFilters defaults if not set
  useEffect(() => {
    setTestFilters((prev) => {
      const newFilters: { year?: number; quarter?: number } = {
        year: prev.year ?? scheduleFilters.year,
      };
      if (typeof scheduleFilters.quarter === "number") {
        newFilters.quarter = scheduleFilters.quarter;
      }
      return newFilters;
    });
  }, [scheduleFilters.year, scheduleFilters.quarter]);

  // Create mutations for schedules and tests
  const [createScheduleMutation] = useMutation(CREATE_TEST_SCHEDULE, {
    onCompleted: () => {
      refetchSchedules();
    },
    onError: (error) => {
      console.error("Failed to create schedule:", error);
    },
  });

  const [updateScheduleMutation] = useMutation(UPDATE_TEST_SCHEDULE, {
    onCompleted: () => {
      refetchSchedules();
    },
    onError: (error) => {
      console.error("Failed to update schedule:", error);
    },
  });

  const [deleteScheduleMutation] = useMutation(DELETE_TEST_SCHEDULE, {
    onCompleted: () => {
      refetchSchedules();
      setSelectedScheduleId(null);
    },
    onError: (error) => {
      console.error("Failed to delete schedule:", error);
    },
  });

  const [createTestMutation] = useMutation(CREATE_EMISSION_TEST, {
    onCompleted: () => {
      refetchTests();
    },
    onError: (error) => {
      console.error("Failed to create emission test:", error);
    },
  });

  const [updateTestMutation] = useMutation(UPDATE_EMISSION_TEST, {
    onCompleted: () => {
      refetchTests();
    },
    onError: (error) => {
      console.error("Failed to update emission test:", error);
    },
  });

  const [deleteTestMutation] = useMutation(DELETE_EMISSION_TEST, {
    onCompleted: () => {
      refetchTests();
    },
    onError: (error) => {
      console.error("Failed to delete vehicle test:", error);
      throw error;
    },
  });

  // Fetch vehicle by ID (for test creation)
  const [getVehicleSummary] = useLazyQuery(GET_VEHICLE_SUMMARY, {
    onError: (error) => {
      console.error("Failed to fetch vehicle details:", error);
    },
  });

  // API wrapper functions without offline support
  const addSchedule = async (scheduleData: TestScheduleInput) => {
    try {
      await createScheduleMutation({
        variables: { input: scheduleData },
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const editSchedule = async (id: string, scheduleData: TestScheduleInput) => {
    try {
      await updateScheduleMutation({
        variables: { id, input: scheduleData },
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const removeSchedule = async (id: string) => {
    try {
      await deleteScheduleMutation({
        variables: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const addTest = async (testData: EmissionTestInput) => {
    try {
      await createTestMutation({
        variables: { input: testData },
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const editTest = async (id: string, testData: EmissionTestInput) => {
    try {
      await updateTestMutation({
        variables: { id, input: testData },
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const removeTest = async (id: string) => {
    try {
      await deleteTestMutation({
        variables: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  // Fetch vehicle by plate number or ID
  const getVehicleByPlateOrId = async (identifier: string) => {
    const matchingVehicle = vehicles.find(
      (v) => v.id === identifier || v.plateNumber === identifier
    );

    if (matchingVehicle) {
      return matchingVehicle;
    }

    // Try to fetch from API directly
    try {
      const { data } = await getVehicleSummary({
        variables: { id: identifier },
      });
      return data?.vehicleSummary;
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      return null;
    }
  };

  return {
    // State
    scheduleFilters,
    testFilters,
    selectedScheduleId,
    schedules,
    emissionTests,
    vehicles,
    availableYears,

    // Loading & error states
    isLoading: isLoadingSchedules || isLoadingTests,
    isLoadingVehicles,
    error: scheduleError || testsError || vehiclesError,
    isOffline: false, // Always return false for isOffline

    // Actions
    selectSchedule,
    handleYearChange,
    handleQuarterChange,
    setScheduleFilters,
    setTestFilters,

    // API operations
    refetchSchedules,
    refetchTests,
    addSchedule,
    editSchedule,
    removeSchedule,
    addTest,
    editTest,
    removeTest,
    getVehicleByPlateOrId,
  };
}

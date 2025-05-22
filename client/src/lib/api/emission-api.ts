// Backward compatibility layer for emission API
// This file provides the same API as before, but uses the new
// TanStack Query and Axios-based service under the hood
import apiClient from "./api-client";
import { queryClient } from "../api/query-provider";
import {
  Vehicle,
  EmissionTest,
  TestSchedule,
  OfficeCompliance,
  VehicleFilters,
  EmissionTestFilters,
  EmissionTestInput,
  EmissionTestScheduleInput,
} from "./emission-service";

// Endpoints
const ENDPOINTS = {
  VEHICLES: "/vehicles",
  VEHICLE: (id: string) => `/vehicles/${id}`,
  EMISSION_TESTS: "/emission-tests",
  EMISSION_TEST: (id: string) => `/emission-tests/${id}`,
  TEST_SCHEDULES: "/test-schedules",
  TEST_SCHEDULE: (id: string) => `/test-schedules/${id}`,
  OFFICE_COMPLIANCE: "/office-compliance",
};

// Helper function to fetch vehicle summaries
export async function fetchVehicleSummaries(filters: VehicleFilters = {}) {
  try {
    const { data } = await apiClient.get<Vehicle[]>(ENDPOINTS.VEHICLES, {
      params: filters,
    });
    return data;
  } catch (error) {
    console.error("Error fetching vehicle summaries:", error);
    throw error;
  }
}

// Helper function to fetch emission tests
export async function fetchEmissionTests(filters: EmissionTestFilters = {}) {
  try {
    const { data } = await apiClient.get<EmissionTest[]>(
      ENDPOINTS.EMISSION_TESTS,
      { params: filters }
    );
    return data;
  } catch (error) {
    console.error("Error fetching emission tests:", error);
    throw error;
  }
}

// Helper function to fetch test schedules
export async function fetchTestSchedules(
  year: number,
  quarter: number | undefined = undefined
) {
  try {
    const { data } = await apiClient.get<TestSchedule[]>(
      ENDPOINTS.TEST_SCHEDULES,
      {
        params: { year, ...(quarter !== undefined && { quarter }) },
      }
    );
    return data;
  } catch (error) {
    console.error("Error fetching test schedules:", error);
    throw error;
  }
}

// Helper function to create a new emission test
export async function createEmissionTest(input: EmissionTestInput) {
  try {
    const { data } = await apiClient.post<EmissionTest>(
      ENDPOINTS.EMISSION_TESTS,
      input
    );

    // Invalidate queries to ensure UI updates
    queryClient.invalidateQueries({
      queryKey: ["emissionTests", { year: input.year, quarter: input.quarter }],
    });
    queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    queryClient.invalidateQueries({ queryKey: ["vehicle", input.vehicleId] });

    return data;
  } catch (error) {
    console.error("Error creating emission test:", error);
    throw error;
  }
}

// Helper function to create a new test schedule
export async function createTestSchedule(input: EmissionTestScheduleInput) {
  try {
    const { data } = await apiClient.post<TestSchedule>(
      ENDPOINTS.TEST_SCHEDULES,
      input
    );

    // Invalidate queries to ensure UI updates
    queryClient.invalidateQueries({
      queryKey: ["testSchedules", input.year, input.quarter],
    });

    return data;
  } catch (error) {
    console.error("Error creating test schedule:", error);
    throw error;
  }
}

// Helper function to update an existing test schedule
export async function updateTestSchedule(
  id: string,
  input: EmissionTestScheduleInput
) {
  try {
    const { data } = await apiClient.put<TestSchedule>(
      ENDPOINTS.TEST_SCHEDULE(id),
      input
    );

    // Invalidate queries to ensure UI updates
    queryClient.invalidateQueries({ queryKey: ["testSchedules"] });
    queryClient.invalidateQueries({
      queryKey: ["testSchedules", input.year, input.quarter],
    });

    return data;
  } catch (error) {
    console.error("Error updating test schedule:", error);
    throw error;
  }
}

// Helper function to delete a test schedule
export async function deleteTestSchedule(id: string) {
  try {
    await apiClient.delete(ENDPOINTS.TEST_SCHEDULE(id));

    // Invalidate queries to ensure UI updates
    queryClient.invalidateQueries({ queryKey: ["testSchedules"] });

    return true;
  } catch (error) {
    console.error("Error deleting test schedule:", error);
    throw error;
  }
}

// Helper function to update an emission test
export async function updateEmissionTest(id: string, input: EmissionTestInput) {
  try {
    const { data } = await apiClient.put<EmissionTest>(
      ENDPOINTS.EMISSION_TEST(id),
      input
    );

    // Invalidate queries to ensure UI updates
    queryClient.invalidateQueries({ queryKey: ["emissionTest", id] });
    queryClient.invalidateQueries({ queryKey: ["emissionTests"] });
    queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    queryClient.invalidateQueries({ queryKey: ["vehicle", input.vehicleId] });
    queryClient.invalidateQueries({
      queryKey: ["emissionTests", { year: input.year, quarter: input.quarter }],
    });

    return data;
  } catch (error) {
    console.error("Error updating emission test:", error);
    throw error;
  }
}

// Helper function to delete an emission test
export async function deleteEmissionTest(id: string) {
  try {
    await apiClient.delete(ENDPOINTS.EMISSION_TEST(id));

    // Invalidate queries to ensure UI updates
    queryClient.invalidateQueries({ queryKey: ["emissionTest", id] });
    queryClient.invalidateQueries({ queryKey: ["emissionTests"] });
    queryClient.invalidateQueries({ queryKey: ["vehicles"] });

    return true;
  } catch (error) {
    console.error("Error deleting emission test:", error);
    throw error;
  }
}

// Helper function to fetch a vehicle by ID
export async function fetchVehicleById(id: string) {
  try {
    const { data } = await apiClient.get<Vehicle>(ENDPOINTS.VEHICLE(id));
    return data;
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    throw error;
  }
}

// Helper function to fetch office compliance data
export async function fetchOffices(filters: {
  year?: number;
  quarter?: number;
  searchTerm?: string;
}) {
  try {
    const { data } = await apiClient.get<OfficeCompliance[]>(
      ENDPOINTS.OFFICE_COMPLIANCE,
      {
        params: {
          year: filters.year || new Date().getFullYear(),
          quarter:
            filters.quarter || Math.ceil((new Date().getMonth() + 1) / 3),
          ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error fetching office compliance data:", error);
    throw error;
  }
}

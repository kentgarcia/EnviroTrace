// Emissions API service using TanStack Query and Axios
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./api-client";

// Types
export interface VehicleFilters {
  searchTerm?: string;
  officeCode?: string;
  testResult?: string;
  engineType?: string;
  vehicleType?: string;
  year?: number;
  quarter?: number;
}

export interface EmissionTestFilters {
  vehicleId?: string;
  year?: number;
  quarter?: number;
  result?: string;
  searchTerm?: string;
}

export interface EmissionTestInput {
  vehicleId: string;
  testDate: string;
  quarter: number;
  year: number;
  result: string;
}

export interface EmissionTestScheduleInput {
  assignedPersonnel: string;
  conductedOn: string;
  location: string;
  quarter: number;
  year: number;
}

export interface Vehicle {
  id: string;
  driverName: string;
  contactNumber: string;
  engineType: string;
  officeName: string;
  plateNumber: string;
  vehicleType: string;
  wheels: number;
  latestTestDate: string | null;
  latestTestQuarter: number | null;
  latestTestYear: number | null;
  latestTestResult: string | null;
  driverHistory: Array<{
    driverName: string;
    changedAt: string;
    changedBy: string;
  }>;
}

export interface EmissionTest {
  id: string;
  vehicleId: string;
  testDate: string;
  quarter: number;
  year: number;
  result: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: {
    id: string;
    plateNumber: string;
    driverName: string;
    officeName: string;
  };
}

export interface TestSchedule {
  id: string;
  assignedPersonnel: string;
  conductedOn: string;
  location: string;
  quarter: number;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface OfficeCompliance {
  id: string;
  name: string;
  code: string;
  vehicleCount: number;
  testedCount: number;
  passedCount: number;
  complianceRate: number;
}

// API Endpoints
const ENDPOINTS = {
  VEHICLES: "/vehicles",
  VEHICLE: (id: string) => `/vehicles/${id}`,
  EMISSION_TESTS: "/emission-tests",
  EMISSION_TEST: (id: string) => `/emission-tests/${id}`,
  TEST_SCHEDULES: "/test-schedules",
  TEST_SCHEDULE: (id: string) => `/test-schedules/${id}`,
  OFFICE_COMPLIANCE: "/office-compliance",
};

// Query Hooks

// Get all vehicles with optional filters
export function useVehicles(filters: VehicleFilters = {}) {
  return useQuery({
    queryKey: ["vehicles", filters],
    queryFn: async () => {
      const { data } = await apiClient.get<Vehicle[]>(ENDPOINTS.VEHICLES, {
        params: filters,
      });
      return data;
    },
  });
}

// Get a single vehicle by ID
export function useVehicle(id: string) {
  return useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const { data } = await apiClient.get<Vehicle>(ENDPOINTS.VEHICLE(id));
      return data;
    },
    enabled: !!id,
  });
}

// Get emission tests with optional filters
export function useEmissionTests(filters: EmissionTestFilters = {}) {
  return useQuery({
    queryKey: ["emissionTests", filters],
    queryFn: async () => {
      const { data } = await apiClient.get<EmissionTest[]>(
        ENDPOINTS.EMISSION_TESTS,
        { params: filters }
      );
      return data;
    },
  });
}

// Get a single emission test by ID
export function useEmissionTest(id: string) {
  return useQuery({
    queryKey: ["emissionTest", id],
    queryFn: async () => {
      const { data } = await apiClient.get<EmissionTest>(
        ENDPOINTS.EMISSION_TEST(id)
      );
      return data;
    },
    enabled: !!id,
  });
}

// Get test schedules for a specific year and optional quarter
export function useTestSchedules(year: number, quarter?: number) {
  return useQuery({
    queryKey: ["testSchedules", year, quarter],
    queryFn: async () => {
      const { data } = await apiClient.get<TestSchedule[]>(
        ENDPOINTS.TEST_SCHEDULES,
        {
          params: { year, ...(quarter && { quarter }) },
        }
      );
      return data;
    },
    enabled: !!year,
  });
}

// Get office compliance data
export function useOfficeCompliance(
  year: number,
  quarter: number,
  searchTerm?: string
) {
  return useQuery({
    queryKey: ["officeCompliance", year, quarter, searchTerm],
    queryFn: async () => {
      const { data } = await apiClient.get<OfficeCompliance[]>(
        ENDPOINTS.OFFICE_COMPLIANCE,
        {
          params: { year, quarter, ...(searchTerm && { searchTerm }) },
        }
      );
      return data;
    },
    enabled: !!year && !!quarter,
  });
}

// Mutation Hooks

// Create a new emission test
export function useCreateEmissionTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: EmissionTestInput) => {
      const { data } = await apiClient.post<EmissionTest>(
        ENDPOINTS.EMISSION_TESTS,
        input
      );
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["emissionTests"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle", data.vehicleId] });
      queryClient.invalidateQueries({
        queryKey: [
          "emissionTests",
          { year: variables.year, quarter: variables.quarter },
        ],
      });
    },
  });
}

// Update an existing emission test
export function useUpdateEmissionTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: EmissionTestInput;
    }) => {
      const { data } = await apiClient.put<EmissionTest>(
        ENDPOINTS.EMISSION_TEST(id),
        input
      );
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["emissionTest", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["emissionTests"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle", data.vehicleId] });
      queryClient.invalidateQueries({
        queryKey: [
          "emissionTests",
          { year: variables.input.year, quarter: variables.input.quarter },
        ],
      });
    },
  });
}

// Delete an emission test
export function useDeleteEmissionTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(ENDPOINTS.EMISSION_TEST(id));
      return id;
    },
    onSuccess: (id) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["emissionTest", id] });
      queryClient.invalidateQueries({ queryKey: ["emissionTests"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

// Create a new test schedule
export function useCreateTestSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: EmissionTestScheduleInput) => {
      const { data } = await apiClient.post<TestSchedule>(
        ENDPOINTS.TEST_SCHEDULES,
        input
      );
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["testSchedules", variables.year, variables.quarter],
      });
    },
  });
}

// Update an existing test schedule
export function useUpdateTestSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: EmissionTestScheduleInput;
    }) => {
      const { data } = await apiClient.put<TestSchedule>(
        ENDPOINTS.TEST_SCHEDULE(id),
        input
      );
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["testSchedules"] });
      queryClient.invalidateQueries({
        queryKey: [
          "testSchedules",
          variables.input.year,
          variables.input.quarter,
        ],
      });
    },
  });
}

// Delete a test schedule
export function useDeleteTestSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(ENDPOINTS.TEST_SCHEDULE(id));
      return id;
    },
    onSuccess: () => {
      // Invalidate all test schedule queries
      queryClient.invalidateQueries({ queryKey: ["testSchedules"] });
    },
  });
}

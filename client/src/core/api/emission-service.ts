import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/core/api/api-client";

// Types
export interface Vehicle {
  id: string;
  driver_name: string;
  contact_number?: string;
  engine_type: string;
  office_name: string;
  plate_number: string;
  vehicle_type: string;
  wheels: number;
  created_at: string;
  updated_at: string;
  latest_test_result: boolean | null;
  latest_test_date: string | null;
}

export interface VehicleInput {
  driver_name: string;
  contact_number?: string;
  engine_type: string;
  office_name: string;
  plate_number: string;
  vehicle_type: string;
  wheels: number;
}

export interface VehicleFilters {
  plate_number?: string;
  driver_name?: string;
  office_name?: string;
  vehicle_type?: string;
  engine_type?: string;
  wheels?: number;
  search?: string;
}

interface VehiclesResponse {
  vehicles: Vehicle[];
  total: number;
}

interface FilterOptions {
  offices: string[];
  vehicle_types: string[];
  engine_types: string[];
  wheels: number[];
}

// API endpoints
const API_ENDPOINTS = {
  VEHICLES: "/emission/vehicles",
  FILTER_OPTIONS: "/emission/vehicles/filters/options",
  TESTS: "/emission/tests",
  SCHEDULES: "/emission/schedules",
  DRIVER_HISTORY: "/emission/vehicles/driver-history",
};

// Hooks for vehicles
export function useVehicles(filters?: VehicleFilters, skip = 0, limit = 100) {
  return useQuery<VehiclesResponse>({
    queryKey: ["vehicles", filters, skip, limit],
    queryFn: async () => {
      // Build query params
      const params = new URLSearchParams();

      if (skip) params.append("skip", skip.toString());
      if (limit) params.append("limit", limit.toString());

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
      }

      const { data } = await apiClient.get<VehiclesResponse>(
        `${API_ENDPOINTS.VEHICLES}?${params.toString()}`
      );
      return data;
    },
  });
}

export function useVehicle(id: string) {
  return useQuery<Vehicle>({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const { data } = await apiClient.get<Vehicle>(
        `${API_ENDPOINTS.VEHICLES}/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useFilterOptions() {
  return useQuery<FilterOptions>({
    queryKey: ["vehicleFilterOptions"],
    queryFn: async () => {
      const { data } = await apiClient.get<FilterOptions>(
        API_ENDPOINTS.FILTER_OPTIONS
      );
      return data;
    },
  });
}

export function useAddVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vehicleData: VehicleInput) => {
      const { data } = await apiClient.post<Vehicle>(
        API_ENDPOINTS.VEHICLES,
        vehicleData
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      vehicleData,
    }: {
      id: string;
      vehicleData: Partial<VehicleInput>;
    }) => {
      const { data } = await apiClient.put<Vehicle>(
        `${API_ENDPOINTS.VEHICLES}/${id}`,
        vehicleData
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle", variables.id] });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${API_ENDPOINTS.VEHICLES}/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

// Emission Test Types
export interface EmissionTest {
  id: string;
  vehicle_id: string;
  test_date: string;
  quarter: number;
  year: number;
  result: boolean;
  co_level: number;
  hc_level: number;
  smoke_opacity?: number;
  remarks?: string;
  technician_name: string;
  testing_center: string;
  created_at: string;
  updated_at: string;
}

export interface EmissionTestInput {
  vehicle_id: string;
  test_date: string;
  quarter: number;
  year: number;
  result: boolean;
  co_level: number;
  hc_level: number;
  smoke_opacity?: number;
  remarks?: string;
  technician_name: string;
  testing_center: string;
}

export interface TestSchedule {
  id: string;
  year: number;
  quarter: number;
  assigned_personnel: string;
  conducted_on: string;
  location: string;
  status: "pending" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface TestScheduleInput {
  year: number;
  quarter: number;
  assigned_personnel: string;
  conducted_on: string;
  location: string;
}

export interface DriverHistoryRecord {
  id: string;
  vehicle_id: string;
  driver_name: string;
  contact_number?: string;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

// Emission tests queries
export function useEmissionTests(
  params: { vehicleId?: string } = {},
  options = {}
) {
  return useQuery<EmissionTest[]>({
    queryKey: ["emission-tests", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params.vehicleId) {
        queryParams.append("vehicle_id", params.vehicleId);
      }

      const { data } = await apiClient.get<EmissionTest[]>(
        `${API_ENDPOINTS.TESTS}?${queryParams.toString()}`
      );
      return data;
    },
    ...options,
  });
}

export function useEmissionTest(id: string, options = {}) {
  return useQuery<EmissionTest>({
    queryKey: ["emission-test", id],
    queryFn: async () => {
      const { data } = await apiClient.get<EmissionTest>(
        `${API_ENDPOINTS.TESTS}/${id}`
      );
      return data;
    },
    enabled: !!id,
    ...options,
  });
}

export function useAddEmissionTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (testData: EmissionTestInput) => {
      const { data } = await apiClient.post<EmissionTest>(
        API_ENDPOINTS.TESTS,
        testData
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["emission-tests"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

// Test Schedule hooks
export function useTestSchedules() {
  return useQuery<TestSchedule[]>({
    queryKey: ["test-schedules"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ schedules: TestSchedule[] }>(
        API_ENDPOINTS.SCHEDULES
      );
      return data.schedules;
    },
  });
}

export function useAddTestSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheduleData: TestScheduleInput) => {
      const { data } = await apiClient.post<TestSchedule>(
        API_ENDPOINTS.SCHEDULES,
        scheduleData
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-schedules"] });
    },
  });
}

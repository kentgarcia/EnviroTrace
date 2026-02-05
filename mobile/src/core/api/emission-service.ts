import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./api-client";
import { queueableRequest } from "../queue/offlineQueue";

// Types
export interface Office {
  id: string;
  name: string;
  address?: string;
  contact_number?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  driver_name: string;
  contact_number?: string;
  engine_type: string;
  office_id: string;
  office?: Office;
  plate_number?: string;
  chassis_number?: string;
  registration_number?: string;
  vehicle_type: string;
  wheels: number;
  year_acquired?: number;
  description?: string;
  created_at: string;
  updated_at: string;
  latest_test_result?: boolean | null;
  latest_test_date?: string | null;
}

export interface VehicleInput {
  driver_name: string;
  contact_number?: string;
  engine_type: string;
  office_id: string;
  plate_number?: string | null;
  chassis_number?: string | null;
  registration_number?: string | null;
  vehicle_type: string;
  wheels: number;
  year_acquired?: number;
  description?: string;
}

export interface VehicleFilters {
  plate_number?: string;
  driver_name?: string;
  office_name?: string;
  office_id?: string;
  vehicle_type?: string;
  engine_type?: string;
  wheels?: number;
  search?: string;
}

interface VehiclesResponse {
  vehicles: Vehicle[];
  total: number;
}

interface OfficesResponse {
  offices: Office[];
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
  OFFICES: "/emission/offices",
  VEHICLES: "/emission/vehicles",
  FILTER_OPTIONS: "/emission/vehicles/filters/options",
  TESTS: "/emission/tests",
  OFFICE_COMPLIANCE: "/emission/offices/compliance",
};

// Office Compliance Types
export interface OfficeData {
  office_name: string;
  total_vehicles: number;
  tested_vehicles: number;
  compliant_vehicles: number;
  non_compliant_vehicles: number;
  compliance_rate: number;
  last_test_date: string | null;
}

export interface OfficeComplianceSummary {
  total_offices: number;
  total_vehicles: number;
  total_compliant: number;
  overall_compliance_rate: number;
}

export interface OfficeComplianceResponse {
  offices: OfficeData[];
  summary: OfficeComplianceSummary;
  total: number;
}

export interface OfficeFilters {
  search_term?: string;
  year?: number;
  quarter?: number;
}

// Hooks for offices
export function useOffices(search?: string, skip = 0, limit = 100) {
  return useQuery<OfficesResponse>({
    queryKey: ["offices", search, skip, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (skip) params.append("skip", skip.toString());
      if (limit) params.append("limit", limit.toString());
      if (search) params.append("search", search);

      const { data } = await apiClient.get<OfficesResponse>(
        `${API_ENDPOINTS.OFFICES}?${params.toString()}`
      );
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}

export function useOfficeCompliance(
  filters?: OfficeFilters,
  skip = 0,
  limit = 100
) {
  return useQuery<OfficeComplianceResponse>({
    queryKey: ["officeCompliance", filters, skip, limit],
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

      const { data } = await apiClient.get<OfficeComplianceResponse>(
        `${API_ENDPOINTS.OFFICE_COMPLIANCE}?${params.toString()}`
      );
      return data;
    },
  });
}

// Hooks for vehicles
export function useVehicles(filters?: VehicleFilters, skip = 0, limit = 100) {
  return useQuery<VehiclesResponse>({
    queryKey: ["vehicles", filters, skip, limit],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (skip) params.append("skip", skip.toString());
      if (limit) params.append("limit", limit.toString());

      // Always include test data for mobile to show badges
      params.append("include_test_data", "true");

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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useAddVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vehicleData: VehicleInput) => {
      return queueableRequest<Vehicle>({
        role: "government_emission",
        action: "emission.vehicle.create",
        method: "POST",
        endpoint: API_ENDPOINTS.VEHICLES,
        payload: vehicleData,
        send: async () => {
          const { data } = await apiClient.post<Vehicle>(
            API_ENDPOINTS.VEHICLES,
            vehicleData
          );
          return data;
        },
      });
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
      return queueableRequest<Vehicle>({
        role: "government_emission",
        action: "emission.vehicle.update",
        method: "PUT",
        endpoint: `${API_ENDPOINTS.VEHICLES}/${id}`,
        payload: vehicleData,
        send: async () => {
          const { data } = await apiClient.put<Vehicle>(
            `${API_ENDPOINTS.VEHICLES}/${id}`,
            vehicleData
          );
          return data;
        },
      });
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
  result: boolean | null;
  co_level?: number;
  hc_level?: number;
  opacimeter_result?: number;
  remarks?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EmissionTestInput {
  vehicle_id: string;
  test_date: string;
  quarter: number;
  year: number;
  result: boolean | null;
  co_level?: number;
  hc_level?: number;
  opacimeter_result?: number;
  remarks?: string;
}

export function useEmissionTests(
  params: { vehicleId?: string; quarter?: number; year?: number } = {},
  options = {}
) {
  return useQuery<EmissionTest[]>({
    queryKey: ["emission-tests", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params.vehicleId) {
        queryParams.append("vehicle_id", params.vehicleId);
      }
      if (params.quarter !== undefined) {
        queryParams.append("quarter", params.quarter.toString());
      }
      if (params.year !== undefined) {
        queryParams.append("year", params.year.toString());
      }

      const { data } = await apiClient.get<{
        tests: EmissionTest[];
        total: number;
      }>(`${API_ENDPOINTS.TESTS}?${queryParams.toString()}`);
      return data.tests;
    },
    ...options,
  });
}

export function useAddEmissionTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (testData: EmissionTestInput) => {
      return queueableRequest<EmissionTest>({
        role: "government_emission",
        action: "emission.test.create",
        method: "POST",
        endpoint: API_ENDPOINTS.TESTS,
        payload: testData,
        send: async () => {
          const { data } = await apiClient.post<EmissionTest>(
            API_ENDPOINTS.TESTS,
            testData
          );
          return data;
        },
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["emission-tests"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useUpdateEmissionTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      testData,
    }: {
      id: string;
      testData: Partial<EmissionTestInput>;
    }) => {
      return queueableRequest<EmissionTest>({
        role: "government_emission",
        action: "emission.test.update",
        method: "PUT",
        endpoint: `${API_ENDPOINTS.TESTS}/${id}`,
        payload: testData,
        send: async () => {
          const { data } = await apiClient.put<EmissionTest>(
            `${API_ENDPOINTS.TESTS}/${id}`,
            testData
          );
          return data;
        },
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["emission-tests"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["emission-test", data.id] });
    },
  });
}

export function useDeleteEmissionTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${API_ENDPOINTS.TESTS}/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emission-tests"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

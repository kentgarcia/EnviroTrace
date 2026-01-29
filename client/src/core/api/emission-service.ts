import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import apiClient from "@/core/api/api-client";

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
  description?: string | null;
  year_acquired?: number | null;
  created_at: string;
  updated_at: string;
  latest_test_result?: boolean | null; // Made optional since not always fetched
  latest_test_date?: string | null; // Made optional since not always fetched
  driverHistory?: DriverHistory[];
}

export interface VehicleInput {
  driver_name: string;
  contact_number?: string;
  engine_type: string;
  office_id: string;
  plate_number?: string;
  chassis_number?: string;
  registration_number?: string;
  vehicle_type: string;
  wheels: number;
  description?: string | null;
  year_acquired?: number | null;
}

// UI-friendly vehicle input that uses office names instead of IDs
export interface VehicleFormInput {
  driverName: string;
  contactNumber?: string;
  engineType: string;
  officeName: string;
  plateNumber?: string;
  chassisNumber?: string;
  registrationNumber?: string;
  vehicleType: string;
  wheels: number;
  description?: string;
  yearAcquired?: number;
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

export interface VehiclesResponse {
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
  SCHEDULES: "/emission/test-schedules",
  DRIVER_HISTORY: "/emission/vehicles/driver-history",
  OFFICE_COMPLIANCE: "/emission/offices/compliance",
};

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
    staleTime: 10 * 60 * 1000, // 10 minutes - offices don't change frequently
    gcTime: 20 * 60 * 1000, // 20 minutes cache time
    refetchOnWindowFocus: false,
  });
}

export function useCreateOffice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      office: Omit<Office, "id" | "created_at" | "updated_at">
    ) => {
      const { data } = await apiClient.post<Office>(
        API_ENDPOINTS.OFFICES,
        office
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
    },
  });
}

export function useUpdateOffice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data: officeData,
    }: {
      id: string;
      data: Partial<Omit<Office, "id" | "created_at" | "updated_at">>;
    }) => {
      const { data } = await apiClient.put<Office>(
        `${API_ENDPOINTS.OFFICES}/${id}`,
        officeData
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      queryClient.invalidateQueries({ queryKey: ["office", variables.id] });
    },
  });
}

export function useDeleteOffice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${API_ENDPOINTS.OFFICES}/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
    },
  });
}

type VehiclesQueryKey = [
  "vehicles",
  VehicleFilters | undefined,
  number,
  number,
  boolean
];

export interface UseVehiclesOptions
  extends Omit<
    UseQueryOptions<VehiclesResponse, unknown, VehiclesResponse, VehiclesQueryKey>,
    "queryKey" | "queryFn"
  > {
  includeTestData?: boolean;
}

export async function fetchVehicles(
  filters?: VehicleFilters,
  skip = 0,
  limit = 100,
  includeTestData = false
) {
  const params = new URLSearchParams();

  if (skip) params.append("skip", skip.toString());
  if (limit) params.append("limit", limit.toString());

  if (includeTestData) {
    params.append("include_test_data", "true");
  }

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
}

// Hooks for vehicles
export function useVehicles(
  filters?: VehicleFilters,
  skip = 0,
  limit = 100,
  options?: UseVehiclesOptions
) {
  const { includeTestData = false, ...queryOptions } = options ?? {};

  return useQuery<VehiclesResponse, unknown, VehiclesResponse, VehiclesQueryKey>({
    queryKey: ["vehicles", filters, skip, limit, includeTestData],
    queryFn: () => fetchVehicles(filters, skip, limit, includeTestData),
    staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - cache time (formerly cacheTime)
    placeholderData: (previousData) => previousData, // Keep previous data while loading new data
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    retry: 2, // Retry failed requests 2 times
    ...queryOptions,
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
    staleTime: 15 * 60 * 1000, // 15 minutes - filter options don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
    refetchOnWindowFocus: false,
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
    onSuccess: (createdVehicle) => {
      const cachedLists = queryClient.getQueriesData<VehiclesResponse>({
        queryKey: ["vehicles"],
      });

      cachedLists.forEach(([queryKey, cached]) => {
        if (!cached) return;

        const skip = Array.isArray(queryKey) ? (queryKey[2] as number | undefined) : undefined;
        const limit = Array.isArray(queryKey) ? (queryKey[3] as number | undefined) : undefined;

        const alreadyExists = cached.vehicles.some((vehicle) => vehicle.id === createdVehicle.id);

        if (skip && skip > 0) {
          // For non-first pages, keep existing page data but update total count.
          queryClient.setQueryData(queryKey, {
            ...cached,
            total: alreadyExists ? cached.total : cached.total + 1,
          });
          return;
        }

        const pageSize = typeof limit === "number" && limit > 0 ? limit : cached.vehicles.length + 1;
        const updatedVehicles = alreadyExists
          ? cached.vehicles.map((vehicle) =>
              vehicle.id === createdVehicle.id ? createdVehicle : vehicle
            )
          : [createdVehicle, ...cached.vehicles];

        queryClient.setQueryData(queryKey, {
          ...cached,
          vehicles: updatedVehicles.slice(0, pageSize),
          total: alreadyExists ? cached.total : cached.total + 1,
        });
      });

      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
        refetchType: "active",
      });
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
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["vehicle", variables.id],
        refetchType: "active",
      });
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
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["vehicles"] });

      // Snapshot the previous value
      const previousVehicles = queryClient.getQueriesData({
        queryKey: ["vehicles"],
      });

      // Optimistically update to remove the vehicle
      queryClient.setQueriesData(
        { queryKey: ["vehicles"] },
        (old: VehiclesResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            vehicles: old.vehicles.filter((vehicle) => vehicle.id !== deletedId),
            total: Math.max(0, old.total - 1),
          };
        }
      );

      // Return a context object with the snapshotted value
      return { previousVehicles };
    },
    onError: (err, newTodo, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousVehicles) {
        context.previousVehicles.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
        refetchType: "active",
      });
    },
  });
}

// Emission Test Types - Aligned with database schema
export interface EmissionTest {
  id: string;
  vehicle_id: string;
  test_date: string;
  quarter: number;
  year: number;
  result: boolean | null;
  remarks?: string;
  co_level?: number; // Carbon monoxide level (percentage) - For GASOLINE vehicles
  hc_level?: number; // Hydrocarbon level (ppm) - For GASOLINE vehicles
  opacimeter_result?: number; // Opacimeter test result (smoke opacity %) - For DIESEL vehicles
  technician_name?: string;
  testing_center?: string;
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
  remarks?: string;
  co_level?: number;
  hc_level?: number;
  opacimeter_result?: number;
  technician_name?: string;
  testing_center?: string;
}

export interface TestSchedule {
  id: string;
  year: number;
  quarter: number;
  assigned_personnel: string;
  conducted_on: string;
  location: string;
  status?: "pending" | "completed" | "cancelled";
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

// UI-friendly driver history type
export interface DriverHistory {
  id: string;
  driverName: string;
  contactNumber?: string;
  startDate: string;
  endDate: string | null;
  changedAt: string;
  changedBy: string | null;
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

      const { data } = await apiClient.get<{
        tests: EmissionTest[];
        total: number;
      }>(`${API_ENDPOINTS.TESTS}?${queryParams.toString()}`);
      return data.tests;
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
      queryClient.invalidateQueries({
        queryKey: ["emission-tests"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["vehicle", data.vehicle_id],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
        refetchType: "active",
      });
    },
  });
}

// Test Schedule hooks
export function useTestSchedules() {
  return useQuery<TestSchedule[]>({
    queryKey: ["test-schedules"],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        schedules: TestSchedule[];
        total: number;
      }>(API_ENDPOINTS.SCHEDULES);
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

// API endpoints
const OFFICE_API_ENDPOINTS = {
  COMPLIANCE: "/emission/offices/compliance",
  FILTER_OPTIONS: "/emission/offices/filters/options",
};

// Hooks for office compliance
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
        `${OFFICE_API_ENDPOINTS.COMPLIANCE}?${params.toString()}`
      );
      return data;
    },
  });
}

export function useOfficeFilterOptions() {
  return useQuery<FilterOptions>({
    queryKey: ["officeFilterOptions"],
    queryFn: async () => {
      const { data } = await apiClient.get<FilterOptions>(
        API_ENDPOINTS.FILTER_OPTIONS
      );
      return data;
    },
  });
}

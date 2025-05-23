/**
 * This file provides compatibility with the old useVehicles hook.
 * It adapts the new emission-service API to maintain backward compatibility.
 */

import {
  useVehicles as useApiVehicles,
  useVehicle as useApiVehicle,
  useAddVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
} from "@/core/api/emission-service";

import { adaptVehicleFromApi, adaptVehicleToApi } from "./adapters";

// Legacy types for compatibility
export interface Vehicle {
  id: string;
  driverName: string;
  contactNumber?: string;
  engineType: string;
  officeName: string;
  plateNumber: string;
  vehicleType: string;
  wheels: number;
  createdAt: string;
  updatedAt: string;
  latestTestResult: boolean | null;
  latestTestDate: string | null;
  driverHistory?: DriverHistory[];
}

export interface DriverHistory {
  id: string;
  driverName: string;
  contactNumber?: string;
  startDate: string;
  endDate: string | null;
}

export interface VehicleInput {
  driverName: string;
  contactNumber?: string;
  engineType: string;
  officeName: string;
  plateNumber: string;
  vehicleType: string;
  wheels: number;
}

// Hook adapter for the main vehicles hook
export function useVehicles(options?: any) {
  const { data, isLoading, error, refetch } = useApiVehicles();

  const vehicles = data?.vehicles.map(adaptVehicleFromApi) || [];

  const addVehicle = async (vehicleData: VehicleInput) => {
    const addVehicleMutation = useAddVehicle();
    const apiVehicleData = adaptVehicleToApi(vehicleData);
    const result = await addVehicleMutation.mutateAsync(apiVehicleData);
    return adaptVehicleFromApi(result);
  };

  const updateVehicle = async (
    id: string,
    vehicleData: Partial<VehicleInput>
  ) => {
    const updateVehicleMutation = useUpdateVehicle();
    const apiVehicleData = adaptVehicleToApi(vehicleData as VehicleInput);
    const result = await updateVehicleMutation.mutateAsync({
      id,
      vehicleData: apiVehicleData,
    });
    return adaptVehicleFromApi(result);
  };

  const deleteVehicle = async (id: string) => {
    const deleteVehicleMutation = useDeleteVehicle();
    await deleteVehicleMutation.mutateAsync(id);
  };

  const editVehicle = updateVehicle; // Alias for backward compatibility

  return {
    vehicles,
    isLoading,
    error,
    refetch,
    addVehicle,
    updateVehicle,
    editVehicle,
    deleteVehicle,
  };
}

// Adapter for single vehicle hook
export function useVehicle(id: string, options: any = {}) {
  const { data, isLoading, error, refetch } = useApiVehicle(id);

  const vehicle = data ? adaptVehicleFromApi(data) : null;

  return {
    data: vehicle,
    isLoading,
    error,
    refetch,
  };
}

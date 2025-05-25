/**
 * This file provides functionality for fetching vehicle details and related data.
 * It's a wrapper around emission-service.ts that's specifically for vehicle data.
 */
import { useQuery } from "@tanstack/react-query";
import {
  Vehicle,
  useVehicle as useApiVehicle,
  DriverHistory,
} from "@/core/api/emission-service";
import apiClient from "@/core/api/api-client";
import { adaptVehicleDriverHistoryFromApi } from "@/core/hooks/vehicles/adapters";

// Enhanced vehicle with driver history
interface EnhancedVehicle extends Vehicle {
  driverHistory?: DriverHistory[];
}

function useDriverHistory(vehicleId: string) {
  return useQuery({
    queryKey: ["driverHistory", vehicleId],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        history: any[];
        total: number;
      }>(`/emission/vehicle-driver-history?vehicle_id=${vehicleId}`);

      // Adapt the API response to match the expected format
      return data.history.map(adaptVehicleDriverHistoryFromApi);
    },
    enabled: !!vehicleId,
  });
}

export function useVehicle(id: string, options = {}) {
  const vehicleQuery = useApiVehicle(id);
  const driverHistoryQuery = useDriverHistory(id);

  // Combine the vehicle data with driver history
  const data = vehicleQuery.data
    ? ({
        ...vehicleQuery.data,
        driverHistory: driverHistoryQuery.data || [],
      } as EnhancedVehicle)
    : undefined;

  const isLoading = vehicleQuery.isLoading || driverHistoryQuery.isLoading;
  const error = vehicleQuery.error || driverHistoryQuery.error;

  return {
    data,
    isLoading,
    error,
    refetch: vehicleQuery.refetch,
  };
}

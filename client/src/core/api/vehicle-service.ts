/**
 * This file provides functionality for fetching vehicle details and related data.
 * It's a wrapper around emission-service.ts that's specifically for vehicle data.
 */
import { useQuery } from "@tanstack/react-query";
import {
  Vehicle,
  useVehicle as useApiVehicle,
  useDriverHistory,
} from "@/core/api/emission-service";

// Enhanced vehicle with driver history
interface EnhancedVehicle extends Vehicle {
  driverHistory?: {
    id: string;
    driver_name: string;
    contact_number?: string;
    start_date: string;
    end_date?: string;
  }[];
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

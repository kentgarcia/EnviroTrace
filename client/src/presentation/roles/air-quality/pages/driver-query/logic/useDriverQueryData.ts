import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  searchAirQualityDrivers,
  createAirQualityDriver,
  updateAirQualityDriver,
  deleteAirQualityDriver,
  AirQualityDriver,
} from "@/core/api/air-quality-api";

export interface DriverSearchParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface DriverFormData {
  first_name: string;
  middle_name?: string;
  last_name: string;
  address: string;
  license_number: string;
}

export const useDriverQueryData = () => {
  const [searchParams, setSearchParams] = useState<DriverSearchParams>({});
  const [selectedDriver, setSelectedDriver] = useState<AirQualityDriver | null>(
    null
  );

  const queryClient = useQueryClient();

  // Fetch drivers
  const {
    data: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchDrivers,
  } = useQuery({
    queryKey: ["air-quality-drivers-search", searchParams],
    queryFn: () => searchAirQualityDrivers(searchParams),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Search function
  const handleSearch = useCallback((params: DriverSearchParams) => {
    setSearchParams(params);
    setSelectedDriver(null);
  }, []);

  // Select driver
  const handleSelectDriver = useCallback((driver: AirQualityDriver) => {
    setSelectedDriver(driver);
  }, []);

  // Create driver mutation
  const createDriverMutation = useMutation({
    mutationFn: createAirQualityDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["air-quality-drivers-search"],
      });
    },
  });

  // Update driver mutation
  const updateDriverMutation = useMutation({
    mutationFn: ({
      driverId,
      driverData,
    }: {
      driverId: string;
      driverData: Partial<DriverFormData>;
    }) => updateAirQualityDriver(driverId, driverData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["air-quality-drivers-search"],
      });
    },
  });

  // Delete driver mutation
  const deleteDriverMutation = useMutation({
    mutationFn: deleteAirQualityDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["air-quality-drivers-search"],
      });
      setSelectedDriver(null);
    },
  });

  // Driver actions
  const handleCreateDriver = useCallback(
    (driverData: DriverFormData) => {
      createDriverMutation.mutate(driverData);
    },
    [createDriverMutation]
  );

  const handleUpdateDriver = useCallback(
    (driverId: string, driverData: Partial<DriverFormData>) => {
      updateDriverMutation.mutate({ driverId, driverData });
    },
    [updateDriverMutation]
  );

  const handleDeleteDriver = useCallback(
    (driverId: string) => {
      deleteDriverMutation.mutate(driverId);
    },
    [deleteDriverMutation]
  );

  return {
    // Data
    searchResults: searchResults || [],
    selectedDriver,

    // Loading states
    isSearchLoading,
    isCreatingDriver: createDriverMutation.isPending,
    isUpdatingDriver: updateDriverMutation.isPending,
    isDeletingDriver: deleteDriverMutation.isPending,

    // Error states
    searchError,

    // Actions
    handleSearch,
    handleSelectDriver,
    handleCreateDriver,
    handleUpdateDriver,
    handleDeleteDriver,
    refetchDrivers,
  };
};

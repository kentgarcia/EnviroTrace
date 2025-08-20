import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  Driver,
} from "@/core/api/belching-api";

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
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const queryClient = useQueryClient();

  // Fetch drivers
  const {
    data: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchDrivers,
  } = useQuery({
    queryKey: ["drivers-search", searchParams],
    queryFn: () => fetchAllDrivers(searchParams),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Search function
  const handleSearch = useCallback((params: DriverSearchParams) => {
    setSearchParams(params);
    setSelectedDriver(null);
  }, []);

  // Select driver
  const handleSelectDriver = useCallback((driver: Driver) => {
    setSelectedDriver(driver);
  }, []);

  // Create driver mutation
  const createDriverMutation = useMutation({
    mutationFn: createDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers-search"] });
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
    }) => updateDriver(driverId, driverData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers-search"] });
    },
  });

  // Delete driver mutation
  const deleteDriverMutation = useMutation({
    mutationFn: deleteDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers-search"] });
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

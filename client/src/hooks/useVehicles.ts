import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apolloClient } from "@/lib/apollo-client";
import {
  fetchVehicleSummaries,
  GET_VEHICLE_SUMMARIES,
} from "@/lib/emission-api";
import { useVehicleStore } from "./useVehicleStore";
import { useNetworkStatus } from "./useNetworkStatus";
import { gql } from "@apollo/client";

// GraphQL mutations for vehicles
export const CREATE_VEHICLE = gql`
  mutation CreateVehicle($input: VehicleInput!) {
    createVehicle(input: $input) {
      id
      plateNumber
      driverName
      contactNumber
      officeName
      vehicleType
      engineType
      wheels
    }
  }
`;

export const UPDATE_VEHICLE = gql`
  mutation UpdateVehicle($id: ID!, $input: VehicleInput!) {
    updateVehicle(id: $id, input: $input) {
      id
      plateNumber
      driverName
      contactNumber
      officeName
      vehicleType
      engineType
      wheels
    }
  }
`;

export const DELETE_VEHICLE = gql`
  mutation DeleteVehicle($id: ID!) {
    deleteVehicle(id: $id)
  }
`;

export interface Vehicle {
  id: string;
  plateNumber: string;
  driverName: string;
  contactNumber?: string;
  officeName: string;
  vehicleType: string;
  engineType: string;
  wheels: number;
  latestTestDate?: string;
  latestTestQuarter?: number;
  latestTestYear?: number;
  latestTestResult?: boolean;
}

export interface VehicleInput {
  plateNumber: string;
  driverName: string;
  contactNumber?: string;
  officeName: string;
  vehicleType: string;
  engineType: string;
  wheels: number;
}

export interface EmissionTest {
  id: string;
  vehicleId: string;
  testDate: string;
  quarter: number;
  year: number;
  result: boolean;
}

export function useVehicles() {
  const queryClient = useQueryClient();
  const { isOffline } = useNetworkStatus();
  const { filters, pendingVehicles, pendingUpdates, pendingDeletes, actions } =
    useVehicleStore();

  // Cache time-to-live longer for offline support
  const TTL = 1000 * 60 * 60; // 1 hour

  // Fetch all vehicles
  const {
    data: vehicles = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => fetchVehicleSummaries(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: TTL,
    retry: 2,
    enabled: !isOffline, // Only fetch online
  });

  // Track any network issues
  useEffect(() => {
    if (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Unable to fetch vehicles data");
    }
  }, [error]);

  // Set offline mode when network changes
  useEffect(() => {
    actions.setShowOfflineData(isOffline);
  }, [isOffline, actions]);

  // Create vehicle mutation
  const { mutateAsync: createVehicle, isPending: isCreating } = useMutation({
    mutationFn: async (vehicle: VehicleInput) => {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_VEHICLE,
        variables: { input: vehicle },
      });
      return data.createVehicle;
    },
    onSuccess: () => {
      toast.success("Vehicle added successfully");
      return queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
    onError: (error) => {
      console.error("Error adding vehicle:", error);
      toast.error("Failed to add vehicle");
      throw error;
    },
  });

  // Update vehicle mutation
  const { mutateAsync: updateVehicle, isPending: isUpdating } = useMutation({
    mutationFn: async ({
      id,
      vehicle,
    }: {
      id: string;
      vehicle: VehicleInput;
    }) => {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_VEHICLE,
        variables: { id, input: vehicle },
      });
      return data.updateVehicle;
    },
    onSuccess: () => {
      toast.success("Vehicle updated successfully");
      return queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
    onError: (error) => {
      console.error("Error updating vehicle:", error);
      toast.error("Failed to update vehicle");
      throw error;
    },
  });

  // Delete vehicle mutation
  const { mutateAsync: deleteVehicle, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apolloClient.mutate({
        mutation: DELETE_VEHICLE,
        variables: { id },
      });
      return data.deleteVehicle;
    },
    onSuccess: () => {
      toast.success("Vehicle deleted successfully");
      return queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
    onError: (error) => {
      console.error("Error deleting vehicle:", error);
      toast.error("Failed to delete vehicle");
      throw error;
    },
  });

  // Sync pending changes when online
  useEffect(() => {
    const syncPendingChanges = async () => {
      // Only proceed if online
      if (isOffline) return;

      // Sync pending deletes
      if (pendingDeletes.length > 0) {
        for (const id of pendingDeletes) {
          try {
            await deleteVehicle(id);
            actions.removePendingDelete(id);
            toast.success(`Synced pending delete`);
          } catch (error) {
            console.error(`Failed to sync delete for vehicle ${id}:`, error);
          }
        }
      }

      // Sync pending creates
      if (pendingVehicles.length > 0) {
        for (const vehicle of pendingVehicles) {
          try {
            const { id, ...vehicleData } = vehicle;
            await createVehicle(vehicleData);
            actions.removePendingVehicle(id);
            toast.success(`Synced new vehicle: ${vehicleData.plateNumber}`);
          } catch (error) {
            console.error(`Failed to sync new vehicle:`, error);
          }
        }
      }

      // Sync pending updates
      const pendingUpdateIds = Object.keys(pendingUpdates);
      if (pendingUpdateIds.length > 0) {
        for (const id of pendingUpdateIds) {
          try {
            await updateVehicle({ id, vehicle: pendingUpdates[id] });
            actions.removePendingUpdate(id);
            toast.success(
              `Synced updated vehicle: ${pendingUpdates[id].plateNumber}`
            );
          } catch (error) {
            console.error(`Failed to sync update for vehicle ${id}:`, error);
          }
        }
      }
    };

    // Check if there are pending changes to sync
    const hasPendingChanges =
      pendingVehicles.length > 0 ||
      Object.keys(pendingUpdates).length > 0 ||
      pendingDeletes.length > 0;

    if (!isOffline && hasPendingChanges) {
      syncPendingChanges();
    }
  }, [
    isOffline,
    pendingVehicles,
    pendingUpdates,
    pendingDeletes,
    actions,
    createVehicle,
    updateVehicle,
    deleteVehicle,
  ]);

  // All vehicles including pending changes
  const allVehicles = useMemo(() => {
    const mergedVehicles = [...vehicles];

    // Include pending vehicles
    if (pendingVehicles.length > 0) {
      mergedVehicles.push(...pendingVehicles);
    }

    // Apply pending updates
    const updatedList = mergedVehicles.map((vehicle) => {
      if (pendingUpdates[vehicle.id]) {
        return { ...vehicle, ...pendingUpdates[vehicle.id] };
      }
      return vehicle;
    });

    // Remove pending deletes
    if (pendingDeletes.length > 0) {
      return updatedList.filter((v) => !pendingDeletes.includes(v.id));
    }

    return updatedList;
  }, [vehicles, pendingVehicles, pendingUpdates, pendingDeletes]);

  // Extract unique filter options
  const vehicleTypes = useMemo(() => {
    return [...new Set(allVehicles.map((v) => v.vehicleType))].filter(Boolean);
  }, [allVehicles]);

  const engineTypes = useMemo(() => {
    return [...new Set(allVehicles.map((v) => v.engineType))].filter(Boolean);
  }, [allVehicles]);

  const wheelCounts = useMemo(() => {
    return [...new Set(allVehicles.map((v) => v.wheels))]
      .filter(Boolean)
      .sort((a, b) => a - b)
      .map((w) => w.toString());
  }, [allVehicles]);

  const offices = useMemo(() => {
    return [...new Set(allVehicles.map((v) => v.officeName))].filter(Boolean);
  }, [allVehicles]);

  // Apply filters
  const filteredVehicles = useMemo(() => {
    const {
      searchQuery,
      statusFilter,
      vehicleTypeFilter,
      engineTypeFilter,
      wheelsFilter,
      officeFilter,
    } = filters;

    return allVehicles.filter((vehicle) => {
      // Search query filter
      if (
        searchQuery &&
        !Object.values(vehicle).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      ) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "passed" && vehicle.latestTestResult !== true) {
          return false;
        }
        if (statusFilter === "failed" && vehicle.latestTestResult !== false) {
          return false;
        }
        if (statusFilter === "untested" && vehicle.latestTestResult !== null) {
          return false;
        }
      }

      // Vehicle type filter
      if (vehicleTypeFilter && vehicle.vehicleType !== vehicleTypeFilter) {
        return false;
      }

      // Engine type filter
      if (engineTypeFilter && vehicle.engineType !== engineTypeFilter) {
        return false;
      }

      // Wheels filter
      if (wheelsFilter && vehicle.wheels !== parseInt(wheelsFilter)) {
        return false;
      }

      // Office filter
      if (officeFilter && vehicle.officeName !== officeFilter) {
        return false;
      }

      return true;
    });
  }, [filters, allVehicles]);

  // Handle adding a new vehicle
  const addVehicle = async (vehicleData: VehicleInput) => {
    if (isOffline) {
      // Store for later syncing
      actions.addPendingVehicle(vehicleData);
      toast.success("Vehicle saved for syncing when online");
      return;
    }

    try {
      await createVehicle(vehicleData);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Handle updating a vehicle
  const editVehicle = async (id: string, vehicleData: VehicleInput) => {
    if (isOffline) {
      // Store for later syncing
      actions.addPendingUpdate(id, vehicleData);
      toast.success("Changes saved for syncing when online");
      return;
    }

    try {
      await updateVehicle({ id, vehicle: vehicleData });
      return true;
    } catch (error) {
      return false;
    }
  };

  // Handle deleting a vehicle
  const removeVehicle = async (id: string) => {
    if (isOffline) {
      // Is it a pending vehicle?
      if (id.toString().startsWith("pending-")) {
        actions.removePendingVehicle(id);
        toast.success("Pending vehicle removed");
        return true;
      }

      // Otherwise mark for deletion when online
      actions.addPendingDelete(id);
      toast.success("Vehicle marked for deletion when online");
      return true;
    }

    try {
      await deleteVehicle(id);
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    vehicles: filteredVehicles,
    allVehicles,
    isLoading: isLoading || isCreating || isUpdating || isDeleting,
    error,
    refetch,
    isOffline,
    filters,
    setFilter: actions.setFilter,
    resetFilters: actions.resetFilters,
    pendingVehicles,
    pendingUpdates,
    pendingDeletes,
    vehicleTypes,
    engineTypes,
    wheelCounts,
    offices,
    addVehicle,
    editVehicle,
    removeVehicle,
  };
}

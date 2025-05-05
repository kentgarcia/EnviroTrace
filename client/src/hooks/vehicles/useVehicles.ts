import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { apolloClient } from "@/lib/apollo-client";
import { GET_VEHICLE_SUMMARIES } from "@/lib/emission-api";
import { useVehicleStore } from "./useVehicleStore";
import { useNetworkStatus } from "../utils/useNetworkStatus";
import { gql, useQuery, useMutation, ApolloError } from "@apollo/client";

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
  const { isOffline } = useNetworkStatus();
  const { filters, pendingVehicles, pendingUpdates, pendingDeletes, actions } =
    useVehicleStore();
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch all vehicles using Apollo Client
  const {
    data,
    loading: isLoading,
    error,
    refetch,
  } = useQuery(GET_VEHICLE_SUMMARIES, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    skip: isOffline,
    notifyOnNetworkStatusChange: true,
  });

  // Extract vehicles from query data
  const vehicles = useMemo(() => {
    return data?.vehicleSummaries || [];
  }, [data]);

  // Track any network issues
  useEffect(() => {
    if (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Unable to fetch vehicles data");
    }
  }, [error]);

  // Set offline mode when network changes
  useEffect(() => {
    // The actions.setShowOfflineData function doesn't exist
    // Instead, we can directly use any relevant actions from the vehicle store
    if (isOffline) {
      // If there's a need to track offline state in the store, you could add this action
      // For now, we'll just log this condition for debugging
      console.log("App is in offline mode, using local vehicle data");
    }
  }, [isOffline]);

  // Create vehicle mutation
  const [createVehicleMutation, { loading: isCreating }] = useMutation(
    CREATE_VEHICLE,
    {
      onCompleted: () => {
        toast.success("Vehicle added successfully");
        refetch();
      },
      onError: (error) => {
        console.error("Error adding vehicle:", error);
        toast.error("Failed to add vehicle");
      },
    }
  );

  // Update vehicle mutation
  const [updateVehicleMutation, { loading: isUpdatingMutation }] = useMutation(
    UPDATE_VEHICLE,
    {
      onCompleted: () => {
        toast.success("Vehicle updated successfully");
        refetch();
      },
      onError: (error) => {
        console.error("Error updating vehicle:", error);
        toast.error("Failed to update vehicle");
      },
    }
  );

  // Delete vehicle mutation
  const [deleteVehicleMutation, { loading: isDeleting }] = useMutation(
    DELETE_VEHICLE,
    {
      onCompleted: () => {
        toast.success("Vehicle deleted successfully");
        refetch();
      },
      onError: (error) => {
        console.error("Error deleting vehicle:", error);
        toast.error("Failed to delete vehicle");
      },
    }
  );

  // Sync pending changes when online
  useEffect(() => {
    const syncPendingChanges = async () => {
      // Only proceed if online
      if (isOffline) return;

      setIsUpdating(true);
      try {
        // Sync pending deletes
        if (pendingDeletes.length > 0) {
          for (const id of pendingDeletes) {
            try {
              await deleteVehicleMutation({ variables: { id } });
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
              await createVehicleMutation({
                variables: { input: vehicleData },
              });
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
              await updateVehicleMutation({
                variables: { id, input: pendingUpdates[id] },
              });
              actions.removePendingUpdate(id);
              toast.success(
                `Synced updated vehicle: ${pendingUpdates[id].plateNumber}`
              );
            } catch (error) {
              console.error(`Failed to sync update for vehicle ${id}:`, error);
            }
          }
        }
      } finally {
        setIsUpdating(false);
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
    createVehicleMutation,
    updateVehicleMutation,
    deleteVehicleMutation,
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
      return true;
    }

    try {
      await createVehicleMutation({ variables: { input: vehicleData } });
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
      return true;
    }

    try {
      await updateVehicleMutation({ variables: { id, input: vehicleData } });
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
      await deleteVehicleMutation({ variables: { id } });
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    vehicles: filteredVehicles,
    allVehicles,
    isLoading:
      isLoading || isCreating || isUpdatingMutation || isDeleting || isUpdating,
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

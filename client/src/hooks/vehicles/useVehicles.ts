import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { GET_VEHICLE_SUMMARIES } from "@/lib/emission-api";
import { gql, useQuery, useMutation } from "@apollo/client";

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

export interface DriverHistoryEntry {
  driverName: string;
  changedAt: string;
  changedBy?: string;
}

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
  createdBy?: string;
  updatedBy?: string;
  driverHistory?: DriverHistoryEntry[];
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
  // Local filter state instead of useVehicleStore
  const [filters, setFilters] = useState({
    searchQuery: "",
    statusFilter: "all",
    vehicleTypeFilter: "",
    engineTypeFilter: "",
    wheelsFilter: "",
    officeFilter: "",
  });

  const resetFilters = () => {
    setFilters({
      searchQuery: "",
      statusFilter: "all",
      vehicleTypeFilter: "",
      engineTypeFilter: "",
      wheelsFilter: "",
      officeFilter: "",
    });
  };

  // Fetch all vehicles using Apollo Client
  const {
    data,
    loading: isLoading,
    error,
    refetch,
  } = useQuery(GET_VEHICLE_SUMMARIES, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
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

  // Extract unique filter options
  const vehicleTypes = useMemo(() => {
    return [...new Set(vehicles.map((v) => v.vehicleType))].filter(Boolean);
  }, [vehicles]);

  const engineTypes = useMemo(() => {
    return [...new Set(vehicles.map((v) => v.engineType))].filter(Boolean);
  }, [vehicles]);

  const wheelCounts = useMemo(() => {
    return [...new Set(vehicles.map((v) => v.wheels?.toString()))].filter(
      Boolean
    );
  }, [vehicles]);

  const offices = useMemo(() => {
    return [...new Set(vehicles.map((v) => v.officeName))].filter(Boolean);
  }, [vehicles]);

  // Filter vehicles based on selected filters
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      // Apply text search filter
      if (
        filters.searchQuery &&
        !vehicle.plateNumber
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) &&
        !vehicle.driverName
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Apply status filter
      if (filters.statusFilter !== "all") {
        if (filters.statusFilter === "passed" && !vehicle.latestTestResult) {
          return false;
        }
        if (
          filters.statusFilter === "failed" &&
          vehicle.latestTestResult !== false
        ) {
          return false;
        }
        if (
          filters.statusFilter === "untested" &&
          vehicle.latestTestResult !== undefined
        ) {
          return false;
        }
      }

      // Apply vehicle type filter
      if (
        filters.vehicleTypeFilter &&
        vehicle.vehicleType !== filters.vehicleTypeFilter
      ) {
        return false;
      }

      // Apply engine type filter
      if (
        filters.engineTypeFilter &&
        vehicle.engineType !== filters.engineTypeFilter
      ) {
        return false;
      }

      // Apply wheels filter
      if (
        filters.wheelsFilter &&
        vehicle.wheels?.toString() !== filters.wheelsFilter
      ) {
        return false;
      }

      // Apply office filter
      if (filters.officeFilter && vehicle.officeName !== filters.officeFilter) {
        return false;
      }

      return true;
    });
  }, [filters, vehicles]);

  // Handle adding a new vehicle
  const addVehicle = async (vehicleData: VehicleInput) => {
    try {
      await createVehicleMutation({ variables: { input: vehicleData } });
      return true;
    } catch (error) {
      return false;
    }
  };

  // Handle updating a vehicle
  const editVehicle = async (id: string, vehicleData: VehicleInput) => {
    try {
      await updateVehicleMutation({ variables: { id, input: vehicleData } });
      return true;
    } catch (error) {
      return false;
    }
  };

  // Handle deleting a vehicle
  const removeVehicle = async (id: string) => {
    try {
      await deleteVehicleMutation({ variables: { id } });
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    vehicles: filteredVehicles,
    isLoading: isLoading || isCreating || isUpdatingMutation || isDeleting,
    error,
    refetch,
    filters,
    setFilter: setFilters,
    resetFilters,
    vehicleTypes,
    engineTypes,
    wheelCounts,
    offices,
    addVehicle,
    editVehicle,
    removeVehicle,
  };
}

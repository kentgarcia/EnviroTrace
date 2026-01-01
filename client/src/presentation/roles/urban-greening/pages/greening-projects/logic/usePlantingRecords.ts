import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchUrbanGreeningPlantings,
  fetchUrbanGreeningPlanting,
  createUrbanGreeningPlanting,
  updateUrbanGreeningPlanting,
  deleteUrbanGreeningPlanting,
  fetchUrbanGreeningStatistics,
  fetchSaplingCollections,
  fetchSaplingCollection,
  createSaplingCollection,
  updateSaplingCollection,
  deleteSaplingCollection,
  fetchSaplingStatistics,
  UrbanGreeningPlanting,
  SaplingCollection,
  PlantingStatistics,
  SaplingStatistics,
  CreateUrbanGreeningPlantingData,
  CreateSaplingCollectionData,
} from "@/core/api/planting-api";

// Query keys
export const PLANTING_QUERY_KEYS = {
  urbanGreening: ["urban-greening-plantings"] as const,
  saplings: ["sapling-collections"] as const,
  urbanGreeningStats: ["urban-greening-statistics"] as const,
  saplingStats: ["sapling-statistics"] as const,
};

// Urban Greening Planting Hooks
export const useUrbanGreeningPlantings = (params?: {
  skip?: number;
  limit?: number;
  planting_type?: string;
  status?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: [...PLANTING_QUERY_KEYS.urbanGreening, params],
    queryFn: () => fetchUrbanGreeningPlantings(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUrbanGreeningPlanting = (id: string) => {
  return useQuery({
    queryKey: [...PLANTING_QUERY_KEYS.urbanGreening, id],
    queryFn: () => fetchUrbanGreeningPlanting(id),
    enabled: !!id,
  });
};

export const useUrbanGreeningStatistics = () => {
  return useQuery({
    queryKey: PLANTING_QUERY_KEYS.urbanGreeningStats,
    queryFn: fetchUrbanGreeningStatistics,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUrbanGreeningPlantingMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createUrbanGreeningPlanting,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PLANTING_QUERY_KEYS.urbanGreening,
      });
      queryClient.invalidateQueries({
        queryKey: PLANTING_QUERY_KEYS.urbanGreeningStats,
      });
      toast.success("Urban greening planting record created successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.detail || "Failed to create planting record"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateUrbanGreeningPlantingData>;
    }) => updateUrbanGreeningPlanting(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PLANTING_QUERY_KEYS.urbanGreening,
      });
      queryClient.invalidateQueries({
        queryKey: PLANTING_QUERY_KEYS.urbanGreeningStats,
      });
      toast.success("Urban greening planting record updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.detail || "Failed to update planting record"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUrbanGreeningPlanting,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PLANTING_QUERY_KEYS.urbanGreening,
      });
      queryClient.invalidateQueries({
        queryKey: PLANTING_QUERY_KEYS.urbanGreeningStats,
      });
      toast.success("Urban greening planting record deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.detail || "Failed to delete planting record"
      );
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};

// Sapling Collection Hooks
export const useSaplingCollections = (params?: {
  skip?: number;
  limit?: number;
  purpose?: string;
  status?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: [...PLANTING_QUERY_KEYS.saplings, params],
    queryFn: () => fetchSaplingCollections(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSaplingCollection = (id: string) => {
  return useQuery({
    queryKey: [...PLANTING_QUERY_KEYS.saplings, id],
    queryFn: () => fetchSaplingCollection(id),
    enabled: !!id,
  });
};

export const useSaplingStatistics = () => {
  return useQuery({
    queryKey: PLANTING_QUERY_KEYS.saplingStats,
    queryFn: fetchSaplingStatistics,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSaplingCollectionMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createSaplingCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLANTING_QUERY_KEYS.saplings });
      queryClient.invalidateQueries({
        queryKey: PLANTING_QUERY_KEYS.saplingStats,
      });
      toast.success("Sapling collection record created successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.detail ||
          "Failed to create sapling collection record"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateSaplingCollectionData>;
    }) => updateSaplingCollection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLANTING_QUERY_KEYS.saplings });
      queryClient.invalidateQueries({
        queryKey: PLANTING_QUERY_KEYS.saplingStats,
      });
      toast.success("Sapling collection record updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.detail ||
          "Failed to update sapling collection record"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSaplingCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLANTING_QUERY_KEYS.saplings });
      queryClient.invalidateQueries({
        queryKey: PLANTING_QUERY_KEYS.saplingStats,
      });
      toast.success("Sapling collection record deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.detail ||
          "Failed to delete sapling collection record"
      );
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};

// Utility functions for filtering and transforming data
export const filterUrbanGreeningPlantings = (
  plantings: UrbanGreeningPlanting[],
  searchTerm: string,
  typeFilter: string,
  statusFilter: string
): UrbanGreeningPlanting[] => {
  return plantings.filter((planting) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      planting.record_number.toLowerCase().includes(searchLower) ||
      planting.species_name.toLowerCase().includes(searchLower) ||
      planting.location.toLowerCase().includes(searchLower) ||
      planting.responsible_person.toLowerCase().includes(searchLower) ||
      (planting.organization &&
        planting.organization.toLowerCase().includes(searchLower));

    const matchesType =
      typeFilter === "all" || planting.planting_type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || planting.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });
};

export const filterSaplingCollections = (
  collections: SaplingCollection[],
  searchTerm: string,
  purposeFilter: string,
  statusFilter: string
): SaplingCollection[] => {
  return collections.filter((collection) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      collection.collection_number.toLowerCase().includes(searchLower) ||
      collection.species_name.toLowerCase().includes(searchLower) ||
      collection.collection_location.toLowerCase().includes(searchLower) ||
      collection.collector_name.toLowerCase().includes(searchLower) ||
      (collection.recipient_name &&
        collection.recipient_name.toLowerCase().includes(searchLower));

    const matchesPurpose =
      purposeFilter === "all" || collection.purpose === purposeFilter;
    const matchesStatus =
      statusFilter === "all" || collection.status === statusFilter;

    return matchesSearch && matchesPurpose && matchesStatus;
  });
};

// Transform API data for display
export const transformPlantingForDisplay = (
  planting: UrbanGreeningPlanting
) => ({
  ...planting,
  planting_date: new Date(planting.planting_date).toLocaleDateString(),
  planting_type_label: getPlantingTypeLabel(planting.planting_type),
  status_label: getPlantingStatusLabel(planting.status),
  survival_rate_display: planting.survival_rate
    ? `${planting.survival_rate}%`
    : "N/A",
});

export const transformSaplingForDisplay = (collection: SaplingCollection) => ({
  ...collection,
  collection_date: new Date(collection.collection_date).toLocaleDateString(),
  target_planting_date: collection.target_planting_date
    ? new Date(collection.target_planting_date).toLocaleDateString()
    : "N/A",
  distribution_date: collection.distribution_date
    ? new Date(collection.distribution_date).toLocaleDateString()
    : "N/A",
  purpose_label: getPurposeLabel(collection.purpose),
  status_label: getSaplingStatusLabel(collection.status),
  survival_rate_display: collection.survival_rate
    ? `${collection.survival_rate}%`
    : "N/A",
});

// Label helpers
export const getPlantingTypeLabel = (type: string) => {
  switch (type) {
    case "ornamental_plants":
      return "Ornamental Plants";
    case "trees":
      return "Trees";
    case "seeds":
      return "Seeds";
    case "seeds_private":
      return "Seeds (Private)";
    default:
      return type;
  }
};

export const getPlantingStatusLabel = (status: string) => {
  switch (status) {
    case "planted":
      return "Planted";
    case "growing":
      return "Growing";
    case "mature":
      return "Mature";
    case "died":
      return "Died";
    case "removed":
      return "Removed";
    default:
      return status;
  }
};

export const getPurposeLabel = (purpose: string) => {
  switch (purpose) {
    case "replacement":
      return "Replacement";
    case "reforestation":
      return "Reforestation";
    case "distribution":
      return "Distribution";
    case "nursery":
      return "Nursery";
    default:
      return purpose;
  }
};

export const getSaplingStatusLabel = (status: string) => {
  switch (status) {
    case "collected":
      return "Collected";
    case "nursery":
      return "In Nursery";
    case "ready_for_planting":
      return "Ready for Planting";
    case "planted":
      return "Planted";
    case "distributed":
      return "Distributed";
    default:
      return status;
  }
};

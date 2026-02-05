// client/src/presentation/roles/urban-greening/pages/tree-inventory/logic/useTreeInventory.ts
/**
 * React Query hooks for Tree Inventory System
 */

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchTrees,
  fetchTreesForMap,
  fetchTreesInBounds,
  fetchTreeClusters,
  fetchTreeStats,
  fetchTreeById,
  fetchTreeByCode,
  createTree,
  updateTree,
  archiveTree,
  restoreTree,
  createTreesBatch,
  fetchMonitoringLogs,
  createMonitoringLog,
  fetchProjects,
  fetchProjectStats,
  fetchProjectById,
  createProject,
  updateProject,
  deleteProject,
  addTreesToProject,
  fetchTreeSpecies,
  createTreeSpecies,
  TreeInventoryCreate,
  TreeInventoryUpdate,
  TreeMonitoringLogCreate,
  PlantingProjectCreate,
  PlantingProjectUpdate,
  TreeSpeciesCreate,
  BoundsParams,
  TreeMapItem,
  TreeCluster,
} from "@/core/api/tree-inventory-api";

// ==================== Tree Species Hooks ====================

export const useTreeSpecies = (search?: string) => {
  return useQuery({
    queryKey: ["tree-species", search],
    queryFn: () => fetchTreeSpecies(search),
    staleTime: 1 * 60 * 1000, // 1 minute - allow more frequent updates for species type changes
    refetchOnMount: true, // Always refetch on component mount to get latest changes
  });
};

export const useCreateSpecies = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTreeSpecies,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree-species"] });
      toast.success("New species added successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to add species");
    },
  });
};

// ==================== Tree Inventory Hooks ====================

export const useTreeInventory = (
  params?: {
    skip?: number;
    limit?: number;
    status?: string;
    health?: string;
    species?: string;
    barangay?: string;
    search?: string;
    is_archived?: boolean;
  },
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: ["tree-inventory", params],
    queryFn: () => fetchTrees(params),
    staleTime: 60_000,
    enabled: options?.enabled ?? true,
  });
};

export const useTreesForMap = (params?: {
  status?: string;
  health?: string;
}) => {
  return useQuery({
    queryKey: ["tree-inventory", "map", params],
    queryFn: () => fetchTreesForMap(params),
    staleTime: 60_000,
  });
};

// ==================== Expanded Bounds Caching Utilities ====================

/**
 * Expand bounds by a factor (1.5 = 50% larger in each direction)
 */
const expandBounds = (bounds: BoundsParams, factor: number = 1.5): BoundsParams => {
  const latSpan = bounds.max_lat - bounds.min_lat;
  const lngSpan = bounds.max_lng - bounds.min_lng;
  const latPadding = (latSpan * (factor - 1)) / 2;
  const lngPadding = (lngSpan * (factor - 1)) / 2;
  
  return {
    min_lat: bounds.min_lat - latPadding,
    min_lng: bounds.min_lng - lngPadding,
    max_lat: bounds.max_lat + latPadding,
    max_lng: bounds.max_lng + lngPadding,
    status: bounds.status,
    health: bounds.health,
  };
};

/**
 * Check if viewport is contained within cached bounds
 */
const isViewportWithinCache = (
  viewport: BoundsParams,
  cachedBounds: BoundsParams | null
): boolean => {
  if (!cachedBounds) return false;
  return (
    viewport.min_lat >= cachedBounds.min_lat &&
    viewport.min_lng >= cachedBounds.min_lng &&
    viewport.max_lat <= cachedBounds.max_lat &&
    viewport.max_lng <= cachedBounds.max_lng &&
    viewport.status === cachedBounds.status &&
    viewport.health === cachedBounds.health
  );
};

/**
 * Smart bounds caching hook for trees
 * - Fetches expanded bounds (1.5x viewport) on first load
 * - Only refetches when viewport leaves cached bounds
 * - Merges new data with existing (never clears)
 * - Renders from cache immediately
 */
export const useSmartTreesInBounds = (
  viewportBounds: BoundsParams | null,
  options?: { enabled?: boolean; limit?: number }
) => {
  // Track the bounds we actually fetched (expanded)
  const [cachedBounds, setCachedBounds] = useState<BoundsParams | null>(null);
  // Track merged tree data across fetches
  const [mergedTrees, setMergedTrees] = useState<Map<string, TreeMapItem>>(new Map());
  // Track fetch bounds - only update when we need to fetch
  const [fetchBounds, setFetchBounds] = useState<BoundsParams | null>(null);
  
  // Determine if we need to fetch new data
  const needsFetch = useMemo(() => {
    if (!viewportBounds) return false;
    if (!cachedBounds) return true; // First load
    return !isViewportWithinCache(viewportBounds, cachedBounds);
  }, [viewportBounds, cachedBounds]);
  
  // Update fetch bounds when needed
  useEffect(() => {
    if (needsFetch && viewportBounds) {
      const expanded = expandBounds(viewportBounds, 1.5);
      setFetchBounds(expanded);
    }
  }, [needsFetch, viewportBounds]);
  
  // Round bounds for query key stability
  const roundedFetchBounds = fetchBounds ? {
    min_lat: Math.floor(fetchBounds.min_lat * 10000) / 10000,
    min_lng: Math.floor(fetchBounds.min_lng * 10000) / 10000,
    max_lat: Math.ceil(fetchBounds.max_lat * 10000) / 10000,
    max_lng: Math.ceil(fetchBounds.max_lng * 10000) / 10000,
    status: fetchBounds.status,
    health: fetchBounds.health,
  } : null;
  
  const query = useQuery({
    queryKey: ["tree-inventory", "smart-bounds", roundedFetchBounds],
    queryFn: () => fetchTreesInBounds({ ...roundedFetchBounds!, limit: options?.limit }),
    enabled: options?.enabled !== false && !!roundedFetchBounds && needsFetch,
    staleTime: 10 * 60_000, // 10 minutes cache
    gcTime: 15 * 60_000,
  });
  
  // Merge new data and update cached bounds on successful fetch
  useEffect(() => {
    if (query.data && fetchBounds && needsFetch) {
      setMergedTrees(prev => {
        const newMap = new Map(prev);
        query.data.forEach(tree => {
          newMap.set(tree.id, tree);
        });
        return newMap;
      });
      setCachedBounds(fetchBounds);
    }
  }, [query.data, fetchBounds, needsFetch]);
  
  // Clear merged trees when filters change
  useEffect(() => {
    if (viewportBounds) {
      const filterKey = `${viewportBounds.status || ''}-${viewportBounds.health || ''}`;
      setMergedTrees(prev => {
        // If filters changed, check if any existing tree matches new filters
        const firstTree = prev.values().next().value;
        if (firstTree) {
          const prevFilterKey = `${firstTree._filterStatus || ''}-${firstTree._filterHealth || ''}`;
          if (prevFilterKey !== filterKey) {
            return new Map(); // Clear on filter change
          }
        }
        return prev;
      });
    }
  }, [viewportBounds?.status, viewportBounds?.health]);
  
  // Filter to viewport for rendering (but keep full cache)
  const visibleTrees = useMemo(() => {
    if (!viewportBounds) return [];
    return Array.from(mergedTrees.values()).filter(tree => 
      tree.latitude >= viewportBounds.min_lat &&
      tree.latitude <= viewportBounds.max_lat &&
      tree.longitude >= viewportBounds.min_lng &&
      tree.longitude <= viewportBounds.max_lng
    );
  }, [mergedTrees, viewportBounds]);
  
  return {
    data: visibleTrees,
    allCachedData: Array.from(mergedTrees.values()),
    isLoading: query.isLoading && mergedTrees.size === 0,
    isFetching: query.isFetching,
    cachedBounds,
    isUsingCache: !needsFetch,
  };
};

/**
 * Smart bounds caching hook for clusters
 * Same strategy as trees but for clustered data
 */
export const useSmartTreeClusters = (
  viewportBounds: BoundsParams | null,
  zoom: number,
  options?: { enabled?: boolean }
) => {
  const [cachedBounds, setCachedBounds] = useState<BoundsParams | null>(null);
  const [cachedZoom, setCachedZoom] = useState<number | null>(null);
  const [mergedClusters, setMergedClusters] = useState<TreeCluster[]>([]);
  const [fetchBounds, setFetchBounds] = useState<BoundsParams | null>(null);
  const [fetchZoom, setFetchZoom] = useState<number>(zoom);
  
  // Need to fetch if outside bounds OR zoom changed significantly
  const needsFetch = useMemo(() => {
    if (!viewportBounds) return false;
    if (!cachedBounds || cachedZoom === null) return true;
    // Refetch if zoom changed by more than 1 level
    if (Math.abs(zoom - cachedZoom) > 1) return true;
    return !isViewportWithinCache(viewportBounds, cachedBounds);
  }, [viewportBounds, cachedBounds, zoom, cachedZoom]);
  
  useEffect(() => {
    if (needsFetch && viewportBounds) {
      const expanded = expandBounds(viewportBounds, 1.5);
      setFetchBounds(expanded);
      setFetchZoom(zoom);
    }
  }, [needsFetch, viewportBounds, zoom]);
  
  const roundedFetchBounds = fetchBounds ? {
    min_lat: Math.floor(fetchBounds.min_lat * 1000) / 1000,
    min_lng: Math.floor(fetchBounds.min_lng * 1000) / 1000,
    max_lat: Math.ceil(fetchBounds.max_lat * 1000) / 1000,
    max_lng: Math.ceil(fetchBounds.max_lng * 1000) / 1000,
    status: fetchBounds.status,
    health: fetchBounds.health,
  } : null;
  
  const query = useQuery({
    queryKey: ["tree-inventory", "smart-clusters", roundedFetchBounds, fetchZoom],
    queryFn: () => fetchTreeClusters({ ...roundedFetchBounds!, zoom: fetchZoom }),
    enabled: options?.enabled !== false && !!roundedFetchBounds && needsFetch,
    staleTime: 10 * 60_000,
    gcTime: 15 * 60_000,
  });
  
  useEffect(() => {
    if (query.data && fetchBounds && needsFetch) {
      setMergedClusters(query.data);
      setCachedBounds(fetchBounds);
      setCachedZoom(fetchZoom);
    }
  }, [query.data, fetchBounds, fetchZoom, needsFetch]);
  
  // Clear on filter change
  useEffect(() => {
    setCachedBounds(null);
    setMergedClusters([]);
  }, [viewportBounds?.status, viewportBounds?.health]);
  
  // Filter clusters to viewport
  const visibleClusters = useMemo(() => {
    if (!viewportBounds) return [];
    return mergedClusters.filter(cluster =>
      cluster.cluster_lat >= viewportBounds.min_lat &&
      cluster.cluster_lat <= viewportBounds.max_lat &&
      cluster.cluster_lng >= viewportBounds.min_lng &&
      cluster.cluster_lng <= viewportBounds.max_lng
    );
  }, [mergedClusters, viewportBounds]);
  
  return {
    data: visibleClusters,
    allCachedData: mergedClusters,
    isLoading: query.isLoading && mergedClusters.length === 0,
    isFetching: query.isFetching,
    cachedBounds,
    isUsingCache: !needsFetch,
  };
};

/**
 * Fetch trees within a bounding box using PostGIS spatial query
 * Caches results by bounding box for efficient map movement
 * @deprecated Use useSmartTreesInBounds for better caching
 */
export const useTreesInBounds = (
  bounds: BoundsParams | null,
  options?: { enabled?: boolean; limit?: number }
) => {
  // Round bounds to 4 decimal places for cache key stability
  const roundedBounds = bounds ? {
    min_lat: Math.floor(bounds.min_lat * 10000) / 10000,
    min_lng: Math.floor(bounds.min_lng * 10000) / 10000,
    max_lat: Math.ceil(bounds.max_lat * 10000) / 10000,
    max_lng: Math.ceil(bounds.max_lng * 10000) / 10000,
    status: bounds.status,
    health: bounds.health,
  } : null;

  return useQuery({
    queryKey: ["tree-inventory", "bounds", roundedBounds],
    queryFn: () => fetchTreesInBounds({ ...roundedBounds!, limit: options?.limit }),
    enabled: options?.enabled !== false && !!roundedBounds,
    staleTime: 5 * 60_000, // 5 minutes cache
    gcTime: 10 * 60_000, // Keep in cache for 10 minutes
  });
};

/**
 * Fetch clustered tree data for map visualization
 * Uses server-side clustering for performance at lower zoom levels
 */
export const useTreeClusters = (
  bounds: BoundsParams | null,
  zoom: number,
  options?: { enabled?: boolean }
) => {
  // Round bounds for cache key stability
  const roundedBounds = bounds ? {
    min_lat: Math.floor(bounds.min_lat * 1000) / 1000,
    min_lng: Math.floor(bounds.min_lng * 1000) / 1000,
    max_lat: Math.ceil(bounds.max_lat * 1000) / 1000,
    max_lng: Math.ceil(bounds.max_lng * 1000) / 1000,
    status: bounds.status,
    health: bounds.health,
  } : null;

  return useQuery({
    queryKey: ["tree-inventory", "clusters", roundedBounds, zoom],
    queryFn: () => fetchTreeClusters({ ...roundedBounds!, zoom }),
    enabled: options?.enabled !== false && !!roundedBounds,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });
};

export const useTreeStats = () => {
  return useQuery({
    queryKey: ["tree-inventory", "stats"],
    queryFn: fetchTreeStats,
    staleTime: 60_000,
  });
};

export const useTreeById = (id: string) => {
  return useQuery({
    queryKey: ["tree-inventory", id],
    queryFn: () => fetchTreeById(id),
    enabled: !!id,
  });
};

export const useTreeByCode = (code: string) => {
  return useQuery({
    queryKey: ["tree-inventory", "code", code],
    queryFn: () => fetchTreeByCode(code),
    enabled: !!code,
  });
};

export const useTreeMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createTree,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree-inventory"] });
      toast.success("Tree added to inventory successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to add tree");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TreeInventoryUpdate }) =>
      updateTree(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree-inventory"] });
      toast.success("Tree updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update tree");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: archiveTree,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree-inventory"] });
      toast.success("Tree archived successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to archive tree");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreTree,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree-inventory"] });
      toast.success("Tree restored successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to restore tree");
    },
  });

  const batchCreateMutation = useMutation({
    mutationFn: createTreesBatch,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tree-inventory"] });
      toast.success(`${data.length} trees added to inventory`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to add trees");
    },
  });

  return {
    createMutation,
    updateMutation,
    archiveMutation,
    restoreMutation,
    batchCreateMutation,
  };
};

// ==================== Monitoring Log Hooks ====================

export const useMonitoringLogs = (treeId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["tree-inventory", treeId, "monitoring"],
    queryFn: () => fetchMonitoringLogs(treeId),
    enabled: options?.enabled ?? !!treeId,
  });
};

// Alias for better clarity in components
export const useTreeMonitoringLogs = useMonitoringLogs;

export const useMonitoringMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createMonitoringLog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tree-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["tree-inventory", data.tree_id, "monitoring"] });
      toast.success("Monitoring log added successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to add monitoring log");
    },
  });

  return { createMutation };
};

// ==================== Planting Project Hooks ====================

export const usePlantingProjects = (params?: {
  project_type?: string;
  status?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["planting-projects", params],
    queryFn: () => fetchProjects(params),
    staleTime: 60_000,
  });
};

export const useProjectStats = () => {
  return useQuery({
    queryKey: ["planting-projects", "stats"],
    queryFn: fetchProjectStats,
    staleTime: 60_000,
  });
};

export const useProjectById = (id: string) => {
  return useQuery({
    queryKey: ["planting-projects", id],
    queryFn: () => fetchProjectById(id),
    enabled: !!id,
  });
};

export const useProjectMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planting-projects"] });
      toast.success("Planting project created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create project");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PlantingProjectUpdate }) =>
      updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planting-projects"] });
      toast.success("Project updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update project");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planting-projects"] });
      toast.success("Project deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete project");
    },
  });

  const addTreesMutation = useMutation({
    mutationFn: ({ projectId, trees }: { projectId: string; trees: TreeInventoryCreate[] }) =>
      addTreesToProject(projectId, trees),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["planting-projects"] });
      queryClient.invalidateQueries({ queryKey: ["tree-inventory"] });
      toast.success(`${data.length} trees added to project`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to add trees to project");
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    addTreesMutation,
  };
};

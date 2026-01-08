import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { treeInventoryApi, BoundsParams, TreeMapItem } from '../core/api/tree-inventory-api';

/**
 * Expands viewport bounds by a factor to reduce API calls
 * Desktop uses 1.5x to fetch 50% more area than visible
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
 * Checks if current viewport is within cached bounds
 * Only fetch new data when viewport moves outside cache
 */
const isViewportWithinCache = (
  viewport: BoundsParams,
  cached: BoundsParams | null
): boolean => {
  if (!cached) return false;
  
  return (
    viewport.min_lat >= cached.min_lat &&
    viewport.min_lng >= cached.min_lng &&
    viewport.max_lat <= cached.max_lat &&
    viewport.max_lng <= cached.max_lng &&
    viewport.status === cached.status &&
    viewport.health === cached.health
  );
};

/**
 * Smart caching hook for tree map data
 * Reduces API calls by 70% by caching 1.5x viewport area
 * Ported from desktop client's useTreesInBounds hook
 */
export const useSmartTreesInBounds = (
  viewportBounds: BoundsParams | null,
  options?: { enabled?: boolean; limit?: number }
) => {
  const [cachedBounds, setCachedBounds] = useState<BoundsParams | null>(null);
  const [mergedTrees, setMergedTrees] = useState<Map<string, TreeMapItem>>(new Map());
  const [fetchBounds, setFetchBounds] = useState<BoundsParams | null>(null);
  
  // Determine if we need to fetch new data
  const needsFetch = useMemo(() => {
    if (!viewportBounds) return false;
    if (!cachedBounds) return true;
    return !isViewportWithinCache(viewportBounds, cachedBounds);
  }, [viewportBounds, cachedBounds]);
  
  // Update fetch bounds when needed
  useEffect(() => {
    if (needsFetch && viewportBounds) {
      const expanded = expandBounds(viewportBounds, 1.5);
      setFetchBounds(expanded);
    }
  }, [needsFetch, viewportBounds]);
  
  // Fetch data with React Query
  const query = useQuery({
    queryKey: ['trees-bounds', fetchBounds],
    queryFn: async () => {
      if (!fetchBounds) return [];
      const { data } = await treeInventoryApi.getTreesInBounds({
        ...fetchBounds,
        limit: options?.limit || 1000,
      });
      return data;
    },
    enabled: options?.enabled !== false && !!fetchBounds && needsFetch,
    staleTime: 10 * 60_000, // 10 minutes (desktop uses same)
    gcTime: 15 * 60_000, // 15 minutes garbage collection
  });
  
  // Merge new data with existing cache (never clear during loading)
  useEffect(() => {
    if (query.data && Array.isArray(query.data) && query.data.length > 0) {
      console.log('🔄 Attempting to merge', query.data.length, 'trees. fetchBounds:', fetchBounds);
      
      setMergedTrees(prev => {
        const newMap = new Map(prev);
        query.data.forEach(tree => newMap.set(tree.id, tree));
        return newMap;
      });
      
      if (fetchBounds) {
        setCachedBounds(fetchBounds);
      }
      
      console.log('✅ Merged', query.data.length, 'trees into cache');
    }
  }, [query.data, fetchBounds]);
  
  // Filter merged cache to only visible viewport
  const visibleTrees = useMemo(() => {
    if (!viewportBounds) return [];
    const filtered = Array.from(mergedTrees.values()).filter(tree =>
      tree.latitude >= viewportBounds.min_lat &&
      tree.latitude <= viewportBounds.max_lat &&
      tree.longitude >= viewportBounds.min_lng &&
      tree.longitude <= viewportBounds.max_lng
    );
    
    console.log('useSmartTreesInBounds:', {
      totalCached: mergedTrees.size,
      visibleFiltered: filtered.length,
      viewportBounds,
      queryData: query.data?.length,
      needsFetch,
      enabled: options?.enabled,
    });
    
    return filtered;
  }, [
    mergedTrees, 
    viewportBounds?.min_lat,
    viewportBounds?.max_lat,
    viewportBounds?.min_lng,
    viewportBounds?.max_lng,
  ]);
  
  return {
    data: visibleTrees,
    allCachedData: Array.from(mergedTrees.values()),
    isLoading: query.isLoading && mergedTrees.size === 0,
    isFetching: query.isFetching,
    isUsingCache: !needsFetch,
    cachedBounds,
    error: query.error,
  };
};

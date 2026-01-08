import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { treeInventoryApi, BoundsParams, TreeCluster } from '../core/api/tree-inventory-api';

/**
 * Expands viewport bounds by a factor to reduce API calls
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
 */
const isViewportWithinCache = (
  viewport: BoundsParams,
  cached: BoundsParams | null,
  zoom: number,
  cachedZoom: number | null
): boolean => {
  if (!cached || cachedZoom === null) return false;
  
  // Must refetch if zoom level changed (different clustering grid)
  if (zoom !== cachedZoom) return false;
  
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
 * Smart caching hook for tree cluster data
 * Uses server-side PostGIS clustering for zoom levels < 16
 * Desktop uses zoom threshold of 16 to switch between clusters and individual trees
 */
export const useSmartTreeClusters = (
  viewportBounds: BoundsParams | null,
  zoom: number,
  options?: { enabled?: boolean }
) => {
  const [cachedBounds, setCachedBounds] = useState<BoundsParams | null>(null);
  const [cachedZoom, setCachedZoom] = useState<number | null>(null);
  const [mergedClusters, setMergedClusters] = useState<Map<string, TreeCluster>>(new Map());
  const [fetchBounds, setFetchBounds] = useState<BoundsParams | null>(null);
  
  // Determine if we need to fetch new data
  const needsFetch = useMemo(() => {
    if (!viewportBounds) return false;
    if (!cachedBounds || cachedZoom === null) return true;
    return !isViewportWithinCache(viewportBounds, cachedBounds, zoom, cachedZoom);
  }, [viewportBounds, cachedBounds, zoom, cachedZoom]);
  
  // Update fetch bounds when needed
  useEffect(() => {
    if (needsFetch && viewportBounds) {
      const expanded = expandBounds(viewportBounds, 1.5);
      setFetchBounds(expanded);
    }
  }, [needsFetch, viewportBounds]);
  
  // Clear cache when zoom level changes (different clustering grid)
  useEffect(() => {
    if (cachedZoom !== null && cachedZoom !== zoom) {
      console.log('🔄 Zoom changed from', cachedZoom, 'to', zoom, '- clearing cluster cache');
      setMergedClusters(new Map());
      setCachedBounds(null);
      setCachedZoom(null);
    }
  }, [zoom, cachedZoom]);
  
  // Fetch cluster data with React Query
  const query = useQuery({
    queryKey: ['tree-clusters', fetchBounds, zoom],
    queryFn: async () => {
      if (!fetchBounds) return [];
      const { data } = await treeInventoryApi.getTreeClusters({
        ...fetchBounds,
        zoom,
      });
      console.log('📦 Cluster API response:', JSON.stringify(data, null, 2));
      console.log('📦 Cluster data type:', Array.isArray(data), 'length:', data?.length);
      return data;
    },
    enabled: options?.enabled !== false && !!fetchBounds && needsFetch,
    staleTime: 10 * 60_000, // 10 minutes
    gcTime: 15 * 60_000, // 15 minutes
  });
  
  // Merge new data with existing cache
  useEffect(() => {
    if (query.data && Array.isArray(query.data) && query.data.length > 0) {
      console.log('🔄 Attempting to merge', query.data.length, 'clusters. fetchBounds:', fetchBounds);
      
      setMergedClusters(prev => {
        const newMap = new Map(prev);
        query.data.forEach(cluster => {
          // Use lat/lng as unique key for clusters
          // Check for valid coordinates before using toFixed
          if (cluster.latitude != null && cluster.longitude != null) {
            const key = `${cluster.latitude.toFixed(6)}_${cluster.longitude.toFixed(6)}`;
            newMap.set(key, cluster);
          }
        });
        return newMap;
      });
      
      if (fetchBounds) {
        setCachedBounds(fetchBounds);
        setCachedZoom(zoom);
      }
      
      console.log('✅ Merged', query.data.length, 'clusters into cache');
    }
  }, [query.data, fetchBounds, zoom]);
  
  // Filter merged cache to only visible viewport
  const visibleClusters = useMemo(() => {
    if (!viewportBounds) return [];
    const filtered = Array.from(mergedClusters.values()).filter(cluster =>
      cluster.latitude >= viewportBounds.min_lat &&
      cluster.latitude <= viewportBounds.max_lat &&
      cluster.longitude >= viewportBounds.min_lng &&
      cluster.longitude <= viewportBounds.max_lng
    );
    
    console.log('useSmartTreeClusters:', {
      totalCached: mergedClusters.size,
      visibleFiltered: filtered.length,
      viewportBounds,
      queryData: query.data?.length,
      needsFetch,
      zoom,
      enabled: options?.enabled,
    });
    
    return filtered;
  }, [
    mergedClusters,
    viewportBounds?.min_lat,
    viewportBounds?.max_lat,
    viewportBounds?.min_lng,
    viewportBounds?.max_lng,
  ]);
  
  return {
    data: visibleClusters,
    allCachedData: Array.from(mergedClusters.values()),
    isLoading: query.isLoading && mergedClusters.size === 0,
    isFetching: query.isFetching,
    isUsingCache: !needsFetch,
    cachedBounds,
    error: query.error,
  };
};

import { useQuery, useQueryClient, QueryKey } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import smartCache from "../core/cache/smartCache";

interface UseSmartQueryOptions<T> {
  /** Unique key for the query/cache */
  queryKey: QueryKey;
  /** Function to fetch data from the server */
  queryFn: () => Promise<T>;
  /** Time in milliseconds before data is considered stale (default: 2 minutes) */
  staleTime?: number;
  /** Time in milliseconds for cache persistence (default: 24 hours) */
  cacheTime?: number;
  /** Whether to refetch when app comes to foreground (default: true) */
  refetchOnAppFocus?: boolean;
  /** Interval in milliseconds for auto-refresh (default: disabled) */
  refetchInterval?: number;
  /** Whether the query is enabled (default: true) */
  enabled?: boolean;
  /** Callback when data is successfully fetched */
  onSuccess?: (data: T) => void;
  /** Callback when fetch fails */
  onError?: (error: Error) => void;
}

/**
 * A smart query hook that combines React Query with persistent caching.
 * 
 * Features:
 * - Instant UI with cached data
 * - Background revalidation when stale
 * - Automatic refresh on app focus
 * - Offline support with cached data
 * - Persistent cache across app restarts
 */
export function useSmartQuery<T>({
  queryKey,
  queryFn,
  staleTime = 2 * 60 * 1000, // 2 minutes
  cacheTime = 24 * 60 * 60 * 1000, // 24 hours
  refetchOnAppFocus = true,
  refetchInterval,
  enabled = true,
  onSuccess,
  onError,
}: UseSmartQueryOptions<T>) {
  const queryClient = useQueryClient();
  const cacheKey = Array.isArray(queryKey) ? queryKey.join("_") : String(queryKey);
  const isFirstLoad = useRef(true);
  
  // Load cached data on mount
  useEffect(() => {
    if (!enabled) return;
    
    const loadCachedData = async () => {
      try {
        const cached = await smartCache.get<T>(cacheKey);
        if (cached && isFirstLoad.current) {
          // Seed React Query cache with persisted data
          queryClient.setQueryData(queryKey, cached.data);
          isFirstLoad.current = false;
        }
      } catch (error) {
        console.error("[useSmartQuery] Error loading cached data:", error);
      }
    };
    
    loadCachedData();
  }, [cacheKey, queryKey, queryClient, enabled]);
  
  // Enhanced query function that persists to cache
  const enhancedQueryFn = useCallback(async (): Promise<T> => {
    try {
      const data = await queryFn();
      // Persist to smart cache
      await smartCache.set(cacheKey, data, { staleTime, maxAge: cacheTime });
      onSuccess?.(data);
      return data;
    } catch (error) {
      onError?.(error as Error);
      
      // On error, try to return cached data
      const cached = await smartCache.get<T>(cacheKey);
      if (cached) {
        console.log("[useSmartQuery] Returning cached data on error");
        return cached.data;
      }
      throw error;
    }
  }, [queryFn, cacheKey, staleTime, cacheTime, onSuccess, onError]);
  
  // React Query with smart defaults
  const query = useQuery({
    queryKey,
    queryFn: enhancedQueryFn,
    staleTime,
    gcTime: cacheTime,
    refetchInterval,
    enabled,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if ((error as any)?.response?.status === 401) return false;
      return failureCount < 2;
    },
    refetchOnWindowFocus: false, // We handle this manually for mobile
  });
  
  // Handle app state changes (refetch on foreground)
  useEffect(() => {
    if (!refetchOnAppFocus || !enabled) return;
    
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active" && query.isStale) {
        query.refetch();
      }
    };
    
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription?.remove();
  }, [refetchOnAppFocus, enabled, query]);
  
  // Enhanced refetch that also invalidates cache
  const refetch = useCallback(async () => {
    await smartCache.invalidate(cacheKey);
    return query.refetch();
  }, [query, cacheKey]);
  
  // Force refresh (invalidate cache and refetch)
  const forceRefresh = useCallback(async () => {
    await smartCache.remove(cacheKey);
    return query.refetch();
  }, [query, cacheKey]);
  
  return {
    ...query,
    refetch,
    forceRefresh,
    isFromCache: query.isStale && query.data !== undefined,
  };
}

/**
 * Hook to prefetch and cache data
 */
export function usePrefetch() {
  const queryClient = useQueryClient();
  
  const prefetch = useCallback(async <T>(
    queryKey: QueryKey,
    queryFn: () => Promise<T>,
    options?: { staleTime?: number; cacheTime?: number }
  ) => {
    const cacheKey = Array.isArray(queryKey) ? queryKey.join("_") : String(queryKey);
    
    try {
      const data = await queryFn();
      
      // Set in React Query cache
      queryClient.setQueryData(queryKey, data);
      
      // Persist to smart cache
      await smartCache.set(cacheKey, data, {
        staleTime: options?.staleTime,
        maxAge: options?.cacheTime,
      });
      
      return data;
    } catch (error) {
      console.error("[usePrefetch] Error prefetching:", error);
      return null;
    }
  }, [queryClient]);
  
  return { prefetch };
}

export default useSmartQuery;

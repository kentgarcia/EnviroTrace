import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";

export interface UseDataGridOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<T[]>;
  initialPageSize?: number;
  enableServerSidePagination?: boolean;
  enableServerSideSorting?: boolean;
  enableServerSideFiltering?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  cacheTime?: number;
}

export interface ServerSideParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, any>;
  globalFilter?: string;
}

export function useDataGrid<T extends Record<string, any>>({
  queryKey,
  queryFn,
  initialPageSize = 10,
  enableServerSidePagination = false,
  enableServerSideSorting = false,
  enableServerSideFiltering = false,
  refetchInterval,
  staleTime = 5 * 60 * 1000, // 5 minutes
  cacheTime = 10 * 60 * 1000, // 10 minutes
}: UseDataGridOptions<T>) {
  const queryClient = useQueryClient();

  // Local state for server-side operations
  const [serverParams, setServerParams] = useState<ServerSideParams>({
    page: 0,
    pageSize: initialPageSize,
  });

  // Build query key with server params if server-side features are enabled
  const queryKeyWithParams = useMemo(() => {
    if (
      enableServerSidePagination ||
      enableServerSideSorting ||
      enableServerSideFiltering
    ) {
      return [...queryKey, serverParams];
    }
    return queryKey;
  }, [
    queryKey,
    serverParams,
    enableServerSidePagination,
    enableServerSideSorting,
    enableServerSideFiltering,
  ]);

  // Query for data
  const {
    data = [],
    isLoading,
    error,
    refetch,
    isFetching,
    isRefetching,
  } = useQuery({
    queryKey: queryKeyWithParams,
    queryFn: () => {
      if (
        enableServerSidePagination ||
        enableServerSideSorting ||
        enableServerSideFiltering
      ) {
        // Pass server params to query function if using server-side features
        return (queryFn as any)(serverParams);
      }
      return queryFn();
    },
    refetchInterval,
    staleTime,
    gcTime: cacheTime,
    refetchOnWindowFocus: false,
  });

  // Optimistic update function
  const updateOptimistic = useCallback(
    (updater: (oldData: T[]) => T[]) => {
      queryClient.setQueryData(queryKeyWithParams, updater);
    },
    [queryClient, queryKeyWithParams]
  );

  // Add item optimistically
  const addItemOptimistic = useCallback(
    (newItem: T) => {
      updateOptimistic((oldData) => [newItem, ...oldData]);
    },
    [updateOptimistic]
  );

  // Update item optimistically
  const updateItemOptimistic = useCallback(
    (id: string | number, updater: (item: T) => T) => {
      updateOptimistic((oldData) =>
        oldData.map((item) => (item.id === id ? updater(item) : item))
      );
    },
    [updateOptimistic]
  );

  // Remove item optimistically
  const removeItemOptimistic = useCallback(
    (id: string | number) => {
      updateOptimistic((oldData) => oldData.filter((item) => item.id !== id));
    },
    [updateOptimistic]
  );

  // Invalidate and refetch
  const invalidateAndRefetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
    refetch();
  }, [queryClient, queryKey, refetch]);

  // Server-side operation handlers
  const handleServerSidePagination = useCallback(
    (page: number, pageSize: number) => {
      if (enableServerSidePagination) {
        setServerParams((prev) => ({ ...prev, page, pageSize }));
      }
    },
    [enableServerSidePagination]
  );

  const handleServerSideSorting = useCallback(
    (sortBy: string, sortOrder: "asc" | "desc") => {
      if (enableServerSideSorting) {
        setServerParams((prev) => ({ ...prev, sortBy, sortOrder }));
      }
    },
    [enableServerSideSorting]
  );

  const handleServerSideFiltering = useCallback(
    (filters: Record<string, any>, globalFilter?: string) => {
      if (enableServerSideFiltering) {
        setServerParams((prev) => ({
          ...prev,
          filters,
          globalFilter,
          page: 0,
        }));
      }
    },
    [enableServerSideFiltering]
  );

  // Prefetch next page
  const prefetchNextPage = useCallback(() => {
    if (enableServerSidePagination) {
      const nextPageParams = { ...serverParams, page: serverParams.page! + 1 };
      queryClient.prefetchQuery({
        queryKey: [...queryKey, nextPageParams],
        queryFn: () => (queryFn as any)(nextPageParams),
        staleTime,
      });
    }
  }, [
    queryClient,
    queryKey,
    queryFn,
    serverParams,
    staleTime,
    enableServerSidePagination,
  ]);

  return {
    // Data
    data,
    isLoading,
    isFetching,
    isRefetching,
    error: error?.message || null,

    // Actions
    refetch,
    invalidateAndRefetch,

    // Optimistic updates
    updateOptimistic,
    addItemOptimistic,
    updateItemOptimistic,
    removeItemOptimistic,

    // Server-side operations
    serverParams,
    handleServerSidePagination,
    handleServerSideSorting,
    handleServerSideFiltering,
    prefetchNextPage,

    // Query utilities
    queryKey: queryKeyWithParams,
  };
}

export default useDataGrid;

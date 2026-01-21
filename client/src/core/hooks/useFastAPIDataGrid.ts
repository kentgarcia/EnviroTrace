import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";

export interface FastAPIListResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface FastAPIQueryParams {
  page?: number;
  size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  search?: string;
  [key: string]: any; // For custom filters
}

export interface UseFastAPIDataGridOptions<T> {
  queryKey: string[];
  fetchFn: (params: FastAPIQueryParams) => Promise<FastAPIListResponse<T>>;
  updateFn?: (id: string | number, data: Partial<T>) => Promise<T>;
  deleteFn?: (id: string | number) => Promise<void>;
  initialPageSize?: number;
  staleTime?: number;
  cacheTime?: number;
  enabled?: boolean;
}

export function useFastAPIDataGrid<T extends Record<string, any>>({
  queryKey,
  fetchFn,
  updateFn,
  deleteFn,
  initialPageSize = 10,
  staleTime = 5 * 60 * 1000, // 5 minutes
  cacheTime = 10 * 60 * 1000, // 10 minutes
  enabled = true,
}: UseFastAPIDataGridOptions<T>) {
  const queryClient = useQueryClient();

  // State for query parameters
  const [queryParams, setQueryParams] = useState<FastAPIQueryParams>({
    page: 0,
    size: initialPageSize,
  });

  // Memoized query key with parameters
  const fullQueryKey = useMemo(
    () => [...queryKey, queryParams],
    [queryKey, queryParams]
  );

  // Main data query
  const query = useQuery({
    queryKey: fullQueryKey,
    queryFn: () => fetchFn(queryParams),
    staleTime,
    gcTime: cacheTime,
    enabled,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<T> }) => {
      if (!updateFn) throw new Error("Update function not provided");
      return updateFn(id, data);
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: fullQueryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(fullQueryKey);

      // Optimistically update the cache
      queryClient.setQueryData(
        fullQueryKey,
        (old: FastAPIListResponse<T> | undefined) => {
          if (!old) return old;

          return {
            ...old,
            items: old.items.map((item: T) =>
              (item.id || item._id) === id ? { ...item, ...data } : item
            ),
          };
        }
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(fullQueryKey, context.previousData);
      }
    },
    onSettled: () => {
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: fullQueryKey });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => {
      if (!deleteFn) throw new Error("Delete function not provided");
      return deleteFn(id);
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: fullQueryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(fullQueryKey);

      // Optimistically remove from cache
      queryClient.setQueryData(
        fullQueryKey,
        (old: FastAPIListResponse<T> | undefined) => {
          if (!old) return old;

          return {
            ...old,
            items: old.items.filter((item: T) => (item.id || item._id) !== id),
            total: old.total - 1,
          };
        }
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(fullQueryKey, context.previousData);
      }
    },
    onSettled: () => {
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: fullQueryKey });
    },
  });

  // Helper functions for DataGrid integration
  const handlePageChange = useCallback((page: number, size: number) => {
    setQueryParams((prev) => ({ ...prev, page, size }));
  }, []);

  const handleSortChange = useCallback(
    (field: string, direction: "asc" | "desc" | null) => {
      setQueryParams((prev) => ({
        ...prev,
        sort_by: direction ? field : undefined,
        sort_order: direction || undefined,
        page: 0, // Reset to first page when sorting
      }));
    },
    []
  );

  const handleFilterChange = useCallback((filters: Record<string, any>) => {
    setQueryParams((prev) => ({
      ...prev,
      ...filters,
      page: 0, // Reset to first page when filtering
    }));
  }, []);

  const handleSearchChange = useCallback((search: string) => {
    setQueryParams((prev) => ({
      ...prev,
      search: search || undefined,
      page: 0, // Reset to first page when searching
    }));
  }, []);

  const handleCellEdit = useCallback(
    async (rowId: string | number, field: keyof T, value: any) => {
      if (!updateFn) {
        throw new Error("Update function not provided");
      }

      await updateMutation.mutateAsync({
        id: rowId,
        data: { [field]: value } as Partial<T>,
      });
    },
    [updateMutation, updateFn]
  );

  const handleRefresh = useCallback(() => {
    query.refetch();
  }, [query]);

  return {
    // Data
    data: query.data?.items || [],
    total: query.data?.total || 0,

    // Query state
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error?.message || null,

    // Mutations
    updateMutation,
    deleteMutation,

    // Handlers for DataGrid
    handlePageChange,
    handleSortChange,
    handleFilterChange,
    handleSearchChange,
    handleCellEdit,
    handleRefresh,

    // Current state
    currentPage: queryParams.page || 0,
    pageSize: queryParams.size || initialPageSize,

    // Raw query for advanced usage
    query,
    queryParams,
    setQueryParams,
  };
}

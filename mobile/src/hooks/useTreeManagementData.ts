import { useSmartQuery } from "./useSmartQuery";

export interface TreeManagementData {
  totalRequests: number;
  pendingRequests: number;
  completedThisMonth: number;
  totalTreesCut: number;
  totalTreesPruned: number;
  totalComplaints: number;
  lastRequestDate?: string;
  chartData?: any;
}

/**
 * Hook for fetching tree management dashboard data with smart caching.
 * 
 * Features:
 * - Instant UI with cached data from previous sessions
 * - Background refresh when data is stale (>2 min old)
 * - Automatic refresh when app comes to foreground
 * - Offline support with cached data
 * - Data persists across app restarts (up to 24 hours)
 */
export function useTreeManagementData() {
  // Fetch tree management stats
  const fetchTreeManagementStats = async (): Promise<TreeManagementData> => {
    try {
      // TODO: Replace with actual API calls when tree management endpoints are ready
      // const response = await apiClient.get('/tree-management/dashboard');
      // return response.data;
      
      // For now, using mock data that simulates real data
      return {
        totalRequests: 145,
        pendingRequests: 23,
        completedThisMonth: 18,
        totalTreesCut: 67,
        totalTreesPruned: 124,
        totalComplaints: 15,
        lastRequestDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error fetching tree management stats:", error);
      return {
        totalRequests: 0,
        pendingRequests: 0,
        completedThisMonth: 0,
        totalTreesCut: 0,
        totalTreesPruned: 0,
        totalComplaints: 0,
      };
    }
  };

  const {
    data,
    isLoading,
    error,
    refetch,
    forceRefresh,
    isFromCache,
    isStale,
  } = useSmartQuery<TreeManagementData>({
    queryKey: ["tree-management-dashboard-stats"],
    queryFn: fetchTreeManagementStats,
    staleTime: 2 * 60 * 1000, // Consider stale after 2 minutes
    cacheTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
    refetchOnAppFocus: true, // Refresh when app comes to foreground
  });

  return {
    data: data ?? {
      totalRequests: 0,
      pendingRequests: 0,
      completedThisMonth: 0,
      totalTreesCut: 0,
      totalTreesPruned: 0,
      totalComplaints: 0,
    },
    loading: isLoading,
    error,
    refetch,
    forceRefresh,
    isFromCache,
    isStale,
  };
}

import { useSmartQuery } from "./useSmartQuery";
import { urbanGreeningAPI } from "../core/api/urban-greening-api";
import { treeManagementService } from "../core/api/tree-management-service";

export interface TreeManagementDashboardData {
  // Key Stats
  feesCollectedYear: number;
  feesCollectedMonth: number;
  saplingRequestsMonth: number;
  urbanGreeningMonth: number;
  
  // Tree Management Stats
  totalRequests: number;
  pendingRequests: number;
  completedThisMonth: number;
  
  // Charts Data
  feeMonthly: Array<{ month: string; amount: number }>;
  treeRequestTypeCounts: Array<{ label: string; value: number }>;
  treeRequestStatusCounts: Array<{ label: string; value: number }>;
  ugMonthly: Array<{ month: number; label: string; total: number }>;
  saplingsMonthly: Array<{ month: number; label: string; total: number }>;
  
  // Metadata
  currentYear: number;
  currentMonth: string;
  lastUpdated?: string;
}

export interface TreeManagementDataFilters {
  year?: number;
  month?: number;
}

/**
 * Hook for fetching comprehensive tree management dashboard data with smart caching.
 * 
 * Provides all data needed for the urban greening/tree management dashboard including:
 * - Key stats (fees, saplings, urban greening counts)
 * - Monthly fee collection data
 * - Tree request analytics
 * - Recent activity for urban greening and saplings
 * 
 * @param filters - Optional filters for year and month
 */
export function useTreeManagementData(filters?: TreeManagementDataFilters) {
  const fetchDashboardData = async (): Promise<TreeManagementDashboardData> => {
    try {
      const currentYear = filters?.year ?? new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      // Fetch dashboard overview (aggregated data from backend or client-side)
      const dashboardData = await urbanGreeningAPI.getDashboardOverview({
        year: filters?.year,
        month: filters?.month,
      });
      
      // Fetch tree management stats
      const treeStats = await treeManagementService.getTreeStats();
      
      // Calculate fees for current year and month
      const feesCollectedYear = dashboardData.fee_monthly.reduce((sum, m) => sum + m.amount, 0);
      const feesCollectedMonth = dashboardData.fee_monthly.find(
        (m) => m.month === monthNames[currentMonth]
      )?.amount || 0;
      
      // Get counts for current month
      const saplingRequestsMonth = dashboardData.saplings_monthly.find(
        (m) => m.month === currentMonth + 1
      )?.total || 0;
      
      const urbanGreeningMonth = dashboardData.ug_monthly.find(
        (m) => m.month === currentMonth + 1
      )?.total || 0;
      
      return {
        // Key Stats
        feesCollectedYear,
        feesCollectedMonth,
        saplingRequestsMonth,
        urbanGreeningMonth,
        
        // Tree Management Stats
        totalRequests: treeStats.total_requests,
        pendingRequests: treeStats.on_hold + treeStats.filed,
        completedThisMonth: treeStats.for_signature + treeStats.payment_pending,
        
        // Charts Data
        feeMonthly: dashboardData.fee_monthly,
        treeRequestTypeCounts: dashboardData.tree_request_type_counts,
        treeRequestStatusCounts: dashboardData.tree_request_status_counts,
        ugMonthly: dashboardData.ug_monthly,
        saplingsMonthly: dashboardData.saplings_monthly,
        
        // Metadata
        currentYear,
        currentMonth: monthNames[currentMonth],
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error fetching tree management dashboard data:", error);
      
      // Return empty data structure on error
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      return {
        feesCollectedYear: 0,
        feesCollectedMonth: 0,
        saplingRequestsMonth: 0,
        urbanGreeningMonth: 0,
        totalRequests: 0,
        pendingRequests: 0,
        completedThisMonth: 0,
        feeMonthly: [],
        treeRequestTypeCounts: [],
        treeRequestStatusCounts: [],
        ugMonthly: [],
        saplingsMonthly: [],
        currentYear,
        currentMonth: monthNames[currentMonth],
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
  } = useSmartQuery<TreeManagementDashboardData>({
    queryKey: ["tree-management-dashboard-comprehensive", filters?.year, filters?.month],
    queryFn: fetchDashboardData,
    staleTime: 2 * 60 * 1000, // Consider stale after 2 minutes
    cacheTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
    refetchOnAppFocus: true, // Refresh when app comes to foreground
  });

  return {
    data: data ?? {
      feesCollectedYear: 0,
      feesCollectedMonth: 0,
      saplingRequestsMonth: 0,
      urbanGreeningMonth: 0,
      totalRequests: 0,
      pendingRequests: 0,
      completedThisMonth: 0,
      feeMonthly: [],
      treeRequestTypeCounts: [],
      treeRequestStatusCounts: [],
      ugMonthly: [],
      saplingsMonthly: [],
      currentYear: new Date().getFullYear(),
      currentMonth: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][new Date().getMonth()],
    },
    loading: isLoading,
    error,
    refetch,
    forceRefresh,
    isFromCache,
    isStale,
  };
}

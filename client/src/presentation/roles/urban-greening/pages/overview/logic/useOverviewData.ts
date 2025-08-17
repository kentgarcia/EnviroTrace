import { useQuery } from "@tanstack/react-query";
import {
  fetchUrbanGreeningStatistics,
  fetchSaplingStatistics,
  fetchUrbanGreeningPlantings,
  fetchSaplingCollections,
} from "@/core/api/planting-api";
import { fetchTreeManagementRequests } from "@/core/api/tree-management-api";
import { fetchUrbanGreeningDashboard } from "@/core/api/dashboard-api";

// Overview data hooks
export const useOverviewData = () => {
  // Fetch planting statistics
  const {
    data: plantingStats,
    isLoading: plantingStatsLoading,
    error: plantingStatsError,
  } = useQuery({
    queryKey: ["urban-greening-statistics"],
    queryFn: fetchUrbanGreeningStatistics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch sapling statistics
  const {
    data: saplingStats,
    isLoading: saplingStatsLoading,
    error: saplingStatsError,
  } = useQuery({
    queryKey: ["sapling-statistics"],
    queryFn: fetchSaplingStatistics,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch recent planting records
  const {
    data: recentPlantings,
    isLoading: plantingsLoading,
    error: plantingsError,
  } = useQuery({
    queryKey: ["recent-plantings"],
    queryFn: () => fetchUrbanGreeningPlantings({ limit: 10 }),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch recent sapling collections
  const {
    data: recentSaplings,
    isLoading: saplingsLoading,
    error: saplingsError,
  } = useQuery({
    queryKey: ["recent-saplings"],
    queryFn: () => fetchSaplingCollections({ limit: 10 }),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch tree management requests
  const {
    data: treeRequests,
    isLoading: treeRequestsLoading,
    error: treeRequestsError,
  } = useQuery({
    queryKey: ["tree-requests-overview"],
    queryFn: fetchTreeManagementRequests,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading =
    plantingStatsLoading ||
    saplingStatsLoading ||
    plantingsLoading ||
    saplingsLoading ||
    treeRequestsLoading;
  const hasError =
    plantingStatsError ||
    saplingStatsError ||
    plantingsError ||
    saplingsError ||
    treeRequestsError;

  // Transform data for charts
  const treeRequestCharts = transformTreeRequestData(treeRequests || []);
  const plantingCharts = transformPlantingData(plantingStats);
  const saplingCharts = transformSaplingData(saplingStats);
  const feeData = calculateFeeData(treeRequests || []);

  // Fetch aggregated dashboard data (minimal payload for dashboard)
  const { data: dashboardData } = useQuery({
    queryKey: ["ug-dashboard-aggregated"],
    queryFn: fetchUrbanGreeningDashboard,
    staleTime: 5 * 60 * 1000,
  });

  return {
    // Raw data
    urbanGreeningStatistics: plantingStats,
    saplingStatistics: saplingStats,
    treeRequests,
    plantingRecords: recentPlantings,
    saplingRecords: recentSaplings,

    // Loading states
    isUrbanGreeningLoading: plantingStatsLoading,
    isSaplingLoading: saplingStatsLoading,
    isTreeRequestsLoading: treeRequestsLoading,
    isPlantingLoading: plantingsLoading,
    isSaplingRecordsLoading: saplingsLoading,

    // Processed data for charts
    requestStatusData: treeRequestCharts.statusPie,
    requestTypeData: treeRequestCharts.typePie,
    urgencyData: treeRequestCharts.urgencyBar,
    plantingTypeData: plantingCharts.typeBreakdown,
    speciesData: plantingCharts.speciesBar,

    // Fee data
    feeData,
    dashboardData,

    // Legacy properties for backward compatibility
    plantingStats,
    saplingStats,
    recentPlantings,
    recentSaplings,
    isLoading,
    hasError,
  };
};

// Transform tree requests data for charts
export const transformTreeRequestData = (requests: any[]) => {
  if (!requests || requests.length === 0)
    return { statusPie: [], typePie: [], urgencyBar: [] };

  // Status distribution
  const statusCounts = requests.reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {});

  const statusPie = Object.entries(statusCounts).map(([status, count]) => ({
    id: status,
    label: status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    value: count as number,
  }));

  // Request type distribution
  const typeCounts = requests.reduce((acc, req) => {
    acc[req.request_type] = (acc[req.request_type] || 0) + 1;
    return acc;
  }, {});

  const typePie = Object.entries(typeCounts).map(([type, count]) => ({
    id: type,
    label: type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    value: count as number,
  }));

  // Urgency distribution
  const urgencyCounts = requests.reduce((acc, req) => {
    acc[req.urgency_level] = (acc[req.urgency_level] || 0) + 1;
    return acc;
  }, {});

  const urgencyBar = Object.entries(urgencyCounts).map(([urgency, count]) => ({
    id: urgency,
    label: urgency.replace(/\b\w/g, (l) => l.toUpperCase()),
    value: count as number,
  }));

  return { statusPie, typePie, urgencyBar };
};

// Transform planting data for charts
export const transformPlantingData = (plantingStats: any) => {
  if (!plantingStats) return { typeBreakdown: [], speciesBar: [] };

  const typeBreakdown = [
    {
      id: "ornamental_plants",
      label: "Ornamental Plants",
      value: plantingStats.total_ornamental_plants || 0,
    },
    { id: "trees", label: "Trees", value: plantingStats.total_trees || 0 },
    { id: "seeds", label: "Seeds", value: plantingStats.total_seeds || 0 },
    {
      id: "seeds_private",
      label: "Seeds (Private)",
      value: plantingStats.total_seeds_private || 0,
    },
  ];

  // Extract species data if available
  const speciesBar =
    plantingStats.species_breakdown?.map((species: any) => ({
      id: species.species_name.toLowerCase().replace(/\s+/g, "_"),
      label: species.species_name,
      value: species.total_quantity,
    })) || [];

  return { typeBreakdown, speciesBar };
};

// Transform sapling collection data
export const transformSaplingData = (saplingStats: any) => {
  if (!saplingStats)
    return { speciesBreakdown: [], statusBreakdown: [], purposeBreakdown: [] };

  const speciesBreakdown =
    saplingStats.species_breakdown?.map((species: any) => ({
      species: species.species_name,
      count: species.total_quantity,
    })) || [];

  const statusBreakdown =
    saplingStats.status_breakdown?.map((status: any) => ({
      id: status.status,
      label: status.status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      value: status.count,
    })) || [];

  const purposeBreakdown =
    saplingStats.purpose_breakdown?.map((purpose: any) => ({
      id: purpose.purpose,
      label: purpose.purpose.replace(/\b\w/g, (l) => l.toUpperCase()),
      value: purpose.count,
    })) || [];

  return { speciesBreakdown, statusBreakdown, purposeBreakdown };
};

// Calculate fee amounts from tree requests
export const calculateFeeData = (requests: any[]) => {
  if (!requests || requests.length === 0)
    return { totalFees: 0, monthlyFees: [], latePayments: [] };

  const totalFees = requests.reduce(
    (sum, req) => sum + (req.fee_amount || 0),
    0
  );

  // Calculate monthly fees (mock data for now - would need actual payment dates)
  const currentYear = new Date().getFullYear();
  const monthlyFees = [
    { month: "Jan", amount: Math.floor(totalFees * 0.08) },
    { month: "Feb", amount: Math.floor(totalFees * 0.09) },
    { month: "Mar", amount: Math.floor(totalFees * 0.07) },
    { month: "Apr", amount: Math.floor(totalFees * 0.08) },
    { month: "May", amount: Math.floor(totalFees * 0.09) },
    { month: "Jun", amount: Math.floor(totalFees * 0.08) },
    { month: "Jul", amount: Math.floor(totalFees * 0.07) },
    { month: "Aug", amount: Math.floor(totalFees * 0.09) },
    { month: "Sep", amount: Math.floor(totalFees * 0.08) },
    { month: "Oct", amount: Math.floor(totalFees * 0.08) },
    { month: "Nov", amount: Math.floor(totalFees * 0.09) },
    { month: "Dec", amount: Math.floor(totalFees * 0.08) },
  ];

  // Mock late payments data
  const latePayments = [
    { year: currentYear - 1, amount: Math.floor(totalFees * 0.05) },
    { year: currentYear - 2, amount: Math.floor(totalFees * 0.04) },
    { year: currentYear - 3, amount: Math.floor(totalFees * 0.02) },
  ];

  return { totalFees, monthlyFees, latePayments };
};

import { useQuery } from "@tanstack/react-query";
import {
  fetchUrbanGreeningStatistics,
  fetchSaplingStatistics,
  fetchUrbanGreeningPlantings,
} from "@/core/api/planting-api";
import { fetchTreeRequests } from "@/core/api/tree-management-request-api";
import { fetchUrbanGreeningDashboard } from "@/core/api/dashboard-api";
import { fetchUrbanGreeningFeeRecords } from "@/core/api/fee-api";

// Overview data hooks
export const useOverviewData = (year: number, quarter: string) => {
  // Fetch aggregated dashboard data from backend (all computations server-side)
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ug-dashboard-aggregated", year, quarter],
    queryFn: () => fetchUrbanGreeningDashboard(year, quarter),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    dashboardData,
    isLoading,
    hasError: !!error,
  };
};

// Transform tree requests data for charts
export const transformTreeRequestData = (requests: any[]) => {
  if (!requests || requests.length === 0)
    return { statusPie: [], typePie: [], urgencyBar: [] };

  // Status distribution (ISO uses overall_status, classic used status)
  const statusCounts = requests.reduce((acc, req) => {
    const status = req.overall_status || req.status || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusPie = Object.entries(statusCounts).map(([status, count]) => ({
    id: status,
    label: status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    value: count as number,
  }));

  // Request type distribution
  const typeCounts = requests.reduce((acc, req) => {
    const type = req.request_type || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typePie = Object.entries(typeCounts).map(([type, count]) => ({
    id: type,
    label: type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    value: count as number,
  }));

  // Urgency distribution (ISO schema doesn't have urgency level yet, keep distinct or empty)
  const urgencyPie: any[] = []; 

  return { statusPie, typePie, urgencyBar: urgencyPie };
};

// Transform planting data for charts
const normalizeLabel = (value?: string | null) =>
  value
    ? value.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "Unknown";

const normalizeId = (value?: string | null) =>
  value && value.trim()
    ? value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_")
    : "unknown";

export const transformPlantingData = (
  plantingStats: any,
  recentPlantings: any[] = []
) => {
  if (!plantingStats && (!recentPlantings || recentPlantings.length === 0))
    return { typeBreakdown: [], speciesBar: [] };

  const typeBreakdown: Array<{ id: string; label: string; value: number }> = [];

  if (plantingStats?.by_type && typeof plantingStats.by_type === "object") {
    Object.entries(plantingStats.by_type).forEach(([type, metrics]: [string, any]) => {
      const quantity = Number(metrics?.quantity ?? metrics?.count ?? 0) || 0;
      typeBreakdown.push({
        id: normalizeId(type),
        label: normalizeLabel(type),
        value: quantity,
      });
    });
  }

  if (typeBreakdown.length === 0 && plantingStats) {
    // Backward compatibility with legacy statistics payload
    const legacyBreakdown = [
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
    legacyBreakdown
      .filter((item) => item.value)
      .forEach((item) => typeBreakdown.push(item));
  }

  typeBreakdown.sort((a, b) => b.value - a.value);

  const speciesAccumulator: Record<string, number> = {};
  const registerSpecies = (name?: string, quantity?: number) => {
    if (!name) return;
    const safeName = name.trim();
    if (!safeName) return;
    const total = Number(quantity ?? 0) || 0;
    if (total <= 0) return;
    speciesAccumulator[safeName] = (speciesAccumulator[safeName] || 0) + total;
  };

  if (Array.isArray(plantingStats?.species_breakdown)) {
    plantingStats.species_breakdown.forEach((species: any) => {
      registerSpecies(species?.species_name, species?.total_quantity);
    });
  } else if (
    plantingStats?.by_species &&
    typeof plantingStats.by_species === "object"
  ) {
    Object.entries(plantingStats.by_species).forEach(
      ([species, metrics]: [string, any]) => {
        registerSpecies(species, metrics?.quantity ?? metrics?.count);
      }
    );
  }

  if (Object.keys(speciesAccumulator).length === 0) {
    (recentPlantings || []).forEach((planting: any) => {
      registerSpecies(planting?.species_name, planting?.quantity_planted);

      const plantsField = planting?.plants;
      if (Array.isArray(plantsField)) {
        plantsField.forEach((plant: any) =>
          registerSpecies(plant?.species_name ?? plant?.name, plant?.quantity)
        );
      } else if (typeof plantsField === "string" && plantsField.trim()) {
        try {
          const parsed = JSON.parse(plantsField);
          if (Array.isArray(parsed)) {
            parsed.forEach((plant: any) =>
              registerSpecies(
                plant?.species_name ?? plant?.name,
                plant?.quantity ?? plant?.qty
              )
            );
          }
        } catch (error) {
          // Silently ignore malformed JSON
        }
      }
    });
  }

  const speciesBar = Object.entries(speciesAccumulator)
    .map(([species, total]) => ({
      id: normalizeId(species),
      label: species,
      value: total,
    }))
    .sort((a, b) => b.value - a.value);

  return { typeBreakdown, speciesBar };
};

// Transform sapling collection data
export const transformSaplingData = (saplingStats: any) => {
  if (!saplingStats)
    return { speciesBreakdown: [], statusBreakdown: [], purposeBreakdown: [] };

  const speciesBreakdown: Array<{ id: string; label: string; value: number } & {
    count?: number;
  }> = [];

  if (saplingStats?.by_species && typeof saplingStats.by_species === "object") {
    Object.entries(saplingStats.by_species).forEach(
      ([species, metrics]: [string, any]) => {
        const quantity = Number(metrics?.quantity ?? metrics?.count ?? 0) || 0;
        const count = Number(metrics?.count ?? 0) || 0;
        speciesBreakdown.push({
          id: normalizeId(species),
          label: species || "Unknown",
          value: quantity,
          count,
        });
      }
    );
  } else if (Array.isArray(saplingStats?.species_breakdown)) {
    saplingStats.species_breakdown.forEach((species: any) => {
      speciesBreakdown.push({
        id: normalizeId(species?.species_name),
        label: species?.species_name || "Unknown",
        value: Number(species?.total_quantity ?? 0) || 0,
        count: Number(species?.count ?? 0) || 0,
      });
    });
  }

  speciesBreakdown.sort((a, b) => b.value - a.value);

  const statusBreakdown: Array<{ id: string; label: string; value: number }> = [];
  if (saplingStats?.by_status && typeof saplingStats.by_status === "object") {
    Object.entries(saplingStats.by_status).forEach(
      ([status, count]: [string, any]) => {
        statusBreakdown.push({
          id: normalizeId(status),
          label: normalizeLabel(status),
          value: Number(count ?? 0) || 0,
        });
      }
    );
  } else if (Array.isArray(saplingStats?.status_breakdown)) {
    saplingStats.status_breakdown.forEach((status: any) => {
      statusBreakdown.push({
        id: normalizeId(status?.status),
        label: normalizeLabel(status?.status),
        value: Number(status?.count ?? 0) || 0,
      });
    });
  }

  statusBreakdown.sort((a, b) => b.value - a.value);

  const purposeBreakdown: Array<{ id: string; label: string; value: number }> = [];
  if (saplingStats?.by_purpose && typeof saplingStats.by_purpose === "object") {
    Object.entries(saplingStats.by_purpose).forEach(
      ([purpose, metrics]: [string, any]) => {
        const quantity = Number(metrics?.quantity ?? metrics?.count ?? 0) || 0;
        purposeBreakdown.push({
          id: normalizeId(purpose),
          label: normalizeLabel(purpose),
          value: quantity,
        });
      }
    );
  } else if (Array.isArray(saplingStats?.purpose_breakdown)) {
    saplingStats.purpose_breakdown.forEach((purpose: any) => {
      purposeBreakdown.push({
        id: normalizeId(purpose?.purpose),
        label: normalizeLabel(purpose?.purpose),
        value: Number(purpose?.count ?? 0) || 0,
      });
    });
  }

  purposeBreakdown.sort((a, b) => b.value - a.value);

  return { speciesBreakdown, statusBreakdown, purposeBreakdown };
};

// Calculate fee amounts from actual fee records
export const calculateFeeDataFromRecords = (feeRecords: any[]) => {
  if (!feeRecords || feeRecords.length === 0)
    return { totalFees: 0, monthlyFees: [], latePayments: [] };

  const currentYear = new Date().getFullYear();

  // Calculate total fees for the current year (paid status only)
  const totalFees = feeRecords
    .filter(
      (record) =>
        record.status === "paid" &&
        new Date(record.payment_date || record.date).getFullYear() ===
          currentYear
    )
    .reduce((sum, record) => sum + Number(record.amount), 0);

  // Calculate monthly fees for current year (paid status only)
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlyFees = monthNames.map((month, index) => {
    const monthTotal = feeRecords
      .filter((record) => {
        if (record.status !== "paid") return false;
        const recordDate = new Date(record.payment_date || record.date);
        return (
          recordDate.getFullYear() === currentYear &&
          recordDate.getMonth() === index
        );
      })
      .reduce((sum, record) => sum + Number(record.amount), 0);

    return { month, amount: monthTotal };
  });

  // Mock late payments data (could be enhanced to calculate actual overdue amounts)
  const latePayments = [
    { year: currentYear - 1, amount: Math.floor(totalFees * 0.05) },
    { year: currentYear - 2, amount: Math.floor(totalFees * 0.04) },
    { year: currentYear - 3, amount: Math.floor(totalFees * 0.02) },
  ];

  return { totalFees, monthlyFees, latePayments };
};

// Legacy function - kept for backward compatibility but not used
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

/**
 * useOffices hook for office management
 * This hook provides office data from the office compliance API with proper stats calculation
 */

import { useState, useCallback, useMemo } from "react";
import {
  useOffices as useOfficesAPI,
  useOfficeCompliance,
  Office,
  OfficeData,
  useOfficeVehicleCounts,
} from "@/core/api/emission-service";

// Types that match the expected interface from the Offices page
export interface OfficeFilters {
  searchTerm?: string;
  year?: number;
  quarter?: number;
}

// Extended office interface with compliance data
export interface OfficeWithCompliance extends Office {
  total_vehicles: number;
  tested_vehicles: number;
  compliant_vehicles: number;
  non_compliant_vehicles: number;
  compliance_rate: number;
  last_test_date: string | null;
}

export interface SummaryStats {
  totalOffices: number;
  totalVehicles: number;
  totalCompliant: number;
  overallComplianceRate: number;
}

export interface UseOfficesReturn {
  officeData: OfficeWithCompliance[];
  isLoading: boolean;
  errorMessage: string | null;
  filters: OfficeFilters;
  handleFilterChange: (newFilters: Partial<OfficeFilters>) => void;
  refetch: () => void;
  summaryStats: SummaryStats;
}

export function useOffices(): UseOfficesReturn {
  // Local state for filters
  const [filters, setFilters] = useState<OfficeFilters>({
    searchTerm: "",
    year: new Date().getFullYear(), // Default to current year
    quarter: undefined,
  });

  // Fetch offices using the normalized office API
  const {
    data: officesResponse,
    isLoading: officesLoading,
    error: officesError,
    refetch: refetchOffices,
  } = useOfficesAPI(filters.searchTerm, 0, 100);

  // Fetch office compliance data with proper stats
  const {
    data: complianceResponse,
    isLoading: complianceLoading,
    error: complianceError,
    refetch: refetchCompliance,
  } = useOfficeCompliance({
    search_term: filters.searchTerm,
    year: filters.year,
    quarter: filters.quarter,
  });

  const {
    data: vehicleCountsResponse,
    isLoading: vehicleCountsLoading,
    refetch: refetchVehicleCounts,
  } = useOfficeVehicleCounts(
    { search_term: filters.searchTerm },
    0,
    100
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilters: Partial<OfficeFilters>) => {
      setFilters((prevFilters) => ({
        ...prevFilters,
        ...newFilters,
      }));
    },
    []
  );

  // Wrap the refetch function
  const refetch = useCallback(() => {
    refetchOffices();
    refetchCompliance();
    refetchVehicleCounts();
  }, [refetchOffices, refetchCompliance, refetchVehicleCounts]);

  // Combine office data with compliance data
  const officeData = useMemo<OfficeWithCompliance[]>(() => {
    if (!officesResponse?.offices || !complianceResponse?.offices) {
      return [];
    }

    // Create a map of compliance data by office name for quick lookup
    const complianceMap = new Map<string, OfficeData>();
    complianceResponse.offices.forEach((complianceOffice) => {
      complianceMap.set(complianceOffice.office_name, complianceOffice);
    });

    const vehiclesByOfficeId = new Map<string, number>();
    vehicleCountsResponse?.counts?.forEach((count) => {
      vehiclesByOfficeId.set(count.office_id, count.total_vehicles);
    });

    // Combine office information with compliance data
    return officesResponse.offices.map((office) => {
      const complianceData = complianceMap.get(office.name);
      const actualVehicleCount = vehiclesByOfficeId.get(office.id);

      if (complianceData) {
        return {
          ...office,
          total_vehicles: actualVehicleCount !== undefined ? actualVehicleCount : complianceData.total_vehicles,
          tested_vehicles: complianceData.tested_vehicles,
          compliant_vehicles: complianceData.compliant_vehicles,
          non_compliant_vehicles: complianceData.non_compliant_vehicles,
          compliance_rate: complianceData.compliance_rate,
          last_test_date: complianceData.last_test_date,
        };
      } else {
        // If no compliance data, return office with zero stats
        return {
          ...office,
          total_vehicles: actualVehicleCount !== undefined ? actualVehicleCount : 0,
          tested_vehicles: 0,
          compliant_vehicles: 0,
          non_compliant_vehicles: 0,
          compliance_rate: 0,
          last_test_date: null,
        };
      }
    });
  }, [officesResponse?.offices, complianceResponse?.offices, vehicleCountsResponse?.counts]);

  // Derive summary stats from the merged office data for accuracy
  const summaryStats: SummaryStats = useMemo(() => {
    if (officeData.length === 0) {
      return {
        totalOffices: 0,
        totalVehicles: 0,
        totalCompliant: 0,
        overallComplianceRate: 0,
      };
    }

    const totals = officeData.reduce(
      (acc, office) => {
        acc.totalOffices += 1;
        acc.totalVehicles += office.total_vehicles;
        acc.totalCompliantVehicles += office.compliant_vehicles;
        if (office.total_vehicles > 0 && office.compliance_rate >= 80) {
          acc.totalCompliantOffices += 1;
        }
        return acc;
      },
      {
        totalOffices: 0,
        totalVehicles: 0,
        totalCompliantOffices: 0,
        totalCompliantVehicles: 0,
      }
    );

    const overallComplianceRate = totals.totalVehicles
      ? Math.round((totals.totalCompliantVehicles / totals.totalVehicles) * 100)
      : 0;

    return {
      totalOffices: totals.totalOffices,
      totalVehicles: totals.totalVehicles,
      totalCompliant: totals.totalCompliantOffices,
      overallComplianceRate,
    };
  }, [officeData]);

  // Determine loading and error states
  const isLoading = officesLoading || complianceLoading || vehicleCountsLoading;
  const error = officesError || complianceError;
  const errorMessage = error ? (error as Error).message : null;

  return {
    officeData,
    isLoading,
    errorMessage,
    filters,
    handleFilterChange,
    refetch,
    summaryStats,
  };
}

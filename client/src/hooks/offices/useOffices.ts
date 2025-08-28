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
  } = useOfficesAPI(filters.searchTerm);

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
  }, [refetchOffices, refetchCompliance]);

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

    // Combine office information with compliance data
    return officesResponse.offices.map((office) => {
      const complianceData = complianceMap.get(office.name);

      if (complianceData) {
        return {
          ...office,
          total_vehicles: complianceData.total_vehicles,
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
          total_vehicles: 0,
          tested_vehicles: 0,
          compliant_vehicles: 0,
          non_compliant_vehicles: 0,
          compliance_rate: 0,
          last_test_date: null,
        };
      }
    });
  }, [officesResponse?.offices, complianceResponse?.offices]);

  // Use summary stats from the compliance API
  const summaryStats: SummaryStats = useMemo(() => {
    if (!complianceResponse?.summary) {
      return {
        totalOffices: 0,
        totalVehicles: 0,
        totalCompliant: 0,
        overallComplianceRate: 0,
      };
    }

    const summary = complianceResponse.summary;
    return {
      totalOffices: summary.total_offices,
      totalVehicles: summary.total_vehicles,
      totalCompliant: summary.total_compliant,
      overallComplianceRate: summary.overall_compliance_rate,
    };
  }, [complianceResponse?.summary]);

  // Determine loading and error states
  const isLoading = officesLoading || complianceLoading;
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

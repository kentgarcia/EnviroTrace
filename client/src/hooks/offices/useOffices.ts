/**
 * useOffices hook for office management
 * This hook provides office data from the normalized office table and calculates compliance
 */

import { useState, useCallback, useMemo } from "react";
import {
  useOffices as useOfficesAPI,
  useVehicles,
  Office,
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
    year: undefined,
    quarter: undefined,
  });

  // Fetch offices using the normalized office API
  const {
    data: officesResponse,
    isLoading: officesLoading,
    error: officesError,
    refetch: refetchOffices,
  } = useOfficesAPI(filters.searchTerm);

  // Fetch all vehicles to calculate compliance data
  const {
    data: vehiclesResponse,
    isLoading: vehiclesLoading,
    error: vehiclesError,
    refetch: refetchVehicles,
  } = useVehicles({});

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
    refetchVehicles();
  }, [refetchOffices, refetchVehicles]);

  // Calculate compliance data for each office
  const officeData = useMemo<OfficeWithCompliance[]>(() => {
    if (!officesResponse?.offices || !vehiclesResponse?.vehicles) {
      return [];
    }

    return officesResponse.offices.map((office) => {
      // Get vehicles for this office
      const officeVehicles = vehiclesResponse.vehicles.filter(
        (vehicle) => vehicle.office_id === office.id
      );

      // Calculate compliance metrics
      const totalVehicles = officeVehicles.length;
      const testedVehicles = officeVehicles.filter(
        (vehicle) => vehicle.latest_test_date !== null
      ).length;
      const compliantVehicles = officeVehicles.filter(
        (vehicle) => vehicle.latest_test_result === true
      ).length;
      const nonCompliantVehicles = testedVehicles - compliantVehicles;
      const complianceRate =
        testedVehicles > 0 ? (compliantVehicles / testedVehicles) * 100 : 0;

      // Find the most recent test date
      const testDates = officeVehicles
        .map((vehicle) => vehicle.latest_test_date)
        .filter((date): date is string => date !== null)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      const lastTestDate = testDates.length > 0 ? testDates[0] : null;

      return {
        ...office,
        total_vehicles: totalVehicles,
        tested_vehicles: testedVehicles,
        compliant_vehicles: compliantVehicles,
        non_compliant_vehicles: nonCompliantVehicles,
        compliance_rate: Math.round(complianceRate * 100) / 100,
        last_test_date: lastTestDate,
      };
    });
  }, [officesResponse?.offices, vehiclesResponse?.vehicles]);

  // Calculate summary statistics
  const summaryStats: SummaryStats = useMemo(() => {
    if (officeData.length === 0) {
      return {
        totalOffices: 0,
        totalVehicles: 0,
        totalCompliant: 0,
        overallComplianceRate: 0,
      };
    }

    const totalVehicles = officeData.reduce(
      (sum, office) => sum + office.total_vehicles,
      0
    );
    const totalCompliant = officeData.reduce(
      (sum, office) => sum + office.compliant_vehicles,
      0
    );
    const overallComplianceRate =
      totalVehicles > 0 ? (totalCompliant / totalVehicles) * 100 : 0;

    return {
      totalOffices: officeData.length,
      totalVehicles,
      totalCompliant,
      overallComplianceRate: Math.round(overallComplianceRate * 100) / 100,
    };
  }, [officeData]);

  // Determine loading and error states
  const isLoading = officesLoading || vehiclesLoading;
  const error = officesError || vehiclesError;
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

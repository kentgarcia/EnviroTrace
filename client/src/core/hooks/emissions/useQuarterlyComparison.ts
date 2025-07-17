import { useMemo } from "react";
import { useOfficeCompliance } from "@/core/api/emission-service";

export interface QuarterlyComparisonData {
  quarter: string;
  passed_vehicles: number;
  failed_vehicles: number;
  untested_vehicles: number;
  total_vehicles: number;
}

interface UseQuarterlyComparisonReturn {
  data: QuarterlyComparisonData[];
  loading: boolean;
  error: Error | null;
}

export function useQuarterlyComparison(
  selectedYear: number
): UseQuarterlyComparisonReturn {
  // Fetch data for all quarters of the selected year
  const q1Query = useOfficeCompliance({ year: selectedYear, quarter: 1 });
  const q2Query = useOfficeCompliance({ year: selectedYear, quarter: 2 });
  const q3Query = useOfficeCompliance({ year: selectedYear, quarter: 3 });
  const q4Query = useOfficeCompliance({ year: selectedYear, quarter: 4 });

  const loading =
    q1Query.isLoading ||
    q2Query.isLoading ||
    q3Query.isLoading ||
    q4Query.isLoading;
  const error =
    q1Query.error || q2Query.error || q3Query.error || q4Query.error;

  const data = useMemo(() => {
    const quarters: QuarterlyComparisonData[] = [];

    // Process each quarter's data
    const quarterData = [
      { query: q1Query, label: "Q1" },
      { query: q2Query, label: "Q2" },
      { query: q3Query, label: "Q3" },
      { query: q4Query, label: "Q4" },
    ];

    quarterData.forEach(({ query, label }) => {
      if (query.data?.summary && query.data?.offices) {
        const summary = query.data.summary;
        const offices = query.data.offices;

        // Calculate totals from office data
        const totalVehicles = summary.total_vehicles || 0;
        const passedVehicles = summary.total_compliant || 0;

        // Calculate tested vehicles by summing from offices
        const testedVehicles = offices.reduce(
          (sum, office) => sum + (office.tested_vehicles || 0),
          0
        );
        const failedVehicles = testedVehicles - passedVehicles;
        const untestedVehicles = totalVehicles - testedVehicles;

        quarters.push({
          quarter: label,
          passed_vehicles: Math.max(0, passedVehicles),
          failed_vehicles: Math.max(0, failedVehicles),
          untested_vehicles: Math.max(0, untestedVehicles),
          total_vehicles: totalVehicles,
        });
      } else {
        // Add empty data for quarters without data
        quarters.push({
          quarter: label,
          passed_vehicles: 0,
          failed_vehicles: 0,
          untested_vehicles: 0,
          total_vehicles: 0,
        });
      }
    });

    return quarters;
  }, [q1Query.data, q2Query.data, q3Query.data, q4Query.data]);

  return {
    data,
    loading,
    error: error as Error | null,
  };
}

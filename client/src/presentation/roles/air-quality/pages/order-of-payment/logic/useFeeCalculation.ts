import { useState, useEffect, useCallback } from "react";
import { fetchAirQualityFees } from "@/core/api/air-quality-api";

interface FeeData {
  id: number;
  amount: number;
  category: string;
  level: number;
  effective_date: string;
}

interface FeeCalculationResult {
  apprehension_fee: number;
  voluntary_fee: number;
  impound_fee: number;
  testing_fee: number;
  driver_penalty: number;
  operator_penalty: number;
}

export const useFeeCalculation = () => {
  const [fees, setFees] = useState<FeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load air quality fees
  const loadFees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const feeData = await fetchAirQualityFees();
      setFees(feeData);
    } catch (err) {
      console.error("Error loading fees:", err);
      setError("Failed to load fee data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFees();
  }, [loadFees]);

  // Get fee by category and level
  const getFeeByCategory = useCallback(
    (category: string, level: number = 0): number => {
      const fee = fees.find(
        (f) =>
          f.category.toLowerCase() === category.toLowerCase() &&
          f.level === level
      );
      return fee ? fee.amount : 0;
    },
    [fees]
  );

  // Calculate fees for violations based on offense levels
  const calculateViolationFees = useCallback(
    (violations: any[]): FeeCalculationResult => {
      let driverTotal = 0;
      let operatorTotal = 0;

      violations.forEach((violation) => {
        // Calculate driver penalty based on offense level
        const driverOffenseLevel = getDriverOffenseLevel(violation, violations);
        const driverPenalty = getFeeByCategory("driver", driverOffenseLevel);
        driverTotal += driverPenalty;

        // Calculate operator penalty based on offense level
        const operatorOffenseLevel = getOperatorOffenseLevel(
          violation,
          violations
        );
        const operatorPenalty = getFeeByCategory(
          "operator",
          operatorOffenseLevel
        );
        operatorTotal += operatorPenalty;
      });

      return {
        apprehension_fee: getFeeByCategory("apprehension"),
        voluntary_fee: getFeeByCategory("voluntary"),
        impound_fee: getFeeByCategory("impound"),
        testing_fee: getFeeByCategory("testing"),
        driver_penalty: driverTotal,
        operator_penalty: operatorTotal,
      };
    },
    [getFeeByCategory]
  );

  // Helper function to determine driver offense level
  const getDriverOffenseLevel = (
    currentViolation: any,
    allViolations: any[]
  ): number => {
    if (!currentViolation.driver_id) return 1;

    // Count previous violations by the same driver
    const driverViolations = allViolations
      .filter(
        (v) =>
          v.driver_id === currentViolation.driver_id &&
          v.id <= currentViolation.id
      )
      .sort(
        (a, b) =>
          new Date(a.date_of_apprehension).getTime() -
          new Date(b.date_of_apprehension).getTime()
      );

    const offenseCount =
      driverViolations.findIndex((v) => v.id === currentViolation.id) + 1;
    return Math.min(offenseCount, 3); // Cap at 3rd offense
  };

  // Helper function to determine operator offense level
  const getOperatorOffenseLevel = (
    currentViolation: any,
    allViolations: any[]
  ): number => {
    // Count violations for this operator/plate number
    const operatorViolations = allViolations
      .filter((v) => v.id <= currentViolation.id)
      .sort(
        (a, b) =>
          new Date(a.date_of_apprehension).getTime() -
          new Date(b.date_of_apprehension).getTime()
      );

    const offenseCount =
      operatorViolations.findIndex((v) => v.id === currentViolation.id) + 1;
    return Math.min(offenseCount, 3); // Cap at 3rd offense
  };

  return {
    fees,
    loading,
    error,
    getFeeByCategory,
    calculateViolationFees,
    getDriverOffenseLevel,
    getOperatorOffenseLevel,
    reload: loadFees,
  };
};

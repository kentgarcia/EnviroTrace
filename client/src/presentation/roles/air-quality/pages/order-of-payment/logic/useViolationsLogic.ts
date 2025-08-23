import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  searchAirQualityRecords,
  fetchAirQualityViolationsByRecordId,
} from "@/core/api/air-quality-api";
import { Violation } from "./types";
import { safeDateCompare, getOrdinalNumber } from "./utils";
import { PENALTY_AMOUNTS } from "./constants";

export const useViolationsLogic = () => {
  const [violations, setViolations] = useState<Violation[]>([]);

  const loadViolations = useCallback(async (plateNumber: string) => {
    try {
      // First search for the record with this plate number
      const records = await searchAirQualityRecords({ plateNumber });
      if (records.length > 0) {
        const record = records[0];
        const violationsData = await fetchAirQualityViolationsByRecordId(
          record.id
        );

        // Ensure each violation has paid_driver and paid_operator fields initialized
        const initializedViolations = violationsData.map((violation: any) => ({
          ...violation,
          paid_driver: violation.paid_driver || false,
          paid_operator: violation.paid_operator || false,
        }));

        setViolations(initializedViolations);
      }
    } catch (error) {
      console.error("Error loading violations:", error);
      toast.error("Failed to load violations");
    }
  }, []);

  const getDriverOffenseLevel = useCallback(
    (violationId: number): string => {
      const violation = violations.find((v) => v.id === violationId);
      if (!violation?.driver_id) return "1st";

      // Count previous violations by the same driver
      const driverViolations = violations
        .filter(
          (v) => v.driver_id === violation.driver_id && v.id <= violationId
        )
        .sort((a, b) =>
          safeDateCompare(a.date_of_apprehension, b.date_of_apprehension)
        );

      const index = driverViolations.findIndex((v) => v.id === violationId);
      return getOrdinalNumber(index + 1);
    },
    [violations]
  );

  const getOperatorOffenseLevel = useCallback(
    (violationId: number): string => {
      // Count violations for this operator/plate number
      const operatorViolations = violations
        .filter((v) => v.id <= violationId)
        .sort((a, b) =>
          safeDateCompare(a.date_of_apprehension, b.date_of_apprehension)
        );

      const index = operatorViolations.findIndex((v) => v.id === violationId);
      return getOrdinalNumber(index + 1);
    },
    [violations]
  );

  const getDriverPenalty = useCallback((offenseLevel: string): number => {
    return (
      PENALTY_AMOUNTS.driver[
        offenseLevel as keyof typeof PENALTY_AMOUNTS.driver
      ] || PENALTY_AMOUNTS.driver.default
    );
  }, []);

  const getOperatorPenalty = useCallback((offenseLevel: string): number => {
    return (
      PENALTY_AMOUNTS.operator[
        offenseLevel as keyof typeof PENALTY_AMOUNTS.operator
      ] || PENALTY_AMOUNTS.operator.default
    );
  }, []);

  const updateViolationPayment = useCallback(
    (
      violationId: number,
      field: "paid_driver" | "paid_operator",
      isChecked: boolean
    ) => {
      setViolations((prev) =>
        prev.map((violation) =>
          violation.id === violationId
            ? { ...violation, [field]: isChecked }
            : violation
        )
      );
    },
    []
  );

  const resetViolationsPayment = useCallback(() => {
    setViolations((prev) =>
      prev.map((violation) => ({
        ...violation,
        paid_driver: false,
        paid_operator: false,
      }))
    );
  }, []);

  const setAllViolationsPayment = useCallback(
    (field: "paid_driver" | "paid_operator", value: boolean) => {
      setViolations((prev) =>
        prev.map((violation) => ({
          ...violation,
          [field]: value,
        }))
      );
    },
    []
  );

  return {
    violations,
    setViolations,
    loadViolations,
    getDriverOffenseLevel,
    getOperatorOffenseLevel,
    getDriverPenalty,
    getOperatorPenalty,
    updateViolationPayment,
    resetViolationsPayment,
    setAllViolationsPayment,
  };
};

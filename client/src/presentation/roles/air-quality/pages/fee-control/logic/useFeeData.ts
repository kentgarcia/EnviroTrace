import { useState, useCallback, useEffect } from "react";
import {
  fetchFees,
  createFee,
  updateFee,
  deleteFee,
} from "@/core/api/api-client";

export interface Fee {
  fee_id: number;
  category: string;
  rate: number; // This will be in cents (integer) from backend, displayed as decimal
  date_effective: string;
  offense_level: number;
}

export interface FeeCreate {
  category: string;
  rate: number; // This will be converted to cents before sending to backend
  date_effective: string;
  offense_level: number;
}

export interface FeeUpdate {
  category?: string;
  rate?: number;
  date_effective?: string;
  offense_level?: number;
}

// Helper functions to convert between frontend decimal and backend integer
const convertRateToBackend = (frontendRate: number): number => {
  return Math.round(frontendRate * 100); // Convert to cents
};

const convertRateFromBackend = (backendRate: number): number => {
  return backendRate / 100; // Convert from cents to decimal
};

const transformFeeForBackend = (fee: FeeCreate | FeeUpdate): any => {
  return {
    ...fee,
    rate: fee.rate !== undefined ? convertRateToBackend(fee.rate) : undefined,
  };
};

const transformFeeFromBackend = (fee: any): Fee => {
  return {
    ...fee,
    rate: convertRateFromBackend(fee.rate),
  };
};

export const useFeeData = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFees();
      // Transform all fees from backend format
      const transformedFees = Array.isArray(data)
        ? data.map(transformFeeFromBackend)
        : [];
      setFees(transformedFees);
    } catch (err: any) {
      setError("Failed to load fees");
      setFees([]);
      console.error("Error loading fees:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewFee = useCallback(async (feeData: FeeCreate) => {
    setLoading(true);
    setError(null);
    try {
      // Transform fee data for backend
      const backendFeeData = transformFeeForBackend(feeData);
      const newFee = await createFee(backendFeeData);
      // Transform response from backend
      const transformedFee = transformFeeFromBackend(newFee);
      setFees((prev) => [...prev, transformedFee]);
      return transformedFee;
    } catch (err: any) {
      setError("Failed to create fee");
      console.error("Error creating fee:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateExistingFee = useCallback(
    async (feeId: number, feeData: FeeUpdate) => {
      setLoading(true);
      setError(null);
      try {
        // Transform update data for backend
        const backendUpdateData = transformFeeForBackend(feeData);
        const updatedFee = await updateFee(feeId, backendUpdateData);
        // Transform response from backend
        const transformedFee = transformFeeFromBackend(updatedFee);
        setFees((prev) =>
          prev.map((fee) => (fee.fee_id === feeId ? transformedFee : fee))
        );
        return transformedFee;
      } catch (err: any) {
        setError("Failed to update fee");
        console.error("Error updating fee:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const removeExistingFee = useCallback(async (feeId: number) => {
    setLoading(true);
    setError(null);
    try {
      await deleteFee(feeId);
      setFees((prev) => prev.filter((fee) => fee.fee_id !== feeId));
    } catch (err: any) {
      setError("Failed to delete fee");
      console.error("Error deleting fee:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFees();
  }, [loadFees]);

  return {
    fees,
    loading,
    error,
    loadFees,
    createFee: createNewFee,
    updateFee: updateExistingFee,
    deleteFee: removeExistingFee,
  };
};

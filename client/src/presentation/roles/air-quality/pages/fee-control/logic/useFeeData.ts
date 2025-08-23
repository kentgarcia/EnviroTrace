import { fetchFees, createFee, updateFee, deleteFee } from "@/core/api/fee-api";
import { useState, useCallback, useEffect } from "react";

export interface Fee {
  id: number;
  category: string;
  amount: number; // This will be in decimal format from backend
  effective_date: string;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface FeeCreate {
  category: string;
  amount: number;
  effective_date: string;
  level: number;
}

export interface FeeUpdate {
  category?: string;
  amount?: number;
  effective_date?: string;
  level?: number;
}

// Remove the rate conversion functions since we're using amount directly
const transformFeeForBackend = (fee: FeeCreate | FeeUpdate): any => {
  return fee;
};

const transformFeeFromBackend = (fee: any): Fee => {
  return fee;
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
    async (feeId: string, feeData: FeeUpdate) => {
      setLoading(true);
      setError(null);
      try {
        // Transform update data for backend
        const backendUpdateData = transformFeeForBackend(feeData);
        const updatedFee = await updateFee(feeId, backendUpdateData);
        // Transform response from backend
        const transformedFee = transformFeeFromBackend(updatedFee);
        setFees((prev) =>
          prev.map((fee) => (fee.id === parseInt(feeId) ? transformedFee : fee))
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

  const removeExistingFee = useCallback(async (feeId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteFee(feeId);
      setFees((prev) => prev.filter((fee) => fee.id !== parseInt(feeId)));
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

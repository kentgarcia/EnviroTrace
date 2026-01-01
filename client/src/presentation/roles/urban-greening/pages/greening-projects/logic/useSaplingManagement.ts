import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchSaplingRequests,
  createSaplingRequest,
  updateSaplingRequest,
  deleteSaplingRequest,
  SaplingRequest,
  SaplingRequestCreate,
  SaplingRequestUpdate,
} from "@/core/api/sapling-requests-api";
import {
  useUrbanGreeningPlantings as useUGPlantings,
  useUrbanGreeningStatistics as useUGStats,
} from "./usePlantingRecords";

export const SAPLING_MGMT_KEYS = {
  saplingRequests: (year?: number) => ["sapling-requests", year] as const,
};

export const useSaplingRequests = (year?: number) => {
  const { data = [], refetch } = useQuery({
    queryKey: SAPLING_MGMT_KEYS.saplingRequests(year),
    queryFn: () => fetchSaplingRequests(year),
    staleTime: 5 * 60 * 1000,
  });
  
  return {
    saplingRequests: data as SaplingRequest[],
    refetchSaplingRequests: refetch,
  };
};

export const useSaplingRequestMutations = () => {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["sapling-requests"] });

  const createSapling = useMutation({
    mutationFn: (data: SaplingRequestCreate) => createSaplingRequest(data),
    onSuccess: () => {
      invalidate();
      toast.success("Sapling request created");
    },
    onError: (e: any) =>
      toast.error(
        e?.response?.data?.detail || "Failed to create sapling request"
      ),
  });

  const updateSapling = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SaplingRequestUpdate }) =>
      updateSaplingRequest(id, data),
    onSuccess: () => {
      invalidate();
      toast.success("Sapling request updated");
    },
    onError: (e: any) =>
      toast.error(
        e?.response?.data?.detail || "Failed to update sapling request"
      ),
  });

  const deleteSapling = useMutation({
    mutationFn: (id: string) => deleteSaplingRequest(id),
    onSuccess: () => {
      invalidate();
      toast.success("Sapling request deleted");
    },
    onError: (e: any) =>
      toast.error(
        e?.response?.data?.detail || "Failed to delete sapling request"
      ),
  });

  return { createSapling, updateSapling, deleteSapling };
};

export const useUrbanGreeningPlantings = useUGPlantings;
export const useUrbanGreeningStatistics = useUGStats;

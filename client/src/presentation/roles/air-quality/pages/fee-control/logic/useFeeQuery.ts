import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFees, createFee, updateFee, deleteFee } from "@/core/api/fee-api";
import { Fee, FeeCreate, FeeUpdate } from "./useFeeData";

export function useFeeQuery() {
  return useQuery<Fee[]>({
    queryKey: ["fees"],
    queryFn: fetchFees,
  });
}

export function useCreateFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
    },
  });
}

export function useUpdateFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fee_id, data }: { fee_id: string; data: FeeUpdate }) =>
      updateFee(fee_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
    },
  });
}

export function useDeleteFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fee_id: string) => deleteFee(fee_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
    },
  });
}

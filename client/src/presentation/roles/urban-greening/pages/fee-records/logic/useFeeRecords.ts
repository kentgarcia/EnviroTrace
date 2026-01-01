import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchUrbanGreeningFeeRecords,
  updateUrbanGreeningFeeRecord,
  createUrbanGreeningFeeRecord,
  deleteUrbanGreeningFeeRecord,
  UrbanGreeningFeeRecord,
  UrbanGreeningFeeRecordUpdate,
  UrbanGreeningFeeRecordCreate,
} from "@/core/api/fee-api";

export interface FeeRecord {
  id: string;
  reference_number: string;
  type: "cutting_permit" | "pruning_permit" | "violation_fine";
  amount: number;
  payer_name: string;
  date: string;
  due_date: string;
  status: "paid" | "pending" | "overdue" | "cancelled";
  or_number?: string;
  payment_date?: string;
  created_at: string;
  updated_at?: string;
}

export const transformApiRecord = (
  record: UrbanGreeningFeeRecord
): FeeRecord => ({
  id: record.id,
  reference_number: record.reference_number,
  type: record.type,
  amount: Number(record.amount), // Ensure amount is a number
  payer_name: record.payer_name,
  date: record.date,
  due_date: record.due_date,
  status: record.status,
  or_number: record.or_number,
  payment_date: record.payment_date,
  created_at: record.created_at,
  updated_at: record.updated_at,
});

export const useFeeRecordMutations = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      field,
      value,
    }: {
      id: string;
      field: keyof FeeRecord;
      value: any;
    }) => {
      const updateData: UrbanGreeningFeeRecordUpdate = {
        [field]: value,
      };
      return updateUrbanGreeningFeeRecord(id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-records"] });
      toast.success("Fee record updated successfully");
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast.error("Failed to update fee record");
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: UrbanGreeningFeeRecordCreate) =>
      createUrbanGreeningFeeRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-records"] });
      toast.success("Fee record created successfully");
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast.error("Failed to create fee record");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUrbanGreeningFeeRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-records"] });
      toast.success("Fee record deleted successfully");
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast.error("Failed to delete fee record");
    },
  });

  const fullUpdateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UrbanGreeningFeeRecordUpdate;
    }) => updateUrbanGreeningFeeRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-records"] });
      toast.success("Fee record updated successfully");
    },
    onError: (error) => {
      console.error("Full update error:", error);
      toast.error("Failed to update fee record");
    },
  });

  return {
    updateMutation,
    createMutation,
    deleteMutation,
    fullUpdateMutation,
  };
};

export const fetchFeeRecords = async (year?: number): Promise<FeeRecord[]> => {
  const records = await fetchUrbanGreeningFeeRecords(year);
  return records.map(transformApiRecord);
};

export const getStatusCounts = (records: FeeRecord[]) => {
  return records.reduce(
    (acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    },
    { paid: 0, pending: 0, overdue: 0, cancelled: 0 }
  );
};

export const getTotalAmount = (records: FeeRecord[]) => {
  return records.reduce((total, record) => {
    const amount = Number(record.amount) || 0;
    return total + amount;
  }, 0);
};

export const getPaidAmount = (records: FeeRecord[]) => {
  return records
    .filter((record) => record.status === "paid")
    .reduce((total, record) => {
      const amount = Number(record.amount) || 0;
      return total + amount;
    }, 0);
};

export const filterRecords = (
  records: FeeRecord[],
  searchTerm: string,
  statusFilter: string,
  typeFilter: string
) => {
  return records.filter((record) => {
    const matchesSearch =
      !searchTerm ||
      record.reference_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      record.payer_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;
    const matchesType = typeFilter === "all" || record.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });
};

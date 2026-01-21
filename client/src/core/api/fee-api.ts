import apiClient from "./api-client";

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

export interface UrbanGreeningFeeRecord {
  id: string;
  reference_number: string;
  type: "cutting_permit" | "pruning_permit" | "violation_fine";
  amount: number;
  payer_name: string;
  date: string;
  status: "paid" | "pending" | "overdue" | "cancelled";
  or_number?: string;
  payment_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface UrbanGreeningFeeRecordCreate {
  reference_number?: string;
  type: "cutting_permit" | "pruning_permit" | "violation_fine";
  amount: number;
  payer_name: string;
  date: string;
  status: "paid" | "pending" | "overdue" | "cancelled";
  or_number?: string;
  payment_date?: string;
}

export interface UrbanGreeningFeeRecordUpdate {
  reference_number?: string;
  type?: "cutting_permit" | "pruning_permit" | "violation_fine";
  amount?: number;
  payer_name?: string;
  date?: string;
  status?: "paid" | "pending" | "cancelled";
  or_number?: string;
  payment_date?: string;
}

// Urban Greening Fee Record API functions
export const fetchUrbanGreeningFeeRecords = async (year?: number): Promise<
  UrbanGreeningFeeRecord[]
> => {
  const params = year ? { year } : {};
  const res = await apiClient.get("/fees/urban-greening", { params });
  return res.data;
};

export const createUrbanGreeningFeeRecord = async (
  record: UrbanGreeningFeeRecordCreate
): Promise<UrbanGreeningFeeRecord> => {
  const res = await apiClient.post("/fees/urban-greening", record);
  return res.data;
};

export const updateUrbanGreeningFeeRecord = async (
  id: string,
  record: UrbanGreeningFeeRecordUpdate
): Promise<UrbanGreeningFeeRecord> => {
  const res = await apiClient.put(`/fees/urban-greening/${id}`, record);
  return res.data;
};

export const deleteUrbanGreeningFeeRecord = async (id: string) => {
  const res = await apiClient.delete(`/fees/urban-greening/${id}`);
  return res.data;
};

export const fetchUrbanGreeningFeeRecordByReference = async (
  referenceNumber: string
): Promise<UrbanGreeningFeeRecord> => {
  const res = await apiClient.get(
    `/fees/urban-greening/reference/${referenceNumber}`
  );
  return res.data;
};

export const fetchUrbanGreeningFeeRecordsByType = async (
  type: string
): Promise<UrbanGreeningFeeRecord[]> => {
  const res = await apiClient.get(`/fees/urban-greening/type/${type}`);
  return res.data;
};

export const fetchUrbanGreeningFeeRecordsByStatus = async (
  status: string
): Promise<UrbanGreeningFeeRecord[]> => {
  const res = await apiClient.get(`/fees/urban-greening/status/${status}`);
  return res.data;
};

export const fetchUrbanGreeningFeeRecordsByPayer = async (
  payerName: string
): Promise<UrbanGreeningFeeRecord[]> => {
  const res = await apiClient.get(`/fees/urban-greening/payer/${payerName}`);
  return res.data;
};

export const fetchOverdueUrbanGreeningFeeRecords = async (): Promise<
  UrbanGreeningFeeRecord[]
> => {
  const res = await apiClient.get("/fees/urban-greening/overdue");
  return res.data;
};

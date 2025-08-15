import apiClient from "./api-client";

export interface FeeCreate {
  category: string;
  rate: number;
  date_effective: string;
  level: number;
}

export interface FeeUpdate {
  category?: string;
  rate?: number;
  date_effective?: string;
  level?: number;
}

export interface UrbanGreeningFeeRecord {
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

export interface UrbanGreeningFeeRecordCreate {
  reference_number?: string;
  type: "cutting_permit" | "pruning_permit" | "violation_fine";
  amount: number;
  payer_name: string;
  date: string;
  due_date: string;
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
  due_date?: string;
  status?: "paid" | "pending" | "overdue" | "cancelled";
  or_number?: string;
  payment_date?: string;
}

// Air Quality Fee API functions
export const fetchFees = async () => {
  const res = await apiClient.get("/fees");
  return res.data;
};

export const createFee = async (fee: FeeCreate) => {
  const res = await apiClient.post("/fees", fee);
  return res.data;
};

export const updateFee = async (fee_id: string, fee: FeeUpdate) => {
  const res = await apiClient.put(`/fees/${fee_id}`, fee);
  return res.data;
};

export const deleteFee = async (fee_id: string) => {
  const res = await apiClient.delete(`/fees/${fee_id}`);
  return res.data;
};

// Urban Greening Fee Record API functions
export const fetchUrbanGreeningFeeRecords = async (): Promise<
  UrbanGreeningFeeRecord[]
> => {
  const res = await apiClient.get("/fees/urban-greening");
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

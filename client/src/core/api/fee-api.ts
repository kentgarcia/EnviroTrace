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

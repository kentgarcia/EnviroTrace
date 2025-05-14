export interface BelchingFee {
  id: number;
  amount: number;
  category: string;
  level: number;
  effectiveDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BelchingFeeInput {
  amount: number;
  category: string;
  level: number;
  effectiveDate: string;
}

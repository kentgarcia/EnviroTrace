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

export interface BelchingRecord {
  id: number;
  plateNumber: string;
  vehicleType: string;
  operator: string;
  operatorAddress: string;
  recordAddress: string;
  recordStatus: "new" | "apprehended" | "no offense";
  licenseValidUntil: string;
  offenseLevel: number;
  lastDateApprehended: string;
  orderOfPayment: string;
  violationSummary: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BelchingRecordInput {
  plateNumber: string;
  vehicleType: string;
  operator: string;
  operatorAddress: string;
  recordAddress: string;
  recordStatus: "new" | "apprehended" | "no offense";
  licenseValidUntil: string;
  offenseLevel: number;
  lastDateApprehended: string;
  orderOfPayment: string;
  violationSummary: string;
}

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

export interface BelchingRecordHistory {
  id: number;
  recordId: number;
  type: string;
  date: string;
  details: string;
  orNo: string;
  status: string;
}

export interface BelchingRecordHistoryInput {
  recordId: number;
  type: string;
  date: string;
  details: string;
  orNo: string;
  status: string;
}

export interface BelchingViolation {
  id: number;
  recordId: number;
  operatorOffense: string;
  dateOfApprehension: string;
  place: string;
  driverName: string;
  driverOffense: string;
  paid: boolean;
}

export interface BelchingViolationInput {
  recordId: number;
  operatorOffense: string;
  dateOfApprehension: string;
  place: string;
  driverName: string;
  driverOffense: string;
  paid: boolean;
}

export interface OrderOfPayment {
  id: number;
  orderNo: string;
  plateNo: string;
  operator: string;
  amount: number;
  dateIssued: string; // YYYY-MM-DD
  status: string;
  testingOfficer: string;
  testResults: string;
  dateOfTesting: string;
  apprehensionFee: number;
  voluntaryFee: number;
  impoundFee: number;
  driverAmount: number;
  operatorAmount: number;
}

export interface OrderOfPaymentInput {
  orderNo: string;
  plateNo: string;
  operator: string;
  amount: number;
  dateIssued: string; // YYYY-MM-DD
  status: string;
  testingOfficer: string;
  testResults: string;
  dateOfTesting: string;
  apprehensionFee: number;
  voluntaryFee: number;
  impoundFee: number;
  driverAmount: number;
  operatorAmount: number;
}

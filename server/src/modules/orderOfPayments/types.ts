export interface OrderOfPayment {
  id: number;
  orderNo: string;
  plateNo: string;
  operator: string;
  amount: number;
  dateIssued: string; // YYYY-MM-DD
  status: string;
}

export interface OrderOfPaymentInput {
  orderNo: string;
  plateNo: string;
  operator: string;
  amount: number;
  dateIssued: string; // YYYY-MM-DD
  status: string;
}

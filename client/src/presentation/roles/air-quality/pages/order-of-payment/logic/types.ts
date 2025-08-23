export interface OrderOfPayment {
  id: string;
  oop_control_number?: string;
  control_number: string;
  plate_number: string;
  operator_name: string;
  driver_name?: string;
  status: string;
  selected_violations: string[] | string;
  grand_total_amount: number;
  created_at: string;
  updated_at: string;
  // Fee properties
  apprehension_fee?: number;
  voluntary_fee?: number;
  impound_fee?: number;
  testing_fee?: number;
  driver_amount?: number;
  operator_fee?: number;
  // Testing information
  testing_officer?: string;
  test_results?: string;
  date_of_testing?: string;
  date_of_payment?: string;
  total_undisclosed_amount?: number;
}

export interface PaymentChecklistItem {
  checked: boolean;
  amount: number;
}

export interface PaymentChecklist {
  apprehension_fee: PaymentChecklistItem;
  voluntary_fee: PaymentChecklistItem;
  impound_fee: PaymentChecklistItem;
  testing_fee: PaymentChecklistItem;
  driver_amount: PaymentChecklistItem;
  operator_fee: PaymentChecklistItem;
}

export interface TestingInfo {
  testing_officer: string;
  test_results: string;
  date_of_testing: string;
}

export interface PaymentDetails {
  payment_or_number: string;
  payment_date: string;
  total_amount: number;
  discount: number;
  grand_total_amount: number;
}

export interface PaymentTotals {
  total_undisclosed_amount: number;
  grand_total_amount: number;
}

export interface Violation {
  id: number;
  date_of_apprehension: string;
  driver_id?: string;
  driver_offense?: string;
  driver_penalty?: number;
  operator_offense?: string;
  operator_penalty?: number;
  paid_driver?: boolean;
  paid_operator?: boolean;
}

export interface OrderOfPaymentDetailsComponentProps {
  selectedOrder: OrderOfPayment | null;
  newOrderData?: any;
  onCreateOrder: (orderData: any) => void;
  onUpdateOrder: (orderId: string, orderData: Partial<OrderOfPayment>) => void;
  onDeleteOrder: (orderId: string) => void;
  showAsFullPage?: boolean;
}

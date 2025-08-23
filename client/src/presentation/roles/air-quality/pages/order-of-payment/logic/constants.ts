// Status configurations
export const STATUS_CONFIG = {
  draft: { label: "Draft", variant: "secondary" as const },
  pending: { label: "Pending", variant: "default" as const },
  paid: { label: "Paid", variant: "green" as const },
  cancelled: { label: "Cancelled", variant: "destructive" as const },
} as const;

// Penalty amounts
export const PENALTY_AMOUNTS = {
  driver: {
    "1st": 500,
    "2nd": 1000,
    "3rd": 2000,
    default: 5000,
  },
  operator: {
    "1st": 1000,
    "2nd": 2000,
    "3rd": 5000,
    default: 10000,
  },
} as const;

// Default payment checklist structure
export const DEFAULT_PAYMENT_CHECKLIST = {
  apprehension_fee: { checked: false, amount: 0 },
  voluntary_fee: { checked: false, amount: 0 },
  impound_fee: { checked: false, amount: 0 },
  testing_fee: { checked: false, amount: 0 },
  driver_amount: { checked: false, amount: 0 },
  operator_fee: { checked: false, amount: 0 },
};

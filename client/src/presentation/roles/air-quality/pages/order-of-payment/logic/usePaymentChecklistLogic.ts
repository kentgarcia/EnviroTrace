import { useState, useCallback, useEffect } from "react";
import { PaymentChecklist, PaymentTotals, Violation } from "./types";
import { DEFAULT_PAYMENT_CHECKLIST } from "./constants";

export const usePaymentChecklistLogic = (violations: Violation[]) => {
  const [paymentChecklist, setPaymentChecklist] = useState<PaymentChecklist>(
    DEFAULT_PAYMENT_CHECKLIST
  );
  const [totals, setTotals] = useState<PaymentTotals>({
    total_undisclosed_amount: 0,
    grand_total_amount: 0,
  });

  // Auto-calculate totals when payment checklist changes
  useEffect(() => {
    let total = 0;

    Object.entries(paymentChecklist).forEach(([key, value]) => {
      if (value.checked) {
        total += Number(value.amount) || 0;
      }
    });

    setTotals({
      total_undisclosed_amount: total,
      grand_total_amount: total,
    });
  }, [paymentChecklist]);

  const handlePaymentChecklistChange = useCallback(
    (
      type: keyof PaymentChecklist,
      field: "checked" | "amount",
      value: boolean | number
    ) => {
      setPaymentChecklist((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          [field]: value,
        },
      }));
    },
    []
  );

  const updateDriverAmount = useCallback(
    (paidDriverViolations: Violation[]) => {
      const totalDriverPenalty = paidDriverViolations.length * 500; // Fixed 500 per violation
      const hasAnyDriverPayment = paidDriverViolations.length > 0;

      setPaymentChecklist((prev) => ({
        ...prev,
        driver_amount: {
          checked: hasAnyDriverPayment,
          amount: hasAnyDriverPayment ? totalDriverPenalty : 0,
        },
      }));
    },
    []
  );

  const updateOperatorAmount = useCallback(
    (paidOperatorViolations: Violation[]) => {
      const totalOperatorPenalty = paidOperatorViolations.length * 1000; // Fixed 1000 per violation
      const hasAnyOperatorPayment = paidOperatorViolations.length > 0;

      setPaymentChecklist((prev) => ({
        ...prev,
        operator_fee: {
          checked: hasAnyOperatorPayment,
          amount: hasAnyOperatorPayment ? totalOperatorPenalty : 0,
        },
      }));
    },
    []
  );

  const resetPaymentChecklist = useCallback(() => {
    setPaymentChecklist(DEFAULT_PAYMENT_CHECKLIST);
  }, []);

  const initializeFromOrder = useCallback((order: any) => {
    setPaymentChecklist({
      apprehension_fee: {
        checked: !!order.apprehension_fee,
        amount: Number(order.apprehension_fee) || 0,
      },
      voluntary_fee: {
        checked: !!order.voluntary_fee,
        amount: Number(order.voluntary_fee) || 0,
      },
      impound_fee: {
        checked: !!order.impound_fee,
        amount: Number(order.impound_fee) || 0,
      },
      testing_fee: { checked: false, amount: 0 },
      driver_amount: {
        checked: !!order.driver_amount,
        amount: Number(order.driver_amount) || 0,
      },
      operator_fee: {
        checked: !!order.operator_fee,
        amount: Number(order.operator_fee) || 0,
      },
    });
  }, []);

  const updateFromFeeControl = useCallback((baseFees: any) => {
    setPaymentChecklist((prev) => ({
      apprehension_fee: {
        checked: prev.apprehension_fee.checked,
        amount: Number(baseFees.apprehension_fee) || 0,
      },
      voluntary_fee: {
        checked: prev.voluntary_fee.checked,
        amount: Number(baseFees.voluntary_fee) || 0,
      },
      impound_fee: {
        checked: prev.impound_fee.checked,
        amount: Number(baseFees.impound_fee) || 0,
      },
      testing_fee: {
        checked: false,
        amount: 0,
      },
      // Preserve driver_amount and operator_fee as they are manually managed
      driver_amount: prev.driver_amount,
      operator_fee: prev.operator_fee,
    }));
  }, []);

  return {
    paymentChecklist,
    totals,
    setTotals,
    handlePaymentChecklistChange,
    updateDriverAmount,
    updateOperatorAmount,
    resetPaymentChecklist,
    initializeFromOrder,
    updateFromFeeControl,
  };
};

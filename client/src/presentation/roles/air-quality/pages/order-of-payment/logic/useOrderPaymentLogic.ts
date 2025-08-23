import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { OrderOfPayment, TestingInfo, PaymentDetails } from "./types";
import { useViolationsLogic } from "./useViolationsLogic";
import { usePaymentChecklistLogic } from "./usePaymentChecklistLogic";
import { useFeeCalculation } from "./useFeeCalculation";

export const useOrderPaymentLogic = (
  selectedOrder: OrderOfPayment | null,
  newOrderData: any,
  onCreateOrder: (orderData: any) => void,
  onUpdateOrder: (orderId: string, orderData: Partial<OrderOfPayment>) => void
) => {
  const [selectedViolations, setSelectedViolations] = useState<string[]>([]);
  const [testingInfo, setTestingInfo] = useState<TestingInfo>({
    testing_officer: "",
    test_results: "",
    date_of_testing: "",
  });
  const [dateOfPayment, setDateOfPayment] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    payment_or_number: "",
    payment_date: new Date().toISOString().split("T")[0],
    total_amount: 0,
    discount: 0,
    grand_total_amount: 0,
  });

  // Initialize violation logic
  const violationsLogic = useViolationsLogic();

  // Initialize payment checklist logic
  const paymentLogic = usePaymentChecklistLogic(violationsLogic.violations);

  // Initialize fee calculation system
  const feeCalculation = useFeeCalculation();

  // Calculate fees based on violations and fee control data
  const calculateFeesFromControl = useCallback(() => {
    if (!feeCalculation.fees.length || !violationsLogic.violations.length)
      return;

    // Get base fees from fee control
    const baseFees = {
      apprehension_fee: feeCalculation.getFeeByCategory("apprehension"),
      voluntary_fee: feeCalculation.getFeeByCategory("voluntary"),
      impound_fee: feeCalculation.getFeeByCategory("impound"),
    };

    // Update payment checklist with calculated amounts
    paymentLogic.updateFromFeeControl(baseFees);
  }, [
    feeCalculation.fees,
    violationsLogic.violations,
    feeCalculation.getFeeByCategory,
    paymentLogic.updateFromFeeControl,
  ]);

  // Recalculate fees when violations or fee data changes
  useEffect(() => {
    if (!feeCalculation.loading && feeCalculation.fees.length > 0) {
      calculateFeesFromControl();
    }
  }, [
    violationsLogic.violations,
    feeCalculation.fees,
    feeCalculation.loading,
    calculateFeesFromControl,
  ]);

  // Initialize data when order is selected or new order data is provided
  useEffect(() => {
    if (selectedOrder) {
      setSelectedViolations(
        Array.isArray(selectedOrder.selected_violations)
          ? selectedOrder.selected_violations
          : selectedOrder.selected_violations?.split(",") || []
      );

      paymentLogic.initializeFromOrder(selectedOrder);

      setTestingInfo({
        testing_officer: selectedOrder.testing_officer || "",
        test_results: selectedOrder.test_results || "",
        date_of_testing: selectedOrder.date_of_testing || "",
      });

      setDateOfPayment(
        selectedOrder.date_of_payment || new Date().toISOString().split("T")[0]
      );

      paymentLogic.setTotals({
        total_undisclosed_amount: selectedOrder.total_undisclosed_amount || 0,
        grand_total_amount: selectedOrder.grand_total_amount,
      });

      violationsLogic.loadViolations(selectedOrder.plate_number);
    } else if (newOrderData) {
      // Initialize with new order data
      const initializedViolations = (newOrderData.violations || []).map(
        (violation: any) => ({
          ...violation,
          paid_driver: violation.paid_driver || false,
          paid_operator: violation.paid_operator || false,
        })
      );

      violationsLogic.setViolations(initializedViolations);
      setSelectedViolations(
        newOrderData.violations?.map((v: any) => v.id) || []
      );
      paymentLogic.resetPaymentChecklist();

      setTestingInfo({
        testing_officer: "",
        test_results: "",
        date_of_testing: "",
      });

      setDateOfPayment(new Date().toISOString().split("T")[0]);
    } else {
      resetForm();
    }
  }, [selectedOrder, newOrderData]);

  const resetForm = useCallback(() => {
    violationsLogic.setViolations([]);
    setSelectedViolations([]);
    paymentLogic.resetPaymentChecklist();
    setTestingInfo({
      testing_officer: "",
      test_results: "",
      date_of_testing: "",
    });
    setDateOfPayment(new Date().toISOString().split("T")[0]);
    paymentLogic.setTotals({
      total_undisclosed_amount: 0,
      grand_total_amount: 0,
    });
  }, [violationsLogic, paymentLogic]);

  const handleViolationPaymentChange = useCallback(
    (
      violationId: number,
      field: "paid_driver" | "paid_operator",
      isChecked: boolean
    ) => {
      // Update the violation in the local state first
      violationsLogic.updateViolationPayment(violationId, field, isChecked);

      // Get updated violations after the change
      const updatedViolations = violationsLogic.violations.map((violation) =>
        violation.id === violationId
          ? { ...violation, [field]: isChecked }
          : violation
      );

      // Calculate amounts based on updated violations
      if (field === "paid_driver") {
        const paidDriverViolations = updatedViolations.filter(
          (v) => v.paid_driver
        );
        paymentLogic.updateDriverAmount(paidDriverViolations);
      } else if (field === "paid_operator") {
        const paidOperatorViolations = updatedViolations.filter(
          (v) => v.paid_operator
        );
        paymentLogic.updateOperatorAmount(paidOperatorViolations);
      }
    },
    [violationsLogic, paymentLogic]
  );

  const handlePaymentChecklistChange = useCallback(
    (
      type: keyof typeof paymentLogic.paymentChecklist,
      field: "checked" | "amount",
      value: boolean | number
    ) => {
      paymentLogic.handlePaymentChecklistChange(type, field, value);

      // Handle driver amount checkbox changes
      if (type === "driver_amount" && field === "checked") {
        if (value === true) {
          violationsLogic.setAllViolationsPayment("paid_driver", true);
          const totalDriverPenalty =
            violationsLogic.violations.length *
            violationsLogic.getDriverPenalty("1st");
          paymentLogic.handlePaymentChecklistChange(
            "driver_amount",
            "amount",
            totalDriverPenalty
          );
        } else {
          violationsLogic.setAllViolationsPayment("paid_driver", false);
          paymentLogic.handlePaymentChecklistChange(
            "driver_amount",
            "amount",
            0
          );
        }
      }

      // Handle operator fee checkbox changes
      if (type === "operator_fee" && field === "checked") {
        if (value === true) {
          violationsLogic.setAllViolationsPayment("paid_operator", true);
          const totalOperatorPenalty =
            violationsLogic.violations.length *
            violationsLogic.getOperatorPenalty("1st");
          paymentLogic.handlePaymentChecklistChange(
            "operator_fee",
            "amount",
            totalOperatorPenalty
          );
        } else {
          violationsLogic.setAllViolationsPayment("paid_operator", false);
          paymentLogic.handlePaymentChecklistChange(
            "operator_fee",
            "amount",
            0
          );
        }
      }

      // If checking a fee item, recalculate if needed
      if (
        field === "checked" &&
        value === true &&
        (type === "apprehension_fee" ||
          type === "voluntary_fee" ||
          type === "impound_fee")
      ) {
        calculateFeesFromControl();
      }
    },
    [paymentLogic, violationsLogic, calculateFeesFromControl]
  );

  const handleSaveOrder = useCallback(() => {
    // For new orders (when we have newOrderData but no selectedOrder.id)
    if (newOrderData && (!selectedOrder || !selectedOrder.id)) {
      const newOrderPayload = {
        plate_number: newOrderData.vehicle.plate_number,
        operator_name: newOrderData.vehicle.operator_name,
        driver_name: newOrderData.driver?.name || "",
        status: "pending",
        ...testingInfo,
        selected_violations: selectedViolations,
        apprehension_fee: paymentLogic.paymentChecklist.apprehension_fee.checked
          ? paymentLogic.paymentChecklist.apprehension_fee.amount
          : 0,
        voluntary_fee: paymentLogic.paymentChecklist.voluntary_fee.checked
          ? paymentLogic.paymentChecklist.voluntary_fee.amount
          : 0,
        impound_fee: paymentLogic.paymentChecklist.impound_fee.checked
          ? paymentLogic.paymentChecklist.impound_fee.amount
          : 0,
        driver_amount: paymentLogic.paymentChecklist.driver_amount.checked
          ? paymentLogic.paymentChecklist.driver_amount.amount
          : 0,
        operator_fee: paymentLogic.paymentChecklist.operator_fee.checked
          ? paymentLogic.paymentChecklist.operator_fee.amount
          : 0,
        total_undisclosed_amount: paymentLogic.totals.total_undisclosed_amount,
        grand_total_amount: paymentLogic.totals.grand_total_amount,
        payment_or_number: paymentDetails.payment_or_number,
        date_of_payment: paymentDetails.payment_date || dateOfPayment,
      };

      onCreateOrder(newOrderPayload);
      toast.success(`Order of payment saved successfully!`);
      return;
    }

    // For existing orders
    if (!selectedOrder) return;

    const updateData: Partial<OrderOfPayment> = {
      ...testingInfo,
      selected_violations: selectedViolations,
      apprehension_fee: paymentLogic.paymentChecklist.apprehension_fee.checked
        ? paymentLogic.paymentChecklist.apprehension_fee.amount
        : 0,
      voluntary_fee: paymentLogic.paymentChecklist.voluntary_fee.checked
        ? paymentLogic.paymentChecklist.voluntary_fee.amount
        : 0,
      impound_fee: paymentLogic.paymentChecklist.impound_fee.checked
        ? paymentLogic.paymentChecklist.impound_fee.amount
        : 0,
      driver_amount: paymentLogic.paymentChecklist.driver_amount.checked
        ? paymentLogic.paymentChecklist.driver_amount.amount
        : 0,
      operator_fee: paymentLogic.paymentChecklist.operator_fee.checked
        ? paymentLogic.paymentChecklist.operator_fee.amount
        : 0,
      total_undisclosed_amount: paymentLogic.totals.total_undisclosed_amount,
      grand_total_amount: paymentLogic.totals.grand_total_amount,
      date_of_payment: dateOfPayment,
    };

    onUpdateOrder(selectedOrder.id, updateData);
    toast.success("Order of payment updated successfully");
  }, [
    newOrderData,
    selectedOrder,
    testingInfo,
    selectedViolations,
    paymentLogic,
    paymentDetails,
    dateOfPayment,
    onCreateOrder,
    onUpdateOrder,
  ]);

  const handleCancelOrder = useCallback(() => {
    // For new orders, just go back to search without creating
    if (newOrderData && (!selectedOrder || !selectedOrder.id)) {
      toast.info("New order creation cancelled");
      return;
    }

    // For existing orders, mark as cancelled
    if (!selectedOrder) return;

    const updateData: Partial<OrderOfPayment> = {
      status: "cancelled",
    };

    onUpdateOrder(selectedOrder.id, updateData);
    toast.success("Order of payment cancelled");
  }, [newOrderData, selectedOrder, onUpdateOrder]);

  return {
    // State
    selectedViolations,
    testingInfo,
    dateOfPayment,
    paymentDetails,

    // Setters
    setTestingInfo,
    setDateOfPayment,
    setPaymentDetails,

    // Violation logic
    ...violationsLogic,

    // Payment logic
    ...paymentLogic,

    // Fee calculation
    ...feeCalculation,

    // Handlers
    handleViolationPaymentChange,
    handlePaymentChecklistChange,
    handleSaveOrder,
    handleCancelOrder,
    calculateFeesFromControl,
    resetForm,
  };
};

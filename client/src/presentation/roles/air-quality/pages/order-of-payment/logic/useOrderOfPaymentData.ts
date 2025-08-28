import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  searchAirQualityOrdersOfPayment,
  createAirQualityOrderOfPayment,
  updateAirQualityOrderOfPayment,
  deleteAirQualityOrderOfPayment,
  AirQualityOrderOfPayment,
} from "@/core/api/air-quality-api";
import { OrderOfPayment } from "./types";
import { toast } from "sonner";

// API functions using air quality endpoints
const searchOrdersOfPayment = async (
  params: any
): Promise<OrderOfPayment[]> => {
  const results = await searchAirQualityOrdersOfPayment({
    search: params.search,
    control_number: params.control_number,
    plate_number: params.plate_number,
    status: params.status,
    created_date: params.created_date,
    limit: params.limit || 50,
    offset: params.offset || 0,
  });

  // Map to match the interface
  return results.map((order) => ({
    id: order.id,
    oop_control_number: order.oop_control_number,
    control_number: order.oop_control_number, // For backward compatibility
    plate_number: order.plate_number,
    operator_name: order.operator_name,
    driver_name: order.driver_name,
    status: order.status,
    selected_violations: order.selected_violations,
    grand_total_amount: order.grand_total_amount,
    created_at: order.created_at,
    updated_at: order.updated_at,
    testing_officer: order.testing_officer,
    test_results: order.test_results,
    date_of_testing: order.date_of_testing,
    apprehension_fee: order.apprehension_fee,
    voluntary_fee: order.voluntary_fee,
    impound_fee: order.impound_fee,
    driver_amount: order.driver_amount,
    operator_fee: order.operator_fee,
    total_undisclosed_amount: order.total_undisclosed_amount,
    payment_or_number: order.payment_or_number,
    date_of_payment: order.date_of_payment,
  }));
};

const createOrderOfPayment = async (data: any): Promise<OrderOfPayment> => {
  const result = await createAirQualityOrderOfPayment({
    plate_number: data.plate_number,
    operator_name: data.operator_name,
    driver_name: data.driver_name,
    selected_violations: Array.isArray(data.selected_violations)
      ? data.selected_violations.join(",")
      : data.selected_violations,
    testing_officer: data.testing_officer,
    test_results: data.test_results,
    date_of_testing: data.date_of_testing,
    apprehension_fee: data.apprehension_fee || 0,
    voluntary_fee: data.voluntary_fee || 0,
    impound_fee: data.impound_fee || 0,
    driver_amount: data.driver_amount || 0,
    operator_fee: data.operator_fee || 0,
    total_undisclosed_amount: data.total_undisclosed_amount,
    grand_total_amount: data.grand_total_amount,
    payment_or_number: data.payment_or_number,
    date_of_payment:
      data.date_of_payment || new Date().toISOString().split("T")[0],
    status: data.status || "pending",
  });

  return {
    id: result.id,
    oop_control_number: result.oop_control_number,
    control_number: result.oop_control_number,
    plate_number: result.plate_number,
    operator_name: result.operator_name,
    driver_name: result.driver_name,
    status: result.status,
    selected_violations: result.selected_violations,
    grand_total_amount: result.grand_total_amount,
    created_at: result.created_at,
    updated_at: result.updated_at,
  };
};

const updateOrderOfPayment = async (
  id: string,
  data: any
): Promise<OrderOfPayment> => {
  const result = await updateAirQualityOrderOfPayment(id, data);
  return {
    id: result.id,
    oop_control_number: result.oop_control_number,
    control_number: result.oop_control_number,
    plate_number: result.plate_number,
    operator_name: result.operator_name,
    driver_name: result.driver_name,
    status: result.status,
    selected_violations: result.selected_violations,
    grand_total_amount: result.grand_total_amount,
    created_at: result.created_at,
    updated_at: result.updated_at,
  };
};

const deleteOrderOfPayment = async (id: string): Promise<void> => {
  await deleteAirQualityOrderOfPayment(id);
};

export interface OrderOfPaymentSearchParams {
  search?: string;
  control_number?: string;
  plate_number?: string;
  status?: string;
  created_date?: string;
  limit?: number;
  offset?: number;
}

export interface OrderOfPaymentFormData {
  plate_number: string;
  operator_name: string;
  driver_name?: string;
  selected_violations: string[];
  testing_officer?: string;
  test_results?: string;
  date_of_testing?: string;
  apprehension_fee?: number;
  voluntary_fee?: number;
  impound_fee?: number;
  driver_amount?: number;
  operator_fee?: number;
  total_undisclosed_amount?: number;
  grand_total_amount?: number;
  payment_or_number?: string;
  date_of_payment?: string;
}

export const useOrderOfPaymentData = () => {
  const [searchParams, setSearchParams] = useState<OrderOfPaymentSearchParams>(
    { limit: 1000 } // Default to loading all orders with high limit
  );
  const [selectedOrder, setSelectedOrder] = useState<OrderOfPayment | null>(
    null
  );

  const queryClient = useQueryClient();

  // Fetch orders
  const {
    data: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["order-of-payment-search", searchParams],
    queryFn: () => searchOrdersOfPayment(searchParams),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Search function
  const handleSearch = useCallback((params: OrderOfPaymentSearchParams) => {
    setSearchParams(params);
    setSelectedOrder(null);
  }, []);

  // Select order
  const handleSelectOrder = useCallback((order: OrderOfPayment) => {
    setSelectedOrder(order);
  }, []);

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: createOrderOfPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-of-payment-search"] });
    },
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: ({
      orderId,
      orderData,
    }: {
      orderId: string;
      orderData: Partial<OrderOfPayment>;
    }) => updateOrderOfPayment(orderId, orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-of-payment-search"] });
    },
  });

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: deleteOrderOfPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-of-payment-search"] });
      setSelectedOrder(null);
    },
  });

  // Order actions
  const handleCreateOrder = useCallback(
    (orderData: OrderOfPaymentFormData) => {
      console.log("Creating order with data:", orderData);

      try {
        const totalAmount =
          (orderData.apprehension_fee || 0) +
          (orderData.voluntary_fee || 0) +
          (orderData.impound_fee || 0) +
          (orderData.driver_amount || 0) +
          (orderData.operator_fee || 0);

        console.log("Total amount calculated:", totalAmount);

        // Ensure all numeric values are properly converted
        const numericFields = {
          apprehension_fee: parseFloat(String(orderData.apprehension_fee || 0)),
          voluntary_fee: parseFloat(String(orderData.voluntary_fee || 0)),
          impound_fee: parseFloat(String(orderData.impound_fee || 0)),
          driver_amount: parseFloat(String(orderData.driver_amount || 0)),
          operator_fee: parseFloat(String(orderData.operator_fee || 0)),
          total_undisclosed_amount: parseFloat(String(totalAmount)),
          grand_total_amount: parseFloat(String(totalAmount)),
        };

        // Ensure dates are in proper format
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

        // Simplified payload with required fields only
        const createPayload = {
          plate_number: orderData.plate_number || "DEMO-001",
          operator_name: orderData.operator_name || "Demo Operator",
          driver_name: orderData.driver_name || "Demo Driver",
          selected_violations: Array.isArray(orderData.selected_violations)
            ? orderData.selected_violations.join(",")
            : orderData.selected_violations || "1,2", // Ensure it's a string
          testing_officer: orderData.testing_officer || "Officer Demo",
          test_results: orderData.test_results || "Pass",
          date_of_testing: orderData.date_of_testing || today,
          ...numericFields,
          payment_or_number: orderData.payment_or_number || `PAY-${Date.now()}`,
          date_of_payment: orderData.date_of_payment || today,
          status: "pending",
        };
        console.log("Sending payload:", createPayload);

        createOrderMutation.mutate(createPayload, {
          onSuccess: (createdOrder) => {
            console.log("Order created successfully:", createdOrder);
            toast.success("Order saved successfully!");
            // Navigate back to the order list instead of individual order page
            window.location.href = `/air-quality/order-of-payment`;
          },
          onError: (error) => {
            console.error("Create order error:", error);
            // Show actual error instead of fake demo success
            toast.error(
              `Failed to save order: ${error.message || "Unknown error"}`
            );
            // Don't navigate away on error so user can try again
          },
        });
      } catch (error) {
        console.error("Error in handleCreateOrder:", error);
        toast.error(
          `Error saving order: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        // Don't navigate away on error so user can try again
      }
    },
    [createOrderMutation]
  );

  const handleUpdateOrder = useCallback(
    (orderId: string, orderData: Partial<OrderOfPayment>) => {
      console.log("Updating order:", orderId, orderData);

      try {
        updateOrderMutation.mutate(
          { orderId, orderData },
          {
            onSuccess: (updatedOrder) => {
              console.log("Order updated successfully:", updatedOrder);
              toast.success("Order updated successfully!");
            },
            onError: (error) => {
              console.error("Update order error:", error);
              toast.error(
                `Failed to update order: ${error.message || "Unknown error"}`
              );
            },
          }
        );
      } catch (error) {
        console.error("Error in handleUpdateOrder:", error);
        toast.error(
          `Error updating order: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
    [updateOrderMutation]
  );

  const handleDeleteOrder = useCallback(
    (orderId: string) => {
      deleteOrderMutation.mutate(orderId);
    },
    [deleteOrderMutation]
  );

  return {
    // Data
    searchResults: searchResults || [],
    selectedOrder,

    // Loading states
    isSearchLoading,
    isCreatingOrder: createOrderMutation.isPending,
    isUpdatingOrder: updateOrderMutation.isPending,
    isDeletingOrder: deleteOrderMutation.isPending,

    // Error states
    searchError,

    // Actions
    handleSearch,
    handleSelectOrder,
    handleCreateOrder,
    handleUpdateOrder,
    handleDeleteOrder,
    refetchOrders,
  };
};

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  searchOrdersOfPayment,
  createOrderOfPayment,
  updateOrderOfPayment,
  deleteOrderOfPayment,
  OrderOfPayment,
} from "@/core/api/belching-api";

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
}

export const useOrderOfPaymentData = () => {
  const [searchParams, setSearchParams] = useState<OrderOfPaymentSearchParams>(
    {}
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
      createOrderMutation.mutate({
        plate_number: orderData.plate_number,
        operator_name: orderData.operator_name,
        driver_name: orderData.driver_name,
        selected_violations: orderData.selected_violations,
      });
    },
    [createOrderMutation]
  );

  const handleUpdateOrder = useCallback(
    (orderId: string, orderData: Partial<OrderOfPayment>) => {
      updateOrderMutation.mutate({ orderId, orderData });
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

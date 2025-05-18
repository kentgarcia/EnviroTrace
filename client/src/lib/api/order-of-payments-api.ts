import { gql } from "@apollo/client";
import { apolloClient } from "../apollo/apollo-client";

// GraphQL Queries & Mutations
export const GET_ORDER_OF_PAYMENTS = gql`
  query OrderOfPayments {
    orderOfPayments {
      id
      orderNo
      plateNo
      operator
      amount
      dateIssued
      status
    }
  }
`;

export const GET_ORDER_OF_PAYMENT = gql`
  query OrderOfPayment($id: ID!) {
    orderOfPayment(id: $id) {
      id
      orderNo
      plateNo
      operator
      amount
      dateIssued
      status
    }
  }
`;

export const CREATE_ORDER_OF_PAYMENT = gql`
  mutation CreateOrderOfPayment($input: OrderOfPaymentInput!) {
    createOrderOfPayment(input: $input) {
      id
      orderNo
      plateNo
      operator
      amount
      dateIssued
      status
    }
  }
`;

export const UPDATE_ORDER_OF_PAYMENT = gql`
  mutation UpdateOrderOfPayment($id: ID!, $input: OrderOfPaymentInput!) {
    updateOrderOfPayment(id: $id, input: $input) {
      id
      orderNo
      plateNo
      operator
      amount
      dateIssued
      status
    }
  }
`;

export const DELETE_ORDER_OF_PAYMENT = gql`
  mutation DeleteOrderOfPayment($id: ID!) {
    deleteOrderOfPayment(id: $id)
  }
`;

// API Helper Functions
export async function fetchOrderOfPayments() {
  try {
    const { data } = await apolloClient.query({
      query: GET_ORDER_OF_PAYMENTS,
      fetchPolicy: "network-only",
    });
    return data.orderOfPayments;
  } catch (error) {
    console.error("Error fetching order of payments:", error);
    throw error;
  }
}

export async function fetchOrderOfPaymentById(id) {
  try {
    const { data } = await apolloClient.query({
      query: GET_ORDER_OF_PAYMENT,
      variables: { id },
      fetchPolicy: "network-only",
    });
    return data.orderOfPayment;
  } catch (error) {
    console.error("Error fetching order of payment:", error);
    throw error;
  }
}

export async function createOrderOfPayment(input) {
  try {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_ORDER_OF_PAYMENT,
      variables: { input },
      refetchQueries: [{ query: GET_ORDER_OF_PAYMENTS }],
    });
    return data.createOrderOfPayment;
  } catch (error) {
    console.error("Error creating order of payment:", error);
    throw error;
  }
}

export async function updateOrderOfPayment(id, input) {
  try {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_ORDER_OF_PAYMENT,
      variables: { id, input },
      refetchQueries: [{ query: GET_ORDER_OF_PAYMENTS }],
    });
    return data.updateOrderOfPayment;
  } catch (error) {
    console.error("Error updating order of payment:", error);
    throw error;
  }
}

export async function deleteOrderOfPayment(id) {
  try {
    const { data } = await apolloClient.mutate({
      mutation: DELETE_ORDER_OF_PAYMENT,
      variables: { id },
      refetchQueries: [{ query: GET_ORDER_OF_PAYMENTS }],
    });
    return data.deleteOrderOfPayment;
  } catch (error) {
    console.error("Error deleting order of payment:", error);
    throw error;
  }
}

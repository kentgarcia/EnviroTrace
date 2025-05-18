import { gql } from "@apollo/client";
import { apolloClient } from "../apollo/apollo-client";

// GraphQL Queries & Mutations
export const GET_BELCHING_FEES = gql`
  query BelchingFees {
    belchingFees {
      id
      amount
      category
      level
      effectiveDate
      createdAt
      updatedAt
    }
  }
`;

export const GET_BELCHING_FEE = gql`
  query BelchingFee($id: ID!) {
    belchingFee(id: $id) {
      id
      amount
      category
      level
      effectiveDate
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_BELCHING_FEE = gql`
  mutation CreateBelchingFee($input: BelchingFeeInput!) {
    createBelchingFee(input: $input) {
      id
      amount
      category
      level
      effectiveDate
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_BELCHING_FEE = gql`
  mutation UpdateBelchingFee($id: ID!, $input: BelchingFeeInput!) {
    updateBelchingFee(id: $id, input: $input) {
      id
      amount
      category
      level
      effectiveDate
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_BELCHING_FEE = gql`
  mutation DeleteBelchingFee($id: ID!) {
    deleteBelchingFee(id: $id)
  }
`;

// API Helper Functions
export async function fetchBelchingFees() {
  try {
    const { data } = await apolloClient.query({
      query: GET_BELCHING_FEES,
      fetchPolicy: "network-only",
    });
    return data.belchingFees;
  } catch (error) {
    console.error("Error fetching belching fees:", error);
    throw error;
  }
}

export async function fetchBelchingFeeById(id) {
  try {
    const { data } = await apolloClient.query({
      query: GET_BELCHING_FEE,
      variables: { id },
      fetchPolicy: "network-only",
    });
    return data.belchingFee;
  } catch (error) {
    console.error("Error fetching belching fee:", error);
    throw error;
  }
}

export async function createBelchingFee(input) {
  try {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_BELCHING_FEE,
      variables: { input },
      refetchQueries: [{ query: GET_BELCHING_FEES }],
    });
    return data.createBelchingFee;
  } catch (error) {
    console.error("Error creating belching fee:", error);
    throw error;
  }
}

export async function updateBelchingFee(id, input) {
  try {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_BELCHING_FEE,
      variables: { id, input },
      refetchQueries: [{ query: GET_BELCHING_FEES }],
    });
    return data.updateBelchingFee;
  } catch (error) {
    console.error("Error updating belching fee:", error);
    throw error;
  }
}

export async function deleteBelchingFee(id) {
  try {
    const { data } = await apolloClient.mutate({
      mutation: DELETE_BELCHING_FEE,
      variables: { id },
      refetchQueries: [{ query: GET_BELCHING_FEES }],
    });
    return data.deleteBelchingFee;
  } catch (error) {
    console.error("Error deleting belching fee:", error);
    throw error;
  }
}

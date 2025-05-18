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

// Belching Record GraphQL
export const GET_BELCHING_RECORDS = gql`
  query BelchingRecords {
    belchingRecords {
      id
      plateNumber
      vehicleType
      operator
      operatorAddress
      recordAddress
      recordStatus
      licenseValidUntil
      offenseLevel
      lastDateApprehended
      orderOfPayment
      violationSummary
      createdAt
      updatedAt
    }
  }
`;

export const GET_BELCHING_RECORD = gql`
  query BelchingRecord($id: ID!) {
    belchingRecord(id: $id) {
      id
      plateNumber
      vehicleType
      operator
      operatorAddress
      recordAddress
      recordStatus
      licenseValidUntil
      offenseLevel
      lastDateApprehended
      orderOfPayment
      violationSummary
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_BELCHING_RECORD = gql`
  mutation CreateBelchingRecord($input: BelchingRecordInput!) {
    createBelchingRecord(input: $input) {
      id
      plateNumber
      vehicleType
      operator
      operatorAddress
      recordAddress
      recordStatus
      licenseValidUntil
      offenseLevel
      lastDateApprehended
      orderOfPayment
      violationSummary
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_BELCHING_RECORD = gql`
  mutation UpdateBelchingRecord($id: ID!, $input: BelchingRecordInput!) {
    updateBelchingRecord(id: $id, input: $input) {
      id
      plateNumber
      vehicleType
      operator
      operatorAddress
      recordAddress
      recordStatus
      licenseValidUntil
      offenseLevel
      lastDateApprehended
      orderOfPayment
      violationSummary
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_BELCHING_RECORD = gql`
  mutation DeleteBelchingRecord($id: ID!) {
    deleteBelchingRecord(id: $id)
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

export async function fetchBelchingRecords() {
  try {
    const { data } = await apolloClient.query({
      query: GET_BELCHING_RECORDS,
      fetchPolicy: "network-only",
    });
    return data.belchingRecords;
  } catch (error) {
    console.error("Error fetching belching records:", error);
    throw error;
  }
}

export async function fetchBelchingRecordById(id) {
  try {
    const { data } = await apolloClient.query({
      query: GET_BELCHING_RECORD,
      variables: { id },
      fetchPolicy: "network-only",
    });
    return data.belchingRecord;
  } catch (error) {
    console.error("Error fetching belching record:", error);
    throw error;
  }
}

export async function createBelchingRecord(input) {
  try {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_BELCHING_RECORD,
      variables: { input },
      refetchQueries: [{ query: GET_BELCHING_RECORDS }],
    });
    return data.createBelchingRecord;
  } catch (error) {
    console.error("Error creating belching record:", error);
    throw error;
  }
}

export async function updateBelchingRecord(id, input) {
  try {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_BELCHING_RECORD,
      variables: { id, input },
      refetchQueries: [{ query: GET_BELCHING_RECORDS }],
    });
    return data.updateBelchingRecord;
  } catch (error) {
    console.error("Error updating belching record:", error);
    throw error;
  }
}

export async function deleteBelchingRecord(id) {
  try {
    const { data } = await apolloClient.mutate({
      mutation: DELETE_BELCHING_RECORD,
      variables: { id },
      refetchQueries: [{ query: GET_BELCHING_RECORDS }],
    });
    return data.deleteBelchingRecord;
  } catch (error) {
    console.error("Error deleting belching record:", error);
    throw error;
  }
}

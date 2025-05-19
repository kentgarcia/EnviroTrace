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

// --- Belching Record History ---
export const GET_BELCHING_RECORD_HISTORIES = gql`
  query BelchingRecordHistories($recordId: Int) {
    belchingRecordHistories(recordId: $recordId) {
      id
      recordId
      type
      date
      details
      orNo
      status
    }
  }
`;

export const GET_BELCHING_RECORD_HISTORY = gql`
  query BelchingRecordHistory($id: ID!) {
    belchingRecordHistory(id: $id) {
      id
      recordId
      type
      date
      details
      orNo
      status
    }
  }
`;

export const CREATE_BELCHING_RECORD_HISTORY = gql`
  mutation CreateBelchingRecordHistory($input: BelchingRecordHistoryInput!) {
    createBelchingRecordHistory(input: $input) {
      id
      recordId
      type
      date
      details
      orNo
      status
    }
  }
`;

export const UPDATE_BELCHING_RECORD_HISTORY = gql`
  mutation UpdateBelchingRecordHistory(
    $id: ID!
    $input: BelchingRecordHistoryInput!
  ) {
    updateBelchingRecordHistory(id: $id, input: $input) {
      id
      recordId
      type
      date
      details
      orNo
      status
    }
  }
`;

export const DELETE_BELCHING_RECORD_HISTORY = gql`
  mutation DeleteBelchingRecordHistory($id: ID!) {
    deleteBelchingRecordHistory(id: $id)
  }
`;

// --- Belching Violations ---
export const GET_BELCHING_VIOLATIONS = gql`
  query BelchingViolations($recordId: Int) {
    belchingViolations(recordId: $recordId) {
      id
      recordId
      operatorOffense
      dateOfApprehension
      place
      driverName
      driverOffense
      paid
    }
  }
`;

export const GET_BELCHING_VIOLATION = gql`
  query BelchingViolation($id: ID!) {
    belchingViolation(id: $id) {
      id
      recordId
      operatorOffense
      dateOfApprehension
      place
      driverName
      driverOffense
      paid
    }
  }
`;

export const CREATE_BELCHING_VIOLATION = gql`
  mutation CreateBelchingViolation($input: BelchingViolationInput!) {
    createBelchingViolation(input: $input) {
      id
      recordId
      operatorOffense
      dateOfApprehension
      place
      driverName
      driverOffense
      paid
    }
  }
`;

export const UPDATE_BELCHING_VIOLATION = gql`
  mutation UpdateBelchingViolation($id: ID!, $input: BelchingViolationInput!) {
    updateBelchingViolation(id: $id, input: $input) {
      id
      recordId
      operatorOffense
      dateOfApprehension
      place
      driverName
      driverOffense
      paid
    }
  }
`;

export const DELETE_BELCHING_VIOLATION = gql`
  mutation DeleteBelchingViolation($id: ID!) {
    deleteBelchingViolation(id: $id)
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

export async function fetchBelchingRecordHistories(recordId) {
  try {
    const { data } = await apolloClient.query({
      query: GET_BELCHING_RECORD_HISTORIES,
      variables: { recordId },
      fetchPolicy: "network-only",
    });
    return data.belchingRecordHistories;
  } catch (error) {
    console.error("Error fetching belching record histories:", error);
    throw error;
  }
}

export async function fetchBelchingRecordHistoryById(id) {
  try {
    const { data } = await apolloClient.query({
      query: GET_BELCHING_RECORD_HISTORY,
      variables: { id },
      fetchPolicy: "network-only",
    });
    return data.belchingRecordHistory;
  } catch (error) {
    console.error("Error fetching belching record history:", error);
    throw error;
  }
}

export async function createBelchingRecordHistory(input) {
  try {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_BELCHING_RECORD_HISTORY,
      variables: { input },
      refetchQueries: [
        {
          query: GET_BELCHING_RECORD_HISTORIES,
          variables: { recordId: input.recordId },
        },
      ],
    });
    return data.createBelchingRecordHistory;
  } catch (error) {
    console.error("Error creating belching record history:", error);
    throw error;
  }
}

export async function updateBelchingRecordHistory(id, input) {
  try {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_BELCHING_RECORD_HISTORY,
      variables: { id, input },
      refetchQueries: [
        {
          query: GET_BELCHING_RECORD_HISTORIES,
          variables: { recordId: input.recordId },
        },
      ],
    });
    return data.updateBelchingRecordHistory;
  } catch (error) {
    console.error("Error updating belching record history:", error);
    throw error;
  }
}

export async function deleteBelchingRecordHistory(id, recordId) {
  try {
    const { data } = await apolloClient.mutate({
      mutation: DELETE_BELCHING_RECORD_HISTORY,
      variables: { id },
      refetchQueries: [
        { query: GET_BELCHING_RECORD_HISTORIES, variables: { recordId } },
      ],
    });
    return data.deleteBelchingRecordHistory;
  } catch (error) {
    console.error("Error deleting belching record history:", error);
    throw error;
  }
}

export async function fetchBelchingViolations(recordId) {
  try {
    const { data } = await apolloClient.query({
      query: GET_BELCHING_VIOLATIONS,
      variables: { recordId },
      fetchPolicy: "network-only",
    });
    return data.belchingViolations;
  } catch (error) {
    console.error("Error fetching belching violations:", error);
    throw error;
  }
}

export async function fetchBelchingViolationById(id) {
  try {
    const { data } = await apolloClient.query({
      query: GET_BELCHING_VIOLATION,
      variables: { id },
      fetchPolicy: "network-only",
    });
    return data.belchingViolation;
  } catch (error) {
    console.error("Error fetching belching violation:", error);
    throw error;
  }
}

export async function createBelchingViolation(input) {
  try {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_BELCHING_VIOLATION,
      variables: { input },
      refetchQueries: [
        {
          query: GET_BELCHING_VIOLATIONS,
          variables: { recordId: input.recordId },
        },
      ],
    });
    return data.createBelchingViolation;
  } catch (error) {
    console.error("Error creating belching violation:", error);
    throw error;
  }
}

export async function updateBelchingViolation(id, input) {
  try {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_BELCHING_VIOLATION,
      variables: { id, input },
      refetchQueries: [
        {
          query: GET_BELCHING_VIOLATIONS,
          variables: { recordId: input.recordId },
        },
      ],
    });
    return data.updateBelchingViolation;
  } catch (error) {
    console.error("Error updating belching violation:", error);
    throw error;
  }
}

export async function deleteBelchingViolation(id, recordId) {
  try {
    const { data } = await apolloClient.mutate({
      mutation: DELETE_BELCHING_VIOLATION,
      variables: { id },
      refetchQueries: [
        { query: GET_BELCHING_VIOLATIONS, variables: { recordId } },
      ],
    });
    return data.deleteBelchingViolation;
  } catch (error) {
    console.error("Error deleting belching violation:", error);
    throw error;
  }
}

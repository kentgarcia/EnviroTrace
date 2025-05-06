import { gql } from "@apollo/client";
import { apolloClient } from "./apollo-client";

// Query to fetch vehicle summaries
export const GET_VEHICLE_SUMMARIES = gql`
  query VehicleSummaries($filters: VehicleFilters) {
    vehicleSummaries(filters: $filters) {
      id
      driverName
      contactNumber
      engineType
      officeName
      plateNumber
      vehicleType
      wheels
      latestTestDate
      latestTestQuarter
      latestTestYear
      latestTestResult
    }
  }
`;

// Query to fetch a specific vehicle summary
export const GET_VEHICLE_SUMMARY = gql`
  query VehicleSummary($id: ID!) {
    vehicleSummary(id: $id) {
      id
      driverName
      contactNumber
      engineType
      officeName
      plateNumber
      vehicleType
      wheels
      latestTestDate
      latestTestQuarter
      latestTestYear
      latestTestResult
    }
  }
`;

// Query to fetch emission tests with filtering
export const GET_EMISSION_TESTS = gql`
  query EmissionTests($filters: EmissionTestFilters) {
    emissionTests(filters: $filters) {
      id
      vehicleId
      testDate
      quarter
      year
      result
      createdAt
      updatedAt
      vehicle {
        id
        plateNumber
        driverName
        officeName
      }
    }
  }
`;

// Query to fetch test schedules
export const GET_TEST_SCHEDULES = gql`
  query EmissionTestSchedules($year: Int!, $quarter: Int) {
    emissionTestSchedules(year: $year, quarter: $quarter) {
      id
      assignedPersonnel
      conductedOn
      location
      quarter
      year
      createdAt
      updatedAt
    }
  }
`;

// Query to fetch a specific emission test
export const GET_EMISSION_TEST = gql`
  query EmissionTest($id: ID!) {
    emissionTest(id: $id) {
      id
      vehicleId
      testDate
      quarter
      year
      result
      createdAt
      updatedAt
      vehicle {
        id
        plateNumber
        driverName
        officeName
      }
    }
  }
`;

// Create a new emission test
export const CREATE_EMISSION_TEST = gql`
  mutation CreateEmissionTest($input: EmissionTestInput!) {
    createEmissionTest(input: $input) {
      id
      vehicleId
      testDate
      quarter
      year
      result
    }
  }
`;

// Update an existing emission test
export const UPDATE_EMISSION_TEST = gql`
  mutation UpdateEmissionTest($id: ID!, $input: EmissionTestInput!) {
    updateEmissionTest(id: $id, input: $input) {
      id
      vehicleId
      testDate
      quarter
      year
      result
    }
  }
`;

// Create a new test schedule
export const CREATE_TEST_SCHEDULE = gql`
  mutation CreateTestSchedule($input: EmissionTestScheduleInput!) {
    createEmissionTestSchedule(input: $input) {
      id
      assignedPersonnel
      conductedOn
      location
      quarter
      year
    }
  }
`;

// Update an existing test schedule
export const UPDATE_TEST_SCHEDULE = gql`
  mutation UpdateTestSchedule($id: ID!, $input: EmissionTestScheduleInput!) {
    updateEmissionTestSchedule(id: $id, input: $input) {
      id
      assignedPersonnel
      conductedOn
      location
      quarter
      year
    }
  }
`;

// Delete a test schedule
export const DELETE_TEST_SCHEDULE = gql`
  mutation DeleteTestSchedule($id: ID!) {
    deleteEmissionTestSchedule(id: $id)
  }
`;

// Delete an emission test
export const DELETE_EMISSION_TEST = gql`
  mutation DeleteEmissionTest($id: ID!) {
    deleteEmissionTest(id: $id)
  }
`;

// Query to fetch office compliance data
export const GET_OFFICE_COMPLIANCE = gql`
  query OfficeCompliance($year: Int!, $quarter: Int!, $searchTerm: String) {
    officeCompliance(year: $year, quarter: $quarter, searchTerm: $searchTerm) {
      id
      name
      code
      vehicleCount
      testedCount
      passedCount
      complianceRate
    }
  }
`;

// Helper function to fetch vehicle summaries
export async function fetchVehicleSummaries(filters = {}) {
  try {
    const { data } = await apolloClient.query({
      query: GET_VEHICLE_SUMMARIES,
      variables: { filters },
      fetchPolicy: "network-only",
    });
    return data.vehicleSummaries;
  } catch (error) {
    console.error("Error fetching vehicle summaries:", error);
    throw error;
  }
}

// Helper function to fetch emission tests
export async function fetchEmissionTests(filters = {}) {
  try {
    const { data } = await apolloClient.query({
      query: GET_EMISSION_TESTS,
      variables: { filters },
      fetchPolicy: "network-only",
    });
    return data.emissionTests;
  } catch (error) {
    console.error("Error fetching emission tests:", error);
    throw error;
  }
}

// Helper function to fetch test schedules
export async function fetchTestSchedules(
  year: number,
  quarter: number | undefined = undefined
) {
  try {
    const { data } = await apolloClient.query({
      query: GET_TEST_SCHEDULES,
      variables: { year, quarter }, // Pass quarter directly (can be number or undefined)
      fetchPolicy: "network-only",
    });
    return data.emissionTestSchedules;
  } catch (error) {
    console.error("Error fetching test schedules:", error);
    throw error;
  }
}

// Helper function to create a new emission test
export async function createEmissionTest(input) {
  try {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_EMISSION_TEST,
      variables: { input },
      refetchQueries: [
        {
          query: GET_EMISSION_TESTS,
          variables: { filters: { year: input.year, quarter: input.quarter } },
        },
      ],
    });
    return data.createEmissionTest;
  } catch (error) {
    console.error("Error creating emission test:", error);
    throw error;
  }
}

// Helper function to create a new test schedule
export async function createTestSchedule(input) {
  try {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_TEST_SCHEDULE,
      variables: { input },
      refetchQueries: [
        {
          query: GET_TEST_SCHEDULES,
          variables: { year: input.year, quarter: input.quarter },
        },
      ],
    });
    return data.createEmissionTestSchedule;
  } catch (error) {
    console.error("Error creating test schedule:", error);
    throw error;
  }
}

// Helper function to update an existing test schedule
export async function updateTestSchedule(id, input) {
  try {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_TEST_SCHEDULE,
      variables: { id, input },
      refetchQueries: [
        {
          query: GET_TEST_SCHEDULES,
          variables: { year: input.year, quarter: input.quarter },
        },
      ],
    });
    return data.updateEmissionTestSchedule;
  } catch (error) {
    console.error("Error updating test schedule:", error);
    throw error;
  }
}

// Helper function to delete a test schedule
export async function deleteTestSchedule(id) {
  try {
    const { data } = await apolloClient.mutate({
      mutation: DELETE_TEST_SCHEDULE,
      variables: { id },
      refetchQueries: [{ query: GET_TEST_SCHEDULES }],
    });
    return data.deleteEmissionTestSchedule;
  } catch (error) {
    console.error("Error deleting test schedule:", error);
    throw error;
  }
}

// Helper function to update an emission test
export async function updateEmissionTest(id, input) {
  try {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_EMISSION_TEST,
      variables: { id, input },
      refetchQueries: [
        {
          query: GET_EMISSION_TESTS,
          variables: { filters: { year: input.year, quarter: input.quarter } },
        },
      ],
    });
    return data.updateEmissionTest;
  } catch (error) {
    console.error("Error updating emission test:", error);
    throw error;
  }
}

// Helper function to delete an emission test
export async function deleteEmissionTest(id) {
  try {
    const { data } = await apolloClient.mutate({
      mutation: DELETE_EMISSION_TEST,
      variables: { id },
      refetchQueries: [{ query: GET_EMISSION_TESTS }],
    });
    return data.deleteEmissionTest;
  } catch (error) {
    console.error("Error deleting emission test:", error);
    throw error;
  }
}

// Helper function to fetch a vehicle by ID
export async function fetchVehicleById(id) {
  try {
    const { data } = await apolloClient.query({
      query: GET_VEHICLE_SUMMARY,
      variables: { id },
      fetchPolicy: "network-only",
    });
    return data.vehicleSummary;
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    throw error;
  }
}

// Helper function to fetch office compliance data
export async function fetchOffices(filters: {
  year?: number;
  quarter?: number;
  searchTerm?: string;
}) {
  try {
    const { data } = await apolloClient.query({
      query: GET_OFFICE_COMPLIANCE,
      variables: {
        year: filters.year || new Date().getFullYear(),
        quarter: filters.quarter || Math.ceil((new Date().getMonth() + 1) / 3),
        searchTerm: filters.searchTerm || undefined,
      },
      fetchPolicy: "network-only",
    });
    return data.officeCompliance;
  } catch (error) {
    console.error("Error fetching office compliance data:", error);
    throw error;
  }
}

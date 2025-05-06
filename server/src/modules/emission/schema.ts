export const emissionTypeDefs = `#graphql
  type Vehicle {
    id: ID!
    driverName: String!
    contactNumber: String
    engineType: String!
    officeName: String!
    plateNumber: String!
    vehicleType: String!
    wheels: Int!
    createdAt: String!
    updatedAt: String!
    latestTest: EmissionTest
    createdBy: ID
    updatedBy: ID
    driverHistory: [DriverHistoryEntry!]!
  }

  type EmissionTest {
    id: ID!
    vehicleId: ID!
    testDate: String!
    quarter: Int!
    year: Int!
    result: Boolean!
    createdBy: ID
    createdAt: String!
    updatedAt: String!
    vehicle: Vehicle
  }

  type EmissionTestSchedule {
    id: ID!
    assignedPersonnel: String!
    conductedOn: String!
    location: String!
    quarter: Int!
    year: Int!
    createdAt: String!
    updatedAt: String!
  }

  type VehicleSummary {
    id: ID!
    driverName: String!
    contactNumber: String
    engineType: String!
    officeName: String!
    plateNumber: String!
    vehicleType: String!
    wheels: Int!
    latestTestDate: String
    latestTestQuarter: Int
    latestTestYear: Int
    latestTestResult: Boolean
    driverHistory: [DriverHistoryEntry!]!
  }

  type DriverHistoryEntry {
    driverName: String!
    changedAt: String!
    changedBy: ID
  }

  input VehicleInput {
    driverName: String!
    contactNumber: String
    engineType: String!
    officeName: String!
    plateNumber: String!
    vehicleType: String!
    wheels: Int!
  }

  input EmissionTestInput {
    vehicleId: ID!
    testDate: String!
    quarter: Int!
    year: Int!
    result: Boolean!
  }

  input EmissionTestScheduleInput {
    assignedPersonnel: String!
    conductedOn: String!
    location: String!
    quarter: Int!
    year: Int!
  }

  input EmissionTestFilters {
    year: Int
    quarter: Int
    vehicleId: ID
    result: Boolean
  }

  input VehicleFilters {
    plateNumber: String
    driverName: String
    officeName: String
    vehicleType: String
  }

  extend type Query {
    # Vehicle queries
    vehicles(filters: VehicleFilters): [Vehicle!]!
    vehicle(id: ID!): Vehicle
    vehicleSummaries(filters: VehicleFilters): [VehicleSummary!]!
    vehicleSummary(id: ID!): VehicleSummary
    
    # EmissionTest queries
    emissionTests(filters: EmissionTestFilters): [EmissionTest!]!
    emissionTest(id: ID!): EmissionTest
    
    # EmissionTestSchedule queries
    emissionTestSchedules(year: Int, quarter: Int): [EmissionTestSchedule!]!
    emissionTestSchedule(id: ID!): EmissionTestSchedule
    
    # Office compliance queries
    officeCompliance(year: Int!, quarter: Int!, searchTerm: String): [OfficeCompliance!]!
    officeComplianceByYear(year: Int!, searchTerm: String): [OfficeCompliance!]!
  }

  # Office compliance data type
  type OfficeCompliance {
    id: ID!
    name: String!
    code: String!
    vehicleCount: Int!
    testedCount: Int!
    passedCount: Int!
    complianceRate: Int!
  }

  extend type Mutation {
    # Vehicle mutations
    createVehicle(input: VehicleInput!): Vehicle!
    updateVehicle(id: ID!, input: VehicleInput!): Vehicle!
    deleteVehicle(id: ID!): Boolean!
    
    # EmissionTest mutations
    createEmissionTest(input: EmissionTestInput!): EmissionTest!
    updateEmissionTest(id: ID!, input: EmissionTestInput!): EmissionTest!
    deleteEmissionTest(id: ID!): Boolean!
    
    # EmissionTestSchedule mutations
    createEmissionTestSchedule(input: EmissionTestScheduleInput!): EmissionTestSchedule!
    updateEmissionTestSchedule(id: ID!, input: EmissionTestScheduleInput!): EmissionTestSchedule!
    deleteEmissionTestSchedule(id: ID!): Boolean!
  }
`;

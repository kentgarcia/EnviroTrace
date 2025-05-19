export const belchingTypeDefs = `#graphql
  type BelchingFee {
    id: ID!
    amount: Float!
    category: String!
    level: Int!
    effectiveDate: String!
    createdAt: String
    updatedAt: String
  }

  input BelchingFeeInput {
    amount: Float!
    category: String!
    level: Int!
    effectiveDate: String!
  }

  type BelchingRecord {
    id: ID!
    plateNumber: String!
    vehicleType: String!
    operator: String!
    operatorAddress: String!
    recordAddress: String!
    recordStatus: String!
    licenseValidUntil: String!
    offenseLevel: Int!
    lastDateApprehended: String!
    orderOfPayment: String!
    violationSummary: String!
    createdAt: String
    updatedAt: String
  }

  input BelchingRecordInput {
    plateNumber: String!
    vehicleType: String!
    operator: String!
    operatorAddress: String!
    recordAddress: String!
    recordStatus: String!
    licenseValidUntil: String!
    offenseLevel: Int!
    lastDateApprehended: String!
    orderOfPayment: String!
    violationSummary: String!
  }

  type BelchingRecordHistory {
    id: ID!
    recordId: Int!
    type: String!
    date: String!
    details: String!
    orNo: String!
    status: String!
  }

  input BelchingRecordHistoryInput {
    recordId: Int!
    type: String!
    date: String!
    details: String!
    orNo: String!
    status: String!
  }

  type BelchingViolation {
    id: ID!
    recordId: Int!
    operatorOffense: String!
    dateOfApprehension: String!
    place: String!
    driverName: String!
    driverOffense: String!
    paid: Boolean!
  }

  input BelchingViolationInput {
    recordId: Int!
    operatorOffense: String!
    dateOfApprehension: String!
    place: String!
    driverName: String!
    driverOffense: String!
    paid: Boolean!
  }

  type Query {
    belchingFees: [BelchingFee!]!
    belchingFee(id: ID!): BelchingFee
    belchingRecords: [BelchingRecord!]!
    belchingRecord(id: ID!): BelchingRecord
    belchingRecordHistories(recordId: Int): [BelchingRecordHistory!]!
    belchingRecordHistory(id: ID!): BelchingRecordHistory
    belchingViolations(recordId: Int): [BelchingViolation!]!
    belchingViolation(id: ID!): BelchingViolation
  }

  type Mutation {
    createBelchingFee(input: BelchingFeeInput!): BelchingFee!
    updateBelchingFee(id: ID!, input: BelchingFeeInput!): BelchingFee!
    deleteBelchingFee(id: ID!): Boolean!
    createBelchingRecord(input: BelchingRecordInput!): BelchingRecord!
    updateBelchingRecord(id: ID!, input: BelchingRecordInput!): BelchingRecord!
    deleteBelchingRecord(id: ID!): Boolean!
    createBelchingRecordHistory(input: BelchingRecordHistoryInput!): BelchingRecordHistory!
    updateBelchingRecordHistory(id: ID!, input: BelchingRecordHistoryInput!): BelchingRecordHistory!
    deleteBelchingRecordHistory(id: ID!): Boolean!
    createBelchingViolation(input: BelchingViolationInput!): BelchingViolation!
    updateBelchingViolation(id: ID!, input: BelchingViolationInput!): BelchingViolation!
    deleteBelchingViolation(id: ID!): Boolean!
  }
`;

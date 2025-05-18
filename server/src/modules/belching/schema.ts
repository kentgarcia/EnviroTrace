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

  type Query {
    belchingFees: [BelchingFee!]!
    belchingFee(id: ID!): BelchingFee
    belchingRecords: [BelchingRecord!]!
    belchingRecord(id: ID!): BelchingRecord
  }

  type Mutation {
    createBelchingFee(input: BelchingFeeInput!): BelchingFee!
    updateBelchingFee(id: ID!, input: BelchingFeeInput!): BelchingFee!
    deleteBelchingFee(id: ID!): Boolean!
    createBelchingRecord(input: BelchingRecordInput!): BelchingRecord!
    updateBelchingRecord(id: ID!, input: BelchingRecordInput!): BelchingRecord!
    deleteBelchingRecord(id: ID!): Boolean!
  }
`;

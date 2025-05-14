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

  type Query {
    belchingFees: [BelchingFee!]!
    belchingFee(id: ID!): BelchingFee
  }

  type Mutation {
    createBelchingFee(input: BelchingFeeInput!): BelchingFee!
    updateBelchingFee(id: ID!, input: BelchingFeeInput!): BelchingFee!
    deleteBelchingFee(id: ID!): Boolean!
  }
`;

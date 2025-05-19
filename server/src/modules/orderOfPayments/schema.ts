// GraphQL schema for OrderOfPayments
export const orderOfPaymentsTypeDefs = `
  type OrderOfPayment {
    id: ID!
    orderNo: String!
    plateNo: String!
    operator: String!
    amount: Float!
    dateIssued: String!
    status: String!
    testingOfficer: String!
    testResults: String!
    dateOfTesting: String!
    apprehensionFee: Float!
    voluntaryFee: Float!
    impoundFee: Float!
    driverAmount: Float!
    operatorAmount: Float!
  }

  input OrderOfPaymentInput {
    orderNo: String!
    plateNo: String!
    operator: String!
    amount: Float!
    dateIssued: String!
    status: String!
    testingOfficer: String!
    testResults: String!
    dateOfTesting: String!
    apprehensionFee: Float!
    voluntaryFee: Float!
    impoundFee: Float!
    driverAmount: Float!
    operatorAmount: Float!
  }

  type Query {
    orderOfPayments: [OrderOfPayment!]!
    orderOfPayment(id: ID!): OrderOfPayment
  }

  type Mutation {
    createOrderOfPayment(input: OrderOfPaymentInput!): OrderOfPayment!
    updateOrderOfPayment(id: ID!, input: OrderOfPaymentInput!): OrderOfPayment!
    deleteOrderOfPayment(id: ID!): Boolean!
  }
`;

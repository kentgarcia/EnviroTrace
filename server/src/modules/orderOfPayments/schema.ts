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
  }

  input OrderOfPaymentInput {
    orderNo: String!
    plateNo: String!
    operator: String!
    amount: Float!
    dateIssued: String!
    status: String!
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

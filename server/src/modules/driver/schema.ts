export const driverTypeDefs = `#graphql
  type DriverOffense {
    date: String!
    type: String!
    status: String!
    paid: Boolean!
  }

  type Driver {
    id: ID!
    driverName: String!
    plateNo: String!
    orNo: String!
    transportGroup: String!
    offenses: [DriverOffense!]!
  }

  input DriverSearchInput {
    driverName: String
    plateNo: String
    orNo: String
    transportGroup: String
  }

  type Query {
    driverSearch(input: DriverSearchInput): [Driver!]!
    driverById(id: ID!): Driver
  }
`;

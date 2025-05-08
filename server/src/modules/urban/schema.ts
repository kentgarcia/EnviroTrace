export const urbanGreeningTypeDefs = `#graphql
  # Seedling request types
  type SeedlingItem {
    name: String!
    quantity: Int!
  }

  type SeedlingRequest {
    id: ID!
    dateReceived: String!
    requesterName: String!
    address: String!
    items: [SeedlingItem!]!
    notes: String
    createdAt: String!
    createdBy: ID
    updatedAt: String!
    updatedBy: ID
  }

  # Urban greening types
  type UrbanGreeningItem {
    name: String!
    quantity: Int!
  }

  type UrbanGreening {
    id: ID!
    date: String!
    establishmentName: String!
    plantedBy: String!
    items: [UrbanGreeningItem!]!
    total: Int!
    type: String!
    status: String!
    notes: String
    createdAt: String!
    createdBy: ID
    updatedAt: String!
    updatedBy: ID
  }

  # Urban overview types
  type UrbanGreeningStats {
    ornamentalPlants: Int!
    trees: Int!
  }

  type UrbanGreeningBreakdown {
    seeds: Int!
    seedsPrivate: Int!
    trees: Int!
    ornamentals: Int!
  }

  type UrbanOverview {
    plantSaplingsCollected: Int!
    urbanGreening: UrbanGreeningStats!
    urbanGreeningBreakdown: UrbanGreeningBreakdown!
  }

  # Input types
  input SeedlingItemInput {
    name: String!
    quantity: Int!
  }

  input SeedlingRequestInput {
    dateReceived: String!
    requesterName: String!
    address: String!
    items: [SeedlingItemInput!]!
    notes: String
  }

  input SeedlingRequestFiltersInput {
    requesterName: String
    startDate: String
    endDate: String
  }

  input UrbanGreeningItemInput {
    name: String!
    quantity: Int!
  }

  input UrbanGreeningInput {
    date: String!
    establishmentName: String!
    plantedBy: String!
    items: [UrbanGreeningItemInput!]!
    total: Int!
    type: String!
    status: String!
    notes: String
  }

  input UrbanGreeningFiltersInput {
    establishmentName: String
    type: String
    status: String
    startDate: String
    endDate: String
  }

  # Extend existing GraphQL queries
  extend type Query {
    # Seedling request queries
    seedlingRequests(filters: SeedlingRequestFiltersInput): [SeedlingRequest!]!
    seedlingRequest(id: ID!): SeedlingRequest
    
    # Urban greening queries
    urbanGreeningRecords(filters: UrbanGreeningFiltersInput): [UrbanGreening!]!
    urbanGreeningRecord(id: ID!): UrbanGreening
    urbanOverview(year: Int!): UrbanOverview!
  }

  # Extend existing GraphQL mutations
  extend type Mutation {
    # Seedling request mutations
    createSeedlingRequest(input: SeedlingRequestInput!): SeedlingRequest!
    updateSeedlingRequest(id: ID!, input: SeedlingRequestInput!): SeedlingRequest!
    deleteSeedlingRequest(id: ID!): Boolean!
    
    # Urban greening mutations
    createUrbanGreening(input: UrbanGreeningInput!): UrbanGreening!
    updateUrbanGreening(id: ID!, input: UrbanGreeningInput!): UrbanGreening!
    deleteUrbanGreening(id: ID!): Boolean!
  }
`;

import { authTypeDefs } from "./auth/schema";
import { userTypeDefs } from "./user/schema";

// Base schema definition
const baseTypeDefs = `#graphql
  type Query {
    _empty: String
  }
  
  type Mutation {
    _empty: String
  }
`;

// Combine all type definitions
export const typeDefs = [
  baseTypeDefs,
  authTypeDefs,
  userTypeDefs,
  // Add other module schemas here
];

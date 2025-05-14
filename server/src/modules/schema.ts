import { authTypeDefs } from "./auth/schema.js";
import { userTypeDefs } from "./user/schema.js";
import { profileTypeDefs } from "./profile/schema.js";
import { emissionTypeDefs } from "./emission/schema.js";
import { urbanGreeningTypeDefs } from "./urban/schema.js";
import { belchingTypeDefs } from "./belching/schema.js";
import { mergeTypeDefs } from "@graphql-tools/merge";

// Base schema definition with empty Query and Mutation types
// This creates proper extension points for our schema modules
const baseTypeDefs = `#graphql
  type Query {
    _empty: String
  }
  
  type Mutation {
    _empty: String
  }
`;

// Combine all type definitions using mergeTypeDefs
export const typeDefs = mergeTypeDefs([
  baseTypeDefs,
  authTypeDefs,
  userTypeDefs,
  profileTypeDefs,
  emissionTypeDefs,
  urbanGreeningTypeDefs,
  belchingTypeDefs,
  // Add other module schemas here
]);

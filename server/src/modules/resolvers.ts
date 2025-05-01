import { authResolvers } from "./auth/resolvers";
import { userResolvers } from "./user/resolvers";
import { mergeResolvers } from "@graphql-tools/merge";

// Helper function to merge all resolvers
const resolversArray = [
  authResolvers,
  userResolvers,
  // Add other module resolvers here
];

// Export merged resolvers
export const resolvers = mergeResolvers(resolversArray);

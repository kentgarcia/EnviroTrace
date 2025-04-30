import { authResolvers } from "./auth/resolvers";
import { userResolvers } from "./user/resolvers";

// Helper function to merge all resolvers
const resolversArray = [
  authResolvers,
  userResolvers,
  // Add other module resolvers here
];

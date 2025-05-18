import { authResolvers } from "./auth/resolvers.js";
import { userResolvers } from "./user/resolvers.js";
import { profileResolvers } from "./profile/resolvers.js";
import { emissionResolvers } from "./emission/resolvers.js";
import { urbanGreeningResolvers } from "./urban/resolvers.js";
import { belchingResolvers } from "./belching/resolvers.js";
import { orderOfPaymentsResolvers } from "./orderOfPayments/resolvers.js";
import { mergeResolvers } from "@graphql-tools/merge";
import { IResolvers } from "@graphql-tools/utils";
import { GraphQLResolveInfo } from "graphql";
import { AuthContext } from "./auth/types.js";

// Helper function to merge all resolvers
const resolversArray = [
  authResolvers,
  userResolvers,
  profileResolvers,
  emissionResolvers,
  urbanGreeningResolvers,
  belchingResolvers,
  orderOfPaymentsResolvers,
  // Add other module resolvers here
];

// Export merged resolvers
export const resolvers: IResolvers<any, AuthContext> =
  mergeResolvers(resolversArray);

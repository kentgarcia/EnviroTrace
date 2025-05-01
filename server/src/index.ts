import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import dotenv from "dotenv";

import { typeDefs } from "./modules/schema.js";
import { resolvers } from "./modules/resolvers.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import { formatError } from "./middlewares/errorMiddleware.js";

// Load environment variables
dotenv.config();

// Create an instance of Apollo Server with our combined schemas and resolvers
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError, // Use our custom error formatter
  includeStacktraceInErrorResponses: process.env.NODE_ENV !== "production", // Hide stack traces in production
});

// Start the server
const { url } = await startStandaloneServer(server, {
  listen: { port: parseInt(process.env.PORT || "4000") },
  context: async ({ req }) => {
    // Apply auth middleware to get user from token
    return authMiddleware(req);
  },
});

console.log(`🚀 Server ready at ${url}`);

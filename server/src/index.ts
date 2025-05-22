// src/index.ts
import "dotenv/config"; // Load .env variables (must be at the top)
import express, { Request, Response, NextFunction } from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import cors from "cors";
import helmet from "helmet"; // Basic security headers
import jwt from "jsonwebtoken";

import { typeDefs } from "./graphql/typeDefs"; // You'll create these
import { resolvers } from "./graphql/resolvers"; // You'll create these
import { prisma } from "./lib/prisma"; // Your Prisma client instance
import { Context, AuthenticatedUser } from "./context"; // Your context definition

// Basic rate limiting (example, can be more sophisticated)
import rateLimit from "express-rate-limit";

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}

// ---- Helper Function for JWT ----
const getUserFromToken = (token?: string): AuthenticatedUser | null => {
  if (!token) return null;
  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      JWT_SECRET
    ) as AuthenticatedUser; // Adjust 'AuthenticatedUser' to your token payload
    return decoded;
  } catch (err) {
    return null; // Invalid token
  }
};

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // ---- Security Middleware ----
  // 1. Helmet (sets various HTTP headers for security)
  app.use(helmet());

  // 2. CORS
  const corsOptions = {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000", // Be specific in production
    credentials: true, // If you need to send cookies or authorization headers
  };
  app.use(cors(corsOptions));

  // 3. Body Parsers (Apollo Server handles its own for /graphql)
  app.use(express.json()); // For other potential REST routes

  // 4. Basic Rate Limiting (apply to all requests or specific routes)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `windowMs`
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  });
  app.use(limiter); // Apply to all routes

  // ---- Apollo Server Setup ----
  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Plugin to prevent overly complex queries (basic depth limit)
      {
        async requestDidStart() {
          return {
            async didResolveOperation(requestContext) {
              const MAX_DEPTH = 7; // Adjust as needed
              const query = requestContext.document;
              if (query) {
                const depth = getQueryDepth(query);
                if (depth > MAX_DEPTH) {
                  throw new Error(`Query too deep. Max depth is ${MAX_DEPTH}.`);
                }
              }
            },
          };
        },
      },
    ],
    introspection: process.env.NODE_ENV !== "production", // Disable introspection in production
    formatError: (formattedError, error) => {
      // Mask sensitive errors in production
      if (process.env.NODE_ENV === "production") {
        // Log the original error internally
        console.error(error);
        // Return a generic error message to the client
        return { message: "Internal server error" };
      }
      return formattedError;
    },
  });

  await server.start();

  // ---- Authentication Middleware (Example) ----
  // This is a simplified middleware to extract user from token
  // and make it available in the Apollo Context.
  app.use((req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    const user = getUserFromToken(token);
    (req as any).user = user; // Attach user to request object for context
    next();
  });

  // ---- GraphQL Endpoint ----
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }): Promise<Context> => {
        return {
          prisma,
          req, // Pass the Express request
          user: (req as any).user, // Get user from our auth middleware
          // dataLoaders: createDataLoaders(prisma), // If you implement Dataloaders
        };
      },
    })
  );

  // ---- Health Check Endpoint (Good Practice) ----
  app.get("/health", (req, res) => {
    res.status(200).send("OK");
  });

  // ---- Start Server ----
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  console.log(`NODE_ENV is: ${process.env.NODE_ENV}`);
}

// Basic query depth calculation (can be more robust)
function getQueryDepth(queryDocument: any): number {
  let maxDepth = 0;
  function dive(selectionSet: any, depth: number) {
    if (depth > maxDepth) maxDepth = depth;
    selectionSet.selections.forEach((selection: any) => {
      if (selection.selectionSet) {
        dive(selection.selectionSet, depth + 1);
      }
    });
  }
  queryDocument.definitions.forEach((definition: any) => {
    if (definition.kind === "OperationDefinition") {
      dive(definition.selectionSet, 1);
    }
  });
  return maxDepth;
}

startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});

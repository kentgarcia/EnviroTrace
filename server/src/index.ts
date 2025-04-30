import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// PostgreSQL connection setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
});

// Define your GraphQL schema
const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    lastSignInAt: String
    isSuperAdmin: Boolean
    createdAt: String
    updatedAt: String
  }

  type Query {
    users: [User]
    user(id: ID!): User
  }

  type Mutation {
    createUser(email: String!, password: String!): User
    deleteUser(id: ID!): Boolean
  }
`;

// Define your resolvers
const resolvers = {
  Query: {
    users: async () => {
      const result = await pool.query(
        'SELECT id, email, last_sign_in_at AS "lastSignInAt", is_super_admin AS "isSuperAdmin", created_at AS "createdAt", updated_at AS "updatedAt" FROM users WHERE deleted_at IS NULL'
      );
      return result.rows;
    },
    user: async (_, { id }) => {
      const result = await pool.query(
        'SELECT id, email, last_sign_in_at AS "lastSignInAt", is_super_admin AS "isSuperAdmin", created_at AS "createdAt", updated_at AS "updatedAt" FROM users WHERE id = $1 AND deleted_at IS NULL',
        [id]
      );
      return result.rows[0];
    },
  },
  Mutation: {
    createUser: async (_, { email, password }) => {
      const encryptedPassword = "hashed_password_placeholder"; // Replace with actual hashing logic
      const result = await pool.query(
        'INSERT INTO users (email, encrypted_password, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING id, email, created_at AS "createdAt", updated_at AS "updatedAt"',
        [email, encryptedPassword]
      );
      return result.rows[0];
    },
    deleteUser: async (_, { id }) => {
      await pool.query("UPDATE users SET deleted_at = NOW() WHERE id = $1", [
        id,
      ]);
      return true;
    },
  },
};

// Create an instance of Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start the server
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀 Server ready at ${url}`);

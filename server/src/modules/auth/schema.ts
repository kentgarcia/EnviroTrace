export const authTypeDefs = `#graphql
  enum UserRole {
    admin
    air_quality
    tree_management
    government_emission
  }

  type User {
    id: ID!
    email: String!
    lastSignInAt: String
    isSuperAdmin: Boolean
    createdAt: String
    updatedAt: String
    roles: [UserRole!]!
  }

  type UserRoleEntity {
    id: ID!
    userId: ID!
    role: UserRole!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
  }

  type Mutation {
    signIn(email: String!, password: String!): AuthPayload
    signUp(email: String!, password: String!): AuthPayload
  }
`;

export const userTypeDefs = `#graphql
  # User types are extended from auth schema
  extend type Query {
    users: [User]
    user(id: ID!): User
    userRoles(userId: ID!): [UserRoleEntity!]!
  }

  extend type Mutation {
    createUser(email: String!, password: String!): User
    deleteUser(id: ID!): Boolean
    addUserRole(userId: ID!, role: UserRole!): UserRoleEntity
    removeUserRole(userId: ID!, role: UserRole!): Boolean
  }
`;

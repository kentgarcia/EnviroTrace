export const profileTypeDefs = `#graphql
  type Profile {
    id: ID!
    userId: ID!
    firstName: String
    lastName: String
    fullName: String
    bio: String
    jobTitle: String
    department: String
    phoneNumber: String
    createdAt: String
    updatedAt: String
  }

  input ProfileInput {
    firstName: String
    lastName: String
    bio: String
    jobTitle: String
    department: String
    phoneNumber: String
  }

  extend type Query {
    profile(userId: ID!): Profile
    myProfile: Profile
  }

  extend type Mutation {
    updateProfile(input: ProfileInput!): Profile
  }
`;

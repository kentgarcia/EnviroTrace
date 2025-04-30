import { UserRepository } from "./repository";
import { hashPassword } from "../../utils/auth";
import { AuthContext } from "../auth/types";

export const userResolvers = {
  Query: {
    users: async () => {
      return await UserRepository.findAll();
    },
    user: async (_, { id }) => {
      return await UserRepository.findById(id);
    },
    userRoles: async (_, { userId }) => {
      return await UserRepository.getUserRoles(userId);
    },
  },
  User: {
    roles: async (parent) => {
      return await UserRepository.getRoles(parent.id);
    },
  },
  Mutation: {
    createUser: async (_, { email, password }) => {
      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      return await UserRepository.create(email, hashedPassword);
    },
    deleteUser: async (_, { id }, { user }: AuthContext) => {
      // Optional: Add authorization check here
      // if (!user?.isSuperAdmin) throw new Error("Unauthorized");

      return await UserRepository.delete(id);
    },
    addUserRole: async (_, { userId, role }) => {
      return await UserRepository.addRole(userId, role);
    },
    removeUserRole: async (_, { userId, role }) => {
      return await UserRepository.removeRole(userId, role);
    },
  },
};

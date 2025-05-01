import { UserRepository } from "./repository.js";
import { hashPassword } from "../../utils/auth.js";
import { AuthContext, UserRole } from "../auth/types.js";
import { ErrorType, AppError } from "../../middlewares/errorMiddleware.js";

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
    addUserRole: async (_, { userId, role }, { user }: AuthContext) => {
      // Authorization check - only admins or the user themselves can add roles
      if (!user) {
        throw new AppError("Not authenticated", ErrorType.UNAUTHORIZED);
      }

      // Check if the current user is an admin or is the same user
      const userRoles = await UserRepository.getRoles(user.id);
      const isAdmin = userRoles.includes(UserRole.ADMIN);
      const isSelf = user.id === userId;

      if (!isAdmin && !isSelf) {
        throw new AppError(
          "Not authorized to modify user roles",
          ErrorType.FORBIDDEN
        );
      }

      try {
        // Attempt to add the role
        const result = await UserRepository.addRole(userId, role);
        return result;
      } catch (error) {
        console.error("Failed to add user role:", error);
        throw new AppError(
          "Failed to add role to user",
          ErrorType.DATABASE_ERROR
        );
      }
    },
    removeUserRole: async (_, { userId, role }, { user }: AuthContext) => {
      // Authorization check - only admins or the user themselves can remove roles
      if (!user) {
        throw new AppError("Not authenticated", ErrorType.UNAUTHORIZED);
      }

      // Check if the current user is an admin or is the same user
      const userRoles = await UserRepository.getRoles(user.id);
      const isAdmin = userRoles.includes(UserRole.ADMIN);
      const isSelf = user.id === userId;

      if (!isAdmin && !isSelf) {
        throw new AppError(
          "Not authorized to modify user roles",
          ErrorType.FORBIDDEN
        );
      }

      // Prevent removing the last role
      const targetUserRoles = await UserRepository.getRoles(userId);
      if (targetUserRoles.length <= 1) {
        throw new AppError(
          "Cannot remove the last role from a user",
          ErrorType.BAD_REQUEST
        );
      }

      try {
        // Attempt to remove the role
        return await UserRepository.removeRole(userId, role);
      } catch (error) {
        console.error("Failed to remove user role:", error);
        throw new AppError(
          "Failed to remove role from user",
          ErrorType.DATABASE_ERROR
        );
      }
    },
  },
};

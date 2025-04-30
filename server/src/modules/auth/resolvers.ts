import { UserRepository } from "../user/repository";
import { comparePassword, generateToken, hashPassword } from "../../utils/auth";
import { AuthContext, UserRole } from "./types";

export const authResolvers = {
  Mutation: {
    signIn: async (_, { email, password }) => {
      // Find the user by email
      const user = await UserRepository.findByEmail(email);
      if (!user) {
        throw new Error("User not found");
      }

      // Verify password
      const isValid = await comparePassword(password, user.encrypted_password);
      if (!isValid) {
        throw new Error("Invalid password");
      }

      // Update last sign in time
      await UserRepository.updateLastSignIn(user.id);

      // Get user roles
      const roles = await UserRepository.getRoles(user.id);

      // Generate token with user ID
      const token = generateToken({
        id: user.id,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
      });

      // Return the authentication payload
      delete user.encrypted_password; // Don't include password in response
      return {
        token,
        user: {
          ...user,
          roles,
        },
      };
    },

    signUp: async (_, { email, password }) => {
      // Check if user already exists
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Insert new user
      const user = await UserRepository.create(email, hashedPassword);

      // Give new user a default role
      await UserRepository.addRole(user.id, UserRole.AIR_QUALITY);

      // Get user roles
      const roles = await UserRepository.getRoles(user.id);

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin || false,
      });

      return {
        token,
        user: {
          ...user,
          roles,
        },
      };
    },
  },

  Query: {
    me: async (_, __, { user }: AuthContext) => {
      if (!user) {
        return null; // Not authenticated
      }

      const userData = await UserRepository.findById(user.id);
      if (!userData) {
        return null;
      }

      // Get user roles
      userData.roles = await UserRepository.getRoles(userData.id);

      return userData;
    },
  },
};

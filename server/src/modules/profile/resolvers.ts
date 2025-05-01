import { ProfileRepository } from "./repository.js";
import { AuthContext } from "../auth/types.js";
import { ErrorType, AppError } from "../../middlewares/errorMiddleware.js";

export const profileResolvers = {
  Query: {
    profile: async (_, { userId }, { user }: AuthContext) => {
      // Authentication check
      if (!user) {
        throw new AppError("Not authenticated", ErrorType.UNAUTHORIZED);
      }

      // Authorization check - only allow users to view their own profile or admins
      const isOwnProfile = user.id === userId;

      // For now, allow any authenticated user to view profiles
      // In a more restricted system, we could check for admin role here

      try {
        return await ProfileRepository.findByUserId(userId);
      } catch (error) {
        console.error("Error fetching profile:", error);
        throw new AppError("Failed to fetch profile", ErrorType.DATABASE_ERROR);
      }
    },

    myProfile: async (_, __, { user }: AuthContext) => {
      // Authentication check
      if (!user) {
        throw new AppError("Not authenticated", ErrorType.UNAUTHORIZED);
      }

      try {
        const profile = await ProfileRepository.findByUserId(user.id);
        return profile;
      } catch (error) {
        console.error("Error fetching profile:", error);
        throw new AppError("Failed to fetch profile", ErrorType.DATABASE_ERROR);
      }
    },
  },

  Mutation: {
    updateProfile: async (_, { input }, { user }: AuthContext) => {
      // Authentication check
      if (!user) {
        throw new AppError("Not authenticated", ErrorType.UNAUTHORIZED);
      }

      try {
        const updatedProfile = await ProfileRepository.update(user.id, input);
        return updatedProfile;
      } catch (error) {
        console.error("Error updating profile:", error);
        throw new AppError(
          "Failed to update profile",
          ErrorType.DATABASE_ERROR
        );
      }
    },
  },

  Profile: {
    // Calculate fullName from firstName and lastName
    fullName: (parent) => {
      if (parent.firstName && parent.lastName) {
        return `${parent.firstName} ${parent.lastName}`;
      } else if (parent.firstName) {
        return parent.firstName;
      } else if (parent.lastName) {
        return parent.lastName;
      }
      return null;
    },
  },
};

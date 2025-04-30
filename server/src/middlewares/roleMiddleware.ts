import { UserRole } from "../modules/auth/types";
import { UserRepository } from "../modules/user/repository";

/**
 * Middleware to check if the user has the required roles
 * @param requiredRoles Array of roles that grant access
 * @returns Boolean indicating if the user has access
 */
export const checkRoles = async (
  userId: string,
  requiredRoles: UserRole[]
): Promise<boolean> => {
  if (!userId) return false;

  try {
    // Get the user's roles
    const userRoles = await UserRepository.getRoles(userId);

    // Admin role has access to everything
    if (userRoles.includes(UserRole.ADMIN)) {
      return true;
    }

    // Check if the user has any of the required roles
    return requiredRoles.some((role) => userRoles.includes(role));
  } catch (error) {
    console.error("Role check error:", error);
    return false;
  }
};

/**
 * Creates a GraphQL directive resolver for role-based authorization
 */
export const createRoleDirective = (directiveName: string) => {
  return {
    [directiveName]: (next, source, { roles }, context) => {
      // Check if the user is authenticated
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // Convert string roles to enum values if needed
      const requiredRoles = roles.map((role) => {
        return typeof role === "string" ? role : role;
      });

      // Check if user has required roles
      return checkRoles(context.user.id, requiredRoles).then((hasAccess) => {
        if (!hasAccess) {
          throw new Error(
            "Not authorized - Required roles: " + roles.join(", ")
          );
        }
        return next();
      });
    },
  };
};

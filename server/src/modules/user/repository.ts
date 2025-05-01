import { db } from "../../config/db.js";
import { UserRole } from "../auth/types.js";
import { ErrorType, AppError } from "../../middlewares/errorMiddleware.js";

/**
 * User repository for database operations related to users
 */
export const UserRepository = {
  /**
   * Find a user by email
   */
  async findByEmail(email: string) {
    try {
      const result = await db.query(
        'SELECT id, email, encrypted_password, is_super_admin AS "isSuperAdmin", created_at AS "createdAt", updated_at AS "updatedAt" FROM users WHERE email = $1 AND deleted_at IS NULL',
        [email]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Database error in findByEmail:", error);
      throw new AppError(
        "Failed to find user by email",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  /**
   * Find a user by ID
   */
  async findById(id: string) {
    try {
      const result = await db.query(
        'SELECT id, email, last_sign_in_at AS "lastSignInAt", is_super_admin AS "isSuperAdmin", created_at AS "createdAt", updated_at AS "updatedAt" FROM users WHERE id = $1 AND deleted_at IS NULL',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Database error in findById:", error);
      throw new AppError("Failed to find user by ID", ErrorType.DATABASE_ERROR);
    }
  },

  /**
   * Get all users
   */
  async findAll() {
    try {
      const result = await db.query(
        'SELECT id, email, last_sign_in_at AS "lastSignInAt", is_super_admin AS "isSuperAdmin", created_at AS "createdAt", updated_at AS "updatedAt" FROM users WHERE deleted_at IS NULL'
      );
      return result.rows;
    } catch (error) {
      console.error("Database error in findAll:", error);
      throw new AppError("Failed to retrieve users", ErrorType.DATABASE_ERROR);
    }
  },

  /**
   * Create a new user
   */
  async create(email: string, encryptedPassword: string) {
    try {
      // Use transaction to ensure data consistency
      return await db.transaction(async (client) => {
        const userResult = await client.query(
          'INSERT INTO users (email, encrypted_password, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING id, email, created_at AS "createdAt", updated_at AS "updatedAt"',
          [email, encryptedPassword]
        );

        return userResult.rows[0];
      });
    } catch (error) {
      console.error("Database error in create:", error);
      throw new AppError("Failed to create user", ErrorType.DATABASE_ERROR);
    }
  },

  /**
   * Update user's last sign in time
   */
  async updateLastSignIn(userId: string) {
    try {
      await db.query(
        "UPDATE users SET last_sign_in_at = NOW(), updated_at = NOW() WHERE id = $1",
        [userId]
      );
    } catch (error) {
      console.error("Database error in updateLastSignIn:", error);
      throw new AppError(
        "Failed to update sign-in time",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  /**
   * Soft delete a user
   */
  async delete(id: string) {
    try {
      await db.query("UPDATE users SET deleted_at = NOW() WHERE id = $1", [id]);
      return true;
    } catch (error) {
      console.error("Database error in delete:", error);
      throw new AppError("Failed to delete user", ErrorType.DATABASE_ERROR);
    }
  },

  /**
   * Get roles for a user
   */
  async getRoles(userId: string) {
    try {
      const result = await db.query(
        "SELECT role FROM user_roles WHERE user_id = $1",
        [userId]
      );
      return result.rows.map((row) => row.role);
    } catch (error) {
      console.error("Database error in getRoles:", error);
      throw new AppError("Failed to get user roles", ErrorType.DATABASE_ERROR);
    }
  },

  /**
   * Add a role to a user
   */
  async addRole(userId: string, role: UserRole) {
    try {
      // Check if the role already exists
      const existingRole = await db.query(
        "SELECT * FROM user_roles WHERE user_id = $1 AND role = $2",
        [userId, role]
      );

      if (existingRole.rows.length > 0) {
        return existingRole.rows[0];
      }

      // Create new role using transaction
      return await db.transaction(async (client) => {
        const result = await client.query(
          'INSERT INTO user_roles (id, user_id, role, created_at) VALUES (uuid_generate_v4(), $1, $2, NOW()) RETURNING id, user_id AS "userId", role, created_at AS "createdAt"',
          [userId, role]
        );
        return result.rows[0];
      });
    } catch (error) {
      console.error("Database error in addRole:", error);
      throw new AppError("Failed to add user role", ErrorType.DATABASE_ERROR);
    }
  },

  /**
   * Remove a role from a user
   */
  async removeRole(userId: string, role: UserRole) {
    try {
      const result = await db.query(
        "DELETE FROM user_roles WHERE user_id = $1 AND role = $2",
        [userId, role]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error("Database error in removeRole:", error);
      throw new AppError(
        "Failed to remove user role",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  /**
   * Get all roles for a user
   */
  async getUserRoles(userId: string) {
    try {
      const result = await db.query(
        'SELECT id, user_id AS "userId", role, created_at AS "createdAt" FROM user_roles WHERE user_id = $1',
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error("Database error in getUserRoles:", error);
      throw new AppError("Failed to get user roles", ErrorType.DATABASE_ERROR);
    }
  },
};

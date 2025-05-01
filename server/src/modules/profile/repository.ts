import { db } from "../../config/db.js";
import { ErrorType, AppError } from "../../middlewares/errorMiddleware.js";

export interface ProfileData {
  id?: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  jobTitle?: string;
  department?: string;
  phoneNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const ProfileRepository = {
  /**
   * Get profile by user ID
   */
  async findByUserId(userId: string) {
    try {
      const result = await db.query(
        `SELECT id, user_id AS "userId", first_name AS "firstName", last_name AS "lastName",
        bio, job_title AS "jobTitle", department, phone_number AS "phoneNumber",
        created_at AS "createdAt", updated_at AS "updatedAt"
        FROM profiles WHERE user_id = $1`,
        [userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("Database error in findByUserId:", error);
      throw new AppError("Failed to get profile", ErrorType.DATABASE_ERROR);
    }
  },

  /**
   * Create a new profile
   */
  async create(profileData: ProfileData) {
    try {
      const result = await db.query(
        `INSERT INTO profiles 
        (user_id, first_name, last_name, bio, job_title, department, phone_number, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING id, user_id AS "userId", first_name AS "firstName", last_name AS "lastName",
        bio, job_title AS "jobTitle", department, phone_number AS "phoneNumber",
        created_at AS "createdAt", updated_at AS "updatedAt"`,
        [
          profileData.userId,
          profileData.firstName || null,
          profileData.lastName || null,
          profileData.bio || null,
          profileData.jobTitle || null,
          profileData.department || null,
          profileData.phoneNumber || null,
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Database error in create:", error);
      throw new AppError("Failed to create profile", ErrorType.DATABASE_ERROR);
    }
  },

  /**
   * Update an existing profile
   */
  async update(userId: string, profileData: Partial<ProfileData>) {
    try {
      // First check if profile exists
      const existingProfile = await this.findByUserId(userId);

      if (!existingProfile) {
        // Create profile if it doesn't exist
        return await this.create({
          userId,
          ...profileData,
        });
      }

      // Build the SET part of the SQL query dynamically based on provided fields
      const updateFields = [];
      const queryParams = [userId]; // First parameter is always userId
      let paramCounter = 2; // Start from 2 since userId is $1

      if (profileData.firstName !== undefined) {
        updateFields.push(`first_name = $${paramCounter++}`);
        queryParams.push(profileData.firstName);
      }

      if (profileData.lastName !== undefined) {
        updateFields.push(`last_name = $${paramCounter++}`);
        queryParams.push(profileData.lastName);
      }

      if (profileData.bio !== undefined) {
        updateFields.push(`bio = $${paramCounter++}`);
        queryParams.push(profileData.bio);
      }

      if (profileData.jobTitle !== undefined) {
        updateFields.push(`job_title = $${paramCounter++}`);
        queryParams.push(profileData.jobTitle);
      }

      if (profileData.department !== undefined) {
        updateFields.push(`department = $${paramCounter++}`);
        queryParams.push(profileData.department);
      }

      if (profileData.phoneNumber !== undefined) {
        updateFields.push(`phone_number = $${paramCounter++}`);
        queryParams.push(profileData.phoneNumber);
      }

      // Always update the updated_at timestamp
      updateFields.push(`updated_at = NOW()`);

      // Execute the update query only if there are fields to update
      if (updateFields.length > 0) {
        const result = await db.query(
          `UPDATE profiles 
           SET ${updateFields.join(", ")} 
           WHERE user_id = $1
           RETURNING id, user_id AS "userId", first_name AS "firstName", last_name AS "lastName",
           bio, job_title AS "jobTitle", department, phone_number AS "phoneNumber",
           created_at AS "createdAt", updated_at AS "updatedAt"`,
          queryParams
        );
        return result.rows[0];
      }

      return existingProfile;
    } catch (error) {
      console.error("Database error in update:", error);
      throw new AppError("Failed to update profile", ErrorType.DATABASE_ERROR);
    }
  },
};

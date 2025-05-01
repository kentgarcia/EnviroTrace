import { db } from '../config/db.js';
import { UserRole } from '../modules/auth/types.js';
import { hashPassword } from './auth.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Development utility script to add roles to users for testing
 * Usage: npx ts-node src/utils/dev-setup-roles.ts
 */

// User email to role mapping for testing
const devUsers = [
  { email: 'admin@example.com', roles: [UserRole.ADMIN] },
  { email: 'air@example.com', roles: [UserRole.AIR_QUALITY] },
  { email: 'tree@example.com', roles: [UserRole.TREE_MANAGEMENT] },
  { email: 'emission@example.com', roles: [UserRole.GOVERNMENT_EMISSION] },
  { email: 'multi@example.com', roles: [UserRole.AIR_QUALITY, UserRole.TREE_MANAGEMENT] },
  { email: 'allaccess@example.com', roles: [UserRole.ADMIN, UserRole.AIR_QUALITY, UserRole.TREE_MANAGEMENT, UserRole.GOVERNMENT_EMISSION] },
];

// Find a user by email
async function findUserByEmail(email: string): Promise<{ id: string } | null> {
  try {
    const result = await db.query(
      'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Error finding user with email ${email}:`, error);
    return null;
  }
}

// Add a role to a user
async function addRoleToUser(userId: string, role: UserRole): Promise<boolean> {
  try {
    // Check if the role already exists
    const existingRole = await db.query(
      'SELECT * FROM user_roles WHERE user_id = $1 AND role = $2',
      [userId, role]
    );

    if (existingRole.rows.length > 0) {
      console.log(`Role ${role} already exists for user ${userId}`);
      return true;
    }

    // Add the new role
    await db.query(
      'INSERT INTO user_roles (id, user_id, role, created_at) VALUES (uuid_generate_v4(), $1, $2, NOW())',
      [userId, role]
    );
    console.log(`Added role ${role} to user ${userId}`);
    return true;
  } catch (error) {
    console.error(`Error adding role ${role} to user ${userId}:`, error);
    return false;
  }
}

// Create a user if it doesn't exist
async function ensureUserExists(email: string): Promise<string | null> {
  try {
    let user = await findUserByEmail(email);
    
    if (!user) {
      console.log(`User with email ${email} not found. Creating new user...`);
      
      // Generate a default password for development
      const defaultPassword = 'password123'; // For development only
      const hashedPassword = await hashPassword(defaultPassword);
      
      // Insert new user
      const userResult = await db.query(
        `INSERT INTO users (email, encrypted_password, created_at, updated_at) 
         VALUES ($1, $2, NOW(), NOW()) RETURNING id`,
        [email, hashedPassword]
      );
      
      user = userResult.rows[0];
      console.log(`Created new user with email ${email} and id ${user.id}`);
      console.log(`Default password for ${email}: ${defaultPassword}`);
    }
    
    return user.id;
  } catch (error) {
    console.error(`Error ensuring user exists for email ${email}:`, error);
    return null;
  }
}

// Main setup function
async function setupDevelopmentRoles() {
  console.log('Setting up development user roles...');
  
  for (const devUser of devUsers) {
    const userId = await ensureUserExists(devUser.email);
    
    if (userId) {
      console.log(`Processing user ${devUser.email}...`);
      
      // Add each role to the user
      for (const role of devUser.roles) {
        await addRoleToUser(userId, role);
      }
    }
  }
  
  console.log('Development user roles setup complete!');
  process.exit(0);
}

// Run the setup
setupDevelopmentRoles().catch(error => {
  console.error('Error setting up development roles:', error);
  process.exit(1);
});
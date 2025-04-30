import jwt, { Secret } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_CONFIG, BCRYPT_CONFIG } from "../config/jwt";

/**
 * Generates a JWT token for a user
 */
export const generateToken = (payload: Record<string, any>): string => {
  return jwt.sign(payload, JWT_CONFIG.secret as Secret, {
    expiresIn: JWT_CONFIG.expiresIn,
  });
};

/**
 * Verifies a JWT token and returns the payload if valid
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_CONFIG.secret);
  } catch (error) {
    return null;
  }
};

/**
 * Hashes a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, BCRYPT_CONFIG.saltRounds);
};

/**
 * Compares a plain password with a hashed password
 */
export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

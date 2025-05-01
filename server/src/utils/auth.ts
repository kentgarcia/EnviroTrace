import jwt, { Secret, SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_CONFIG, BCRYPT_CONFIG } from "../config/jwt.js";

/**
 * Generates a JWT token for a user
 */
export const generateToken = (payload: Record<string, any>): string => {
  // Using type assertions to ensure compatibility with jwt.sign
  const secret: Secret = JWT_CONFIG.secret;
  const options: SignOptions = {
    // Using type assertion to handle the expiresIn string value
    expiresIn: JWT_CONFIG.expiresIn as jwt.SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
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

import dotenv from "dotenv";
import { Secret } from "jsonwebtoken";

dotenv.config();

// JWT configuration
export const JWT_CONFIG = {
  secret: (process.env.JWT_SECRET ||
    "your-secret-key-for-jwt-token-generation") as Secret,
  expiresIn: process.env.JWT_EXPIRES_IN || "24h",
};

// Password hashing configuration
export const BCRYPT_CONFIG = {
  saltRounds: 10,
};

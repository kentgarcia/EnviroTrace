import { verifyToken } from "../utils/auth.js";

/**
 * Middleware to extract and verify JWT token from request headers
 */
export const authMiddleware = (req) => {
  // Get the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1] || "";

  if (!token) {
    return { user: null };
  }

  try {
    // Verify token and extract user data
    const user = verifyToken(token);
    return { user };
  } catch (error) {
    // Invalid token
    return { user: null };
  }
};

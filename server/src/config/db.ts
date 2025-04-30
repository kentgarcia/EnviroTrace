import { dbManager } from "../db/dbManager";
import dotenv from "dotenv";

dotenv.config();

// Re-export the database manager's pool for backward compatibility
export const pool = dbManager.getPool();

// Export utility methods for database operations
export const db = {
  query: (text: string, params?: any[]) => dbManager.query(text, params),
  transaction: dbManager.transaction.bind(dbManager),
  getPool: () => dbManager.getPool(),
  close: () => dbManager.close(),
};

import { Pool, PoolClient } from "pg";
import dotenv from "dotenv";

dotenv.config();

/**
 * Database Manager singleton for managing PostgreSQL connections
 */
class DatabaseManager {
  private static instance: DatabaseManager;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || "5432"),
      max: parseInt(process.env.DB_MAX_CONNECTIONS || "20"), // Maximum number of clients
      idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
      connectionTimeoutMillis: 2000, // How long to wait for a connection
    });

    // Log errors
    this.pool.on("error", (err) => {
      console.error("Unexpected error on idle database client", err);
    });

    // Log connection
    console.log(
      `Connected to PostgreSQL database: ${process.env.DB_NAME} on ${process.env.DB_HOST}`
    );
  }

  /**
   * Get the singleton instance of DatabaseManager
   */
  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Get the connection pool
   */
  public getPool(): Pool {
    return this.pool;
  }

  /**
   * Execute a query using a client from the pool
   * @param queryText The SQL query text
   * @param params The query parameters
   * @returns The query result
   */
  public async query(queryText: string, params: any[] = []) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(queryText, params);
      return result;
    } finally {
      client.release();
    }
  }

  /**
   * Execute multiple queries in a transaction
   * @param queries Array of query objects with text and params
   * @returns Array of query results
   */
  public async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const result = await callback(client);

      await client.query("COMMIT");
      return result;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * Close all pool connections
   */
  public async close() {
    await this.pool.end();
    console.log("Database connection pool closed");
  }
}

// Export a singleton instance of the database manager
export const dbManager = DatabaseManager.getInstance();

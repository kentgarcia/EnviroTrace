import { db } from "../../config/db.js";
import {
  SeedlingRequest,
  UrbanGreening,
  SeedlingRequestFilters,
  UrbanGreeningFilters,
  SeedlingItem,
  UrbanGreeningItem,
  UrbanOverview,
} from "./types.js";
import { ErrorType, AppError } from "../../middlewares/errorMiddleware.js";

/**
 * Repository for urban greening management database operations
 */
export const UrbanRepository = {
  // Seedling Request Operations
  async findAllSeedlingRequests(
    filters?: SeedlingRequestFilters
  ): Promise<SeedlingRequest[]> {
    try {
      let query = `
        SELECT 
          id, 
          date_received AS "dateReceived",
          requester_name AS "requesterName",
          address,
          items,
          notes,
          created_at AS "createdAt",
          created_by AS "createdBy",
          updated_at AS "updatedAt",
          updated_by AS "updatedBy"
        FROM seedling_requests
        WHERE 1=1
      `;

      const queryParams: any[] = [];
      let paramCounter = 1;

      if (filters) {
        if (filters.requesterName) {
          query += ` AND requester_name ILIKE $${paramCounter++}`;
          queryParams.push(`%${filters.requesterName}%`);
        }

        if (filters.startDate) {
          query += ` AND date_received >= $${paramCounter++}`;
          queryParams.push(filters.startDate);
        }

        if (filters.endDate) {
          query += ` AND date_received <= $${paramCounter++}`;
          queryParams.push(filters.endDate);
        }
      }

      query += " ORDER BY date_received DESC";

      const result = await db.query(query, queryParams);
      return result.rows;
    } catch (error) {
      console.error("Database error in findAllSeedlingRequests:", error);
      throw new AppError(
        "Failed to retrieve seedling requests",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  async findSeedlingRequestById(id: string): Promise<SeedlingRequest | null> {
    try {
      const result = await db.query(
        `SELECT 
          id, 
          date_received AS "dateReceived",
          requester_name AS "requesterName",
          address,
          items,
          notes,
          created_at AS "createdAt",
          created_by AS "createdBy",
          updated_at AS "updatedAt",
          updated_by AS "updatedBy"
        FROM seedling_requests
        WHERE id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("Database error in findSeedlingRequestById:", error);
      throw new AppError(
        "Failed to retrieve seedling request",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  async createSeedlingRequest(
    requestData: Omit<SeedlingRequest, "id" | "createdAt" | "updatedAt">,
    userId: string
  ): Promise<SeedlingRequest> {
    try {
      const result = await db.query(
        `INSERT INTO seedling_requests
         (date_received, requester_name, address, items, notes, created_by, updated_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $6, NOW(), NOW())
         RETURNING 
           id, 
           date_received AS "dateReceived",
           requester_name AS "requesterName",
           address,
           items,
           notes,
           created_at AS "createdAt",
           created_by AS "createdBy",
           updated_at AS "updatedAt",
           updated_by AS "updatedBy"`,
        [
          requestData.dateReceived,
          requestData.requesterName,
          requestData.address,
          JSON.stringify(requestData.items),
          requestData.notes || null,
          userId,
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Database error in createSeedlingRequest:", error);
      throw new AppError(
        "Failed to create seedling request",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  async updateSeedlingRequest(
    id: string,
    requestData: Partial<
      Omit<SeedlingRequest, "id" | "createdAt" | "createdBy" | "updatedAt">
    >,
    userId: string
  ): Promise<SeedlingRequest> {
    try {
      const updateFields = [];
      const queryParams = [id]; // First parameter is always id
      let paramCounter = 2; // Start from 2 since id is $1

      if (requestData.dateReceived !== undefined) {
        updateFields.push(`date_received = $${paramCounter++}`);
        queryParams.push(requestData.dateReceived);
      }

      if (requestData.requesterName !== undefined) {
        updateFields.push(`requester_name = $${paramCounter++}`);
        queryParams.push(requestData.requesterName);
      }

      if (requestData.address !== undefined) {
        updateFields.push(`address = $${paramCounter++}`);
        queryParams.push(requestData.address);
      }

      if (requestData.items !== undefined) {
        updateFields.push(`items = $${paramCounter++}`);
        queryParams.push(JSON.stringify(requestData.items));
      }

      if (requestData.notes !== undefined) {
        updateFields.push(`notes = $${paramCounter++}`);
        queryParams.push(requestData.notes);
      }

      // Always update updated_at timestamp and updated_by
      updateFields.push(`updated_at = NOW()`);
      updateFields.push(`updated_by = $${paramCounter++}`);
      queryParams.push(userId);

      // If no fields to update, return the existing request
      if (updateFields.length <= 2) {
        return (await this.findSeedlingRequestById(id)) as SeedlingRequest;
      }

      const result = await db.query(
        `UPDATE seedling_requests
         SET ${updateFields.join(", ")}
         WHERE id = $1
         RETURNING 
           id, 
           date_received AS "dateReceived",
           requester_name AS "requesterName",
           address,
           items,
           notes,
           created_at AS "createdAt",
           created_by AS "createdBy",
           updated_at AS "updatedAt",
           updated_by AS "updatedBy"`,
        queryParams
      );

      return result.rows[0];
    } catch (error) {
      console.error("Database error in updateSeedlingRequest:", error);
      throw new AppError(
        "Failed to update seedling request",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  async deleteSeedlingRequest(id: string): Promise<boolean> {
    try {
      const result = await db.query(
        "DELETE FROM seedling_requests WHERE id = $1",
        [id]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error("Database error in deleteSeedlingRequest:", error);
      throw new AppError(
        "Failed to delete seedling request",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  // Urban Greening Operations
  async findAllUrbanGreening(
    filters?: UrbanGreeningFilters
  ): Promise<UrbanGreening[]> {
    try {
      let query = `
        SELECT 
          id, 
          date,
          establishment_name AS "establishmentName",
          planted_by AS "plantedBy",
          items,
          total,
          type,
          status,
          notes,
          created_at AS "createdAt",
          created_by AS "createdBy",
          updated_at AS "updatedAt",
          updated_by AS "updatedBy"
        FROM urban_greening
        WHERE 1=1
      `;

      const queryParams: any[] = [];
      let paramCounter = 1;

      if (filters) {
        if (filters.establishmentName) {
          query += ` AND establishment_name ILIKE $${paramCounter++}`;
          queryParams.push(`%${filters.establishmentName}%`);
        }

        if (filters.type) {
          query += ` AND type ILIKE $${paramCounter++}`;
          queryParams.push(`%${filters.type}%`);
        }

        if (filters.status) {
          query += ` AND status ILIKE $${paramCounter++}`;
          queryParams.push(`%${filters.status}%`);
        }

        if (filters.startDate) {
          query += ` AND date >= $${paramCounter++}`;
          queryParams.push(filters.startDate);
        }

        if (filters.endDate) {
          query += ` AND date <= $${paramCounter++}`;
          queryParams.push(filters.endDate);
        }
      }

      query += " ORDER BY date DESC";

      const result = await db.query(query, queryParams);
      return result.rows;
    } catch (error) {
      console.error("Database error in findAllUrbanGreening:", error);
      throw new AppError(
        "Failed to retrieve urban greening records",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  async findUrbanGreeningById(id: string): Promise<UrbanGreening | null> {
    try {
      const result = await db.query(
        `SELECT 
          id, 
          date,
          establishment_name AS "establishmentName",
          planted_by AS "plantedBy",
          items,
          total,
          type,
          status,
          notes,
          created_at AS "createdAt",
          created_by AS "createdBy",
          updated_at AS "updatedAt",
          updated_by AS "updatedBy"
        FROM urban_greening
        WHERE id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("Database error in findUrbanGreeningById:", error);
      throw new AppError(
        "Failed to retrieve urban greening record",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  async createUrbanGreening(
    greeningData: Omit<UrbanGreening, "id" | "createdAt" | "updatedAt">,
    userId: string
  ): Promise<UrbanGreening> {
    try {
      const result = await db.query(
        `INSERT INTO urban_greening
         (date, establishment_name, planted_by, items, total, type, status, notes, created_by, updated_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9, NOW(), NOW())
         RETURNING 
           id, 
           date,
           establishment_name AS "establishmentName",
           planted_by AS "plantedBy",
           items,
           total,
           type,
           status,
           notes,
           created_at AS "createdAt",
           created_by AS "createdBy",
           updated_at AS "updatedAt",
           updated_by AS "updatedBy"`,
        [
          greeningData.date,
          greeningData.establishmentName,
          greeningData.plantedBy,
          JSON.stringify(greeningData.items),
          greeningData.total,
          greeningData.type,
          greeningData.status,
          greeningData.notes || null,
          userId,
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Database error in createUrbanGreening:", error);
      throw new AppError(
        "Failed to create urban greening record",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  async updateUrbanGreening(
    id: string,
    greeningData: Partial<
      Omit<UrbanGreening, "id" | "createdAt" | "createdBy" | "updatedAt">
    >,
    userId: string
  ): Promise<UrbanGreening> {
    try {
      const updateFields = [];
      const queryParams = [id]; // First parameter is always id
      let paramCounter = 2; // Start from 2 since id is $1

      if (greeningData.date !== undefined) {
        updateFields.push(`date = $${paramCounter++}`);
        queryParams.push(greeningData.date);
      }

      if (greeningData.establishmentName !== undefined) {
        updateFields.push(`establishment_name = $${paramCounter++}`);
        queryParams.push(greeningData.establishmentName);
      }

      if (greeningData.plantedBy !== undefined) {
        updateFields.push(`planted_by = $${paramCounter++}`);
        queryParams.push(greeningData.plantedBy);
      }

      if (greeningData.items !== undefined) {
        updateFields.push(`items = $${paramCounter++}`);
        queryParams.push(JSON.stringify(greeningData.items));
      }

      if (greeningData.total !== undefined) {
        updateFields.push(`total = $${paramCounter++}`);
        queryParams.push(String(greeningData.total));
      }

      if (greeningData.type !== undefined) {
        updateFields.push(`type = $${paramCounter++}`);
        queryParams.push(greeningData.type);
      }

      if (greeningData.status !== undefined) {
        updateFields.push(`status = $${paramCounter++}`);
        queryParams.push(greeningData.status);
      }

      if (greeningData.notes !== undefined) {
        updateFields.push(`notes = $${paramCounter++}`);
        queryParams.push(greeningData.notes);
      }

      // Always update updated_at timestamp and updated_by
      updateFields.push(`updated_at = NOW()`);
      updateFields.push(`updated_by = $${paramCounter++}`);
      queryParams.push(userId);

      // If no fields to update, return the existing record
      if (updateFields.length <= 2) {
        return (await this.findUrbanGreeningById(id)) as UrbanGreening;
      }

      const result = await db.query(
        `UPDATE urban_greening
         SET ${updateFields.join(", ")}
         WHERE id = $1
         RETURNING 
           id, 
           date,
           establishment_name AS "establishmentName",
           planted_by AS "plantedBy",
           items,
           total,
           type,
           status,
           notes,
           created_at AS "createdAt",
           created_by AS "createdBy",
           updated_at AS "updatedAt",
           updated_by AS "updatedBy"`,
        queryParams
      );

      return result.rows[0];
    } catch (error) {
      console.error("Database error in updateUrbanGreening:", error);
      throw new AppError(
        "Failed to update urban greening record",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  async deleteUrbanGreening(id: string): Promise<boolean> {
    try {
      const result = await db.query(
        "DELETE FROM urban_greening WHERE id = $1",
        [id]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error("Database error in deleteUrbanGreening:", error);
      throw new AppError(
        "Failed to delete urban greening record",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  async getUrbanOverview(year: number): Promise<UrbanOverview> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    try {
      // Get plant saplings collected (from seedling requests)
      const saplingsResult = await db.query(
        `SELECT COALESCE(SUM((item->>'quantity')::integer), 0) as total
         FROM seedling_requests,
         jsonb_array_elements(items::jsonb) as item
         WHERE date_received BETWEEN $1 AND $2`,
        [startDate, endDate]
      );

      // Get urban greening stats
      const greeningResult = await db.query(
        `SELECT 
           COALESCE(SUM(CASE WHEN type = 'ornamentals' THEN total ELSE 0 END), 0) as ornamentalPlants,
           COALESCE(SUM(CASE WHEN type = 'trees' THEN total ELSE 0 END), 0) as trees
         FROM urban_greening
         WHERE date BETWEEN $1 AND $2`,
        [startDate, endDate]
      );

      // Get urban greening breakdown
      const breakdownResult = await db.query(
        `SELECT 
           COALESCE(SUM(CASE WHEN type = 'seeds' THEN total ELSE 0 END), 0) as seeds,
           COALESCE(SUM(CASE WHEN type = 'seeds_private' THEN total ELSE 0 END), 0) as seedsPrivate,
           COALESCE(SUM(CASE WHEN type = 'trees' THEN total ELSE 0 END), 0) as trees,
           COALESCE(SUM(CASE WHEN type = 'ornamentals' THEN total ELSE 0 END), 0) as ornamentals
         FROM urban_greening
         WHERE date BETWEEN $1 AND $2`,
        [startDate, endDate]
      );

      return {
        plantSaplingsCollected: Number(saplingsResult.rows[0]?.total || 0),
        urbanGreening: {
          ornamentalPlants: Number(
            greeningResult.rows[0]?.ornamentalPlants || 0
          ),
          trees: Number(greeningResult.rows[0]?.trees || 0),
        },
        urbanGreeningBreakdown: {
          seeds: Number(breakdownResult.rows[0]?.seeds || 0),
          seedsPrivate: Number(breakdownResult.rows[0]?.seedsPrivate || 0),
          trees: Number(breakdownResult.rows[0]?.trees || 0),
          ornamentals: Number(breakdownResult.rows[0]?.ornamentals || 0),
        },
      };
    } catch (error) {
      console.error("Database error in getUrbanOverview:", error);
      throw new AppError(
        "Failed to retrieve urban overview data",
        ErrorType.DATABASE_ERROR
      );
    }
  },
};

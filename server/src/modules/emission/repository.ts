import { db } from "../../config/db.js";
import {
  EmissionTest,
  EmissionTestSchedule,
  Vehicle,
  VehicleSummary,
  EmissionTestFilters,
  VehicleFilters,
} from "./types.js";
import { ErrorType, AppError } from "../../middlewares/errorMiddleware.js";

/**
 * Repository for emission management database operations
 */
export const EmissionRepository = {
  // Vehicle operations
  async findAllVehicles(filters?: VehicleFilters): Promise<Vehicle[]> {
    try {
      let query = `
        SELECT 
          id, 
          driver_name AS "driverName", 
          contact_number AS "contactNumber", 
          engine_type AS "engineType",
          office_name AS "officeName",
          plate_number AS "plateNumber",
          vehicle_type AS "vehicleType",
          wheels,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM vehicles
        WHERE 1=1
      `;

      const queryParams: any[] = [];
      let paramCounter = 1;

      if (filters) {
        if (filters.plateNumber) {
          query += ` AND plate_number ILIKE $${paramCounter++}`;
          queryParams.push(`%${filters.plateNumber}%`);
        }

        if (filters.driverName) {
          query += ` AND driver_name ILIKE $${paramCounter++}`;
          queryParams.push(`%${filters.driverName}%`);
        }

        if (filters.officeName) {
          query += ` AND office_name ILIKE $${paramCounter++}`;
          queryParams.push(`%${filters.officeName}%`);
        }

        if (filters.vehicleType) {
          query += ` AND vehicle_type ILIKE $${paramCounter++}`;
          queryParams.push(`%${filters.vehicleType}%`);
        }
      }

      query += " ORDER BY created_at DESC";

      const result = await db.query(query, queryParams);
      return result.rows;
    } catch (error) {
      console.error("Database error in findAllVehicles:", error);
      throw new AppError(
        "Failed to retrieve vehicles",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  async findVehicleById(id: string): Promise<Vehicle | null> {
    try {
      const result = await db.query(
        `SELECT 
          id, 
          driver_name AS "driverName", 
          contact_number AS "contactNumber", 
          engine_type AS "engineType",
          office_name AS "officeName",
          plate_number AS "plateNumber",
          vehicle_type AS "vehicleType",
          wheels,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM vehicles
        WHERE id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("Database error in findVehicleById:", error);
      throw new AppError(
        "Failed to retrieve vehicle",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  async createVehicle(
    vehicleData: Omit<Vehicle, "id" | "createdAt" | "updatedAt">
  ): Promise<Vehicle> {
    try {
      const result = await db.query(
        `INSERT INTO vehicles
         (driver_name, contact_number, engine_type, office_name, plate_number, vehicle_type, wheels, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING 
           id, 
           driver_name AS "driverName", 
           contact_number AS "contactNumber", 
           engine_type AS "engineType",
           office_name AS "officeName",
           plate_number AS "plateNumber",
           vehicle_type AS "vehicleType",
           wheels,
           created_at AS "createdAt",
           updated_at AS "updatedAt"`,
        [
          vehicleData.driverName,
          vehicleData.contactNumber,
          vehicleData.engineType,
          vehicleData.officeName,
          vehicleData.plateNumber,
          vehicleData.vehicleType,
          vehicleData.wheels,
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Database error in createVehicle:", error);
      throw new AppError("Failed to create vehicle", ErrorType.DATABASE_ERROR);
    }
  },

  async updateVehicle(
    id: string,
    vehicleData: Partial<Omit<Vehicle, "id" | "createdAt" | "updatedAt">>
  ): Promise<Vehicle> {
    try {
      const updateFields = [];
      const queryParams = [id]; // First parameter is always id
      let paramCounter = 2; // Start from 2 since id is $1

      if (vehicleData.driverName !== undefined) {
        updateFields.push(`driver_name = $${paramCounter++}`);
        queryParams.push(vehicleData.driverName);
      }

      if (vehicleData.contactNumber !== undefined) {
        updateFields.push(`contact_number = $${paramCounter++}`);
        queryParams.push(vehicleData.contactNumber);
      }

      if (vehicleData.engineType !== undefined) {
        updateFields.push(`engine_type = $${paramCounter++}`);
        queryParams.push(vehicleData.engineType);
      }

      if (vehicleData.officeName !== undefined) {
        updateFields.push(`office_name = $${paramCounter++}`);
        queryParams.push(vehicleData.officeName);
      }

      if (vehicleData.plateNumber !== undefined) {
        updateFields.push(`plate_number = $${paramCounter++}`);
        queryParams.push(vehicleData.plateNumber);
      }

      if (vehicleData.vehicleType !== undefined) {
        updateFields.push(`vehicle_type = $${paramCounter++}`);
        queryParams.push(vehicleData.vehicleType);
      }

      if (vehicleData.wheels !== undefined) {
        updateFields.push(`wheels = $${paramCounter++}`);
        queryParams.push(String(vehicleData.wheels)); // Convert wheels number to string
      }

      // Always update updated_at timestamp
      updateFields.push(`updated_at = NOW()`);

      // If no fields to update, return the existing vehicle
      if (updateFields.length === 1) {
        return (await this.findVehicleById(id)) as Vehicle;
      }

      const result = await db.query(
        `UPDATE vehicles
         SET ${updateFields.join(", ")}
         WHERE id = $1
         RETURNING 
           id, 
           driver_name AS "driverName", 
           contact_number AS "contactNumber", 
           engine_type AS "engineType",
           office_name AS "officeName",
           plate_number AS "plateNumber",
           vehicle_type AS "vehicleType",
           wheels,
           created_at AS "createdAt",
           updated_at AS "updatedAt"`,
        queryParams
      );

      return result.rows[0];
    } catch (error) {
      console.error("Database error in updateVehicle:", error);
      throw new AppError("Failed to update vehicle", ErrorType.DATABASE_ERROR);
    }
  },

  async deleteVehicle(id: string): Promise<boolean> {
    try {
      const result = await db.query("DELETE FROM vehicles WHERE id = $1", [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error("Database error in deleteVehicle:", error);
      throw new AppError("Failed to delete vehicle", ErrorType.DATABASE_ERROR);
    }
  },

  async findVehicleSummaries(
    filters?: VehicleFilters
  ): Promise<VehicleSummary[]> {
    try {
      let query = `
        SELECT 
          v.id,
          v.driver_name AS "driverName", 
          v.contact_number AS "contactNumber", 
          v.engine_type AS "engineType",
          v.office_name AS "officeName",
          v.plate_number AS "plateNumber",
          v.vehicle_type AS "vehicleType",
          v.wheels,
          latest_tests.test_date AS "latestTestDate",
          latest_tests.quarter AS "latestTestQuarter",
          latest_tests.year AS "latestTestYear",
          latest_tests.result AS "latestTestResult"
        FROM vehicles v
        LEFT JOIN LATERAL (
          SELECT 
            et.test_date,
            et.quarter,
            et.year,
            et.result
          FROM 
            emission_tests et
          WHERE 
            et.vehicle_id = v.id
          ORDER BY 
            et.year DESC, 
            et.quarter DESC,
            et.test_date DESC
          LIMIT 1
        ) latest_tests ON true
        WHERE 1=1
      `;

      const queryParams: any[] = [];
      let paramCounter = 1;

      if (filters) {
        if (filters.plateNumber) {
          query += ` AND v.plate_number ILIKE $${paramCounter++}`;
          queryParams.push(`%${filters.plateNumber}%`);
        }

        if (filters.driverName) {
          query += ` AND v.driver_name ILIKE $${paramCounter++}`;
          queryParams.push(`%${filters.driverName}%`);
        }

        if (filters.officeName) {
          query += ` AND v.office_name ILIKE $${paramCounter++}`;
          queryParams.push(`%${filters.officeName}%`);
        }

        if (filters.vehicleType) {
          query += ` AND v.vehicle_type ILIKE $${paramCounter++}`;
          queryParams.push(`%${filters.vehicleType}%`);
        }
      }

      query += " ORDER BY v.created_at DESC";

      const result = await db.query(query, queryParams);
      return result.rows;
    } catch (error) {
      console.error("Database error in findVehicleSummaries:", error);
      throw new AppError(
        "Failed to retrieve vehicle summaries",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  async findVehicleSummaryById(id: string): Promise<VehicleSummary | null> {
    try {
      const result = await db.query(
        `SELECT 
          v.id,
          v.driver_name AS "driverName", 
          v.contact_number AS "contactNumber", 
          v.engine_type AS "engineType",
          v.office_name AS "officeName",
          v.plate_number AS "plateNumber",
          v.vehicle_type AS "vehicleType",
          v.wheels,
          latest_tests.test_date AS "latestTestDate",
          latest_tests.quarter AS "latestTestQuarter",
          latest_tests.year AS "latestTestYear",
          latest_tests.result AS "latestTestResult"
        FROM vehicles v
        LEFT JOIN LATERAL (
          SELECT 
            et.test_date,
            et.quarter,
            et.year,
            et.result
          FROM 
            emission_tests et
          WHERE 
            et.vehicle_id = v.id
          ORDER BY 
            et.year DESC, 
            et.quarter DESC,
            et.test_date DESC
          LIMIT 1
        ) latest_tests ON true
        WHERE v.id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("Database error in findVehicleSummaryById:", error);
      throw new AppError(
        "Failed to retrieve vehicle summary",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  // Emission Test operations
  async findAllEmissionTests(
    filters?: EmissionTestFilters
  ): Promise<EmissionTest[]> {
    try {
      let query = `
        SELECT 
          et.id, 
          et.vehicle_id AS "vehicleId", 
          et.test_date AS "testDate", 
          et.quarter,
          et.year,
          et.result,
          et.created_by AS "createdBy",
          et.created_at AS "createdAt",
          et.updated_at AS "updatedAt"
        FROM emission_tests et
        WHERE 1=1
      `;

      const queryParams: any[] = [];
      let paramCounter = 1;

      if (filters) {
        if (filters.year !== undefined) {
          query += ` AND et.year = $${paramCounter++}`;
          queryParams.push(filters.year);
        }

        if (filters.quarter !== undefined) {
          query += ` AND et.quarter = $${paramCounter++}`;
          queryParams.push(filters.quarter);
        }

        if (filters.vehicleId) {
          query += ` AND et.vehicle_id = $${paramCounter++}`;
          queryParams.push(String(filters.vehicleId)); // Convert to string to ensure type compatibility
        }

        if (filters.result !== undefined) {
          query += ` AND et.result = $${paramCounter++}`;
          queryParams.push(filters.result);
        }
      }

      query += " ORDER BY et.year DESC, et.quarter DESC, et.test_date DESC";

      const result = await db.query(query, queryParams);
      return result.rows;
    } catch (error) {
      console.error("Database error in findAllEmissionTests:", error);
      throw new AppError(
        "Failed to retrieve emission tests",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  async findEmissionTestById(id: string): Promise<EmissionTest | null> {
    try {
      const result = await db.query(
        `SELECT 
          id, 
          vehicle_id AS "vehicleId", 
          test_date AS "testDate", 
          quarter,
          year,
          result,
          created_by AS "createdBy",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM emission_tests
        WHERE id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("Database error in findEmissionTestById:", error);
      throw new AppError(
        "Failed to retrieve emission test",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  async createEmissionTest(
    testData: Omit<EmissionTest, "id" | "createdAt" | "updatedAt" | "vehicle">,
    userId?: string
  ): Promise<EmissionTest> {
    try {
      const result = await db.query(
        `INSERT INTO emission_tests
         (vehicle_id, test_date, quarter, year, result, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING 
           id, 
           vehicle_id AS "vehicleId", 
           test_date AS "testDate", 
           quarter,
           year,
           result,
           created_by AS "createdBy",
           created_at AS "createdAt",
           updated_at AS "updatedAt"`,
        [
          String(testData.vehicleId),
          testData.testDate instanceof Date
            ? testData.testDate.toISOString()
            : testData.testDate,
          testData.quarter,
          testData.year,
          typeof testData.result === "boolean"
            ? String(testData.result)
            : testData.result,
          userId || null,
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Database error in createEmissionTest:", error);
      throw new AppError(
        "Failed to create emission test",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  async updateEmissionTest(
    id: string,
    testData: Partial<
      Omit<
        EmissionTest,
        "id" | "createdAt" | "updatedAt" | "vehicle" | "createdBy"
      >
    >
  ): Promise<EmissionTest> {
    try {
      const updateFields = [];
      const queryParams = [id]; // First parameter is always id
      let paramCounter = 2; // Start from 2 since id is $1

      if (testData.vehicleId !== undefined) {
        updateFields.push(`vehicle_id = $${paramCounter++}`);
        queryParams.push(String(testData.vehicleId));
      }

      if (testData.testDate !== undefined) {
        updateFields.push(`test_date = $${paramCounter++}`);
        queryParams.push(
          testData.testDate instanceof Date
            ? testData.testDate.toISOString()
            : testData.testDate
        );
      }

      if (testData.quarter !== undefined) {
        updateFields.push(`quarter = $${paramCounter++}`);
        queryParams.push(String(testData.quarter));
      }

      if (testData.year !== undefined) {
        updateFields.push(`year = $${paramCounter++}`);
        queryParams.push(String(testData.year));
      }

      if (testData.result !== undefined) {
        updateFields.push(`result = $${paramCounter++}`);
        queryParams.push(
          typeof testData.result === "boolean"
            ? String(testData.result)
            : testData.result
        );
      }

      // Always update updated_at timestamp
      updateFields.push(`updated_at = NOW()`);

      // If no fields to update, return the existing test
      if (updateFields.length === 1) {
        return (await this.findEmissionTestById(id)) as EmissionTest;
      }

      const result = await db.query(
        `UPDATE emission_tests
         SET ${updateFields.join(", ")}
         WHERE id = $1
         RETURNING 
           id, 
           vehicle_id AS "vehicleId", 
           test_date AS "testDate", 
           quarter,
           year,
           result,
           created_by AS "createdBy",
           created_at AS "createdAt",
           updated_at AS "updatedAt"`,
        queryParams
      );

      return result.rows[0];
    } catch (error) {
      console.error("Database error in updateEmissionTest:", error);
      throw new AppError(
        "Failed to update emission test",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  async deleteEmissionTest(id: string): Promise<boolean> {
    try {
      const result = await db.query(
        "DELETE FROM emission_tests WHERE id = $1",
        [id]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error("Database error in deleteEmissionTest:", error);
      throw new AppError(
        "Failed to delete emission test",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  // Emission Test Schedule operations
  async findAllEmissionTestSchedules(
    year?: number,
    quarter?: number
  ): Promise<EmissionTestSchedule[]> {
    try {
      let query = `
        SELECT 
          id, 
          assigned_personnel AS "assignedPersonnel", 
          conducted_on AS "conductedOn", 
          location,
          quarter,
          year,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM emission_test_schedules
        WHERE 1=1
      `;

      const queryParams: any[] = [];
      let paramCounter = 1;

      if (year !== undefined) {
        query += ` AND year = $${paramCounter++}`;
        queryParams.push(year);
      }

      if (quarter !== undefined) {
        query += ` AND quarter = $${paramCounter++}`;
        queryParams.push(quarter);
      }

      query += " ORDER BY year DESC, quarter DESC, conducted_on ASC";

      const result = await db.query(query, queryParams);
      return result.rows;
    } catch (error) {
      console.error("Database error in findAllEmissionTestSchedules:", error);
      throw new AppError(
        "Failed to retrieve emission test schedules",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  async findEmissionTestScheduleById(
    id: string
  ): Promise<EmissionTestSchedule | null> {
    try {
      const result = await db.query(
        `SELECT 
          id, 
          assigned_personnel AS "assignedPersonnel", 
          conducted_on AS "conductedOn", 
          location,
          quarter,
          year,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM emission_test_schedules
        WHERE id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("Database error in findEmissionTestScheduleById:", error);
      throw new AppError(
        "Failed to retrieve emission test schedule",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  async createEmissionTestSchedule(
    scheduleData: Omit<EmissionTestSchedule, "id" | "createdAt" | "updatedAt">
  ): Promise<EmissionTestSchedule> {
    try {
      const result = await db.query(
        `INSERT INTO emission_test_schedules
         (assigned_personnel, conducted_on, location, quarter, year, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING 
           id, 
           assigned_personnel AS "assignedPersonnel", 
           conducted_on AS "conductedOn", 
           location,
           quarter,
           year,
           created_at AS "createdAt",
           updated_at AS "updatedAt"`,
        [
          scheduleData.assignedPersonnel,
          scheduleData.conductedOn instanceof Date
            ? scheduleData.conductedOn.toISOString()
            : scheduleData.conductedOn,
          scheduleData.location,
          String(scheduleData.quarter),
          String(scheduleData.year),
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Database error in createEmissionTestSchedule:", error);
      throw new AppError(
        "Failed to create emission test schedule",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  async updateEmissionTestSchedule(
    id: string,
    scheduleData: Partial<
      Omit<EmissionTestSchedule, "id" | "createdAt" | "updatedAt">
    >
  ): Promise<EmissionTestSchedule> {
    try {
      const updateFields = [];
      const queryParams = [id]; // First parameter is always id
      let paramCounter = 2; // Start from 2 since id is $1

      if (scheduleData.assignedPersonnel !== undefined) {
        updateFields.push(`assigned_personnel = $${paramCounter++}`);
        queryParams.push(scheduleData.assignedPersonnel);
      }

      if (scheduleData.conductedOn !== undefined) {
        updateFields.push(`conducted_on = $${paramCounter++}`);
        queryParams.push(
          scheduleData.conductedOn instanceof Date
            ? scheduleData.conductedOn.toISOString()
            : scheduleData.conductedOn
        );
      }

      if (scheduleData.location !== undefined) {
        updateFields.push(`location = $${paramCounter++}`);
        queryParams.push(scheduleData.location);
      }

      if (scheduleData.quarter !== undefined) {
        updateFields.push(`quarter = $${paramCounter++}`);
        queryParams.push(String(scheduleData.quarter));
      }

      if (scheduleData.year !== undefined) {
        updateFields.push(`year = $${paramCounter++}`);
        queryParams.push(String(scheduleData.year));
      }

      // Always update updated_at timestamp
      updateFields.push(`updated_at = NOW()`);

      // If no fields to update, return the existing schedule
      if (updateFields.length === 1) {
        return (await this.findEmissionTestScheduleById(
          id
        )) as EmissionTestSchedule;
      }

      const result = await db.query(
        `UPDATE emission_test_schedules
         SET ${updateFields.join(", ")}
         WHERE id = $1
         RETURNING 
           id, 
           assigned_personnel AS "assignedPersonnel", 
           conducted_on AS "conductedOn", 
           location,
           quarter,
           year,
           created_at AS "createdAt",
           updated_at AS "updatedAt"`,
        queryParams
      );

      return result.rows[0];
    } catch (error) {
      console.error("Database error in updateEmissionTestSchedule:", error);
      throw new AppError(
        "Failed to update emission test schedule",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  async deleteEmissionTestSchedule(id: string): Promise<boolean> {
    try {
      const result = await db.query(
        "DELETE FROM emission_test_schedules WHERE id = $1",
        [id]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error("Database error in deleteEmissionTestSchedule:", error);
      throw new AppError(
        "Failed to delete emission test schedule",
        ErrorType.DATABASE_ERROR
      );
    }
  },

  // Office compliance operations
  async findOfficeCompliance(
    year: number,
    quarter: number,
    searchTerm?: string
  ): Promise<any[]> {
    try {
      // First, get unique office names from vehicles
      let officesQuery = `
        SELECT DISTINCT office_name AS name
        FROM vehicles
        WHERE 1=1
      `;

      const officeQueryParams: any[] = [];
      let officeParamCounter = 1;

      if (searchTerm) {
        officesQuery += ` AND office_name ILIKE $${officeParamCounter++}`;
        officeQueryParams.push(`%${searchTerm}%`);
      }

      officesQuery += " ORDER BY name";

      const officeResult = await db.query(officesQuery, officeQueryParams);
      const offices = officeResult.rows;

      // For each office, calculate compliance metrics
      const officeCompliance = [];

      for (const office of offices) {
        // Generate a code based on the office name (get initials)
        const code = office.name
          .split(" ")
          .map((word: string) => word.charAt(0).toUpperCase())
          .join("");

        // Get vehicles for this office
        const vehiclesResult = await db.query(
          `SELECT id
           FROM vehicles
           WHERE office_name = $1`,
          [office.name]
        );

        const vehicleIds = vehiclesResult.rows.map((v) => v.id);
        const vehicleCount = vehicleIds.length;

        if (vehicleCount === 0) {
          // Skip offices with no vehicles
          continue;
        }

        // Get emission tests for these vehicles in the specified year and quarter
        const emissionTestsResult = await db.query(
          `SELECT vehicle_id, result
           FROM emission_tests
           WHERE year = $1 AND quarter = $2 AND vehicle_id = ANY($3)`,
          [year, quarter, vehicleIds]
        );

        const testedCount = emissionTestsResult.rows.length;
        const passedCount = emissionTestsResult.rows.filter(
          (test) => test.result === true
        ).length;

        // Calculate compliance rate
        const complianceRate =
          vehicleCount > 0 ? Math.round((passedCount / vehicleCount) * 100) : 0;

        officeCompliance.push({
          id: code.toLowerCase(), // Use lowercase code as id
          name: office.name,
          code,
          vehicleCount,
          testedCount,
          passedCount,
          complianceRate,
        });
      }

      return officeCompliance;
    } catch (error) {
      console.error("Database error in findOfficeCompliance:", error);
      throw new AppError(
        "Failed to retrieve office compliance data",
        ErrorType.DATABASE_ERROR
      );
    }
  },
};

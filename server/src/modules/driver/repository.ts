import { dbManager } from "../../db/dbManager.js";
import { Driver, DriverSearchInput, DriverOffense } from "./types.js";

export async function driverSearch(
  input: DriverSearchInput = {}
): Promise<Driver[]> {
  // Build dynamic WHERE clause for belching_records
  const where: string[] = [];
  const params: any[] = [];
  let idx = 1;
  if (input.plateNo) {
    where.push(`LOWER(plate_number) LIKE $${idx++}`);
    params.push(`%${input.plateNo.toLowerCase()}%`);
  }
  if (input.orNo) {
    where.push(`LOWER(order_of_payment) LIKE $${idx++}`);
    params.push(`%${input.orNo.toLowerCase()}%`);
  }
  if (input.transportGroup) {
    where.push(`LOWER(operator) LIKE $${idx++}`);
    params.push(`%${input.transportGroup.toLowerCase()}%`);
  }
  // We'll filter by driverName in the JOINed violations below
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // Query belching_records
  const recordRows = (
    await dbManager.query(
      `SELECT * FROM belching_records ${whereClause} ORDER BY id`,
      params
    )
  ).rows;
  if (recordRows.length === 0) return [];
  const recordIds = recordRows.map((r) => r.id);

  // Query violations for these records
  let violationWhere = "WHERE record_id = ANY($1::int[])";
  let violationParams: any[] = [recordIds];
  if (input.driverName) {
    violationWhere += ` AND LOWER(driver_name) LIKE $2`;
    violationParams.push(`%${input.driverName.toLowerCase()}%`);
  }
  const violationRows = (
    await dbManager.query(
      `SELECT * FROM belching_violations ${violationWhere} ORDER BY date_of_apprehension DESC`,
      violationParams
    )
  ).rows;

  // Group violations by record_id
  const violationsByRecord: Record<number, DriverOffense[]> = {};
  for (const row of violationRows) {
    const offense: DriverOffense = {
      date: row.date_of_apprehension
        ? row.date_of_apprehension.toISOString().split("T")[0]
        : "",
      type: row.driver_offense,
      status: row.operator_offense,
      paid: row.paid,
    };
    if (!violationsByRecord[row.record_id])
      violationsByRecord[row.record_id] = [];
    violationsByRecord[row.record_id].push(offense);
  }

  // Map to Driver shape (one per belching_record)
  return recordRows
    .map((r) => ({
      id: r.id,
      driverName:
        violationRows.find((v) => v.record_id === r.id)?.driver_name || "",
      plateNo: r.plate_number,
      orNo: r.order_of_payment,
      transportGroup: r.operator,
      offenses: violationsByRecord[r.id] || [],
    }))
    .filter(
      (d) =>
        !input.driverName ||
        d.driverName.toLowerCase().includes(input.driverName.toLowerCase())
    );
}

export async function driverById(id: number): Promise<Driver | null> {
  // Not implemented for belching_records yet
  return null;
}

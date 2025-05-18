import { dbManager } from "../../db/dbManager.js";
import { Driver, DriverSearchInput, DriverOffense } from "./types.js";

export async function driverSearch(
  input: DriverSearchInput = {}
): Promise<Driver[]> {
  // Build dynamic WHERE clause
  const where: string[] = [];
  const params: any[] = [];
  let idx = 1;
  if (input.driverName) {
    where.push(`LOWER(driver_name) LIKE $${idx++}`);
    params.push(`%${input.driverName.toLowerCase()}%`);
  }
  if (input.plateNo) {
    where.push(`LOWER(plate_no) LIKE $${idx++}`);
    params.push(`%${input.plateNo.toLowerCase()}%`);
  }
  if (input.orNo) {
    where.push(`LOWER(or_no) LIKE $${idx++}`);
    params.push(`%${input.orNo.toLowerCase()}%`);
  }
  if (input.transportGroup) {
    where.push(`LOWER(transport_group) LIKE $${idx++}`);
    params.push(`%${input.transportGroup.toLowerCase()}%`);
  }
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // Query drivers
  const driverRows = (
    await dbManager.query(
      `SELECT * FROM drivers ${whereClause} ORDER BY driver_name`,
      params
    )
  ).rows;

  // Query offenses for all drivers
  const driverIds = driverRows.map((d) => d.id);
  let offensesByDriver: Record<number, DriverOffense[]> = {};
  if (driverIds.length > 0) {
    const offenseRows = (
      await dbManager.query(
        `SELECT * FROM driver_offenses WHERE driver_id = ANY($1::int[])`,
        [driverIds]
      )
    ).rows;
    for (const row of offenseRows) {
      const offense: DriverOffense = {
        date: row.date,
        type: row.type,
        status: row.status,
        paid: row.paid,
      };
      if (!offensesByDriver[row.driver_id])
        offensesByDriver[row.driver_id] = [];
      offensesByDriver[row.driver_id].push(offense);
    }
  }

  // Map to Driver shape
  return driverRows.map((d) => ({
    id: d.id,
    driverName: d.driver_name,
    plateNo: d.plate_no,
    orNo: d.or_no,
    transportGroup: d.transport_group,
    offenses: offensesByDriver[d.id] || [],
  }));
}

export async function driverById(id: number): Promise<Driver | null> {
  const driverRes = await dbManager.query(
    `SELECT * FROM drivers WHERE id = $1`,
    [id]
  );
  const d = driverRes.rows[0];
  if (!d) return null;
  const offenseRows = (
    await dbManager.query(
      `SELECT * FROM driver_offenses WHERE driver_id = $1`,
      [id]
    )
  ).rows;
  const offenses: DriverOffense[] = offenseRows.map((row) => ({
    date: row.date,
    type: row.type,
    status: row.status,
    paid: row.paid,
  }));
  return {
    id: d.id,
    driverName: d.driver_name,
    plateNo: d.plate_no,
    orNo: d.or_no,
    transportGroup: d.transport_group,
    offenses,
  };
}

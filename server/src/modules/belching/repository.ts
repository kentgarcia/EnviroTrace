import { dbManager } from "../../db/dbManager.js";
import {
  BelchingFee,
  BelchingFeeInput,
  BelchingRecord,
  BelchingRecordInput,
  BelchingRecordHistory,
  BelchingRecordHistoryInput,
  BelchingViolation,
  BelchingViolationInput,
} from "./types.js";

export const getBelchingFees = async (): Promise<BelchingFee[]> => {
  const result = await dbManager.query(
    "SELECT * FROM belching_fees ORDER BY id"
  );
  return result.rows.map((row) => ({
    ...row,
    effectiveDate: row.effective_date
      ? row.effective_date.toISOString().split("T")[0]
      : "",
    level: row.level,
  }));
};

export const getBelchingFeeById = async (
  id: number
): Promise<BelchingFee | null> => {
  const result = await dbManager.query(
    "SELECT * FROM belching_fees WHERE id = $1",
    [id]
  );
  if (!result.rows[0]) return null;
  const row = result.rows[0];
  return {
    ...row,
    effectiveDate: row.effective_date
      ? row.effective_date.toISOString().split("T")[0]
      : "",
    level: row.level,
  };
};

export const createBelchingFee = async (
  input: BelchingFeeInput
): Promise<BelchingFee> => {
  const result = await dbManager.query(
    `INSERT INTO belching_fees (amount, category, level, effective_date) VALUES ($1, $2, $3, $4) RETURNING *`,
    [input.amount, input.category, input.level, input.effectiveDate]
  );
  const row = result.rows[0];
  return {
    ...row,
    effectiveDate: row.effective_date
      ? row.effective_date.toISOString().split("T")[0]
      : "",
    level: row.level,
  };
};

export const updateBelchingFee = async (
  id: number,
  input: BelchingFeeInput
): Promise<BelchingFee | null> => {
  const result = await dbManager.query(
    `UPDATE belching_fees SET amount = $1, category = $2, level = $3, effective_date = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *`,
    [input.amount, input.category, input.level, input.effectiveDate, id]
  );
  if (!result.rows[0]) return null;
  const row = result.rows[0];
  return {
    ...row,
    effectiveDate: row.effective_date
      ? row.effective_date.toISOString().split("T")[0]
      : "",
    level: row.level,
  };
};

export const deleteBelchingFee = async (id: number): Promise<boolean> => {
  const result = await dbManager.query(
    "DELETE FROM belching_fees WHERE id = $1",
    [id]
  );
  return result.rowCount > 0;
};

// Belching Record CRUD
export const getBelchingRecords = async (): Promise<BelchingRecord[]> => {
  const result = await dbManager.query(
    "SELECT * FROM belching_records ORDER BY id"
  );
  return result.rows
    .filter((row) => row.plate_number && row.plate_number.trim() !== "")
    .map((row) => ({
      id: row.id,
      plateNumber: row.plate_number,
      vehicleType: row.vehicle_type,
      operator: row.operator,
      operatorAddress: row.operator_address,
      recordAddress: row.record_address,
      recordStatus: row.record_status,
      licenseValidUntil: row.license_valid_until,
      offenseLevel: row.offense_level,
      lastDateApprehended: row.last_date_apprehended,
      orderOfPayment: row.order_of_payment,
      violationSummary: row.violation_summary,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
};

export const getBelchingRecordById = async (
  id: number
): Promise<BelchingRecord | null> => {
  const result = await dbManager.query(
    "SELECT * FROM belching_records WHERE id = $1",
    [id]
  );
  if (!result.rows[0]) return null;
  const row = result.rows[0];
  return {
    ...row,
    recordStatus: row.record_status,
    licenseValidUntil: row.license_valid_until,
    offenseLevel: row.offense_level,
    lastDateApprehended: row.last_date_apprehended,
    orderOfPayment: row.order_of_payment,
    violationSummary: row.violation_summary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const createBelchingRecord = async (
  input: BelchingRecordInput
): Promise<BelchingRecord> => {
  const result = await dbManager.query(
    `INSERT INTO belching_records 
      (plate_number, vehicle_type, operator, operator_address, record_address, record_status, license_valid_until, offense_level, last_date_apprehended, order_of_payment, violation_summary)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
    [
      input.plateNumber,
      input.vehicleType,
      input.operator,
      input.operatorAddress,
      input.recordAddress,
      input.recordStatus,
      input.licenseValidUntil,
      input.offenseLevel,
      input.lastDateApprehended,
      input.orderOfPayment,
      input.violationSummary,
    ]
  );
  const row = result.rows[0];
  return {
    id: row.id,
    plateNumber: row.plate_number,
    vehicleType: row.vehicle_type,
    operator: row.operator,
    operatorAddress: row.operator_address,
    recordAddress: row.record_address,
    recordStatus: row.record_status,
    licenseValidUntil: row.license_valid_until,
    offenseLevel: row.offense_level,
    lastDateApprehended: row.last_date_apprehended,
    orderOfPayment: row.order_of_payment,
    violationSummary: row.violation_summary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const updateBelchingRecord = async (
  id: number,
  input: BelchingRecordInput
): Promise<BelchingRecord | null> => {
  const result = await dbManager.query(
    `UPDATE belching_records SET 
      plate_number = $1,
      vehicle_type = $2,
      operator = $3,
      operator_address = $4,
      record_address = $5,
      record_status = $6,
      license_valid_until = $7,
      offense_level = $8,
      last_date_apprehended = $9,
      order_of_payment = $10,
      violation_summary = $11,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $12 RETURNING *`,
    [
      input.plateNumber,
      input.vehicleType,
      input.operator,
      input.operatorAddress,
      input.recordAddress,
      input.recordStatus,
      input.licenseValidUntil,
      input.offenseLevel,
      input.lastDateApprehended,
      input.orderOfPayment,
      input.violationSummary,
      id,
    ]
  );
  if (!result.rows[0]) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    plateNumber: row.plate_number,
    vehicleType: row.vehicle_type,
    operator: row.operator,
    operatorAddress: row.operator_address,
    recordAddress: row.record_address,
    recordStatus: row.record_status,
    licenseValidUntil: row.license_valid_until,
    offenseLevel: row.offense_level,
    lastDateApprehended: row.last_date_apprehended,
    orderOfPayment: row.order_of_payment,
    violationSummary: row.violation_summary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const deleteBelchingRecord = async (id: number): Promise<boolean> => {
  const result = await dbManager.query(
    "DELETE FROM belching_records WHERE id = $1",
    [id]
  );
  return result.rowCount > 0;
};

// Belching Record History CRUD
export const getBelchingRecordHistories = async (
  recordId?: number
): Promise<BelchingRecordHistory[]> => {
  const query = recordId
    ? "SELECT * FROM belching_record_history WHERE record_id = $1 ORDER BY id"
    : "SELECT * FROM belching_record_history ORDER BY id";
  const params = recordId ? [recordId] : [];
  const result = await dbManager.query(query, params);
  return result.rows.map((row: any) => ({
    id: row.id,
    recordId: row.record_id,
    type: row.type,
    date: row.date ? row.date.toISOString().split("T")[0] : "",
    details: row.details,
    orNo: row.or_no,
    status: row.status,
  }));
};

export const getBelchingRecordHistoryById = async (
  id: number
): Promise<BelchingRecordHistory | null> => {
  const result = await dbManager.query(
    "SELECT * FROM belching_record_history WHERE id = $1",
    [id]
  );
  if (!result.rows[0]) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    recordId: row.record_id,
    type: row.type,
    date: row.date ? row.date.toISOString().split("T")[0] : "",
    details: row.details,
    orNo: row.or_no,
    status: row.status,
  };
};

export const createBelchingRecordHistory = async (
  input: BelchingRecordHistoryInput
): Promise<BelchingRecordHistory> => {
  const result = await dbManager.query(
    `INSERT INTO belching_record_history (record_id, type, date, details, or_no, status)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      input.recordId,
      input.type,
      input.date,
      input.details,
      input.orNo,
      input.status,
    ]
  );
  const row = result.rows[0];
  return {
    id: row.id,
    recordId: row.record_id,
    type: row.type,
    date: row.date ? row.date.toISOString().split("T")[0] : "",
    details: row.details,
    orNo: row.or_no,
    status: row.status,
  };
};

export const updateBelchingRecordHistory = async (
  id: number,
  input: BelchingRecordHistoryInput
): Promise<BelchingRecordHistory | null> => {
  const result = await dbManager.query(
    `UPDATE belching_record_history SET record_id = $1, type = $2, date = $3, details = $4, or_no = $5, status = $6 WHERE id = $7 RETURNING *`,
    [
      input.recordId,
      input.type,
      input.date,
      input.details,
      input.orNo,
      input.status,
      id,
    ]
  );
  if (!result.rows[0]) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    recordId: row.record_id,
    type: row.type,
    date: row.date ? row.date.toISOString().split("T")[0] : "",
    details: row.details,
    orNo: row.or_no,
    status: row.status,
  };
};

export const deleteBelchingRecordHistory = async (
  id: number
): Promise<boolean> => {
  const result = await dbManager.query(
    "DELETE FROM belching_record_history WHERE id = $1",
    [id]
  );
  return result.rowCount > 0;
};

// Belching Violation CRUD
export const getBelchingViolations = async (
  recordId?: number
): Promise<BelchingViolation[]> => {
  const query = recordId
    ? "SELECT * FROM belching_violations WHERE record_id = $1 ORDER BY id"
    : "SELECT * FROM belching_violations ORDER BY id";
  const params = recordId ? [recordId] : [];
  const result = await dbManager.query(query, params);
  return result.rows.map((row: any) => ({
    id: row.id,
    recordId: row.record_id,
    operatorOffense: row.operator_offense,
    dateOfApprehension: row.date_of_apprehension
      ? row.date_of_apprehension.toISOString().split("T")[0]
      : "",
    place: row.place,
    driverName: row.driver_name,
    driverOffense: row.driver_offense,
    paid: row.paid,
  }));
};

export const getBelchingViolationById = async (
  id: number
): Promise<BelchingViolation | null> => {
  const result = await dbManager.query(
    "SELECT * FROM belching_violations WHERE id = $1",
    [id]
  );
  if (!result.rows[0]) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    recordId: row.record_id,
    operatorOffense: row.operator_offense,
    dateOfApprehension: row.date_of_apprehension
      ? row.date_of_apprehension.toISOString().split("T")[0]
      : "",
    place: row.place,
    driverName: row.driver_name,
    driverOffense: row.driver_offense,
    paid: row.paid,
  };
};

export const createBelchingViolation = async (
  input: BelchingViolationInput
): Promise<BelchingViolation> => {
  const result = await dbManager.query(
    `INSERT INTO belching_violations (record_id, operator_offense, date_of_apprehension, place, driver_name, driver_offense, paid)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      input.recordId,
      input.operatorOffense,
      input.dateOfApprehension,
      input.place,
      input.driverName,
      input.driverOffense,
      input.paid,
    ]
  );
  const row = result.rows[0];
  return {
    id: row.id,
    recordId: row.record_id,
    operatorOffense: row.operator_offense,
    dateOfApprehension: row.date_of_apprehension
      ? row.date_of_apprehension.toISOString().split("T")[0]
      : "",
    place: row.place,
    driverName: row.driver_name,
    driverOffense: row.driver_offense,
    paid: row.paid,
  };
};

export const updateBelchingViolation = async (
  id: number,
  input: BelchingViolationInput
): Promise<BelchingViolation | null> => {
  const result = await dbManager.query(
    `UPDATE belching_violations SET record_id = $1, operator_offense = $2, date_of_apprehension = $3, place = $4, driver_name = $5, driver_offense = $6, paid = $7 WHERE id = $8 RETURNING *`,
    [
      input.recordId,
      input.operatorOffense,
      input.dateOfApprehension,
      input.place,
      input.driverName,
      input.driverOffense,
      input.paid,
      id,
    ]
  );
  if (!result.rows[0]) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    recordId: row.record_id,
    operatorOffense: row.operator_offense,
    dateOfApprehension: row.date_of_apprehension
      ? row.date_of_apprehension.toISOString().split("T")[0]
      : "",
    place: row.place,
    driverName: row.driver_name,
    driverOffense: row.driver_offense,
    paid: row.paid,
  };
};

export const deleteBelchingViolation = async (id: number): Promise<boolean> => {
  const result = await dbManager.query(
    "DELETE FROM belching_violations WHERE id = $1",
    [id]
  );
  return result.rowCount > 0;
};

import { dbManager } from "../../db/dbManager.js";
import { BelchingFee, BelchingFeeInput } from "./types.js";

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

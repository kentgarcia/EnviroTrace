import { dbManager } from "../../db/dbManager.js";
import { OrderOfPayment, OrderOfPaymentInput } from "./types.js";

const mapOrderOfPaymentRow = (row: any): OrderOfPayment => ({
  id: row.id,
  orderNo: row.order_no,
  plateNo: row.plate_no,
  operator: row.operator,
  amount: Number(row.amount),
  dateIssued: row.date_issued
    ? row.date_issued.toISOString().split("T")[0]
    : "",
  status: row.status,
  testingOfficer: row.testing_officer,
  testResults: row.test_results,
  dateOfTesting: row.date_of_testing
    ? row.date_of_testing.toISOString().split("T")[0]
    : "",
  apprehensionFee: Number(row.apprehension_fee),
  voluntaryFee: Number(row.voluntary_fee),
  impoundFee: Number(row.impound_fee),
  driverAmount: Number(row.driver_amount),
  operatorAmount: Number(row.operator_amount),
});

export const getOrderOfPayments = async (): Promise<OrderOfPayment[]> => {
  const result = await dbManager.query(
    "SELECT * FROM order_of_payments ORDER BY id DESC"
  );
  return result.rows.map(mapOrderOfPaymentRow);
};

export const getOrderOfPaymentById = async (
  id: number
): Promise<OrderOfPayment | null> => {
  const result = await dbManager.query(
    "SELECT * FROM order_of_payments WHERE id = $1",
    [id]
  );
  if (!result.rows[0]) return null;
  return mapOrderOfPaymentRow(result.rows[0]);
};

export const createOrderOfPayment = async (
  input: OrderOfPaymentInput
): Promise<OrderOfPayment> => {
  const result = await dbManager.query(
    `INSERT INTO order_of_payments (order_no, plate_no, operator, amount, date_issued, status, testing_officer, test_results, date_of_testing, apprehension_fee, voluntary_fee, impound_fee, driver_amount, operator_amount)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
    [
      input.orderNo,
      input.plateNo,
      input.operator,
      input.amount,
      input.dateIssued,
      input.status,
      input.testingOfficer,
      input.testResults,
      input.dateOfTesting,
      input.apprehensionFee,
      input.voluntaryFee,
      input.impoundFee,
      input.driverAmount,
      input.operatorAmount,
    ]
  );
  return mapOrderOfPaymentRow(result.rows[0]);
};

export const updateOrderOfPayment = async (
  id: number,
  input: OrderOfPaymentInput
): Promise<OrderOfPayment> => {
  const result = await dbManager.query(
    `UPDATE order_of_payments SET order_no = $1, plate_no = $2, operator = $3, amount = $4, date_issued = $5, status = $6, testing_officer = $7, test_results = $8, date_of_testing = $9, apprehension_fee = $10, voluntary_fee = $11, impound_fee = $12, driver_amount = $13, operator_amount = $14 WHERE id = $15 RETURNING *`,
    [
      input.orderNo,
      input.plateNo,
      input.operator,
      input.amount,
      input.dateIssued,
      input.status,
      input.testingOfficer,
      input.testResults,
      input.dateOfTesting,
      input.apprehensionFee,
      input.voluntaryFee,
      input.impoundFee,
      input.driverAmount,
      input.operatorAmount,
      id,
    ]
  );
  return mapOrderOfPaymentRow(result.rows[0]);
};

export const deleteOrderOfPayment = async (id: number): Promise<boolean> => {
  const result = await dbManager.query(
    `DELETE FROM order_of_payments WHERE id = $1`,
    [id]
  );
  return result.rowCount > 0;
};

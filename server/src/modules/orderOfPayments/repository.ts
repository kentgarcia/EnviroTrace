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
    `INSERT INTO order_of_payments (order_no, plate_no, operator, amount, date_issued, status)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      input.orderNo,
      input.plateNo,
      input.operator,
      input.amount,
      input.dateIssued,
      input.status,
    ]
  );
  return mapOrderOfPaymentRow(result.rows[0]);
};

export const updateOrderOfPayment = async (
  id: number,
  input: OrderOfPaymentInput
): Promise<OrderOfPayment> => {
  const result = await dbManager.query(
    `UPDATE order_of_payments SET order_no = $1, plate_no = $2, operator = $3, amount = $4, date_issued = $5, status = $6 WHERE id = $7 RETURNING *`,
    [
      input.orderNo,
      input.plateNo,
      input.operator,
      input.amount,
      input.dateIssued,
      input.status,
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

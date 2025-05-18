import {
  getOrderOfPayments,
  getOrderOfPaymentById,
  createOrderOfPayment,
  updateOrderOfPayment,
  deleteOrderOfPayment,
} from "./repository.js";
import { OrderOfPaymentInput } from "./types.js";

export const orderOfPaymentsResolvers = {
  Query: {
    orderOfPayments: async () => {
      const result = await getOrderOfPayments();
      console.log("orderOfPayments resolver result:", result);
      return result;
    },
    orderOfPayment: async (_: any, { id }: { id: number }) =>
      getOrderOfPaymentById(id),
  },
  Mutation: {
    createOrderOfPayment: async (
      _: any,
      { input }: { input: OrderOfPaymentInput }
    ) => createOrderOfPayment(input),
    updateOrderOfPayment: async (
      _: any,
      { id, input }: { id: number; input: OrderOfPaymentInput }
    ) => updateOrderOfPayment(id, input),
    deleteOrderOfPayment: async (_: any, { id }: { id: number }) =>
      deleteOrderOfPayment(id),
  },
};

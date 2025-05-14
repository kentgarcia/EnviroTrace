import {
  getBelchingFees,
  getBelchingFeeById,
  createBelchingFee,
  updateBelchingFee,
  deleteBelchingFee,
} from "./repository.js";
import { BelchingFeeInput } from "./types.js";

export const belchingResolvers = {
  Query: {
    belchingFees: async () => getBelchingFees(),
    belchingFee: async (_: any, { id }: { id: number }) =>
      getBelchingFeeById(id),
  },
  Mutation: {
    createBelchingFee: async (_: any, { input }: { input: BelchingFeeInput }) =>
      createBelchingFee(input),
    updateBelchingFee: async (
      _: any,
      { id, input }: { id: number; input: BelchingFeeInput }
    ) => updateBelchingFee(id, input),
    deleteBelchingFee: async (_: any, { id }: { id: number }) =>
      deleteBelchingFee(id),
  },
};

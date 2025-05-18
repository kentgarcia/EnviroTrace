import {
  getBelchingFees,
  getBelchingFeeById,
  createBelchingFee,
  updateBelchingFee,
  deleteBelchingFee,
  getBelchingRecords,
  getBelchingRecordById,
  createBelchingRecord,
  updateBelchingRecord,
  deleteBelchingRecord,
} from "./repository.js";
import { BelchingFeeInput, BelchingRecordInput } from "./types.js";

export const belchingResolvers = {
  Query: {
    belchingFees: async () => getBelchingFees(),
    belchingFee: async (_: any, { id }: { id: number }) =>
      getBelchingFeeById(id),
    belchingRecords: async () => getBelchingRecords(),
    belchingRecord: async (_: any, { id }: { id: number }) =>
      getBelchingRecordById(id),
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
    createBelchingRecord: async (
      _: any,
      { input }: { input: BelchingRecordInput }
    ) => createBelchingRecord(input),
    updateBelchingRecord: async (
      _: any,
      { id, input }: { id: number; input: BelchingRecordInput }
    ) => updateBelchingRecord(id, input),
    deleteBelchingRecord: async (_: any, { id }: { id: number }) =>
      deleteBelchingRecord(id),
  },
};

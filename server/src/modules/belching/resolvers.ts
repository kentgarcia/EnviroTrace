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
  getBelchingRecordHistories,
  getBelchingRecordHistoryById,
  createBelchingRecordHistory,
  updateBelchingRecordHistory,
  deleteBelchingRecordHistory,
  getBelchingViolations,
  getBelchingViolationById,
  createBelchingViolation,
  updateBelchingViolation,
  deleteBelchingViolation,
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
    belchingRecordHistories: async (
      _: any,
      { recordId }: { recordId?: number }
    ) => getBelchingRecordHistories(recordId),
    belchingRecordHistory: async (_: any, { id }: { id: number }) =>
      getBelchingRecordHistoryById(id),
    belchingViolations: async (_: any, { recordId }: { recordId?: number }) =>
      getBelchingViolations(recordId),
    belchingViolation: async (_: any, { id }: { id: number }) =>
      getBelchingViolationById(id),
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
    createBelchingRecordHistory: async (_: any, { input }: { input: any }) =>
      createBelchingRecordHistory(input),
    updateBelchingRecordHistory: async (
      _: any,
      { id, input }: { id: number; input: any }
    ) => updateBelchingRecordHistory(id, input),
    deleteBelchingRecordHistory: async (_: any, { id }: { id: number }) =>
      deleteBelchingRecordHistory(id),
    createBelchingViolation: async (_: any, { input }: { input: any }) =>
      createBelchingViolation(input),
    updateBelchingViolation: async (
      _: any,
      { id, input }: { id: number; input: any }
    ) => updateBelchingViolation(id, input),
    deleteBelchingViolation: async (_: any, { id }: { id: number }) =>
      deleteBelchingViolation(id),
  },
};

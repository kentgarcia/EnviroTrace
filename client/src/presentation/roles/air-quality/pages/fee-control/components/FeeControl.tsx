import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/shared/ui/card";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
// Update Fee type to ensure id is number
import { Fee } from "../logic/useFeeData";
import { useFeeQuery, useCreateFee, useUpdateFee, useDeleteFee } from "../logic/useFeeQuery";
import { FeeFormModal } from "./FeeFormModal";
import FeeDetailsPanel from "./FeeDetailsPanel";
import FeeStructureDisplay from "./FeeStructureDisplay";
import PenaltyFeeBulkEditModal from "./PenaltyFeeBulkEditModal";

const FeeControl: React.FC = () => {
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [bulkEditData, setBulkEditData] = useState<{
    isOpen: boolean;
    category: string;
    fees: Fee[];
  }>({
    isOpen: false,
    category: '',
    fees: [],
  });

  // TanStack Query hooks for data and mutations
  const { data: fees = [], isLoading: loading, error } = useFeeQuery();
  const createFeeMutation = useCreateFee();
  const updateFeeMutation = useUpdateFee();
  const deleteFeeMutation = useDeleteFee();

  // Handle adding new fee with category and level
  const handleAddFee = async (category: string, level: number) => {
    // For now, create a fee with default amount that can be edited later
    const defaultFee = {
      category: category.toLowerCase(),
      level: level,
      amount: level === 0 ? (category === 'apprehension' ? 150 : category === 'voluntary' ? 100 : category === 'impound' ? 500 : 200) :
        (category === 'driver' ? (level === 1 ? 500 : level === 2 ? 1000 : 2000) : (level === 1 ? 1000 : level === 2 ? 2000 : 5000)),
      effective_date: new Date().toISOString().split('T')[0]
    };

    await createFeeMutation.mutateAsync(defaultFee);
  };

  const handleCreateFee = async (feeData: Omit<Fee, "id" | "created_at" | "updated_at">) => {
    createFeeMutation.mutate(feeData);
  };

  // Handle fee update
  const handleUpdateFee = async (feeId: number, updateData: Partial<Omit<Fee, "id" | "created_at" | "updated_at">>) => {
    updateFeeMutation.mutate({ fee_id: String(feeId), data: updateData });
    // Optionally update selectedFee locally if needed
    if (selectedFee && selectedFee.id === feeId) {
      setSelectedFee({ ...selectedFee, ...updateData } as Fee);
    }
  };

  // Handle fee deletion
  const handleDeleteFee = async (feeId: number) => {
    deleteFeeMutation.mutate(String(feeId), {
      onSuccess: () => {
        if (selectedFee && selectedFee.id === feeId) {
          setSelectedFee(null);
        }
      },
    });
  };

  // Handle editing existing fee
  const handleEditFee = (fee: Fee) => {
    setSelectedFee(fee);
  };

  // Handle bulk editing of penalty fees
  const handleEditPenaltyFees = (category: string, categoryFees: Fee[]) => {
    setBulkEditData({
      isOpen: true,
      category,
      fees: categoryFees,
    });
  };

  // Handle bulk save of penalty fees
  const handleBulkSavePenaltyFees = async (
    category: string,
    feeUpdates: { id: number; level: number; amount: number; effective_date: string }[]
  ) => {
    try {
      // Update existing fees and create new ones
      for (const update of feeUpdates) {
        if (update.id && update.id > 0) {
          // Update existing fee
          await updateFeeMutation.mutateAsync({
            fee_id: String(update.id),
            data: {
              amount: update.amount,
              effective_date: update.effective_date,
            },
          });
        } else {
          // Create new fee
          await createFeeMutation.mutateAsync({
            category: category.toLowerCase(),
            level: update.level,
            amount: update.amount,
            effective_date: update.effective_date,
          });
        }
      }
      setBulkEditData({ isOpen: false, category: '', fees: [] });
    } catch (error) {
      console.error('Error updating penalty fees:', error);
    }
  };

  return (
    <>
      <div className="flex min-h-screen w-full">
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavBarContainer dashboardType="air-quality" />

          {/* Header Section */}
          <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
              Air Quality Fee Management
            </h1>
          </div>

          {/* Body Section */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
            <div className="space-y-6">
              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Fee Structure Display */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Fee Structure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FeeStructureDisplay
                      fees={fees}
                      onEditFee={handleEditFee}
                      onEditPenaltyFees={handleEditPenaltyFees}
                      onAddFee={handleAddFee}
                      isLoading={loading}
                    />
                    {error && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">
                          {typeof error === 'object' && error !== null && 'message' in error ? (error as Error).message : String(error)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Fee Details Panel */}
                <div className="lg:col-span-1">
                  <FeeDetailsPanel
                    selectedFee={selectedFee}
                    onUpdateFee={handleUpdateFee as (feeId: any, updateData: any) => void}
                    loading={loading}
                    error={
                      error
                        ? typeof error === "object" && error !== null && "message" in error
                          ? (error as Error).message
                          : String(error)
                        : null
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Penalty Fee Bulk Edit Modal */}
      <PenaltyFeeBulkEditModal
        isOpen={bulkEditData.isOpen}
        onClose={() => setBulkEditData({ isOpen: false, category: '', fees: [] })}
        category={bulkEditData.category}
        fees={bulkEditData.fees}
        onSave={handleBulkSavePenaltyFees}
        isLoading={createFeeMutation.isPending || updateFeeMutation.isPending}
      />
    </>
  );
};

export default FeeControl;

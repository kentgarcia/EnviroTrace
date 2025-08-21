import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/shared/ui/card";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
// Update Fee type to ensure fee_id is string
import { Fee } from "../logic/useFeeData";
import { useFeeQuery, useCreateFee, useUpdateFee, useDeleteFee } from "../logic/useFeeQuery";
import { createFeeColumns } from "../logic/feeColumns";
import { FeeFormModal } from "./FeeFormModal";
import FeeDetailsPanel from "./FeeDetailsPanel";

const FeeControl: React.FC = () => {
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [deletingFeeId, setDeletingFeeId] = useState<string | undefined>();

  // TanStack Query hooks for data and mutations
  const { data: fees = [], isLoading: loading, error } = useFeeQuery();
  const createFeeMutation = useCreateFee();
  const updateFeeMutation = useUpdateFee();
  const deleteFeeMutation = useDeleteFee();

  // Handle adding new fee
  // Helper to generate a short unique fee_id (e.g., FEE-xxxxxx)
  function generateShortFeeId() {
    const random = Math.floor(100000 + Math.random() * 900000); // 6 digits
    return `FEE-${random}`;
  }

  const handleAddFee = async (feeData: Omit<Fee, "fee_id" | "created_at" | "updated_at">) => {
    const feeWithId = { ...feeData, fee_id: generateShortFeeId() };
    createFeeMutation.mutate(feeWithId);
  };

  // Handle fee update
  const handleUpdateFee = async (feeId: string, updateData: Partial<Omit<Fee, "fee_id" | "created_at" | "updated_at">>) => {
    updateFeeMutation.mutate({ fee_id: feeId, data: updateData });
    // Optionally update selectedFee locally if needed
    if (selectedFee && String(selectedFee.fee_id) === feeId) {
      setSelectedFee({ ...selectedFee, ...updateData } as Fee);
    }
  };

  // Handle fee deletion
  const handleDeleteFee = async (feeId: string) => {
    setDeletingFeeId(feeId);
    deleteFeeMutation.mutate(feeId, {
      onSuccess: () => {
        if (selectedFee && selectedFee.fee_id === feeId) {
          setSelectedFee(null);
        }
        setDeletingFeeId(undefined);
      },
      onError: () => {
        setDeletingFeeId(undefined);
      }
    });
  };

  // Column configuration for data table
  const columns = createFeeColumns(
    handleDeleteFee as (feeId: any) => void,
    deletingFeeId !== undefined ? Number(deletingFeeId) : undefined
  );

  // Handle row click in data table
  const handleRowClick = (row: { original: Fee }) => {
    setSelectedFee(row.original);
  };

  return (
    <>
      <div className="flex min-h-screen w-full">
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavBarContainer dashboardType="air-quality" />

          {/* Header Section */}
          <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
              Fee Control
            </h1>
            <FeeFormModal
              onAddFee={handleAddFee}
              existingFees={fees.map(fee => ({ category: fee.category, level: fee.level }))}
            />
          </div>

          {/* Body Section */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
            <div className="space-y-6">
              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Fees Data Table */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Fee Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={columns}
                      data={fees}
                      isLoading={loading}
                      loadingMessage="Loading fees..."
                      emptyMessage="No fees found."
                      onRowClick={handleRowClick}
                      showPagination={true}
                      showDensityToggle={true}
                      showColumnVisibility={false}
                      defaultPageSize={10}
                      pageSizeOptions={[5, 10, 20, 50]}
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
                    onDeleteFee={handleDeleteFee as (feeId: any) => void}
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
    </>
  );
};

export default FeeControl;

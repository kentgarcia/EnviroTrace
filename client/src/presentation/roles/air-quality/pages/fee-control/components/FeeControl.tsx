import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/shared/ui/card";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import { useFeeData, Fee } from "../logic/useFeeData.tsx";
import { createFeeColumns } from "../logic/feeColumns";
import { FeeFormModal } from "./FeeFormModal";
import FeeDetailsPanel from "./FeeDetailsPanel";

const FeeControl: React.FC = () => {
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [deletingFeeId, setDeletingFeeId] = useState<number | undefined>();

  // Custom hooks for data management
  const {
    fees,
    loading,
    error,
    createFee: createNewFee,
    updateFee: updateExistingFee,
    deleteFee: removeExistingFee,
  } = useFeeData();

  // Handle adding new fee
  const handleAddFee = async (feeData: {
    category: string;
    rate: number;
    date_effective: string;
    offense_level: number;
  }) => {
    try {
      await createNewFee(feeData);
    } catch (err) {
      console.error('Failed to create fee:', err);
    }
  };

  // Handle fee update
  const handleUpdateFee = async (feeId: number, updateData: Partial<Fee>) => {
    try {
      await updateExistingFee(feeId, updateData);
      // Update selected fee if it's the one being updated
      if (selectedFee && selectedFee.fee_id === feeId) {
        setSelectedFee({ ...selectedFee, ...updateData } as Fee);
      }
    } catch (err) {
      console.error('Failed to update fee:', err);
    }
  };

  // Handle fee deletion
  const handleDeleteFee = async (feeId: number) => {
    setDeletingFeeId(feeId);
    try {
      await removeExistingFee(feeId);
      // Clear selected fee if it was deleted
      if (selectedFee && selectedFee.fee_id === feeId) {
        setSelectedFee(null);
      }
    } catch (err) {
      console.error('Failed to delete fee:', err);
    } finally {
      setDeletingFeeId(undefined);
    }
  };

  // Column configuration for data table
  const columns = createFeeColumns(handleDeleteFee, deletingFeeId);

  // Handle row click in data table
  const handleRowClick = (row: any) => {
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
            <FeeFormModal onAddFee={handleAddFee} />
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
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Fee Details Panel */}
                <div className="lg:col-span-1">
                  <FeeDetailsPanel
                    selectedFee={selectedFee}
                    onUpdateFee={handleUpdateFee}
                    loading={loading}
                    error={error}
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

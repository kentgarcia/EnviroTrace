import React, { useState, useEffect } from "react";
import { NetworkStatus } from "@/presentation/components/shared/layout/NetworkStatus";
import { useToast } from "@/presentation/components/shared/ui/use-toast";
import FeeControlComponent from "../components/fee/FeeTable";
import type { ViolationRate } from "../components/fee/FeeTable";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";
interface Fee {
  id: string;
  vehiclePlate: string;
  ownerName: string;
  violationDate: string;
  amount: number;
  status: "pending" | "paid" | "overdue";
  dueDate: string;
  paymentDate?: string;
}

const FeeControlPage = () => {
  return (
    <>
      <div className="flex min-h-screen w-full">
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavBarContainer dashboardType="air-quality" />
          <ColorDivider variant="secondary" />

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
            <FeeControlComponent />
          </div>
        </div>
      </div>

      <NetworkStatus />
    </>
  );
};

export default FeeControlPage;

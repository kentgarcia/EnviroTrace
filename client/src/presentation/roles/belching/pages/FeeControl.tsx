import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/presentation/components/shared/layout/AppSidebar";
import { SidebarProvider } from "@/presentation/components/shared/ui/sidebar";
import { NetworkStatus } from "@/presentation/components/shared/layout/NetworkStatus";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/shared/ui/select";
import { Button } from "@/presentation/components/shared/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/presentation/components/shared/ui/use-toast";
import FeeControlComponent from "../components/fee/FeeTable";
import type { ViolationRate } from "../components/fee/FeeTable";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<ViolationRate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available years for selection - last 5 years
  const availableYears = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Data Refreshed",
        description: "The fee control data has been refreshed.",
      });
    }, 1000);
  };

  const handleAddRate = async (rate: Omit<ViolationRate, "id">) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to add rate
      console.log("Adding rate:", rate);
      toast({
        title: "Rate Added",
        description: "The rate has been successfully added.",
      });
      setIsAddModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add rate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRate = async (rate: ViolationRate) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to edit rate
      console.log("Editing rate:", rate);
      toast({
        title: "Rate Updated",
        description: "The rate has been successfully updated.",
      });
      setIsEditModalOpen(false);
      setSelectedRate(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update rate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRate = async () => {
    if (!selectedRate) return;
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to delete rate
      console.log("Deleting rate:", selectedRate);
      toast({
        title: "Rate Deleted",
        description: "The rate has been successfully deleted.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedRate(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete rate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
              Fee Control
            </h1>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
            <Card>
              <CardHeader>
                <CardTitle>Fee Management</CardTitle>
              </CardHeader>
              <CardContent>
                <FeeControlComponent />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <NetworkStatus />
    </>
  );
};

export default FeeControlPage;

import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { NetworkStatus } from "@/components/layout/NetworkStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import FeeControlComponent from "./components/fee/FeeTable";
import { FeeModals } from "./components/fee/FeeModals";
import type { ViolationRate } from "./components/fee/FeeTable";

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
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="smoke-belching" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardNavbar />

          {/* Header Section */}
          <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Fee Control
              </h1>
              <p className="text-muted-foreground">
                Manage smoke belching violation rates
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6">
            <Card>
              <CardHeader>
                <CardTitle>Fee Management</CardTitle>
              </CardHeader>
              <CardContent>
                <FeeControlComponent
                  onViewRate={(rate) => {
                    setSelectedRate(rate);
                    setIsViewModalOpen(true);
                  }}
                  onEditRate={(rate) => {
                    setSelectedRate(rate);
                    setIsEditModalOpen(true);
                  }}
                  onDeleteRate={(rate) => {
                    setSelectedRate(rate);
                    setIsDeleteDialogOpen(true);
                  }}
                  onAddRate={() => setIsAddModalOpen(true)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FeeModals
        isAddModalOpen={isAddModalOpen}
        onAddModalClose={() => setIsAddModalOpen(false)}
        onAddRate={handleAddRate}
        isEditModalOpen={isEditModalOpen}
        onEditModalClose={() => {
          setIsEditModalOpen(false);
          setSelectedRate(null);
        }}
        onEditRate={handleEditRate}
        selectedRate={selectedRate}
        isViewModalOpen={isViewModalOpen}
        onViewModalClose={() => {
          setIsViewModalOpen(false);
          setSelectedRate(null);
        }}
        isDeleteDialogOpen={isDeleteDialogOpen}
        onDeleteDialogClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedRate(null);
        }}
        onDeleteRate={handleDeleteRate}
        isSubmitting={isSubmitting}
      />

      <NetworkStatus />
    </SidebarProvider>
  );
};

export default FeeControlPage;

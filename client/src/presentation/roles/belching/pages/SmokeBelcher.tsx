import React, { useState } from "react";
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
import { FileDown, Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/presentation/components/shared/ui/use-toast";
import SmokeBelcherMenu from "../components/SmokeBelcherMenu";

const SmokeBelcher = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

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
        description: "The smoke belcher data has been refreshed.",
      });
    }, 1000);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="smoke-belching" />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Section */}
          <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
              Smoke Belcher
            </h1>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <SmokeBelcherMenu />
          </div>
        </div>
      </div>
      <NetworkStatus />
    </SidebarProvider>
  );
};

export default SmokeBelcher;

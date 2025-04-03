
import { StatCard } from "@/components/dashboard/StatCard";
import { Building, Factory, Loader2, Truck } from "lucide-react";

interface EmissionStatCardsProps {
  totalVehicles: number;
  totalPassed: number;
  totalFailed: number;
  complianceRate: number;
}

export function EmissionStatCards({ 
  totalVehicles, 
  totalPassed, 
  totalFailed, 
  complianceRate 
}: EmissionStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Total Vehicles"
        value={totalVehicles.toString()}
        description="Registered in database"
        icon={Truck}
        trend="up"
        trendValue={`${totalVehicles} total vehicles`}
      />
      <StatCard
        title="Passed Tests"
        value={totalPassed.toString()}
        description="All quarters combined"
        icon={Building}
        trend="up"
        trendValue={`${totalPassed} passed tests`}
      />
      <StatCard
        title="Failed Tests"
        value={totalFailed.toString()}
        description="Requiring follow-up"
        icon={Factory}
        trend={totalFailed > 0 ? "down" : "up"}
        trendValue={`${totalFailed} failed tests`}
      />
      <StatCard
        title="Compliance Rate"
        value={`${complianceRate}%`}
        description="Pass rate across all tests"
        icon={Loader2}
        trend={complianceRate >= 90 ? "up" : "down"}
        trendValue={`${complianceRate}% compliance rate`}
      />
    </div>
  );
}

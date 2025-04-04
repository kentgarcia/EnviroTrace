
import { StatCard } from "@/components/dashboard/StatCard";
import { Building, Factory, Loader2, Truck } from "lucide-react";

interface EmissionStatCardsProps {
  totalVehicles: number;
  testedVehicles: number;
  passRate: number;
  officeDepartments: number;
}

export function EmissionStatCards({ 
  totalVehicles, 
  testedVehicles, 
  passRate, 
  officeDepartments 
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
        title="Tested Vehicles"
        value={testedVehicles.toString()}
        description="All quarters combined"
        icon={Building}
        trend="up"
        trendValue={`${testedVehicles} tested tests`}
      />
      <StatCard
        title="Compliance Rate"
        value={`${passRate}%`}
        description="Pass rate across all tests"
        icon={Loader2}
        trend={passRate >= 90 ? "up" : "down"}
        trendValue={`${passRate}% compliance rate`}
      />
      <StatCard
        title="Office Departments"
        value={officeDepartments.toString()}
        description="Managing vehicles"
        icon={Factory}
        trend="up"
        trendValue={`${officeDepartments} departments`}
      />
    </div>
  );
}

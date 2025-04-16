import { StatCard } from "@/components/dashboard/StatCard";
import { Building, Factory, Loader2, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EmissionStatCardsProps {
  totalVehicles: number;
  testedVehicles: number;
  passRate: number;
  officeDepartments: number;
  subtitle?: string;
}

export function EmissionStatCards({ 
  totalVehicles, 
  testedVehicles, 
  passRate, 
  officeDepartments, 
  subtitle
}: EmissionStatCardsProps) {
  return (
    <Card className="mb-8">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-1">Key Metrics & Statistics</h2>
        {subtitle && (
          <div className="text-muted-foreground text-sm mb-4">{subtitle}</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Vehicles"
            value={totalVehicles.toString()}
            description="Registered in database"
            icon={Truck}
            className="bg-blue-100"
            iconClassName="bg-blue-400"
          />
          <StatCard
            title="Tested Vehicles"
            value={testedVehicles.toString()}
            description="All quarters combined"
            icon={Building}
            className="bg-green-100"
            iconClassName="bg-green-500"
          />
          <StatCard
            title="Compliance Rate"
            value={`${Math.round(passRate)}%`}
            description="Pass rate across all tests"
            icon={Loader2}
            className="bg-yellow-100"
            iconClassName="bg-yellow-600"
          />
          <StatCard
            title="Office Departments"
            value={officeDepartments.toString()}
            description="Managing vehicles"
            icon={Factory}
            className="bg-purple-100"
            iconClassName="bg-purple-500"
          />
        </div>
      </CardContent>
    </Card>
  );
}

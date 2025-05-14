import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/shared/ui/card";
import {
  CircleCheck,
  CircleX,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  CarFront,
  Cpu,
} from "lucide-react";
import { Skeleton } from "@/presentation/components/shared/ui/skeleton";
import { OfficeData } from "@/hooks/useOffices";

interface ComplianceSummaryCardProps {
  officeData: OfficeData[];
  previousComplianceRate?: number;
  isLoading: boolean;
}

export function ComplianceSummaryCard({
  officeData,
  previousComplianceRate,
  isLoading,
}: ComplianceSummaryCardProps) {
  // Calculate summary statistics
  const totalVehicles = officeData.reduce(
    (sum, office) => sum + office.vehicleCount,
    0
  );
  const totalTested = officeData.reduce(
    (sum, office) => sum + office.testedCount,
    0
  );
  const totalPassed = officeData.reduce(
    (sum, office) => sum + office.passedCount,
    0
  );
  const totalOffices = officeData.length;

  // Calculate overall compliance rate
  const overallComplianceRate = totalVehicles
    ? Math.round((totalPassed / totalVehicles) * 100)
    : 0;

  // Determine if compliance is improving
  let complianceDiff = 0;
  let isImproving = false;

  if (previousComplianceRate !== undefined) {
    complianceDiff = overallComplianceRate - previousComplianceRate;
    isImproving = complianceDiff >= 0;
  }

  // Card definitions
  const cards = [
    {
      title: "Overall Compliance",
      value: `${overallComplianceRate}%`,
      icon: overallComplianceRate >= 80 ? CircleCheck : CircleX,
      iconClassName:
        overallComplianceRate >= 80 ? "text-green-500" : "text-red-500",
      difference:
        complianceDiff !== 0 ? (
          <div
            className={`flex items-center text-xs ${
              isImproving ? "text-green-500" : "text-red-500"
            }`}
          >
            {isImproving ? (
              <ArrowUpRight className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 mr-1" />
            )}
            <span>{Math.abs(complianceDiff)}% from previous period</span>
          </div>
        ) : null,
    },
    {
      title: "Total Offices",
      value: totalOffices.toString(),
      icon: Building,
      iconClassName: "text-blue-500",
    },
    {
      title: "Registered Vehicles",
      value: totalVehicles.toString(),
      icon: CarFront,
      iconClassName: "text-violet-500",
    },
    {
      title: "Vehicles Tested",
      value: totalTested.toString(),
      icon: Cpu,
      iconClassName: "text-amber-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-5 w-[140px]" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-[100px] mb-2" />
              <Skeleton className="h-4 w-[160px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-5 w-5 ${card.iconClassName}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            {card.difference && (
              <div className="text-xs text-muted-foreground">
                {card.difference}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { DataChart } from "@/components/dashboard/DataChart";

interface EmissionHistoryTrendProps {
  historyData: Array<{
    year: number;
    complianceRate: number;
    totalVehicles: number;
  }>;
}

export function EmissionHistoryTrend({ historyData }: EmissionHistoryTrendProps) {
  // Transform data for chart display
  const chartData = historyData.map(item => ({
    name: item.year.toString(),
    complianceRate: item.complianceRate,
    vehicles: item.totalVehicles
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Test History Trends</CardTitle>
        </div>
        <CardDescription>Compliance rate by year</CardDescription>
      </CardHeader>
      <CardContent>
        <DataChart
          title=""
          description=""
          data={chartData}
          type="line"
          dataKeys={["complianceRate", "vehicles"]}
          colors={["#4ade80", "#94a3b8"]}
        />
      </CardContent>
    </Card>
  );
}


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { DataChart } from "@/components/dashboard/DataChart";

interface QuarterStat {
  name: string;
  passed: number;
  failed: number;
  total: number;
}

interface EmissionHistoryTrendProps {
  quarterStats: QuarterStat[];
}

export function EmissionHistoryTrend({ quarterStats }: EmissionHistoryTrendProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Test History Trends</CardTitle>
        </div>
        <CardDescription>Pass/fail trends by quarter</CardDescription>
      </CardHeader>
      <CardContent>
        <DataChart
          title=""
          description=""
          data={quarterStats}
          type="line"
          dataKeys={["passed", "failed", "total"]}
          colors={["#4ade80", "#f87171", "#94a3b8"]}
        />
      </CardContent>
    </Card>
  );
}

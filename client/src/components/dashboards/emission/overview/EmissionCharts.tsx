import { DataChart } from "@/components/dashboard/DataChart";

interface EmissionChartsProps {
  quarterStats: Array<{
    name: string;
    passed: number;
    failed: number;
    total: number;
  }>;
  engineTypeData: Array<{
    name: string;
    value: number;
  }>;
  wheelCountData: Array<{
    count: number;
    wheelCount: number;
  }>;
  selectedYear: number;
}

export function EmissionCharts({ 
  quarterStats, 
  engineTypeData, 
  wheelCountData, 
  selectedYear 
}: EmissionChartsProps) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <DataChart
        title="Quarterly Emission Test Results"
        description={`${selectedYear} test results by quarter`}
        data={quarterStats}
        type="bar"
        dataKeys={["passed", "failed"]}
        colors={["#4ade80", "#f87171"]}
      />
      <DataChart
        title="Vehicle Distribution"
        description="By engine type and wheel count"
        data={[
          {
            name: "Engine Type",
            gas: engineTypeData.find(item => item.name === "Gas")?.value || 0,
            diesel: engineTypeData.find(item => item.name === "Diesel")?.value || 0
          },
          {
            name: "Wheel Count",
            "2 wheels": wheelCountData.find(item => item.wheelCount === 2)?.count || 0,
            "4 wheels": wheelCountData.find(item => item.wheelCount === 4)?.count || 0
          }
        ]}
        type="bar"
        dataKeys={["gas", "diesel", "2 wheels", "4 wheels"]}
        colors={["#60a5fa", "#a855f7", "#fbbf24", "#f97316"]}
      />
    </section>
  );
}

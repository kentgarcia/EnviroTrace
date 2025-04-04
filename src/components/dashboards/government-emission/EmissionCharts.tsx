
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
  vehicleTypeData: Array<{
    name: string;
    value: number;
  }>;
  selectedYear: number;
}

export function EmissionCharts({ 
  quarterStats, 
  engineTypeData, 
  vehicleTypeData, 
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
            "two_wheels": vehicleTypeData.find(item => item.name === "2")?.value || 0,
            "four_wheels": vehicleTypeData.find(item => item.name === "4")?.value || 0
          }
        ]}
        type="bar"
        dataKeys={["gas", "diesel", "two_wheels", "four_wheels"]}
        colors={["#60a5fa", "#a855f7", "#fbbf24", "#f97316"]}
      />
    </section>
  );
}

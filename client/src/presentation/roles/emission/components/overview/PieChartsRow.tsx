import React from "react";
import { EChartsPieChart } from "@/presentation/components/shared/dashboard/EChartsPieChart";

const PieChartsRow = ({ data, loading }: any) => (
  <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <EChartsPieChart
      title="Passed vs Failed"
      data={[
        {
          id: "Passed",
          label: "Passed",
          value: data.testedVehicles
            ? data.officeComplianceData.reduce(
                (acc: number, o: any) => acc + o.passedCount,
                0
              )
            : 0,
        },
        {
          id: "Failed",
          label: "Failed",
          value: data.testedVehicles
            ? data.testedVehicles -
              data.officeComplianceData.reduce(
                (acc: number, o: any) => acc + o.passedCount,
                0
              )
            : 0,
        },
      ]}
      height={220}
      colors={["#22c55e", "#ef4444"]}
    />
    <EChartsPieChart
      title="Vehicles by Engine Type"
      data={loading ? [] : data.engineTypeData}
      height={220}
      colors={[
        "#22c55e",
        "#facc15",
        "#38bdf8",
        "#a78bfa",
        "#f472b6",
        "#f87171",
      ]}
    />
    <EChartsPieChart
      title="Vehicles by Wheel Count"
      data={loading ? [] : data.wheelCountData}
      height={220}
      colors={[
        "#38bdf8",
        "#facc15",
        "#a78bfa",
        "#f472b6",
        "#f87171",
        "#22c55e",
      ]}
    />
  </section>
);

export default PieChartsRow;

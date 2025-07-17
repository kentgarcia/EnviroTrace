import React from "react";
import { EChartsPieChart } from "@/presentation/components/shared/dashboard/EChartsPieChart";

const PieChartsRow = ({ data, loading }: any) => {
  // Transform engine type data for pie chart (show only totals)
  const engineTypeChartData = loading ? [] : data.engineTypeData.map((item: any) => ({
    id: item.id,
    label: item.label,
    value: item.total,
  }));

  // Transform wheel count data for pie chart (show only totals)
  const wheelCountChartData = loading ? [] : data.wheelCountData.map((item: any) => ({
    id: item.id,
    label: item.label,
    value: item.total,
  }));

  // Calculate overall pass/fail totals
  const totalPassed = loading ? 0 : data.engineTypeData.reduce((acc: number, item: any) => acc + item.passed, 0);
  const totalFailed = loading ? 0 : data.engineTypeData.reduce((acc: number, item: any) => acc + item.failed, 0);
  const totalUntested = loading ? 0 : data.engineTypeData.reduce((acc: number, item: any) => acc + item.untested, 0);

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <EChartsPieChart
        title="Vehicle Testing Status"
        data={[
          {
            id: "Passed",
            label: "Passed",
            value: totalPassed,
          },
          {
            id: "Failed",
            label: "Failed",
            value: totalFailed,
          },
          {
            id: "Untested",
            label: "Untested",
            value: totalUntested,
          },
        ]}
        height={280}
        colors={["#22c55e", "#ef4444", "#f59e0b"]}
      />
      <EChartsPieChart
        title="Vehicles by Engine Type"
        data={engineTypeChartData}
        height={280}
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
        data={wheelCountChartData}
        height={280}
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
};

export default PieChartsRow;

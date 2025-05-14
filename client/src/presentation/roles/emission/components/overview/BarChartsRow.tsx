import React from "react";
import { EChartsBarChart } from "@/components/dashboard/EChartsBarChart";

const BarChartsRow = ({ data, loading }: any) => (
  <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
    <EChartsBarChart
      title="Vehicles by Type"
      data={loading ? [] : data.vehicleTypeData}
      height={350}
      layout="horizontal"
      color={["#22c55e", "#facc15", "#38bdf8", "#a78bfa", "#f472b6", "#f87171"]}
      valueFormatter={(value: number) => value.toString()}
    />
    <EChartsBarChart
      title="Compliance by Office"
      data={loading ? [] : data.officeComplianceData}
      height={350}
      layout="horizontal"
      color={["#22c55e", "#facc15", "#38bdf8", "#a78bfa", "#f472b6", "#f87171"]}
      valueFormatter={(value: number) => `${value}%`}
    />
  </section>
);

export default BarChartsRow;

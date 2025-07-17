import React from "react";
import { EChartsMultiBarChart } from "@/presentation/components/shared/dashboard/EChartsMultiBarChart";
import { EChartsBarChart } from "@/presentation/components/shared/dashboard/EChartsBarChart";

const BarChartsRow = ({ data, loading }: any) => {
  // Transform vehicle type data for multi-series bar chart
  const vehicleTypeChartData = loading ? [] : data.vehicleTypeData.map((item: any) => ({
    category: item.label,
    passed: item.passed,
    failed: item.failed,
    untested: item.untested,
  }));

  // Transform engine type data for multi-series bar chart
  const engineTypeChartData = loading ? [] : data.engineTypeData.map((item: any) => ({
    category: item.label,
    passed: item.passed,
    failed: item.failed,
    untested: item.untested,
  }));

  const seriesConfig = [
    { key: "passed", name: "Passed", color: "#22c55e" },
    { key: "failed", name: "Failed", color: "#ef4444" },
    { key: "untested", name: "Untested", color: "#f59e0b" },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-base font-medium mb-4">Pass/Fail by Vehicle Type</h3>
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : (
          <EChartsMultiBarChart
            data={vehicleTypeChartData}
            seriesConfig={seriesConfig}
            height={380}
            valueFormatter={(value: number) => value.toString()}
          />
        )}
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-base font-medium mb-4">Pass/Fail by Engine Type</h3>
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : (
          <EChartsMultiBarChart
            data={engineTypeChartData}
            seriesConfig={seriesConfig}
            height={380}
            valueFormatter={(value: number) => value.toString()}
          />
        )}
      </div>
    </section>
  );
};

export default BarChartsRow;

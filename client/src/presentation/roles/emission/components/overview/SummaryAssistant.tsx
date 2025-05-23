import React from "react";
import { BarChart3 } from "lucide-react";

const SummaryAssistant = ({
  data,
  loading,
  selectedYear,
  selectedQuarter,
  formatNumber,
}: any) => (
  <aside className="bg-white rounded-2xl shadow-lg p-6 h-fit flex flex-col items-center">
    <div className="flex items-center gap-2 mb-4">
      <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-green-200 text-green-700 shadow">
        <BarChart3 className="h-6 w-6" />
      </span>
      <span className="font-semibold text-green-900 text-lg">
        Summary Assistant
      </span>
    </div>
    <div className="relative w-full space-y-4">
      {/* Bubble 1: Year/Quarter context */}
      <div className="bg-green-50 rounded-xl px-5 py-4 text-green-900 text-sm shadow-sm w-full">
        For <span className="font-bold text-green-800">{selectedYear}</span>
        {selectedQuarter ? <>, Q{selectedQuarter}</> : ", all quarters"}, here
        is your emission dashboard summary.
      </div>
      <div className="text-xs text-green-700 ml-4 mb-2">
        📅 Data period selected
      </div>
      {/* Bubble 2: Vehicle stats */}
      <div className="bg-green-50 rounded-xl px-5 py-4 text-green-900 text-sm shadow-sm w-full">
        There are{" "}
        <span className="font-bold text-green-800">
          {formatNumber(loading ? 0 : data.totalVehicles)}
        </span>{" "}
        vehicles in total.
      </div>
      <div className="text-xs text-green-700 ml-4 mb-2">
        🚗 Total fleet size
      </div>
      {/* Bubble 3: Tested vehicles */}
      <div className="bg-green-50 rounded-xl px-5 py-4 text-green-900 text-sm shadow-sm w-full">
        <span className="font-bold text-green-800">
          {formatNumber(loading ? 0 : data.testedVehicles)}
        </span>{" "}
        vehicles have been tested.
      </div>
      <div className="text-xs text-green-700 ml-4 mb-2">
        🧪 Testing progress
      </div>
      {/* Bubble 4: Passed/Failed/Untested */}
      <div className="bg-green-50 rounded-xl px-5 py-4 text-green-900 text-sm shadow-sm w-full">
        {(() => {
          const passed = data.testedVehicles
            ? data.officeComplianceData.reduce(
                (acc: number, o: any) => acc + o.passedCount,
                0
              )
            : 0;
          const failed = data.testedVehicles ? data.testedVehicles - passed : 0;
          const untested = data.totalVehicles - data.testedVehicles;
          const passPercent =
            data.testedVehicles > 0
              ? Math.round((passed / data.testedVehicles) * 100)
              : 0;
          const failPercent =
            data.testedVehicles > 0
              ? Math.round((failed / data.testedVehicles) * 100)
              : 0;
          return (
            <>
              <span className="font-bold text-green-700">
                {formatNumber(passed)}
              </span>{" "}
              passed (<span className="font-bold">{passPercent}%</span>),{" "}
              <span className="font-bold text-red-600">
                {formatNumber(failed)}
              </span>{" "}
              failed (<span className="font-bold">{failPercent}%</span>).
              {untested > 0 && (
                <>
                  <br />
                  <span className="font-bold text-yellow-600">
                    {formatNumber(untested)}
                  </span>{" "}
                  vehicles are yet to be tested.
                </>
              )}
            </>
          );
        })()}
      </div>
      <div className="text-xs text-green-700 ml-4 mb-2">
        {(() => {
          const passed = data.testedVehicles
            ? data.officeComplianceData.reduce(
                (acc: number, o: any) => acc + o.passedCount,
                0
              )
            : 0;
          const passPercent =
            data.testedVehicles > 0
              ? Math.round((passed / data.testedVehicles) * 100)
              : 0;
          return passPercent >= 80
            ? "✅ Good compliance!"
            : passPercent >= 50
            ? "⚠️ Needs improvement."
            : "❌ Low compliance.";
        })()}
      </div>
      {/* Bubble 5: Compliance rate and offices */}
      <div className="bg-green-50 rounded-xl px-5 py-4 text-green-900 text-sm shadow-sm w-full">
        Compliance rate is{" "}
        <span className="font-bold text-green-800">
          {loading ? 0 : data.complianceRate}%
        </span>{" "}
        across{" "}
        <span className="font-bold text-green-800">
          {formatNumber(loading ? 0 : data.officeDepartments)}
        </span>{" "}
        departments.
      </div>
      <div className="text-xs text-green-700 ml-4 mb-2">
        🏢 Department-wide compliance
      </div>
      {/* Bubble 6: Top and least complying office */}
      {data.officeComplianceData &&
        data.officeComplianceData.length > 0 &&
        (() => {
          const sorted = [...data.officeComplianceData].sort(
            (a: any, b: any) => b.value - a.value
          );
          const top = sorted[0];
          const least = sorted[sorted.length - 1];
          return (
            <>
              <div className="bg-green-50 rounded-xl px-5 py-4 text-green-900 text-sm shadow-sm w-full">
                Top complying office:{" "}
                <span className="font-bold text-green-700">{top.label}</span> (
                {top.value}%).
                <br />
                Least complying office:{" "}
                <span className="font-bold text-red-700">{least.label}</span> (
                {least.value}%).
              </div>
              <div className="text-xs text-green-700 ml-4 mb-2">
                🏆 Office performance highlights
              </div>
            </>
          );
        })()}
      {/* Bubble 7: Compliance trend */}
      <div className="bg-green-50 rounded-xl px-5 py-4 text-green-900 text-sm shadow-sm w-full">
        Compliance rate trend is visualized below.
        <div className="mt-2">
          <svg
            viewBox="0 0 120 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-12"
          >
            <polyline
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinejoin="round"
              points="0,35 20,30 40,32 60,18 80,22 100,10 120,15"
            />
            <circle cx="120" cy="15" r="3" fill="#22c55e" />
          </svg>
          <div className="text-xs text-green-700 text-center mt-1">
            Compliance Rate Trend (see chart for details)
          </div>
        </div>
      </div>
      <div className="text-xs text-green-700 ml-4 mb-2">
        📈 Track progress over time
      </div>
      {/* Chat bubble tail for the last bubble */}
      <span className="absolute left-6 -bottom-2 w-4 h-4 bg-green-50 rotate-45 rounded-sm shadow-sm"></span>
    </div>
    <div className="text-xs text-gray-500 text-center mt-2">
      This summary is generated to help you quickly understand the current
      status and trends of government vehicle emissions.
    </div>
  </aside>
);

export default SummaryAssistant;

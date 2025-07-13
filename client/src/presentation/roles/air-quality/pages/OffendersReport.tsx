import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/shared/ui/card";
import { Button } from "../../../components/shared/ui/button";
import { Input } from "../../../components/shared/ui/input";
import { Label } from "../../../components/shared/ui/label";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";

const OFFENSE_LEVELS = [
  { label: "No Offense", value: "no-offense" },
  { label: "1st Offense", value: "1st-offense" },
  { label: "2nd Offense", value: "2nd-offense" },
  { label: "3rd Offense and Up", value: "3rd-offense-up" },
  { label: "All Levels", value: "all" },
];

// Mock data for demonstration
const MOCK_REPORT_DATA = [
  {
    operator: "1ST BUILDERS CONSTRUCTION",
    plateNumber: "ABC1234",
    offenseLevel: 1,
    lastOffensePaid: "n/a",
    paidStatus: "--",
  },
  {
    operator: "2GO LEASING",
    plateNumber: "XYZ5678",
    offenseLevel: 1,
    lastOffensePaid: "n/a",
    paidStatus: "--",
  },
  // ... more mock rows
];

const MOCK_STATS = {
  "no-offense": { vehicles: 12, drivers: 10 },
  "1st-offense": { vehicles: 308, drivers: 250 },
  "2nd-offense": { vehicles: 50, drivers: 40 },
  "3rd-offense-up": { vehicles: 20, drivers: 15 },
  total: { vehicles: 390, drivers: 315 },
};

const OffendersReport: React.FC = () => {
  const [offenseLevel, setOffenseLevel] = useState("1st-offense");
  const [reportData, setReportData] = useState<any[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [stats, setStats] = useState<any | null>(null);
  const [showStats, setShowStats] = useState(false);

  const handleViewReport = () => {
    // TODO: Replace with actual API call
    setReportData(MOCK_REPORT_DATA);
    setShowReport(true);
  };

  const handleShowStats = () => {
    // TODO: Replace with actual API call
    setStats(MOCK_STATS);
    setShowStats(true);
  };

  // Helper for offense level label
  const getOffenseLabel = (value: string) => {
    const found = OFFENSE_LEVELS.find((l) => l.value === value);
    return found ? found.label : value;
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavBarContainer dashboardType="air-quality" />
        {/* Header Section */}
        <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">
            Available Reports
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
          <div className="px-6">
            <ColorDivider />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Report Parameters (Left) */}
            <Card className="col-span-1 flex flex-col h-full">
              <CardHeader>
                <CardTitle>Offenders Lists</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Label className="mb-2">Offense Level</Label>
                <div className="flex flex-col gap-2 mb-4">
                  {OFFENSE_LEVELS.map((level) => (
                    <label
                      key={level.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="offenseLevel"
                        value={level.value}
                        checked={offenseLevel === level.value}
                        onChange={() => setOffenseLevel(level.value)}
                      />
                      <span>{level.label}</span>
                    </label>
                  ))}
                </div>
                <Button onClick={handleViewReport} className="w-full">
                  View Report
                </Button>
              </CardContent>
            </Card>
            {/* Statistics (Right) */}
            <Card className="col-span-2 flex flex-col h-full">
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-center">
                    <thead>
                      <tr>
                        <th className="border px-2 py-1">Offense Level</th>
                        <th className="border px-2 py-1">Vehicles</th>
                        <th className="border px-2 py-1">Drivers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        "no-offense",
                        "1st-offense",
                        "2nd-offense",
                        "3rd-offense-up",
                        "total",
                      ].map((key) => (
                        <tr key={key}>
                          <td className="border px-2 py-1 font-medium">
                            {key === "total" ? "Total" : getOffenseLabel(key)}
                          </td>
                          <td className="border px-2 py-1">
                            {showStats && stats ? stats[key]?.vehicles : "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {showStats && stats ? stats[key]?.drivers : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button
                  onClick={handleShowStats}
                  className="w-full max-w-xs mt-2"
                >
                  Show Stats
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Report Output Section */}
          {showReport && (
            <div className="mt-10 bg-white rounded-lg shadow p-8 print:p-0">
              {/* Official Header */}
              <div className="text-center mb-6">
                {/* TODO: Replace with actual seal images if available */}
                <div className="flex justify-center items-center gap-4 mb-2">
                  <span className="font-bold text-lg">
                    Republic of the Philippines
                  </span>
                </div>
                <div className="font-semibold text-base">
                  City of Muntinlupa
                </div>
                <div className="font-semibold text-base">
                  ENVIRONMENTAL PROTECTION AND NATURAL RESOURCES OFFICE
                  (E.P.N.R.O.)
                </div>
              </div>
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">OFFENDERS LIST</h2>
                <div className="text-lg font-medium">
                  {getOffenseLabel(offenseLevel)}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-center">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1">No.</th>
                      <th className="border px-2 py-1">Driver / Operator</th>
                      <th className="border px-2 py-1">Plate Number</th>
                      <th className="border px-2 py-1">Offense Level</th>
                      <th className="border px-2 py-1">Last Offense Paid</th>
                      <th className="border px-2 py-1">Paid Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-muted-foreground">
                          No data found for this offense level.
                        </td>
                      </tr>
                    ) : (
                      reportData.map((row, idx) => (
                        <tr key={row.plateNumber + idx}>
                          <td className="border px-2 py-1">{idx + 1}</td>
                          <td className="border px-2 py-1">{row.operator}</td>
                          <td className="border px-2 py-1">
                            {row.plateNumber}
                          </td>
                          <td className="border px-2 py-1">
                            {row.offenseLevel}
                          </td>
                          <td className="border px-2 py-1">
                            {row.lastOffensePaid}
                          </td>
                          <td className="border px-2 py-1">{row.paidStatus}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-right font-medium">
                Total Page No.: 308{" "}
                {/* TODO: Calculate based on data length if paginated */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OffendersReport;

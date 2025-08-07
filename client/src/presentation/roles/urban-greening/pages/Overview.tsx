import React from "react";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import { StatCard } from "@/presentation/components/shared/dashboard/StatCard";
import { EChartsPieChart } from "@/presentation/components/shared/dashboard/EChartsPieChart";
import { EChartsBarChart } from "@/presentation/components/shared/dashboard/EChartsBarChart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/shared/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/presentation/components/shared/ui/table";
import { TreeDeciduous, FileText, Coins } from "lucide-react";

// Mock data
const totalFees2025 = 45200;
const monthlyFees2025 = [
  { month: "Jan", amount: 3200 },
  { month: "Feb", amount: 4100 },
  { month: "Mar", amount: 3800 },
  { month: "Apr", amount: 4200 },
  { month: "May", amount: 3900 },
  { month: "Jun", amount: 4100 },
  { month: "Jul", amount: 3700 },
  { month: "Aug", amount: 4300 },
  { month: "Sep", amount: 4000 },
  { month: "Oct", amount: 3900 },
  { month: "Nov", amount: 4200 },
  { month: "Dec", amount: 3800 },
];
const latePayments = [
  { year: 2024, amount: 2100 },
  { year: 2023, amount: 1800 },
  { year: 2022, amount: 900 },
];
const requestTypePie = [
  { id: "pruning", label: "Pruning", value: 45 },
  { id: "cutting", label: "Tree Cutting", value: 30 },
  { id: "violation", label: "Violation/Complaints", value: 12 },
];
const statusPie = [
  { id: "filed", label: "Filed", value: 40 },
  { id: "payment", label: "Payment & Pick-Up", value: 18 },
  { id: "hold", label: "On Hold", value: 8 },
  { id: "signature", label: "For Signature", value: 21 },
];
const treesBar = [
  { id: "narra", label: "Narra", value: 18 },
  { id: "acacia", label: "Acacia", value: 12 },
  { id: "mahogany", label: "Mahogany", value: 9 },
  { id: "mango", label: "Mango", value: 7 },
  { id: "others", label: "Others", value: 6 },
];
const floraBar = [
  { id: "narra", label: "Narra", value: 120 },
  { id: "acacia", label: "Acacia", value: 80 },
  { id: "mahogany", label: "Mahogany", value: 60 },
  { id: "mango", label: "Mango", value: 40 },
  { id: "ipil-ipil", label: "Ipil-Ipil", value: 30 },
  { id: "others", label: "Others", value: 25 },
];

// Add mock data for new section
const saplingsCollected = [
  { species: "Narra", count: 30 },
  { species: "Acacia", count: 22 },
  { species: "Mahogany", count: 15 },
  { species: "Mango", count: 10 },
  { species: "Others", count: 8 },
];
const urbanGreeningPlanted = [
  { type: "Ornamental Plants", count: 120 },
  { type: "Trees", count: 85 },
  { type: "Seeds", count: 60 },
  { type: "Seeds (Private)", count: 25 },
];
const urbanGreeningBreakdownPie = [
  { id: "ornamentals", label: "Ornamentals", value: 120 },
  { id: "seeds", label: "Seeds", value: 60 },
  { id: "trees", label: "Trees", value: 85 },
  { id: "seeds_private", label: "Seeds (Private)", value: 25 },
];

const UrbanGreeningOverview: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavBarContainer dashboardType="urban-greening" />

        {/* Header Section */}
        <div className="flex items-center justify-between bg-white px-6 py-3 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">
            Urban Greening Overview
          </h1>
        </div>

        {/* Body Section */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#F9FBFC]">
          <div className="px-4">
            <ColorDivider />
          </div>

          {/* Stat Cards - Compact 3 column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4 mb-4">
            <StatCard
              title="Fees Collected 2025"
              value={`₱${totalFees2025.toLocaleString()}`}
              icon={<Coins className="w-5 h-5 text-green-700" />}
              description="This year"
            />
          </div>

          {/* Main Dashboard Grid - 3 columns for better space utilization */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column - Tables */}
            <div className="space-y-4">
              <Card className="h-80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Monthly 2025 Fees</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Month</TableHead>
                          <TableHead className="text-xs">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {monthlyFees2025.map((row) => (
                          <TableRow key={row.month}>
                            <TableCell className="text-xs py-1">
                              {row.month}
                            </TableCell>
                            <TableCell className="text-xs py-1">
                              ₱{row.amount.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-64">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Late Payment Clearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Year</TableHead>
                        <TableHead className="text-xs">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {latePayments.map((row) => (
                        <TableRow key={row.year}>
                          <TableCell className="text-xs py-1">
                            {row.year}
                          </TableCell>
                          <TableCell className="text-xs py-1">
                            ₱{row.amount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Middle Column - Pie Charts */}
            <div className="space-y-4">
              <EChartsPieChart
                title="Request Types (2025)"
                data={requestTypePie}
                height={180}
              />
              <EChartsPieChart
                title="Clearance Status"
                data={statusPie}
                height={180}
              />
            </div>

            {/* Right Column - Bar Charts */}
            <div className="space-y-4">
              <EChartsBarChart
                title="Trees to Cut/Prune"
                data={treesBar}
                height={180}
                color={["#4f46e5", "#22c55e", "#f59e42", "#eab308", "#a3e635"]}
              />
              <EChartsBarChart
                title="Flora Data"
                data={floraBar}
                height={180}
                color={[
                  "#22c55e",
                  "#4f46e5",
                  "#f59e42",
                  "#eab308",
                  "#a3e635",
                  "#818cf8",
                ]}
              />
            </div>
          </div>

          {/* Additional Section: Planting & Replacements */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Plant Saplings Collected Table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Plant Saplings Collected (Replacements)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Species</TableHead>
                      <TableHead className="text-xs">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {saplingsCollected.map((row) => (
                      <TableRow key={row.species}>
                        <TableCell className="text-xs py-1">
                          {row.species}
                        </TableCell>
                        <TableCell className="text-xs py-1">
                          {row.count}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Urban Greening Planted Table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  URBAN GREENING (NUMBER OF ORNAMENTAL PLANT AND TREES PLANTED)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {urbanGreeningPlanted.map((row) => (
                      <TableRow key={row.type}>
                        <TableCell className="text-xs py-1">
                          {row.type}
                        </TableCell>
                        <TableCell className="text-xs py-1">
                          {row.count}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Urban Greening Breakdown Pie Chart */}
            <div>
              <EChartsPieChart
                title="URBAN GREENING (BREAKDOWN)"
                data={urbanGreeningBreakdownPie}
                height={200}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrbanGreeningOverview;

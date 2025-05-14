import React, { useState } from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/shared/ui/table";
import RecordInfo from "./smokeBelcher/RecordInfo";
import Violations from "./smokeBelcher/Violations";
import RecordHistory from "./smokeBelcher/RecordHistory";
import { ChevronUp, ChevronDown, FileText, AlertTriangle } from "lucide-react";

const mockBelchers = [
  {
    id: "1",
    plateNumber: "ABC-1234",
    vehicleType: "Truck",
    operator: "Juan Dela Cruz",
    operatorAddress: "123 Main St, City",
    recordAddress: "456 Record Ave, City",
    recordStatus: "apprehended",
    licenseValidUntil: "2025-01-01",
    offenseLevel: 2,
    lastDateApprehended: "2024-05-01",
    orderOfPayment: "OP-2024-001",
    violationSummary: "Excessive smoke emission detected.",
    history: [
      { date: "2024-05-01", action: "Apprehended", user: "Officer A" },
      {
        date: "2024-05-02",
        action: "Order of Payment Issued",
        user: "Officer B",
      },
    ],
  },
  {
    id: "2",
    plateNumber: "XYZ-5678",
    vehicleType: "Bus",
    operator: "Maria Santos",
    operatorAddress: "789 Main St, City",
    recordAddress: "101 Record Ave, City",
    recordStatus: "new",
    licenseValidUntil: "2024-12-31",
    offenseLevel: 1,
    lastDateApprehended: "2024-04-15",
    orderOfPayment: "OP-2024-002",
    violationSummary: "Failed emission test.",
    history: [{ date: "2024-04-15", action: "Apprehended", user: "Officer C" }],
  },
];

const SmokeBelcherMenu = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    mockBelchers[0].id
  );
  const [tab, setTab] = useState<"violations" | "history">("violations");
  const [sort, setSort] = useState<{ col: string; dir: "asc" | "desc" }>({
    col: "plateNumber",
    dir: "asc",
  });

  const handleSort = (col: string) => {
    setSort((prev) =>
      prev.col === col
        ? { col, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { col, dir: "asc" }
    );
  };

  const filtered = mockBelchers.filter(
    (b) =>
      b.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.operator.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sorted = [...filtered].sort((a, b) => {
    const { col, dir } = sort;
    const aVal = a[col] ?? "";
    const bVal = b[col] ?? "";
    if (aVal < bVal) return dir === "asc" ? -1 : 1;
    if (aVal > bVal) return dir === "asc" ? 1 : -1;
    return 0;
  });
  const selected =
    mockBelchers.find((b) => b.id === selectedId) || mockBelchers[0];

  return (
    <div className="flex h-full">
      {/* Left: Search + Table */}
      <div
        className="w-[320px] min-w-[260px] max-w-[340px] h-full flex flex-col gap-4 border-r bg-white sticky left-0 top-0 z-10 py-6"
        style={{ height: "100vh" }}
      >
        <div className="flex-1 flex flex-col">
          <div className="px-4">
            <Input
              placeholder="Search by plate, operator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm mb-2"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("plateNumber")}
                >
                  Plate No{" "}
                  {sort.col === "plateNumber" &&
                    (sort.dir === "asc" ? (
                      <ChevronUp className="inline w-4 h-4" />
                    ) : (
                      <ChevronDown className="inline w-4 h-4" />
                    ))}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("vehicleType")}
                >
                  Type{" "}
                  {sort.col === "vehicleType" &&
                    (sort.dir === "asc" ? (
                      <ChevronUp className="inline w-4 h-4" />
                    ) : (
                      <ChevronDown className="inline w-4 h-4" />
                    ))}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("operator")}
                >
                  Operator{" "}
                  {sort.col === "operator" &&
                    (sort.dir === "asc" ? (
                      <ChevronUp className="inline w-4 h-4" />
                    ) : (
                      <ChevronDown className="inline w-4 h-4" />
                    ))}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((b) => (
                <TableRow
                  key={b.id}
                  className={
                    (selectedId === b.id ? "bg-blue-50 " : "") +
                    "hover:bg-blue-100 transition cursor-pointer text-sm h-8"
                  }
                  onClick={() => setSelectedId(b.id)}
                  style={{ cursor: "pointer" }}
                >
                  <TableCell className="py-1.5 px-2 align-middle">
                    {b.plateNumber}
                  </TableCell>
                  <TableCell className="py-1.5 px-2 align-middle">
                    {b.vehicleType}
                  </TableCell>
                  <TableCell className="py-1.5 px-2 align-middle">
                    {b.operator}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Right: Record Info + Tabs */}
      <div className="flex-1 flex flex-col gap-4 overflow-auto bg-muted/50">
        <div className="border-b bg-white">
          <RecordInfo
            plateNumber={selected.plateNumber}
            vehicleType={selected.vehicleType}
            operatorName={selected.operator}
            operatorAddress={selected.operatorAddress}
            recordAddress={selected.recordAddress}
            recordStatus={
              selected.recordStatus as "apprehended" | "new" | "no offense"
            }
            licenseValidUntil={selected.licenseValidUntil}
            onAddToCEC={() => alert("Add to CEC Queue")}
            onPrintClearance={() => alert("Print Clearance")}
          />
        </div>

        <div className="flex gap-2 mb-2 pl-4">
          <button
            onClick={() => setTab("violations")}
            className={
              (tab === "violations"
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md "
                : "border border-red-200 text-red-700 bg-white hover:bg-red-50 ") +
              "flex items-center gap-2 px-4 py-2 rounded-lg transition font-semibold focus:outline-none focus:ring-2 focus:ring-red-300"
            }
          >
            <AlertTriangle size={16} /> Violations
          </button>
          <button
            onClick={() => setTab("history")}
            className={
              (tab === "history"
                ? "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md "
                : "border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 ") +
              "flex items-center gap-2 px-4 py-2 rounded-lg transition font-semibold focus:outline-none focus:ring-2 focus:ring-gray-300"
            }
          >
            <FileText size={16} /> Record History
          </button>
        </div>
        <div className="flex-1 mt-0 overflow-auto px-4">
          {tab === "violations" ? (
            <Violations
              offenseLevel={selected.offenseLevel}
              lastDateApprehended={selected.lastDateApprehended}
              orderOfPayment={selected.orderOfPayment}
              violationSummary={selected.violationSummary}
            />
          ) : (
            <RecordHistory history={selected.history} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SmokeBelcherMenu;

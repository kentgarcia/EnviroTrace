import React, { useState, useEffect } from "react";
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
import {
  fetchBelchingRecords,
  createBelchingRecord,
  updateBelchingRecord,
  deleteBelchingRecord,
} from "@/lib/api/belching-api";

type BelchingRecord = {
  id: number | string;
  plateNumber: string;
  vehicleType: string;
  operator: string;
  operatorAddress: string;
  recordAddress: string;
  recordStatus: string;
  licenseValidUntil: string;
  offenseLevel: number;
  lastDateApprehended: string;
  orderOfPayment: string;
  violationSummary: string;
  createdAt?: string;
  updatedAt?: string;
  history?: any[]; // Adjust as needed for your history structure
};

const SmokeBelcherMenu = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<BelchingRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"violations" | "history">("violations");
  const [sort, setSort] = useState<{ col: string; dir: "asc" | "desc" }>({
    col: "plateNumber",
    dir: "asc",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchBelchingRecords()
      .then((data) => {
        setRecords(data);
        if (data.length > 0 && !selectedId)
          setSelectedId(data[0].id.toString());
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (col: string) => {
    setSort((prev) =>
      prev.col === col
        ? { col, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { col, dir: "asc" }
    );
  };

  const filtered = records.filter(
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
    records.find((b) => b.id.toString() === selectedId) || records[0];

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
                    (selectedId === b.id.toString()
                      ? "bg-blue-100 border-l-4 border-blue-500 "
                      : "") +
                    "hover:bg-blue-50 transition-colors cursor-pointer text-sm h-8"
                  }
                  onClick={() => setSelectedId(b.id.toString())}
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
      <div className="flex-1 flex flex-col gap-4 overflow-auto bg-gray-50">
        <div className="border-b bg-white">
          {selected && (
            <RecordInfo
              plateNumber={selected.plateNumber}
              vehicleType={selected.vehicleType}
              operatorName={selected.operator}
              operatorAddress={selected.operatorAddress}
              recordAddress={selected.recordAddress}
              recordStatus={
                selected.recordStatus as "new" | "apprehended" | "no offense"
              }
              licenseValidUntil={selected.licenseValidUntil}
              onAddToCEC={() => alert("Add to CEC Queue")}
              onPrintClearance={() => alert("Print Clearance")}
            />
          )}
        </div>

        {/* Flat tab buttons */}
        <div className="flex gap-2 mb-2 pl-4 border-b border-gray-200">
          <button
            onClick={() => setTab("violations")}
            className={
              (tab === "violations"
                ? "border-b-2 border-red-600 text-red-700 bg-transparent "
                : "text-gray-700 bg-transparent hover:bg-gray-100 ") +
              "flex items-center gap-2 px-4 py-2 transition font-semibold focus:outline-none"
            }
            style={{ borderRadius: 0 }}
          >
            <AlertTriangle size={16} /> Violations
          </button>
          <button
            onClick={() => setTab("history")}
            className={
              (tab === "history"
                ? "border-b-2 border-gray-600 text-gray-800 bg-transparent "
                : "text-gray-700 bg-transparent hover:bg-gray-100 ") +
              "flex items-center gap-2 px-4 py-2 transition font-semibold focus:outline-none"
            }
            style={{ borderRadius: 0 }}
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
            <RecordHistory history={selected.history ?? []} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SmokeBelcherMenu;

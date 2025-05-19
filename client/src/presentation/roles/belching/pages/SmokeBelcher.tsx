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
import RecordInfo from "../components/smokeBelcher/RecordInfo";
import Violations from "../components/smokeBelcher/Violations";
import RecordHistory from "../components/smokeBelcher/RecordHistory";
import {
  ChevronUp,
  ChevronDown,
  FileText,
  AlertTriangle,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import {
  fetchBelchingRecords,
  createBelchingRecord,
  updateBelchingRecord,
  deleteBelchingRecord,
} from "@/lib/api/belching-api";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";

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

const initialForm = {
  plateNumber: "",
  vehicleType: "",
  operator: "",
  operatorAddress: "",
  recordAddress: "",
  recordStatus: "new",
  licenseValidUntil: "",
  offenseLevel: 1,
  lastDateApprehended: "",
  orderOfPayment: "",
  violationSummary: "",
};

// Utility to strip out fields not allowed by BelchingRecordInput
function toBelchingRecordInput(data: any) {
  return {
    plateNumber: data.plateNumber,
    vehicleType: data.vehicleType,
    operator: data.operator,
    operatorAddress: data.operatorAddress,
    recordAddress: data.recordAddress,
    recordStatus: data.recordStatus,
    licenseValidUntil: data.licenseValidUntil,
    offenseLevel: data.offenseLevel,
    lastDateApprehended: data.lastDateApprehended,
    orderOfPayment: data.orderOfPayment,
    violationSummary: data.violationSummary,
  };
}

const SmokeBelcher = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<BelchingRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"violations" | "history">("violations");
  const [sort, setSort] = useState<{ col: string; dir: "asc" | "desc" }>({
    col: "plateNumber",
    dir: "asc",
  });
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [infoMode, setInfoMode] = useState<"view" | "add" | "edit">("view");
  const [formData, setFormData] = useState<any>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  // Replace openAddModal and openEditModal with:
  const startAdd = () => {
    setInfoMode("add");
    setFormData(initialForm);
    setSelectedId(null);
  };
  const startEdit = (record: BelchingRecord) => {
    setInfoMode("edit");
    setFormData({ ...record });
  };
  const cancelEdit = () => {
    setInfoMode("view");
    if (records.length > 0 && selectedId) {
      const rec = records.find((b) => b.id.toString() === selectedId);
      if (rec) setFormData({ ...rec });
    } else {
      setFormData(initialForm);
    }
  };
  const handleInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? Number(value) : value,
    });
  };
  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = toBelchingRecordInput(formData);
    if (infoMode === "add") {
      await createBelchingRecord(input);
    } else if (infoMode === "edit" && formData.id) {
      await updateBelchingRecord(formData.id, input);
    }
    setInfoMode("view");
    fetchBelchingRecords().then((data) => {
      setRecords(data);
      if (infoMode === "add" && data.length > 0) {
        setSelectedId(data[data.length - 1].id.toString());
      } else if (formData.id) {
        setSelectedId(formData.id.toString());
      }
    });
  };
  // Delete Dialog Handlers
  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };
  const handleDelete = async () => {
    if (deletingId) {
      await deleteBelchingRecord(deletingId);
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      fetchBelchingRecords().then(setRecords);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavBarContainer dashboardType="air-quality" />

        {/* Header Section */}
        <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">
            Smoke Belcher
          </h1>
        </div>

        <div className="flex h-full">
          {/* Left: Search + Table */}
          <div
            className="w-[320px] min-w-[260px] max-w-[340px] h-full flex flex-col gap-4 border-r bg-white sticky left-0 top-0 z-10 py-6"
            style={{ height: "100vh" }}
          >
            <div className="flex-1 flex flex-col">
              <div className="px-4 flex items-center justify-between mb-2">
                <Input
                  placeholder="Search by plate, operator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
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
          {/* Delete Confirmation Dialog */}
          {isDeleteDialogOpen && (
            <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm">
                <h2 className="text-lg font-bold mb-4 text-red-700">
                  Delete Record
                </h2>
                <p>Are you sure you want to delete this record?</p>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
          {/* Right: Record Info + Tabs */}
          <div className="flex-1 flex flex-col gap-4 overflow-auto bg-gray-50">
            <div className="border-b bg-white">
              <div className="flex gap-2 p-4 border-b border-gray-200">
                {infoMode === "view" && (
                  <Button
                    size="sm"
                    className="bg-blue-700 text-white"
                    onClick={startAdd}
                  >
                    <Plus size={16} className="mr-1" /> New Record
                  </Button>
                )}
                {infoMode === "view" && selected && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(selected)}
                    >
                      <Pencil size={16} className="mr-1" /> Edit Record
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openDeleteDialog(selected.id.toString())}
                    >
                      <Trash2 size={16} className="mr-1" /> Delete Record
                    </Button>
                  </>
                )}
              </div>
              {infoMode === "add" || infoMode === "edit" ? (
                <RecordInfo
                  mode={infoMode}
                  formData={formData}
                  onChange={handleInfoChange}
                  onSubmit={handleInfoSubmit}
                  onCancel={cancelEdit}
                  plateNumber={formData.plateNumber || ""}
                  vehicleType={formData.vehicleType || ""}
                  operatorName={formData.operator || ""}
                  operatorAddress={formData.operatorAddress || ""}
                  recordAddress={formData.recordAddress || ""}
                  recordStatus={formData.recordStatus || "new"}
                  licenseValidUntil={formData.licenseValidUntil || ""}
                />
              ) : selected ? (
                <RecordInfo
                  plateNumber={selected.plateNumber}
                  vehicleType={selected.vehicleType}
                  operatorName={selected.operator}
                  operatorAddress={selected.operatorAddress}
                  recordAddress={selected.recordAddress}
                  recordStatus={
                    selected.recordStatus as
                      | "new"
                      | "apprehended"
                      | "no offense"
                  }
                  licenseValidUntil={selected.licenseValidUntil}
                  onAddToCEC={() => alert("Add to CEC Queue")}
                  onPrintClearance={() => alert("Print Clearance")}
                  onEdit={() => startEdit(selected)}
                  onDelete={() => openDeleteDialog(selected.id.toString())}
                />
              ) : null}
            </div>
            {/* Flat tab buttons and tab content only if selected */}
            {selected && (
              <>
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
                      recordId={Number(selected.id)}
                      offenseLevel={selected.offenseLevel}
                      lastDateApprehended={selected.lastDateApprehended}
                      orderOfPayment={selected.orderOfPayment}
                      violationSummary={selected.violationSummary}
                    />
                  ) : (
                    <RecordHistory recordId={Number(selected.id)} />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmokeBelcher;

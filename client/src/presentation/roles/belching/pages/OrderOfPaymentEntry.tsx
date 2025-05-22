import React, { useState, useEffect } from "react";
import { fetchBelchingRecords } from "@/lib/api/belching-api";
import { fetchBelchingViolations } from "@/lib/api/belching-api";
import { createOrderOfPayment } from "@/lib/api/order-of-payments-api";
import { Button } from "@/presentation/components/shared/ui/button";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";

const initialForm = {
  // Request Info
  status: "Unpaid",
  plateNo: "",
  orderNo: "",
  operator: "",
  // Testing Info
  testingOfficer: "",
  testResults: "Pending",
  dateOfTesting: new Date().toISOString().split("T")[0],
  // Payment Checklist
  apprehensionFee: 0,
  voluntaryFee: 0,
  impoundFee: 0,
  driverAmount: 0,
  operatorAmount: 0,
};

const OrderOfPaymentEntry = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [violations, setViolations] = useState<any[]>([]);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBelchingRecords().then(setRecords);
  }, []);

  useEffect(() => {
    if (selectedRecord) {
      setForm((f) => ({
        ...f,
        plateNo: selectedRecord.plateNumber,
        operator: selectedRecord.operator,
      }));
      fetchBelchingViolations(selectedRecord.id).then(setViolations);
    } else {
      setViolations([]);
    }
  }, [selectedRecord]);

  // Filter records for search
  const filteredRecords = records.filter(
    (r) =>
      r.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.operator.toLowerCase().includes(search.toLowerCase())
  );

  // Totals
  const totalUndiscounted =
    Number(form.apprehensionFee) +
    Number(form.voluntaryFee) +
    Number(form.impoundFee);
  const grandTotal =
    totalUndiscounted + Number(form.driverAmount) + Number(form.operatorAmount);

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      await createOrderOfPayment({
        ...form,
        amount: grandTotal,
        dateIssued: new Date().toISOString().split("T")[0],
      });
      setSuccess("Order of Payment saved successfully.");
      setForm(initialForm);
      setSelectedRecord(null);
      setViolations([]);
    } catch (err: any) {
      setError(err.message || "Failed to save order of payment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavBarContainer dashboardType="air-quality" />
        <ColorDivider variant="secondary" />

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Record Selection */}
          <div className="bg-white shadow p-4 mb-4">
            <h2 className="text-lg font-bold mb-2 text-blue-900">
              Select Record
            </h2>
            <input
              type="text"
              placeholder="Search by plate number or operator name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded px-2 py-1 w-full mb-2"
            />
            <div className="max-h-40 overflow-y-auto border rounded">
              {filteredRecords.slice(0, 10).map((r) => (
                <div
                  key={r.id}
                  className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${selectedRecord && selectedRecord.id === r.id
                      ? "bg-blue-100 font-bold"
                      : ""
                    }`}
                  onClick={() => setSelectedRecord(r)}
                >
                  {r.plateNumber} — {r.operator}
                </div>
              ))}
              {filteredRecords.length === 0 && (
                <div className="px-3 py-2 text-gray-500">No records found.</div>
              )}
            </div>
          </div>

          {/* Section 1: Request Information */}
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-lg font-bold mb-2 text-blue-900">
              Request Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value }))
                  }
                  className="border rounded px-2 py-1 w-full"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Plate Number
                </label>
                <input
                  type="text"
                  value={form.plateNo}
                  readOnly
                  className="border rounded px-2 py-1 w-full bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  OOP Control No.
                </label>
                <input
                  type="text"
                  value={form.orderNo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, orderNo: e.target.value }))
                  }
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Operator
                </label>
                <input
                  type="text"
                  value={form.operator}
                  readOnly
                  className="border rounded px-2 py-1 w-full bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Testing Information */}
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-lg font-bold mb-2 text-blue-900">
              Testing Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Testing Officer
                </label>
                <input
                  type="text"
                  value={form.testingOfficer}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, testingOfficer: e.target.value }))
                  }
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Test Results
                </label>
                <select
                  value={form.testResults}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, testResults: e.target.value }))
                  }
                  className="border rounded px-2 py-1 w-full"
                >
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Date of Testing
                </label>
                <input
                  type="date"
                  value={form.dateOfTesting}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dateOfTesting: e.target.value }))
                  }
                  className="border rounded px-2 py-1 w-full"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payment Checklist */}
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-lg font-bold mb-2 text-blue-900">
              Payment Checklist
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Apprehension Fee
                </label>
                <input
                  type="number"
                  value={form.apprehensionFee}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      apprehensionFee: Number(e.target.value),
                    }))
                  }
                  min={0}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Voluntary Fee
                </label>
                <input
                  type="number"
                  value={form.voluntaryFee}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      voluntaryFee: Number(e.target.value),
                    }))
                  }
                  min={0}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Impound Fee
                </label>
                <input
                  type="number"
                  value={form.impoundFee}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      impoundFee: Number(e.target.value),
                    }))
                  }
                  min={0}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Driver Amount
                </label>
                <input
                  type="number"
                  value={form.driverAmount}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      driverAmount: Number(e.target.value),
                    }))
                  }
                  min={0}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Operator Amount
                </label>
                <input
                  type="number"
                  value={form.operatorAmount}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      operatorAmount: Number(e.target.value),
                    }))
                  }
                  min={0}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <div className="text-sm font-medium">
                Total Undiscounted:{" "}
                <span className="font-bold">
                  ₱{totalUndiscounted.toLocaleString()}
                </span>
              </div>
              <div className="text-sm font-medium">
                Grand Total:{" "}
                <span className="font-bold text-blue-700">
                  ₱{grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Violation Table */}
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-lg font-bold mb-2 text-blue-900">Violations</h2>
            {selectedRecord ? (
              violations.length > 0 ? (
                <table className="w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">Date</th>
                      <th className="p-2 border">Place</th>
                      <th className="p-2 border">Driver Name</th>
                      <th className="p-2 border">Offense</th>
                      <th className="p-2 border">Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {violations.map((v) => (
                      <tr key={v.id}>
                        <td className="p-2 border">{v.dateOfApprehension}</td>
                        <td className="p-2 border">{v.place}</td>
                        <td className="p-2 border">{v.driverName}</td>
                        <td className="p-2 border">{v.driverOffense}</td>
                        <td className="p-2 border text-center">
                          {v.paid ? "✔" : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-gray-500">
                  No violations found for this record.
                </div>
              )
            ) : (
              <div className="text-gray-500">
                Select a record to view violations.
              </div>
            )}
          </div>

          {/* Save Button (scaffolded) */}
          <div className="flex flex-col items-end mt-6 gap-2">
            {success && (
              <div className="text-green-700 font-semibold">{success}</div>
            )}
            {error && <div className="text-red-700 font-semibold">{error}</div>}
            <Button
              className="bg-blue-700 text-white"
              disabled={!selectedRecord || saving}
              onClick={handleSave}
            >
              {saving ? "Saving..." : "Save Order of Payment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderOfPaymentEntry;

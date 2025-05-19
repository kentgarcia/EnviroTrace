import React, { useEffect, useState } from "react";
import { fetchBelchingViolations } from "@/lib/api/belching-api";
import { Button } from "@/presentation/components/shared/ui/button";
import { FileText, Receipt } from "lucide-react";

interface ViolationsProps {
  recordId: number;
  offenseLevel: number;
  lastDateApprehended: string;
  orderOfPayment: string;
  violationSummary: string;
}

const Violations: React.FC<ViolationsProps> = ({
  recordId,
  offenseLevel,
  lastDateApprehended,
  orderOfPayment,
  violationSummary,
}) => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchBelchingViolations(recordId)
      .then(setRows)
      .catch(() => setError("Failed to load violations."))
      .finally(() => setLoading(false));
  }, [recordId]);

  return (
    <div className="bg-white border border-red-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-lg font-bold text-red-800">Violations</div>
          <div className="text-xs text-gray-500">
            Operator Offense Level:{" "}
            <span className="font-semibold text-red-700">{offenseLevel}</span>
          </div>
          <div className="text-xs text-gray-500">
            Last Date Apprehended:{" "}
            <span className="font-semibold">{lastDateApprehended}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 min-w-[160px] items-end">
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-2 px-4 py-2 rounded transition border border-red-600 shadow-none"
          >
            <Receipt size={16} /> Order of Payment
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50 flex items-center gap-2 px-4 py-2 rounded transition shadow-none"
          >
            <FileText size={16} /> Violation Summary
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && (
          <table className="min-w-full text-xs border rounded bg-white">
            <thead className="bg-red-50 border-b border-red-200">
              <tr>
                <th className="px-2 py-1 font-semibold text-left">
                  Operator Offense
                </th>
                <th className="px-2 py-1 font-semibold text-left">
                  Date of Apprehension
                </th>
                <th className="px-2 py-1 font-semibold text-left">
                  Place of Apprehension
                </th>
                <th className="px-2 py-1 font-semibold text-left">
                  Driver Name
                </th>
                <th className="px-2 py-1 font-semibold text-left">
                  Driver Offense
                </th>
                <th className="px-2 py-1 font-semibold text-center">Paid</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-2">
                    No violations found.
                  </td>
                </tr>
              )}
              {rows.map((row, idx) => (
                <tr key={row.id || idx} className="even:bg-red-50">
                  <td className="px-2 py-1">{row.operatorOffense}</td>
                  <td className="px-2 py-1">{row.dateOfApprehension}</td>
                  <td className="px-2 py-1">{row.place}</td>
                  <td className="px-2 py-1">{row.driverName}</td>
                  <td className="px-2 py-1">{row.driverOffense}</td>
                  <td className="px-2 py-1 text-center">
                    {row.paid ? (
                      <span className="text-green-600 font-bold">✔</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Violations;

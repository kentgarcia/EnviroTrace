import React from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { FileText, Receipt } from "lucide-react";

interface ViolationRow {
  operatorOffense: string;
  dateOfApprehension: string;
  placeOfApprehension: string;
  driverName: string;
  driverOffense: string;
  paidDriver: boolean;
  paidOperator: boolean;
}

interface ViolationsProps {
  offenseLevel: number;
  lastDateApprehended: string;
  orderOfPayment: string;
  violationSummary: string;
  rows?: ViolationRow[];
}

const Violations: React.FC<ViolationsProps> = ({
  offenseLevel,
  lastDateApprehended,
  orderOfPayment,
  violationSummary,
  rows = [
    {
      operatorOffense: "1st Offense",
      dateOfApprehension: "2024-05-01",
      placeOfApprehension: "Main St",
      driverName: "Juan Dela Cruz",
      driverOffense: "Excessive smoke",
      paidDriver: false,
      paidOperator: true,
    },
    {
      operatorOffense: "2nd Offense",
      dateOfApprehension: "2024-06-10",
      placeOfApprehension: "2nd Ave",
      driverName: "Maria Santos",
      driverOffense: "Failed emission test",
      paidDriver: true,
      paidOperator: false,
    },
  ],
}) => {
  return (
    <div className="bg-gradient-to-br from-red-50 to-white border-2 border-red-200 rounded-2xl shadow-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-lg font-bold text-red-900">Violations</div>
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
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-md flex items-center gap-2 px-4 py-2 rounded-lg transition"
          >
            <Receipt size={16} /> Order of Payment
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50 flex items-center gap-2 px-4 py-2 rounded-lg transition"
          >
            <FileText size={16} /> Violation Summary
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border rounded shadow bg-white">
          <thead className="bg-red-100">
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
              <th className="px-2 py-1 font-semibold text-left">Driver Name</th>
              <th className="px-2 py-1 font-semibold text-left">
                Driver Offense
              </th>
              <th className="px-2 py-1 font-semibold text-center">
                Paid Driver
              </th>
              <th className="px-2 py-1 font-semibold text-center">
                Paid Operator
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="even:bg-red-50">
                <td className="px-2 py-1">{row.operatorOffense}</td>
                <td className="px-2 py-1">{row.dateOfApprehension}</td>
                <td className="px-2 py-1">{row.placeOfApprehension}</td>
                <td className="px-2 py-1">{row.driverName}</td>
                <td className="px-2 py-1">{row.driverOffense}</td>
                <td className="px-2 py-1 text-center">
                  {row.paidDriver ? (
                    <span className="text-green-600 font-bold">✔</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-2 py-1 text-center">
                  {row.paidOperator ? (
                    <span className="text-green-600 font-bold">✔</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Violations;

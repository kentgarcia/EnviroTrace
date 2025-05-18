import React from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Info, Printer, PlusCircle } from "lucide-react";

interface RecordInfoProps {
  plateNumber: string;
  vehicleType: string;
  operatorName: string;
  operatorAddress: string;
  recordAddress: string;
  recordStatus: "new" | "apprehended" | "no offense";
  licenseValidUntil: string;
  onAddToCEC: () => void;
  onPrintClearance: () => void;
}

const statusColor = {
  new: "bg-blue-100 text-blue-800 border border-blue-400",
  apprehended: "bg-red-100 text-red-800 border border-red-400",
  "no offense": "bg-green-100 text-green-800 border border-green-400",
};
const statusLabel = {
  new: "New",
  apprehended: "Apprehended",
  "no offense": "No Offense",
};

const RecordInfo: React.FC<RecordInfoProps> = ({
  plateNumber,
  vehicleType,
  operatorName,
  operatorAddress,
  recordAddress,
  recordStatus,
  licenseValidUntil,
  onAddToCEC,
  onPrintClearance,
}) => {
  return (
    <div className="flex overflow-hidden border-b border-gray-200 bg-white">
      {/* Left: Info Fields */}
      <div className="flex-1 p-6">
        <div className="mb-4">
          <div className="text-lg font-bold tracking-wide mb-1 text-blue-900">
            Record Information
          </div>
          <div className="text-xs text-gray-400">
            Vehicle and operator details
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
          <div>
            <label className="text-xs text-gray-500">Plate Number</label>
            <input
              className="w-full bg-gray-100 border border-gray-200 rounded px-2 py-1 text-base font-semibold"
              value={plateNumber}
              readOnly
              tabIndex={-1}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Vehicle Type</label>
            <input
              className="w-full bg-gray-100 border border-gray-200 rounded px-2 py-1 text-base"
              value={vehicleType}
              readOnly
              tabIndex={-1}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Operator Name</label>
            <input
              className="w-full bg-gray-100 border border-gray-200 rounded px-2 py-1 text-base"
              value={operatorName}
              readOnly
              tabIndex={-1}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Operator Address</label>
            <input
              className="w-full bg-gray-100 border border-gray-200 rounded px-2 py-1 text-base"
              value={operatorAddress}
              readOnly
              tabIndex={-1}
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500">Record Address</label>
            <input
              className="w-full bg-gray-100 border border-gray-200 rounded px-2 py-1 text-base"
              value={recordAddress}
              readOnly
              tabIndex={-1}
            />
          </div>
        </div>
      </div>
      {/* Right: Status & Actions */}
      <div className="flex flex-col items-center justify-between w-60 py-8 px-4 bg-gray-50 border-l border-gray-200">
        <div className="flex flex-col items-center gap-4 w-full">
          <span
            className={`px-5 py-2 rounded text-base font-bold mb-1 ${statusColor[recordStatus]}`}
          >
            {statusLabel[recordStatus]}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            License valid until
          </span>
          <span className="text-sm font-medium mb-2">{licenseValidUntil}</span>
        </div>
        <div className="flex flex-col gap-3 w-full mt-6">
          <Button
            size="sm"
            onClick={onAddToCEC}
            title="Add to CEC Queue"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center gap-2 w-full justify-center px-4 py-2 rounded transition border border-green-600 shadow-none"
          >
            <PlusCircle size={18} /> Add to CEC Queue
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onPrintClearance}
            title="Print Clearance"
            className="border-blue-400 text-blue-700 hover:bg-blue-50 flex items-center gap-2 w-full justify-center px-4 py-2 rounded transition shadow-none"
          >
            <Printer size={18} /> Print Clearance
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecordInfo;

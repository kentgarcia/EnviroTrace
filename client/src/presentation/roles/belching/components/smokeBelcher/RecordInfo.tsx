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
  new: "bg-blue-500 text-white",
  apprehended: "bg-red-500 text-white",
  "no offense": "bg-green-500 text-white",
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
    <div className="flex overflow-hidden">
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
              className="w-full bg-gray-100 rounded px-2 py-1 text-base font-semibold"
              value={plateNumber}
              readOnly
              tabIndex={-1}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Vehicle Type</label>
            <input
              className="w-full bg-gray-100 rounded px-2 py-1 text-base"
              value={vehicleType}
              readOnly
              tabIndex={-1}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Operator Name</label>
            <input
              className="w-full bg-gray-100 rounded px-2 py-1 text-base"
              value={operatorName}
              readOnly
              tabIndex={-1}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Operator Address</label>
            <input
              className="w-full bg-gray-100 rounded px-2 py-1 text-base"
              value={operatorAddress}
              readOnly
              tabIndex={-1}
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500">Record Address</label>
            <input
              className="w-full bg-gray-100 rounded px-2 py-1 text-base"
              value={recordAddress}
              readOnly
              tabIndex={-1}
            />
          </div>
        </div>
      </div>
      {/* Right: Status & Actions */}
      <div className="flex flex-col items-center justify-between w-60 py-8 px-4 bg-white border-l">
        <div className="flex flex-col items-center gap-4 w-full">
          <span
            className={`px-5 py-2 rounded-xl text-base font-bold mb-1 shadow ${statusColor[recordStatus]}`}
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
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-md flex items-center gap-2 w-full justify-center px-4 py-2 rounded-lg transition"
          >
            <PlusCircle size={18} /> Add to CEC Queue
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onPrintClearance}
            title="Print Clearance"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md flex items-center gap-2 w-full justify-center px-4 py-2 rounded-lg transition border-0"
          >
            <Printer size={18} /> Print Clearance
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecordInfo;

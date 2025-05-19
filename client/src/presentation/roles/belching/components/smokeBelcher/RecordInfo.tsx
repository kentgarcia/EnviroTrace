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
  offenseLevel?: number;
  lastDateApprehended?: string;
  orderOfPayment?: string;
  violationSummary?: string;
  mode?: "view" | "edit" | "add";
  formData?: any;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit?: (e: React.FormEvent) => void;
  onCancel?: () => void;
  onAddToCEC?: () => void;
  onPrintClearance?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
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

const RecordInfo: React.FC<RecordInfoProps> = (props) => {
  const {
    plateNumber,
    vehicleType,
    operatorName,
    operatorAddress,
    recordAddress,
    recordStatus,
    licenseValidUntil,
    offenseLevel,
    lastDateApprehended,
    orderOfPayment,
    violationSummary,
    mode = "view",
    formData,
    onChange,
    onSubmit,
    onCancel,
    onAddToCEC,
    onPrintClearance,
    onEdit,
    onDelete,
  } = props;
  const isEdit = mode === "edit" || mode === "add";
  return (
    <form
      onSubmit={isEdit ? onSubmit : undefined}
      className="flex overflow-hidden border-b border-gray-200 bg-white"
    >
      {/* Left: Info Fields */}
      <div className="flex-1 p-6">
        <div className="mb-4">
          <div className="text-lg font-bold tracking-wide mb-1 text-blue-900">
            {mode === "add"
              ? "Add New Record"
              : mode === "edit"
              ? "Edit Record"
              : "Record Information"}
          </div>
          <div className="text-xs text-gray-400">
            Vehicle and operator details
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
          <div>
            <label className="text-xs text-gray-500">Plate Number</label>
            {isEdit ? (
              <input
                className="w-full border rounded px-2 py-1 text-base font-semibold"
                name="plateNumber"
                value={formData?.plateNumber || ""}
                onChange={onChange}
                required
              />
            ) : (
              <input
                className="w-full bg-gray-100 border border-gray-200 rounded px-2 py-1 text-base font-semibold"
                value={plateNumber}
                readOnly
                tabIndex={-1}
              />
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500">Vehicle Type</label>
            {isEdit ? (
              <input
                className="w-full border rounded px-2 py-1 text-base"
                name="vehicleType"
                value={formData?.vehicleType || ""}
                onChange={onChange}
                required
              />
            ) : (
              <input
                className="w-full bg-gray-100 border border-gray-200 rounded px-2 py-1 text-base"
                value={vehicleType}
                readOnly
                tabIndex={-1}
              />
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500">Operator Name</label>
            {isEdit ? (
              <input
                className="w-full border rounded px-2 py-1 text-base"
                name="operator"
                value={formData?.operator || ""}
                onChange={onChange}
                required
              />
            ) : (
              <input
                className="w-full bg-gray-100 border border-gray-200 rounded px-2 py-1 text-base"
                value={operatorName}
                readOnly
                tabIndex={-1}
              />
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500">Operator Address</label>
            {isEdit ? (
              <input
                className="w-full border rounded px-2 py-1 text-base"
                name="operatorAddress"
                value={formData?.operatorAddress || ""}
                onChange={onChange}
              />
            ) : (
              <input
                className="w-full bg-gray-100 border border-gray-200 rounded px-2 py-1 text-base"
                value={operatorAddress}
                readOnly
                tabIndex={-1}
              />
            )}
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500">Record Address</label>
            {isEdit ? (
              <input
                className="w-full border rounded px-2 py-1 text-base"
                name="recordAddress"
                value={formData?.recordAddress || ""}
                onChange={onChange}
              />
            ) : (
              <input
                className="w-full bg-gray-100 border border-gray-200 rounded px-2 py-1 text-base"
                value={recordAddress}
                readOnly
                tabIndex={-1}
              />
            )}
          </div>
          {/* Hidden fields in view, shown in edit/add */}
          {isEdit && (
            <>
              <div>
                <label className="text-xs text-gray-500">Record Status</label>
                <select
                  name="recordStatus"
                  value={formData?.recordStatus || "new"}
                  onChange={onChange}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="new">New</option>
                  <option value="apprehended">Apprehended</option>
                  <option value="no offense">No Offense</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">
                  License Valid Until
                </label>
                <input
                  name="licenseValidUntil"
                  type="date"
                  className="w-full border rounded px-2 py-1"
                  value={formData?.licenseValidUntil || ""}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Offense Level</label>
                <input
                  name="offenseLevel"
                  type="number"
                  min={1}
                  className="w-full border rounded px-2 py-1"
                  value={formData?.offenseLevel || 1}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">
                  Date Last Apprehended
                </label>
                <input
                  name="lastDateApprehended"
                  type="date"
                  className="w-full border rounded px-2 py-1"
                  value={formData?.lastDateApprehended || ""}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">
                  Order of Payment
                </label>
                <input
                  name="orderOfPayment"
                  className="w-full border rounded px-2 py-1"
                  value={formData?.orderOfPayment || ""}
                  onChange={onChange}
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500">
                  Violation Summary
                </label>
                <input
                  name="violationSummary"
                  className="w-full border rounded px-2 py-1"
                  value={formData?.violationSummary || ""}
                  onChange={onChange}
                />
              </div>
            </>
          )}
        </div>
        {isEdit && (
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-700 text-white">
              {mode === "add" ? "Add" : "Save"}
            </Button>
          </div>
        )}
      </div>
      {/* Right: Status & Actions (view mode only) */}
      {mode === "view" && (
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
            <span className="text-sm font-medium mb-2">
              {licenseValidUntil}
            </span>
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
      )}
    </form>
  );
};

export default RecordInfo;

import React from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Info, Printer, PlusCircle, FileText, Car, User } from "lucide-react";

interface RecordInfoProps {
  plateNumber: string;
  vehicleType: string;
  transportGroup?: string;
  operatorName: string;
  operatorAddress: string;
  ownerFirstName?: string;
  ownerMiddleName?: string;
  ownerLastName?: string;
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
  onRecordsAndFile?: () => void;
  onGarageTesting?: () => void;
  onDriverQuery?: () => void;
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
    transportGroup,
    operatorName,
    operatorAddress,
    ownerFirstName,
    ownerMiddleName,
    ownerLastName,
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
    onRecordsAndFile,
    onGarageTesting,
    onDriverQuery,
  } = props;
  const isEdit = mode === "edit" || mode === "add";
  return (
    <form
      onSubmit={isEdit ? onSubmit : undefined}
      className="p-6 border-b border-gray-200 bg-white"
    >
      <div className="mb-4">
        <div className="text-lg font-bold tracking-wide mb-1 text-blue-900">
          {mode === "add"
            ? "Add New Record"
            : mode === "edit"
              ? "Update Record"
              : ""}
        </div>
      </div>

      {/* Main Content: Two Column Layout */}
      <div className="flex flex-wrap gap-6">
        {/* Column 1: Vehicle and Operator Information */}
        <div className="flex-1 min-w-[320px]">
          <div className="space-y-4">
            {/* Row 1: Plate Number, Vehicle Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Plate Number</label>
                {isEdit ? (
                  <input
                    className="w-full border rounded px-3 py-2 text-base font-semibold"
                    name="plateNumber"
                    value={formData?.plateNumber || ""}
                    onChange={onChange}
                    required
                  />
                ) : (
                  <input
                    className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-base font-semibold"
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
                    className="w-full border rounded px-3 py-2 text-base"
                    name="vehicleType"
                    value={formData?.vehicleType || ""}
                    onChange={onChange}
                    required
                  />
                ) : (
                  <input
                    className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-base"
                    value={vehicleType}
                    readOnly
                    tabIndex={-1}
                  />
                )}
              </div>
            </div>

            {/* Row 2: Operator Name */}
            <div>
              <label className="text-xs text-gray-500">Operator Name</label>
              {isEdit ? (
                <input
                  className="w-full border rounded px-3 py-2 text-base"
                  name="operator"
                  value={formData?.operator || ""}
                  onChange={onChange}
                  required
                />
              ) : (
                <input
                  className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-base"
                  value={operatorName}
                  readOnly
                  tabIndex={-1}
                />
              )}
            </div>

            {/* Row 3: Operator Address */}
            <div>
              <label className="text-xs text-gray-500">Operator Address</label>
              {isEdit ? (
                <input
                  className="w-full border rounded px-3 py-2 text-base"
                  name="operatorAddress"
                  value={formData?.operatorAddress || ""}
                  onChange={onChange}
                />
              ) : (
                <input
                  className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-base"
                  value={operatorAddress}
                  readOnly
                  tabIndex={-1}
                />
              )}
            </div>

            {/* Edit mode additional fields */}
            {isEdit && (
              <>
                <div>
                  <label className="text-xs text-gray-500">Record Address</label>
                  <input
                    className="w-full border rounded px-3 py-2 text-base"
                    name="recordAddress"
                    value={formData?.recordAddress || ""}
                    onChange={onChange}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Record Status</label>
                  <select
                    name="recordStatus"
                    value={formData?.recordStatus || "new"}
                    onChange={onChange}
                    className="w-full border rounded px-3 py-2"
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
                    className="w-full border rounded px-3 py-2"
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
                    className="w-full border rounded px-3 py-2"
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
                    className="w-full border rounded px-3 py-2"
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
                    className="w-full border rounded px-3 py-2"
                    value={formData?.orderOfPayment || ""}
                    onChange={onChange}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">
                    Violation Summary
                  </label>
                  <input
                    name="violationSummary"
                    className="w-full border rounded px-3 py-2"
                    value={formData?.violationSummary || ""}
                    onChange={onChange}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Column 2: Status & Actions */}
        <div className="w-full md:w-auto md:min-w-[280px] space-y-6">
          {mode === "view" ? (
            <>
              {/* Status Display */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-full text-center py-3 mb-3 rounded-md font-bold ${statusColor[recordStatus]}`}
                  >
                    {statusLabel[recordStatus]}
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">License valid until</div>
                    <div className="text-sm font-medium">{licenseValidUntil}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    size="sm"
                    onClick={onAddToCEC}
                    title="Add to CEC Queue"
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center gap-1 justify-center px-3 py-2 rounded transition border border-green-600 shadow-none"
                  >
                    <PlusCircle size={16} /> Add to CEC
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onPrintClearance}
                    title="Print Clearance"
                    className="border-blue-400 text-blue-700 hover:bg-blue-50 flex items-center gap-1 justify-center px-3 py-2 rounded transition shadow-none"
                  >
                    <Printer size={16} /> Print
                  </Button>
                </div>
              </div>
            </>
          ) : (
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
      </div>
    </form>
  );
};

export default RecordInfo;

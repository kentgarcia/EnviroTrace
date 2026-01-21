import React, { useState } from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/presentation/components/shared/ui/tabs";
import { Input } from "@/presentation/components/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/shared/ui/table";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Skeleton } from "@/presentation/components/shared/ui/skeleton";
import {
  Vehicle,
  VehicleFormInput,
  useEmissionTests
} from "@/core/api/emission-service";
import { useVehicle } from "@/core/api/vehicle-service";
import { formatTestDate, formatTestDateTime } from "@/core/utils/dateUtils";

interface VehicleDetailsProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onEditVehicle?: (data: VehicleFormInput) => void;
  isEditing?: boolean;
  onRegisterRefetch?: (refetch: () => void) => void;
}

export const VehicleDetails: React.FC<VehicleDetailsProps> = ({
  vehicle,
  isOpen,
  onClose,
  onEditVehicle,
  isEditing: isEditingProp = false,
  onRegisterRefetch,
}) => {
  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(isEditingProp);
  const [editData, setEditData] = useState<VehicleFormInput | null>(null);

  const {
    data: vehicleData,
    isLoading: isVehicleLoading,
    refetch,
  } = useVehicle(vehicle?.id || "", {
    enabled: isOpen && !!vehicle && !vehicle.id.startsWith("pending-"),
  });

  React.useEffect(() => {
    if (onRegisterRefetch) {
      onRegisterRefetch(() => refetch());
    }
  }, [refetch, onRegisterRefetch, vehicle?.id]);

  const fullVehicle = vehicleData || vehicle;
  const driverHistory = fullVehicle?.driverHistory || [];

  React.useEffect(() => {
    if (isEditing && fullVehicle) {
      setEditData({
        plateNumber: fullVehicle.plate_number || "",
        chassisNumber: fullVehicle.chassis_number || "",
        registrationNumber: fullVehicle.registration_number || "",
        driverName: fullVehicle.driver_name,
        contactNumber: fullVehicle.contact_number || "",
        officeName: fullVehicle.office?.name || "Unknown Office",
        vehicleType: fullVehicle.vehicle_type,
        engineType: fullVehicle.engine_type,
        wheels: fullVehicle.wheels,
        description: fullVehicle.description || "",
        yearAcquired: fullVehicle.year_acquired,
      });
    }
  }, [isEditing, fullVehicle?.id]);

  const {
    data: testData,
    isLoading
  } = useEmissionTests({
    vehicleId: vehicle?.id
  }, {
    enabled: isOpen && !!vehicle && !vehicle.id.startsWith("pending-"),
  });

  const testHistory = testData || [];
  if (!vehicle) return null;

  const isPendingVehicle = vehicle.id.startsWith("pending-");

  return (
    <div className="max-w-3xl w-full mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            {fullVehicle?.plate_number ||
              fullVehicle?.chassis_number ||
              fullVehicle?.registration_number ||
              "Unknown Vehicle"}
            {fullVehicle?.id.startsWith("pending-") && (
              <Badge
                variant="outline"
                className="text-[10px] uppercase font-bold tracking-wider text-amber-600 bg-amber-50 border-amber-200"
              >
                Pending Sync
              </Badge>
            )}
          </div>
          <div className="text-slate-500 text-sm font-medium mt-1 flex items-center gap-2">
            {!fullVehicle?.plate_number && fullVehicle?.chassis_number && (
              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] uppercase font-bold">Chassis</span>
            )}
            {!fullVehicle?.plate_number && !fullVehicle?.chassis_number && fullVehicle?.registration_number && (
              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] uppercase font-bold">Registration</span>
            )}
            <span>Vehicle Fleet Management</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <Button
              size="sm"
              variant="outline"
              className="rounded-lg border-slate-200"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          ) : (
            <Button
              size="sm"
              className="rounded-lg bg-[#0033a0] hover:bg-[#00267a] text-white"
              onClick={() => setIsEditing(true)}
            >
              Edit Details
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger 
            value="info" 
          >
            Information
          </TabsTrigger>
          <TabsTrigger
            value="history"
            disabled={fullVehicle?.id.startsWith("pending-")}
          >
            Test History
          </TabsTrigger>
          <TabsTrigger
            value="drivers"
            disabled={fullVehicle?.id.startsWith("pending-")}
          >
            Drivers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6 mt-0 outline-none">
          {isEditing && editData ? (
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-xl border border-slate-200"
              onSubmit={async (e) => {
                e.preventDefault();
                if (onEditVehicle && editData) {
                  await onEditVehicle(editData);
                  setIsEditing(false);
                }
              }}
            >
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  Plate Number
                </label>
                <Input
                  className="rounded-lg border-slate-200 focus:ring-[#0033a0] focus:border-[#0033a0] h-10"
                  value={editData.plateNumber}
                  onChange={(e) =>
                    setEditData({ ...editData, plateNumber: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  Chassis Number
                </label>
                <Input
                  className="rounded-lg border-slate-200 focus:ring-[#0033a0] focus:border-[#0033a0] h-10"
                  value={editData.chassisNumber}
                  onChange={(e) =>
                    setEditData({ ...editData, chassisNumber: e.target.value })
                  }
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  Registration Number
                </label>
                <Input
                  className="rounded-lg border-slate-200 focus:ring-[#0033a0] focus:border-[#0033a0] h-10"
                  value={editData.registrationNumber}
                  onChange={(e) =>
                    setEditData({ ...editData, registrationNumber: e.target.value })
                  }
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  Driver Name
                </label>
                <Input
                  className="rounded-lg border-slate-200 focus:ring-[#0033a0] focus:border-[#0033a0] h-10"
                  value={editData.driverName}
                  onChange={(e) =>
                    setEditData({ ...editData, driverName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  Contact Number
                </label>
                <Input
                  className="rounded-lg border-slate-200 focus:ring-[#0033a0] focus:border-[#0033a0] h-10"
                  value={editData.contactNumber}
                  onChange={(e) =>
                    setEditData({ ...editData, contactNumber: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  Office
                </label>
                <Input
                  className="rounded-lg border-slate-200 focus:ring-[#0033a0] focus:border-[#0033a0] h-10"
                  value={editData.officeName}
                  onChange={(e) =>
                    setEditData({ ...editData, officeName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  Vehicle Type
                </label>
                <Input
                  className="rounded-lg border-slate-200 focus:ring-[#0033a0] focus:border-[#0033a0] h-10"
                  value={editData.vehicleType}
                  onChange={(e) =>
                    setEditData({ ...editData, vehicleType: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  Engine Type
                </label>
                <Input
                  className="rounded-lg border-slate-200 focus:ring-[#0033a0] focus:border-[#0033a0] h-10"
                  value={editData.engineType}
                  onChange={(e) =>
                    setEditData({ ...editData, engineType: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  Wheels
                </label>
                <Input
                  type="number"
                  min={2}
                  max={18}
                  className="rounded-lg border-slate-200 focus:ring-[#0033a0] focus:border-[#0033a0] h-10"
                  value={editData.wheels}
                  onChange={(e) =>
                    setEditData({ ...editData, wheels: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Description (Optional)
                </label>
                <textarea
                  className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-[#0033a0] focus:border-[#0033a0] resize-none"
                  value={editData.description || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  placeholder="Additional notes or description about the vehicle..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  Year Acquired (Optional)
                </label>
                <Input
                  type="number"
                  min={1900}
                  max={2026}
                  value={editData.yearAcquired || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, yearAcquired: e.target.value ? Number(e.target.value) : undefined })
                  }
                  placeholder="Optional"
                  className="rounded-lg"
                />
              </div>
              <div className="md:col-span-2 pt-4 flex gap-3">
                <Button 
                  type="submit" 
                  className="flex-1 rounded-lg bg-[#0033a0] hover:bg-[#00267a] text-white font-semibold h-10"
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg border-slate-200 h-10"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : !fullVehicle ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
              Vehicle data not available.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <InfoRow label="Plate Number" value={fullVehicle?.plate_number} />
                  <InfoRow label="Chassis Number" value={fullVehicle?.chassis_number} />
                  <InfoRow label="Registration" value={fullVehicle?.registration_number} />
                  <InfoRow label="Vehicle Type" value={fullVehicle?.vehicle_type} />
                </div>
                <div className="space-y-6">
                  <InfoRow label="Engine Type" value={fullVehicle?.engine_type} />
                  <InfoRow label="Wheels" value={fullVehicle?.wheels?.toString()} />
                  <InfoRow label="Year Acquired" value={fullVehicle?.year_acquired?.toString()} />
                  <InfoRow label="Current Driver" value={fullVehicle?.driver_name} />
                  <InfoRow label="Office" value={fullVehicle?.office?.name} />
                </div>
              </div>
              {fullVehicle?.description && (
                <div className="mt-8 pt-8 border-t border-slate-200">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</div>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap">{fullVehicle.description}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-0 outline-none">
          {isPendingVehicle ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500 font-medium">
                Test history will be available after syncing this vehicle.
              </div>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : testHistory.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500 font-medium">
                No test history available for this vehicle.
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 h-10">Test Date</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 h-10">Period</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 h-10">Result</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 h-10">CO (%)</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 h-10">HC (ppm)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testHistory.map((test) => (
                    <TableRow key={test.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="py-3 font-medium text-slate-700">
                        {test.test_date ? formatTestDate(test.test_date) : "—"}
                      </TableCell>
                      <TableCell className="py-3 text-slate-600">
                        Q{test.quarter}, {test.year}
                      </TableCell>
                      <TableCell className="py-3">
                        {test.result === true ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 border-emerald-100"
                          >
                            Passed
                          </Badge>
                        ) : test.result === false ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-bold tracking-wider text-rose-600 bg-rose-50 border-rose-100"
                          >
                            Failed
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-50 border-slate-200"
                          >
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-slate-600">
                        {test.co_level !== null && test.co_level !== undefined ? test.co_level.toFixed(2) : "—"}
                      </TableCell>
                      <TableCell className="py-3 text-slate-600">
                        {test.hc_level !== null && test.hc_level !== undefined ? test.hc_level.toFixed(2) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="drivers" className="mt-0 outline-none">
          {isVehicleLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : driverHistory.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500 font-medium">
                No driver history available for this vehicle.
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 h-10">Driver Name</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 h-10">Changed At</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 h-10">Changed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driverHistory.map((entry, idx) => (
                    <TableRow key={idx} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="py-3 font-medium text-slate-700">{entry.driverName}</TableCell>
                      <TableCell className="py-3 text-slate-600">
                        {formatTestDateTime(entry.changedAt)}
                      </TableCell>
                      <TableCell className="py-3 text-slate-500">{entry.changedBy || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value?: string | null }> = ({
  label,
  value,
}) => (
  <div className="flex flex-col gap-2 pb-4 border-b border-slate-100 last:border-0">
    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {label}
    </span>
    <span className="text-base font-semibold text-slate-900">
      {value || "—"}
    </span>
  </div>
);

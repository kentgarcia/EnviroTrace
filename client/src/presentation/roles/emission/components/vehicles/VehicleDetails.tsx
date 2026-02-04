import React, { useState } from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/presentation/components/shared/ui/tabs";
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
  useEmissionTests
} from "@/core/api/emission-service";
import { useVehicle } from "@/core/api/vehicle-service";
import { formatTestDate, formatTestDateTime } from "@/core/utils/dateUtils";

interface VehicleDetailsProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onRegisterRefetch?: (refetch: () => void) => void;
  onStartEdit?: (vehicle: Vehicle) => void;
}

export const VehicleDetails: React.FC<VehicleDetailsProps> = ({
  vehicle,
  isOpen,
  onClose,
  onRegisterRefetch,
  onStartEdit,
}) => {
  const [activeTab, setActiveTab] = useState("info");

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
                className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800"
              >
                Pending Sync
              </Badge>
            )}
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1 flex items-center gap-2">
            {!fullVehicle?.plate_number && fullVehicle?.chassis_number && (
              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] uppercase font-bold">Chassis</span>
            )}
            {!fullVehicle?.plate_number && !fullVehicle?.chassis_number && fullVehicle?.registration_number && (
              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] uppercase font-bold">Registration</span>
            )}
            <span>Vehicle Fleet Management</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="rounded-lg bg-[#0033a0] hover:bg-[#00267a] text-white"
            onClick={() => {
              if (!fullVehicle) return;
              if (onStartEdit) {
                onStartEdit(fullVehicle);
              }
            }}
          >
            Edit Details
          </Button>
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
          {!fullVehicle ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 text-slate-500 dark:text-slate-400">
              Vehicle data not available.
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-700 p-8">
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
                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-gray-700">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{fullVehicle.description}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-0 outline-none">
          {isPendingVehicle ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700">
              <div className="text-slate-500 dark:text-slate-400 font-medium">
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
            <div className="text-center py-12 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700">
              <div className="text-slate-500 dark:text-slate-400 font-medium">
                No test history available for this vehicle.
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-100 dark:border-gray-700 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-gray-800">
                  <TableRow className="hover:bg-transparent border-slate-100 dark:border-gray-700">
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 h-10">Test Date</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 h-10">Period</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 h-10">Result</TableHead>
                    {vehicle.engine_type?.toLowerCase().includes('gasoline') && (
                      <>
                        <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 h-10">CO (%)</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 h-10">HC (ppm)</TableHead>
                      </>
                    )}
                    {vehicle.engine_type?.toLowerCase().includes('diesel') && (
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 h-10">Opacimeter (%)</TableHead>
                    )}
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 h-10">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testHistory.map((test) => (
                    <TableRow key={test.id} className="border-slate-100 dark:border-gray-700 hover:bg-slate-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <TableCell className="py-3 font-medium text-slate-700 dark:text-slate-300">
                        {test.test_date ? formatTestDate(test.test_date) : "—"}
                      </TableCell>
                      <TableCell className="py-3 text-slate-600 dark:text-slate-400">
                        Q{test.quarter}, {test.year}
                      </TableCell>
                      <TableCell className="py-3">
                        {test.result === true ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800"
                          >
                            Passed
                          </Badge>
                        ) : test.result === false ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800"
                          >
                            Failed
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600"
                          >
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      {vehicle.engine_type?.toLowerCase().includes('gasoline') && (
                        <>
                          <TableCell className="py-3 text-slate-600 dark:text-slate-400">
                            {test.co_level !== null && test.co_level !== undefined ? test.co_level.toFixed(2) : "—"}
                          </TableCell>
                          <TableCell className="py-3 text-slate-600 dark:text-slate-400">
                            {test.hc_level !== null && test.hc_level !== undefined ? test.hc_level.toFixed(2) : "—"}
                          </TableCell>
                        </>
                      )}
                      {vehicle.engine_type?.toLowerCase().includes('diesel') && (
                        <TableCell className="py-3 text-slate-600 dark:text-slate-400">
                          {test.opacimeter_result !== null && test.opacimeter_result !== undefined ? test.opacimeter_result.toFixed(2) : "—"}
                        </TableCell>
                      )}
                      <TableCell className="py-3 text-slate-600 dark:text-slate-400 text-xs">
                        {test.remarks || "—"}
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
            <div className="text-center py-12 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700">
              <div className="text-slate-500 dark:text-slate-400 font-medium">
                No driver history available for this vehicle.
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-100 dark:border-gray-700 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-gray-800">
                  <TableRow className="hover:bg-transparent border-slate-100 dark:border-gray-700">
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 h-10">Driver Name</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 h-10">Changed At</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 h-10">Changed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driverHistory.map((entry, idx) => (
                    <TableRow key={idx} className="border-slate-100 dark:border-gray-700 hover:bg-slate-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <TableCell className="py-3 font-medium text-slate-700 dark:text-slate-300">{entry.driverName}</TableCell>
                      <TableCell className="py-3 text-slate-600 dark:text-slate-400">
                        {formatTestDateTime(entry.changedAt)}
                      </TableCell>
                      <TableCell className="py-3 text-slate-500 dark:text-slate-400">{entry.changedBy || "—"}</TableCell>
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
  <div className="flex flex-col gap-2 pb-4 border-b border-slate-100 dark:border-gray-700 last:border-0">
    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
      {label}
    </span>
    <span className="text-base font-semibold text-slate-900 dark:text-gray-100">
      {value || "—"}
    </span>
  </div>
);

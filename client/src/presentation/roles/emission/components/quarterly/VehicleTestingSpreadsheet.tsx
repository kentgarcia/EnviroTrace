import React, { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/presentation/components/shared/ui/card";
import { useVirtualizer } from "@tanstack/react-virtual";
import { EmissionTest } from "@/core/api/emission-service";

interface SpreadsheetVehicle {
  id: string;
  plate_number?: string | null;
  chassis_number?: string | null;
  registration_number?: string | null;
  driver_name: string;
  vehicle_type: string;
  tests: {
    Q1: EmissionTest | null;
    Q2: EmissionTest | null;
    Q3: EmissionTest | null;
    Q4: EmissionTest | null;
  };
  remarks?: string | null;
  [key: string]: any; // Allow extra properties from Vehicle
}

interface SpreadsheetOfficeGroup {
  office_id: string;
  office_name: string;
  vehicles: SpreadsheetVehicle[];
}

interface VehicleTestingSpreadsheetProps {
  officeGroups: SpreadsheetOfficeGroup[];
  selectedYear: number;
  isLoading: boolean;
  onUpdateTest?: (vehicleId: string, quarter: number, result: boolean | null) => Promise<void>;
  onAddRemarks?: (vehicleId: string, remarks: string) => void | Promise<void>;
  onLaunchQuickTest?: (vehicleId: string, quarter: number, existingTest?: EmissionTest | null) => void;
}

type QuarterStatus = "pass" | "fail" | "pending";

type SpreadsheetRow = {
  officeId: string;
  officeName: string;
  vehicleId: string;
  plateNumber: string;
  chassisNumber: string;
  registrationNumber: string;
  driverName: string;
  vehicleType: string;
  remarks: string;
  tests: (EmissionTest | null)[];
};

type VirtualizedRow =
  | { type: "header"; officeId: string; officeName: string; vehicleCount: number }
  | { type: "vehicle"; row: SpreadsheetRow };

const ROW_HEIGHT = 44;
const HEADER_HEIGHT = 36;

const getStatus = (test: EmissionTest | null): QuarterStatus => {
  if (!test) return "pending";
  return test.result ? "pass" : "fail";
};

const StatusCell = React.memo(({
  test,
  quarter,
  disabled,
  isPending,
  onChange,
  onDoubleClick,
}: {
  test: EmissionTest | null;
  quarter: number;
  disabled: boolean;
  isPending: boolean;
  onChange: (status: QuarterStatus) => void;
  onDoubleClick?: () => void;
}) => {
  const status = getStatus(test);

  const bgClass = status === "pass"
    ? "bg-emerald-100 text-emerald-800"
    : status === "fail"
    ? "bg-rose-100 text-rose-800"
    : "bg-slate-100 text-slate-500";

  return (
    <div className="relative w-full group/cell" onDoubleClick={onDoubleClick}>
      <select
        value={status}
        onChange={(e) => onChange(e.target.value as QuarterStatus)}
        disabled={disabled || isPending}
        className={`w-full h-7 rounded text-[11px] font-semibold uppercase appearance-none px-1 text-center focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors ${bgClass} ${
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:brightness-95"
        }`}
      >
        <option value="pending" className="bg-white text-slate-500">PENDING</option>
        <option value="pass" className="bg-white text-emerald-700">PASS</option>
        <option value="fail" className="bg-white text-rose-700">FAIL</option>
      </select>
      {isPending && (
        <div className={`absolute inset-0 flex items-center justify-center rounded ${bgClass}`}>
          <Loader2 className="h-3 w-3 animate-spin" />
        </div>
      )}
    </div>
  );
});

StatusCell.displayName = "StatusCell";

export const VehicleTestingSpreadsheet: React.FC<VehicleTestingSpreadsheetProps> = ({
  officeGroups,
  selectedYear,
  isLoading,
  onUpdateTest,
  onAddRemarks,
  onLaunchQuickTest,
}) => {
  const { vehicleRows, virtualRows, totalVehicles } = useMemo(() => {
    const vehicles: SpreadsheetRow[] = [];
    const virtual: VirtualizedRow[] = [];

    officeGroups.forEach((office) => {
      if (office.vehicles.length === 0) return;

      virtual.push({
        type: "header",
        officeId: office.office_id,
        officeName: office.office_name,
        vehicleCount: office.vehicles.length,
      });

      office.vehicles.forEach((vehicle) => {
        const row: SpreadsheetRow = {
          officeId: office.office_id,
          officeName: office.office_name,
          vehicleId: vehicle.id,
          plateNumber: vehicle.plate_number ?? "",
          chassisNumber: vehicle.chassis_number ?? "",
          registrationNumber: vehicle.registration_number ?? "",
          driverName: vehicle.driver_name,
          vehicleType: vehicle.vehicle_type,
          remarks: vehicle.remarks ?? "",
          tests: [vehicle.tests.Q1, vehicle.tests.Q2, vehicle.tests.Q3, vehicle.tests.Q4],
        };
        vehicles.push(row);
        virtual.push({ type: "vehicle", row });
      });
    });

    return { vehicleRows: vehicles, virtualRows: virtual, totalVehicles: vehicles.length };
  }, [officeGroups]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pendingCells, setPendingCells] = useState<Set<string>>(new Set());
  const [savingRemarks, setSavingRemarks] = useState<Set<string>>(new Set());
  const [remarkDrafts, setRemarkDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    setRemarkDrafts((prev) => {
      const next = { ...prev };
      let changed = false;
      vehicleRows.forEach((row) => {
        if (!savingRemarks.has(row.vehicleId) && next[row.vehicleId] !== row.remarks) {
          next[row.vehicleId] = row.remarks;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [vehicleRows, savingRemarks]);

  const rowVirtualizer = useVirtualizer({
    count: virtualRows.length,
    estimateSize: (i) => (virtualRows[i]?.type === "header" ? HEADER_HEIGHT : ROW_HEIGHT),
    getScrollElement: () => containerRef.current,
    overscan: 20,
  });

  const handleStatusChange = useCallback(
    async (vehicleId: string, quarter: number, status: QuarterStatus) => {
      if (!onUpdateTest) return;
      const key = `${vehicleId}-${quarter}`;
      setPendingCells((p) => new Set(p).add(key));
      const result = status === "pending" ? null : status === "pass";
      try {
        await onUpdateTest(vehicleId, quarter, result);
      } catch {
        toast.error("Failed to update test");
      } finally {
        setPendingCells((p) => {
          const n = new Set(p);
          n.delete(key);
          return n;
        });
      }
    },
    [onUpdateTest]
  );

  const handleRemarksBlur = useCallback(
    async (vehicleId: string) => {
      if (!onAddRemarks) return;
      const draft = remarkDrafts[vehicleId] ?? "";
      setSavingRemarks((p) => new Set(p).add(vehicleId));
      try {
        await onAddRemarks(vehicleId, draft);
      } catch {
        toast.error("Failed to save remarks");
      } finally {
        setSavingRemarks((p) => {
          const n = new Set(p);
          n.delete(vehicleId);
          return n;
        });
      }
    },
    [onAddRemarks, remarkDrafts]
  );

  if (isLoading) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading vehicle tests…
        </CardContent>
      </Card>
    );
  }

  if (totalVehicles === 0) {
    return (
      <Card className="border border-dashed border-slate-300 bg-white">
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <div className="text-base font-semibold text-slate-600">No vehicles found</div>
          <div className="text-sm text-muted-foreground">Try adjusting the filters</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-bold text-slate-900">Vehicle Testing Grid</h2>
          <p className="text-xs text-slate-500">{totalVehicles} vehicles • {selectedYear}</p>
        </div>
        <span className="text-[10px] font-semibold text-[#0033a0] bg-blue-50 px-2 py-1 rounded">
          AUTO-SAVE ON
        </span>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_1fr_80px_60px_60px_60px_60px_1fr] gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
          <div>Vehicle</div>
          <div>Driver</div>
          <div>Type</div>
          <div className="text-center">Q1</div>
          <div className="text-center">Q2</div>
          <div className="text-center">Q3</div>
          <div className="text-center">Q4</div>
          <div>Remarks</div>
        </div>

        {/* Virtualized Body */}
        <div ref={containerRef} className="max-h-[calc(100vh-340px)] overflow-auto">
          <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
            {rowVirtualizer.getVirtualItems().map((vRow) => {
              const item = virtualRows[vRow.index];
              if (!item) return null;

              if (item.type === "header") {
                return (
                  <div
                    key={`h-${item.officeId}`}
                    className="absolute left-0 right-0 flex items-center gap-2 px-3 bg-slate-100 text-xs font-bold text-slate-700"
                    style={{ top: vRow.start, height: HEADER_HEIGHT }}
                  >
                    <span className="w-1 h-4 bg-[#0033a0] rounded-full" />
                    {item.officeName}
                    <span className="ml-auto text-[10px] font-normal text-slate-500">
                      {item.vehicleCount} vehicle{item.vehicleCount !== 1 && "s"}
                    </span>
                  </div>
                );
              }

              const r = item.row;
              const vehicleDisplay = r.plateNumber || r.chassisNumber || r.registrationNumber || "—";
              const idType = r.plateNumber ? "Plate" : r.chassisNumber ? "Chassis" : r.registrationNumber ? "Reg" : "";

              return (
                <div
                  key={`v-${r.vehicleId}`}
                  className="absolute left-0 right-0 grid grid-cols-[1fr_1fr_80px_60px_60px_60px_60px_1fr] gap-2 px-3 items-center border-b border-slate-100 hover:bg-slate-50/50"
                  style={{ top: vRow.start, height: ROW_HEIGHT }}
                >
                  <div className="truncate">
                    <span className="text-sm font-semibold text-slate-800">{vehicleDisplay}</span>
                    {idType && <span className="ml-1 text-[9px] text-slate-400 uppercase">{idType}</span>}
                  </div>
                  <div className="text-sm text-slate-600 truncate">{r.driverName || "—"}</div>
                  <div className="text-[10px] text-slate-500 uppercase truncate">{r.vehicleType || "—"}</div>

                  {r.tests.map((test, i) => (
                    <StatusCell
                      key={i}
                      test={test}
                      quarter={i + 1}
                      disabled={!onUpdateTest}
                      isPending={pendingCells.has(`${r.vehicleId}-${i + 1}`)}
                      onChange={(s) => handleStatusChange(r.vehicleId, i + 1, s)}
                      onDoubleClick={onLaunchQuickTest ? () => onLaunchQuickTest(r.vehicleId, i + 1, test) : undefined}
                    />
                  ))}

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Remarks..."
                      value={remarkDrafts[r.vehicleId] ?? ""}
                      onChange={(e) => setRemarkDrafts((p) => ({ ...p, [r.vehicleId]: e.target.value }))}
                      onBlur={() => handleRemarksBlur(r.vehicleId)}
                      disabled={!onAddRemarks}
                      className="w-full h-7 px-2 text-xs bg-transparent border border-slate-200 rounded focus:outline-none focus:border-blue-300"
                    />
                    {savingRemarks.has(r.vehicleId) && (
                      <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-slate-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 px-1">
        Click status to cycle • Double-click for detailed entry
      </p>
    </div>
  );
};

export default VehicleTestingSpreadsheet;

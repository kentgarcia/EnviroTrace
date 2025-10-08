import React, { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { Clock, CheckCircle2, XCircle, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/presentation/components/shared/ui/card";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Button } from "@/presentation/components/shared/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/presentation/components/shared/ui/popover";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { useVirtualizer } from "@tanstack/react-virtual";
import { EmissionTest } from "@/core/api/emission-service";

interface SpreadsheetVehicle {
  id: string;
  plate_number: string;
  driver_name: string;
  vehicle_type: string;
  tests: {
    Q1: EmissionTest | null;
    Q2: EmissionTest | null;
    Q3: EmissionTest | null;
    Q4: EmissionTest | null;
  };
  remarks?: string | null;
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

type QuarterStatus = "pass" | "fail" | "not-tested";

type SpreadsheetRow = {
  officeId: string;
  officeName: string;
  vehicleId: string;
  plateNumber: string;
  driverName: string;
  vehicleType: string;
  remarks: string;
  tests: {
    quarter: number;
    test: EmissionTest | null;
  }[];
};

type VirtualizedRow =
  | {
      type: "header";
      officeId: string;
      officeName: string;
      vehicleCount: number;
    }
  | {
      type: "vehicle";
      row: SpreadsheetRow;
    };

interface QuarterCellProps {
  test: EmissionTest | null;
  quarter: number;
  vehicleId: string;
  disabled: boolean;
  isPending: boolean;
  onChange: (status: QuarterStatus) => void;
  onLaunchQuickTest?: (vehicleId: string, quarter: number, existingTest?: EmissionTest | null) => void;
}

const COLUMN_TEMPLATE = "grid grid-cols-[minmax(170px,1.25fr)_minmax(160px,1fr)_minmax(150px,1fr)_repeat(4,minmax(120px,0.9fr))_minmax(220px,1.35fr)]";
const VEHICLE_ROW_HEIGHT = 96;
const HEADER_ROW_HEIGHT = 52;

const STATUS_OPTIONS: {
  value: QuarterStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  toneClass: string;
}[] = [
  {
    value: "not-tested",
    label: "Not Tested",
    icon: Clock,
    description: "Clear any recorded result for this quarter.",
    toneClass: "border-dashed text-muted-foreground hover:border-slate-400",
  },
  {
    value: "pass",
    label: "Pass",
    icon: CheckCircle2,
    description: "Mark this vehicle as passed for the selected quarter.",
    toneClass: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300",
  },
  {
    value: "fail",
    label: "Fail",
    icon: XCircle,
    description: "Mark this vehicle as failed for the selected quarter.",
    toneClass: "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300",
  },
];

const getStatusFromTest = (test: EmissionTest | null): QuarterStatus => {
  if (!test) return "not-tested";
  return test.result ? "pass" : "fail";
};

const getDisplayMeta = (status: QuarterStatus) => {
  switch (status) {
    case "pass":
      return {
        label: "Pass",
        className:
          "border border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    case "fail":
      return {
        label: "Fail",
        className: "border border-rose-200 bg-rose-50 text-rose-700",
      };
    default:
      return {
        label: "Not Tested",
        className:
          "border border-dashed border-slate-300 text-slate-500 bg-white",
      };
  }
};

const formatTestDate = (test: EmissionTest | null) => {
  if (!test) return "";
  try {
    const date = new Date(test.test_date);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString();
  } catch (error) {
    return "";
  }
};

const QuarterCell: React.FC<QuarterCellProps> = ({
  test,
  quarter,
  vehicleId,
  disabled,
  isPending,
  onChange,
  onLaunchQuickTest,
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const status = getStatusFromTest(test);
  const meta = getDisplayMeta(status);

  const handleNextStatus = useCallback(() => {
    if (disabled || isPending) return;
    const order: QuarterStatus[] = ["not-tested", "pass", "fail"];
    const next = order[(order.indexOf(status) + 1) % order.length];
    onChange(next);
  }, [disabled, isPending, status, onChange]);

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onDoubleClick={handleNextStatus}
          disabled={disabled}
          className={`flex w-full flex-col items-start justify-center gap-1 rounded-md px-3 py-2 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${meta.className} ${
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          }`}
        >
          <div className="flex w-full items-center justify-between gap-2 text-sm">
            <span className="font-medium">{meta.label}</span>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatTestDate(test) || "—"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Quarter {quarter}
        </div>
        <div className="space-y-2">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setPopoverOpen(false);
              }}
              className={`flex w-full items-start gap-3 rounded-md border bg-background px-3 py-2 text-left text-sm transition hover:shadow-sm ${option.toneClass} ${
                option.value === status ? "ring-1 ring-offset-1" : ""
              }`}
            >
              <option.icon className="mt-0.5 h-4 w-4" />
              <div>
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground">
                  {option.description}
                </div>
              </div>
            </button>
          ))}
        </div>
        {onLaunchQuickTest && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 w-full justify-center text-xs"
            onClick={() => {
              onLaunchQuickTest(vehicleId, quarter, test ?? undefined);
              setPopoverOpen(false);
            }}
          >
            Open detailed entry
          </Button>
        )}
        <div className="mt-3 text-xs text-muted-foreground">
          Tip: double-click a cell to cycle through statuses quickly.
        </div>
      </PopoverContent>
    </Popover>
  );
};

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
      if (office.vehicles.length === 0) {
        return;
      }

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
          plateNumber: vehicle.plate_number,
          driverName: vehicle.driver_name,
          vehicleType: vehicle.vehicle_type,
          remarks: vehicle.remarks ?? "",
          tests: [
            { quarter: 1, test: vehicle.tests.Q1 },
            { quarter: 2, test: vehicle.tests.Q2 },
            { quarter: 3, test: vehicle.tests.Q3 },
            { quarter: 4, test: vehicle.tests.Q4 },
          ],
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

  // Keep remark drafts in sync with incoming data unless currently saving
  useEffect(() => {
    setRemarkDrafts((prev) => {
      let mutated = false;
      const next = { ...prev };

      vehicleRows.forEach((row) => {
        if (savingRemarks.has(row.vehicleId)) {
          return;
        }

        const current = next[row.vehicleId];
        const incoming = row.remarks ?? "";
        if (current === undefined || current !== incoming) {
          next[row.vehicleId] = incoming;
          mutated = true;
        }
      });

      return mutated ? next : prev;
    });
  }, [vehicleRows, savingRemarks]);

  const rowVirtualizer = useVirtualizer({
    count: virtualRows.length,
    estimateSize: (index) =>
      virtualRows[index]?.type === "header" ? HEADER_ROW_HEIGHT : VEHICLE_ROW_HEIGHT,
    getScrollElement: () => containerRef.current,
    overscan: 12,
  });

  const setCellPending = useCallback((key: string, pending: boolean) => {
    setPendingCells((prev) => {
      const next = new Set(prev);
      if (pending) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  }, []);

  const handleStatusChange = useCallback(
    async (vehicleId: string, quarter: number, status: QuarterStatus) => {
      if (!onUpdateTest) return;
      const key = `${vehicleId}-${quarter}`;
      setCellPending(key, true);

      const result =
        status === "not-tested" ? null : status === "pass" ? true : false;

      try {
        await onUpdateTest(vehicleId, quarter, result);
      } catch (error) {
        console.error("Failed to update test", error);
        toast.error("Unable to update vehicle test. Please try again.");
      } finally {
        setCellPending(key, false);
      }
    },
    [onUpdateTest, setCellPending]
  );

  const handleRemarksBlur = useCallback(
    async (vehicleId: string) => {
      if (!onAddRemarks) return;
      const draft = remarkDrafts[vehicleId] ?? "";
      setSavingRemarks((prev) => new Set(prev).add(vehicleId));

      try {
        await onAddRemarks(vehicleId, draft);
        toast.success("Remarks saved");
      } catch (error) {
        console.error("Failed to save remarks", error);
        toast.error("Unable to save remarks. Please try again.");
      } finally {
        setSavingRemarks((prev) => {
          const next = new Set(prev);
          next.delete(vehicleId);
          return next;
        });
      }
    },
    [onAddRemarks, remarkDrafts]
  );

  const handleRemarksChange = useCallback((vehicleId: string, value: string) => {
    setRemarkDrafts((prev) => ({
      ...prev,
      [vehicleId]: value,
    }));
  }, []);

  const isCellPending = useCallback(
    (vehicleId: string, quarter: number) => pendingCells.has(`${vehicleId}-${quarter}`),
    [pendingCells]
  );

  const renderEmptyState = () => (
    <Card className="border border-dashed border-slate-300 bg-white">
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="text-lg font-semibold text-slate-600">
          No vehicles found for the selected filters
        </div>
        <div className="max-w-md text-sm text-muted-foreground">
          Try broadening your office selection or searching by a different
          plate number, driver, or keyword.
        </div>
      </CardContent>
    </Card>
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
    return renderEmptyState();
  }

  return (
    <Card className="border border-slate-200">
      <CardContent className="space-y-4 p-0">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Real-time Vehicle Testing Grid
            </div>
            <div className="text-sm text-muted-foreground">
              {totalVehicles} vehicle{totalVehicles === 1 ? "" : "s"} mapped for {selectedYear}
            </div>
          </div>
          <Badge variant="secondary" className="bg-white text-slate-600">
            Inline edits save automatically
          </Badge>
        </div>

        <div className="px-6 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Columns
        </div>

        <div className={`hidden items-center gap-2 border-b border-slate-200 bg-white px-6 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 md:${COLUMN_TEMPLATE}`}>
          <div>Plate #</div>
          <div>Driver</div>
          <div>Vehicle Type</div>
          <div>Q1</div>
          <div>Q2</div>
          <div>Q3</div>
          <div>Q4</div>
          <div>Remarks</div>
        </div>

        <div ref={containerRef} className="max-h-[65vh] overflow-auto px-6">
          <div style={{ height: rowVirtualizer.getTotalSize() }} className="relative">
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = virtualRows[virtualRow.index];
              if (!item) return null;

              const baseStyle: React.CSSProperties = {
                transform: `translateY(${virtualRow.start}px)`
              };

              if (item.type === "header") {
                return (
                  <div
                    key={`header-${item.officeId}`}
                    data-index={virtualRow.index}
                    style={{
                      ...baseStyle,
                      height: `${virtualRow.size}px`,
                      padding: "4px 0",
                    }}
                    className="absolute left-0 right-0"
                  >
                    <div className="flex items-center justify-between rounded-md bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                      <span>{item.officeName}</span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {item.vehicleCount} vehicle{item.vehicleCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                );
              }

              const row = item.row;
              return (
                <div
                  key={`vehicle-${row.vehicleId}`}
                  data-index={virtualRow.index}
                  className={`absolute left-0 right-0 rounded-md border border-slate-100 bg-white shadow-sm transition hover:border-slate-200 ${COLUMN_TEMPLATE}`}
                  style={{
                    ...baseStyle,
                    height: `${virtualRow.size}px`,
                    padding: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <div className="flex flex-col justify-center">
                    <div className="text-sm font-semibold text-slate-800">
                      {row.plateNumber}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center text-sm text-slate-700">
                    <span className="truncate">{row.driverName || "—"}</span>
                  </div>
                  <div className="flex flex-col justify-center text-sm text-slate-700">
                    <span className="truncate">{row.vehicleType || "—"}</span>
                  </div>

                  {row.tests.map(({ quarter, test }) => (
                    <div key={quarter} className="flex items-center">
                      <QuarterCell
                        test={test}
                        quarter={quarter}
                        vehicleId={row.vehicleId}
                        disabled={!onUpdateTest}
                        isPending={isCellPending(row.vehicleId, quarter)}
                        onLaunchQuickTest={onLaunchQuickTest}
                        onChange={(status) =>
                          handleStatusChange(row.vehicleId, quarter, status)
                        }
                      />
                    </div>
                  ))}

                  <div className="flex flex-col justify-center">
                    <div className="relative">
                      <Textarea
                        rows={3}
                        placeholder="Add quick remarks"
                        value={remarkDrafts[row.vehicleId] ?? ""}
                        onChange={(event) =>
                          handleRemarksChange(row.vehicleId, event.target.value)
                        }
                        onBlur={() => handleRemarksBlur(row.vehicleId)}
                        disabled={!onAddRemarks}
                        className="resize-none text-sm"
                      />
                      {savingRemarks.has(row.vehicleId) && (
                        <div className="absolute inset-y-1 right-2 flex items-center text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleTestingSpreadsheet;

import { useState, useMemo, memo, useCallback } from "react";
import type { RowData, VisibilityState } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/shared/ui/table";
import { Progress } from "@/presentation/components/shared/ui/progress";
import { Button } from "@/presentation/components/shared/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  XCircle,
  ArrowLeft,
  FileBarChart,
  Car,
  Loader2,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/presentation/components/shared/ui/alert";
import { SortingState, ColumnDef, Row } from "@tanstack/react-table";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import { EmissionTest, useEmissionTests } from "@/core/hooks/emission/useQuarterlyTesting";
import { OfficeWithCompliance } from "@/hooks/offices/useOffices";

// Augment the @tanstack/react-table module to include 'align' in ColumnMeta
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: "left" | "center" | "right";
  }
}

// Memoized cell components for better performance
const ComplianceCell = memo(
  ({
    value,
    passedCount,
    vehicleCount,
  }: {
    value: number;
    passedCount: number;
    vehicleCount: number;
  }) => {
    const isCompliant = value >= 80;
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span>{value}%</span>
          <span className="text-xs text-muted-foreground">
            {passedCount}/{vehicleCount}
          </span>
        </div>
        <Progress
          value={value}
          className={`h-2 ${isCompliant ? "bg-green-100" : "bg-red-100"}`}
        />
      </div>
    );
  }
);

const StatusCell = memo(({ isCompliant }: { isCompliant: boolean }) => {
  return isCompliant ? (
    <CheckCircle2 className="ml-auto h-5 w-5 text-green-500" />
  ) : (
    <XCircle className="ml-auto h-5 w-5 text-red-500" />
  );
});

// Office Details View Component
const OfficeDetailsView = memo(
  ({ office, onBack }: { office: OfficeWithCompliance; onBack: () => void }) => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Button>
          <div className="text-sm text-muted-foreground">
            Office Detail View
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1 border rounded-lg p-4 bg-white">            <div className="space-y-4">
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold">{office.name}</h3>
              <span className="text-sm text-muted-foreground">
                {office.address && office.address}
              </span>
              {office.contact_number && (
                <span className="text-sm">Contact: {office.contact_number}</span>
              )}
              {office.last_test_date && (
                <span className="text-sm">Last Test: {new Date(office.last_test_date).toLocaleDateString()}</span>
              )}
            </div>

            <div className="pt-2">
              <h4 className="text-sm font-medium mb-2">Compliance Summary</h4>                <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex flex-col p-2 border rounded bg-slate-50">
                  <span className="text-muted-foreground text-xs">
                    Vehicles
                  </span>
                  <span className="font-semibold">{office.total_vehicles}</span>
                </div>
                <div className="flex flex-col p-2 border rounded bg-slate-50">
                  <span className="text-muted-foreground text-xs">
                    Tested
                  </span>
                  <span className="font-semibold">{office.tested_vehicles}</span>
                </div>
                <div className="flex flex-col p-2 border rounded bg-slate-50">
                  <span className="text-muted-foreground text-xs">
                    Passed
                  </span>
                  <span className="font-semibold">{office.compliant_vehicles}</span>
                </div>
                <div className="flex flex-col p-2 border rounded bg-slate-50">
                  <span className="text-muted-foreground text-xs">Rate</span>
                  <span
                    className={`font-semibold ${office.compliance_rate >= 80
                      ? "text-green-600"
                      : "text-red-600"
                      }`}
                  >
                    {office.compliance_rate}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          </div>

          <div className="md:col-span-2 border rounded-lg p-4 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <FileBarChart className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Detailed Information</h3>
            </div>

            <div className="space-y-4">
              <div className="rounded border overflow-hidden">
                <div className="bg-muted px-4 py-2 font-medium">
                  Compliance Status
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {office.compliance_rate >= 80
                        ? "Compliant"
                        : "Non-Compliant"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {office.compliance_rate >= 80
                        ? "This office meets the minimum 80% compliance threshold."
                        : "This office does not meet the minimum 80% compliance threshold."}
                    </p>
                  </div>
                  {office.compliance_rate >= 80 ? (
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-500" />
                  )}
                </div>
              </div>

              <div className="rounded border overflow-hidden">
                <div className="bg-muted px-4 py-2 font-medium flex items-center">
                  <Car className="h-4 w-4 mr-2" />
                  Vehicle Compliance
                </div>
                <div className="p-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Compliance Rate</span>
                      <span className="font-medium">
                        {office.compliance_rate}%
                      </span>
                    </div>
                    <Progress
                      value={office.compliance_rate}
                      className={`h-3 ${office.compliance_rate >= 80
                        ? "bg-green-100"
                        : "bg-red-100"
                        }`}
                    />                    <div className="grid grid-cols-3 gap-2 text-sm pt-2">
                      <div className="flex flex-col items-center p-2 rounded bg-slate-50">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-semibold">
                          {office.total_vehicles}
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-2 rounded bg-slate-50">
                        <span className="text-muted-foreground">Tested</span>
                        <span className="font-semibold">
                          {office.tested_vehicles}
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-2 rounded bg-slate-50">
                        <span className="text-muted-foreground">Passed</span>
                        <span className="font-semibold">
                          {office.compliant_vehicles}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded border overflow-hidden">
                <div className="bg-muted px-4 py-2 font-medium flex items-center">
                  <Car className="h-4 w-4 mr-2" />
                  Emission Tests
                </div>                <div className="p-4">
                  <OfficeEmissionTests officeName={office.name} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

OfficeDetailsView.displayName = "OfficeDetailsView";

interface OfficeComplianceTableProps {
  officeData: OfficeWithCompliance[];
  errorMessage?: string;
}

export function OfficeComplianceTable({
  officeData,
  errorMessage,
}: OfficeComplianceTableProps) {
  // State for sorting
  const [sorting, setSorting] = useState<SortingState>([]);

  // State for selected office
  const [selectedOffice, setSelectedOffice] = useState<OfficeWithCompliance | null>(null);

  // Handler for row click
  const handleRowClick = useCallback((row: Row<OfficeWithCompliance>) => {
    setSelectedOffice(row.original);
  }, []);

  // Handler for going back to the table view
  const handleBackToTable = useCallback(() => {
    setSelectedOffice(null);
  }, []);
  // Table columns config for TanStack Table - memoized to prevent re-creation on render
  const columns = useMemo<ColumnDef<OfficeWithCompliance, any>[]>(
    () => [
      {
        accessorKey: "name",
        id: "office",
        header: "Office Name",
        cell: (info) => info.getValue(),
        enableSorting: true,
      },
      {
        accessorKey: "total_vehicles",
        id: "vehicles",
        header: "Vehicles",
        cell: (info) => info.getValue(),
        enableSorting: true,
      },
      {
        accessorKey: "tested_vehicles",
        id: "tested",
        header: "Tested",
        cell: (info) => info.getValue(),
        enableSorting: true,
      },
      {
        accessorKey: "compliant_vehicles",
        id: "passed",
        header: "Passed",
        cell: (info) => info.getValue(),
        enableSorting: true,
      },
      {
        accessorKey: "compliance_rate",
        id: "compliance",
        header: "Compliance",
        cell: (info) => {
          const row = info.row.original;
          return (
            <ComplianceCell
              value={row.compliance_rate}
              passedCount={row.compliant_vehicles}
              vehicleCount={row.total_vehicles}
            />
          );
        },
        enableSorting: true,
      },
      {
        id: "status",
        header: "Status",
        cell: (info) => {
          const isCompliant = info.row.original.compliance_rate >= 80;
          return <StatusCell isCompliant={isCompliant} />;
        },
        enableSorting: false,
      },
    ],
    []
  );

  // Handle error state
  if (errorMessage) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading data</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  }

  // Handle empty state
  if (!officeData || officeData.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No data available</AlertTitle>
        <AlertDescription>
          There are no office compliance records for the selected period.
        </AlertDescription>
      </Alert>
    );
  }

  if (selectedOffice) {
    return (
      <OfficeDetailsView office={selectedOffice} onBack={handleBackToTable} />
    );
  }

  return (
    <DataTable
      columns={columns}
      data={officeData}
      showDensityToggle={true}
      showColumnVisibility={true}
      showPagination={true}
      defaultPageSize={10}
      loadingMessage="Loading office data..."
      emptyMessage="No office data found for the selected filters."
      onRowClick={handleRowClick}
      defaultDensity="normal"
      stickyHeader={true}
    />
  );
}

OfficeComplianceTable.displayName = "OfficeComplianceTable";
ComplianceCell.displayName = "ComplianceCell";
StatusCell.displayName = "StatusCell";

// Office Emission Tests Component
const OfficeEmissionTests = memo(({ officeName }: { officeName: string }) => {
  const { data, isLoading: loading, isError: hasError } = useEmissionTests({});

  const tests = useMemo(() => {
    if (!data) return [];
    // Filter tests by office name and current year
    const currentYear = new Date().getFullYear();
    return data.filter(
      (test) => test.vehicle?.office_name === officeName && test.year === currentYear
    );
  }, [data, officeName]);

  if (loading) {
    return (
      < div className="flex justify-center items-center py-8" >
        <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
        <span>Loading emission tests...</span>
      </div >
    );
  }
  if (hasError) {
    return (
      <Alert variant="destructive" className="mb-2">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load emission tests.</AlertDescription>
      </Alert>
    );
  }

  if (!tests.length) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No emission tests found for this office.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="text-xs">
        <TableHeader>
          <TableRow className="h-8">
            <TableHead>Plate Number</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Test Date</TableHead>
            <TableHead>Quarter</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Result</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tests.map((test: EmissionTest) => (
            <TableRow key={(test as any).id} className="h-8">
              <TableCell>
                {(test.vehicle as { plateNumber?: string })?.plateNumber ||
                  "Unknown"}
              </TableCell>
              <TableCell>
                {(test.vehicle as { driverName?: string })?.driverName ||
                  "Unknown"}
              </TableCell>
              <TableCell>
                {(test as { testDate?: string | number | Date }).testDate
                  ? new Date(
                    (test as { testDate?: string | number | Date }).testDate!
                  ).toLocaleDateString()
                  : "N/A"}
              </TableCell>
              <TableCell>
                Q{(test as unknown as { quarter: number }).quarter}
              </TableCell>
              <TableCell>
                {(test as unknown as { year: number }).year}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  {test.result ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-green-600">Passed</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600 mr-1" />
                      <span className="text-red-600">Failed</span>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

OfficeEmissionTests.displayName = "OfficeEmissionTests";

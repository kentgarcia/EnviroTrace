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
import { Input } from "@/presentation/components/shared/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/presentation/components/shared/ui/tabs";
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
  Edit,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/presentation/components/shared/ui/alert";
import { SortingState, ColumnDef, Row } from "@tanstack/react-table";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import { EmissionTest, useEmissionTests } from "@/core/hooks/emission/useQuarterlyTesting";
import { OfficeWithCompliance } from "@/core/hooks/offices/useOffices";
import { useVehicles, Vehicle } from "@/core/api/emission-service";

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
          className={`h-2 ${isCompliant ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
        />
      </div>
    );
  }
);

const StatusCell = memo(({
  isCompliant,
  hasData,
}: {
  isCompliant: boolean;
  hasData: boolean;
}) => {
  if (!hasData) {
    return (
      <div className="flex items-center justify-end gap-2 text-slate-500">
        <Info className="h-5 w-5" />
        <span className="text-xs font-semibold uppercase tracking-wide">No Data</span>
      </div>
    );
  }

  return isCompliant ? (
    <div className="flex items-center justify-end gap-2 text-green-600">
      <CheckCircle2 className="h-5 w-5" />
      <span className="text-xs font-semibold uppercase tracking-wide">Compliant</span>
    </div>
  ) : (
    <div className="flex items-center justify-end gap-2 text-red-600">
      <XCircle className="h-5 w-5" />
      <span className="text-xs font-semibold uppercase tracking-wide">Non-Compliant</span>
    </div>
  );
});

// Office Details View Component
const OfficeDetailsView = memo(
  ({ 
    office, 
    onBack, 
    year, 
    onEdit,
    canEdit,
    canViewTests,
    canViewVehicles,
  }: { 
    office: OfficeWithCompliance; 
    onBack: () => void; 
    year?: number; 
    onEdit?: (office: OfficeWithCompliance) => void;
    canEdit: boolean;
    canViewTests: boolean;
    canViewVehicles: boolean;
  }) => {
    const tabCount = (canViewTests ? 1 : 0) + (canViewVehicles ? 1 : 0);
    const defaultTab = canViewTests ? "tests" : "vehicles";
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 rounded-lg border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Button>
          <div className="flex items-center gap-3">
             <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Office Detail View {year ? `(${year})` : ""}
            </div>
            {canEdit && onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(office)}
                className="flex items-center gap-2 rounded-lg border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400"
              >
                <Edit className="h-4 w-4" />
                Edit Office
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 border border-slate-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-900 shadow-none">
            <div className="space-y-6">
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 dark:text-gray-100">{office.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Office Information</p>
              </div>
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
              <h4 className="text-sm font-bold text-slate-900 dark:text-gray-100 mb-3">Compliance Summary</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col p-3 border border-slate-100 dark:border-gray-700 rounded-xl bg-slate-50/50 dark:bg-gray-800/50">
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-medium uppercase tracking-wider">
                    Vehicles
                  </span>
                  <span className="font-bold text-slate-900 dark:text-gray-100 text-lg">{office.total_vehicles}</span>
                </div>
                <div className="flex flex-col p-3 border border-slate-100 dark:border-gray-700 rounded-xl bg-slate-50/50 dark:bg-gray-800/50">
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-medium uppercase tracking-wider">
                    Tested
                  </span>
                  <span className="font-bold text-slate-900 dark:text-gray-100 text-lg">{office.tested_vehicles}</span>
                </div>
                <div className="flex flex-col p-3 border border-slate-100 dark:border-gray-700 rounded-xl bg-slate-50/50 dark:bg-gray-800/50">
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-medium uppercase tracking-wider">
                    Passed
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400 text-lg">{office.compliant_vehicles}</span>
                </div>
                <div className="flex flex-col p-3 border border-slate-100 dark:border-gray-700 rounded-xl bg-slate-50/50 dark:bg-gray-800/50">
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-medium uppercase tracking-wider">Rate</span>
                  <span
                    className={`font-bold text-lg ${office.compliance_rate >= 80
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                      }`}
                  >
                    {office.compliance_rate}%
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 dark:border-gray-700 overflow-hidden bg-slate-50/30 dark:bg-gray-800/30">
              <div className="bg-slate-50 dark:bg-gray-800 px-4 py-3 font-bold text-slate-700 dark:text-slate-300 text-sm border-b border-slate-100 dark:border-gray-700">
                Detailed Information
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-gray-100">
                      {office.compliance_rate >= 80
                        ? "Meets Threshold"
                        : "Below Threshold"}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {office.compliance_rate >= 80
                        ? "This office meets the minimum 80% compliance threshold."
                        : "This office does not meet the minimum 80% compliance threshold."}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${office.compliance_rate >= 80 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                    {office.compliance_rate >= 80 ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Compliance Rate</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-gray-100">
                      {office.compliance_rate}%
                    </span>
                  </div>
                  <Progress
                    value={office.compliance_rate}
                    className={`h-3 rounded-full ${office.compliance_rate >= 80
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                      }`}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center p-3 rounded-xl bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700 shadow-sm">
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-medium uppercase">Total</span>
                    <span className="font-bold text-slate-900 dark:text-gray-100 text-lg">
                      {office.total_vehicles}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-xl bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700 shadow-sm">
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-medium uppercase">Tested</span>
                    <span className="font-bold text-slate-900 dark:text-gray-100 text-lg">
                      {office.tested_vehicles}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-xl bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700 shadow-sm">
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-medium uppercase">Passed</span>
                    <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                      {office.compliant_vehicles}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 border border-slate-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-900 shadow-none">
            {tabCount > 0 ? (
              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className={`grid ${tabCount === 1 ? "grid-cols-1" : "grid-cols-2"} mb-4`}>
                  {canViewTests && (
                    <TabsTrigger value="tests" className="gap-2">
                      <Car className="h-4 w-4" />
                      Emission Tests
                    </TabsTrigger>
                  )}
                  {canViewVehicles && (
                    <TabsTrigger value="vehicles" className="gap-2">
                      <Car className="h-4 w-4" />
                      Office Vehicles
                    </TabsTrigger>
                  )}
                </TabsList>
                {canViewTests && (
                  <TabsContent value="tests" className="mt-0 outline-none">
                    <div className="rounded-xl border border-slate-100 dark:border-gray-700 overflow-hidden bg-slate-50/30 dark:bg-gray-800/30">
                      <div className="p-0">
                        <OfficeEmissionTests officeName={office.name} year={year} canViewTests={canViewTests} />
                      </div>
                    </div>
                  </TabsContent>
                )}
                {canViewVehicles && (
                  <TabsContent value="vehicles" className="mt-0 outline-none">
                    <div className="rounded-xl border border-slate-100 dark:border-gray-700 overflow-hidden bg-slate-50/30 dark:bg-gray-800/30">
                      <div className="p-0">
                        <OfficeVehicles officeId={office.id} canViewVehicles={canViewVehicles} />
                      </div>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-6">
                You do not have permission to view office tests or vehicles.
              </div>
            )}
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
  year?: number;
  onEdit?: (office: OfficeWithCompliance) => void;
  canEdit: boolean;
  canViewTests: boolean;
  canViewVehicles: boolean;
}

export function OfficeComplianceTable({
  officeData,
  errorMessage,
  year,
  onEdit,
  canEdit,
  canViewTests,
  canViewVehicles,
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
        header: "Total Vehicles",
        cell: (info) => info.getValue(),
        enableSorting: true,
      },
      {
        accessorKey: "tested_vehicles",
        id: "tested",
        header: "Tested Vehicles",
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
              vehicleCount={row.tested_vehicles}
            />
          );
        },
        enableSorting: true,
      },
      {
        id: "status",
        header: "Status",
        cell: (info) => {
          const row = info.row.original;
          const hasData = row.total_vehicles > 0 || row.tested_vehicles > 0;
          const isCompliant = row.compliance_rate >= 80;
          return <StatusCell isCompliant={isCompliant} hasData={hasData} />;
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
      <OfficeDetailsView 
        office={selectedOffice} 
        onBack={handleBackToTable} 
        year={year}
        onEdit={onEdit}
        canEdit={canEdit}
        canViewTests={canViewTests}
        canViewVehicles={canViewVehicles}
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      data={officeData}
      showDensityToggle={true}
      showColumnVisibility={true}
      showPagination={true}
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
const OfficeEmissionTests = memo(({ officeName, year, canViewTests }: { officeName: string; year?: number; canViewTests: boolean }) => {
  const { data, isLoading: loading, isError: hasError } = useEmissionTests({}, { enabled: canViewTests });

  const tests = useMemo(() => {
    if (!data) return [];
    // Filter tests by office name and passed year (or current year)
    const targetYear = year || new Date().getFullYear();
    
    return data.filter((test) => {
        // Handle different vehicle object shapes
        const vehicle = test.vehicle as any;
        const testOfficeName = vehicle?.office_name || vehicle?.office?.name;
        
        // Handle potential casing issues
        const matchesOffice = testOfficeName === officeName;
        
        // Check year
        const testYear = (test as any).year;
        const matchesYear = testYear === targetYear;
        
        return matchesOffice && matchesYear;
    });
  }, [data, officeName, year]);

  if (!canViewTests) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        You do not have permission to view emission tests.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
        <span className="dark:text-gray-300">Loading emission tests...</span>
      </div>
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
        No emission tests found for this office in {year || new Date().getFullYear()}.
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
          {tests.map((test: EmissionTest) => {
            const vehicle = test.vehicle as any;
            return (
                <TableRow key={(test as any).id} className="h-8">
                <TableCell>
                    {vehicle?.plate_number || vehicle?.plateNumber || "Unknown"}
                </TableCell>
                <TableCell>
                    {vehicle?.driver_name || vehicle?.driverName || "Unknown"}
                </TableCell>
                <TableCell>
                    {(test as { testDate?: string | number | Date }).testDate
                    ? new Date(
                        (test as { testDate?: string | number | Date }).testDate!
                        ).toLocaleDateString()
                    : (test as any).conducted_on ? new Date((test as any).conducted_on).toLocaleDateString() : "N/A"}
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
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />
                        <span className="text-green-600 dark:text-green-400">Passed</span>
                        </>
                    ) : (
                        <>
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-1" />
                        <span className="text-red-600 dark:text-red-400">Failed</span>
                        </>
                    )}
                    </div>
                </TableCell>
                </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
});

OfficeEmissionTests.displayName = "OfficeEmissionTests";

const OfficeVehicles = memo(({ officeId, canViewVehicles }: { officeId: string; canViewVehicles: boolean }) => {
  const { data, isLoading: loading, isError: hasError } = useVehicles(
    { office_id: officeId },
    0,
    200,
    { includeTotal: false, enabled: canViewVehicles }
  );
  const [searchTerm, setSearchTerm] = useState("");
  const vehicles = data?.vehicles ?? [];
  const filteredVehicles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return vehicles;

    return vehicles.filter((vehicle) => {
      const plate = vehicle.plate_number?.toLowerCase() || "";
      const driver = vehicle.driver_name?.toLowerCase() || "";
      const type = vehicle.vehicle_type?.toLowerCase() || "";
      const engine = vehicle.engine_type?.toLowerCase() || "";
      const year = vehicle.year_acquired?.toString() || "";

      return [plate, driver, type, engine, year].some((value) =>
        value.includes(term)
      );
    });
  }, [vehicles, searchTerm]);

  if (!canViewVehicles) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        You do not have permission to view vehicles.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
        <span className="dark:text-gray-300">Loading vehicles...</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <Alert variant="destructive" className="mb-2">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load vehicles.</AlertDescription>
      </Alert>
    );
  }

  if (!vehicles.length) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No vehicles found for this office.
      </div>
    );
  }

  if (!filteredVehicles.length) {
    return (
      <div className="p-4">
        <Input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search vehicles by plate, driver, type, engine, year..."
          className="bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-700 rounded-lg h-9 text-sm"
        />
        <div className="text-center py-6 text-muted-foreground">
          No vehicles match your search.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="p-4">
        <Input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search vehicles by plate, driver, type, engine, year..."
          className="bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-700 rounded-lg h-9 text-sm"
        />
      </div>
      <Table className="text-xs">
        <TableHeader>
          <TableRow className="h-8">
            <TableHead>Plate Number</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Vehicle Type</TableHead>
            <TableHead>Engine Type</TableHead>
            <TableHead>Wheels</TableHead>
            <TableHead>Year Acquired</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredVehicles.map((vehicle: Vehicle) => (
            <TableRow key={vehicle.id} className="h-8">
              <TableCell>{vehicle.plate_number || "Unknown"}</TableCell>
              <TableCell>{vehicle.driver_name || "Unknown"}</TableCell>
              <TableCell>{vehicle.vehicle_type}</TableCell>
              <TableCell>{vehicle.engine_type}</TableCell>
              <TableCell>{vehicle.wheels}</TableCell>
              <TableCell>{vehicle.year_acquired ?? "N/A"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

OfficeVehicles.displayName = "OfficeVehicles";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Button } from "@/presentation/components/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/presentation/components/shared/ui/dropdown-menu";
import { MoreHorizontal, ClipboardList, Edit, Trash } from "lucide-react";
import {
  TestSchedule,
  EmissionTest,
} from "@/core/hooks/emission/useQuarterlyTesting";
import EmissionTestTable from "./EmissionTestTable";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/shared/ui/table";

interface ScheduleTableProps {
  schedules: TestSchedule[];
  isLoading: boolean;
  emissionTests: EmissionTest[];
  selectedScheduleId: string | null;
  setSelectedScheduleId: React.Dispatch<React.SetStateAction<string | null>>;
  onEditTest: (test: EmissionTest) => void;
  onDeleteTest: (test: EmissionTest) => void;
  onAddTest: () => void;
  onEditSchedule: (schedule: TestSchedule) => void;
  onDeleteSchedule: (schedule: TestSchedule) => void;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  schedules,
  isLoading,
  emissionTests,
  selectedScheduleId,
  setSelectedScheduleId,
  onEditTest,
  onDeleteTest,
  onAddTest,
  onEditSchedule,
  onDeleteSchedule,
}) => {// State for test filtering
  const [testSearch, setTestSearch] = useState("");
  const [testResult, setTestResult] = useState("all");
  // Helper to detect if a schedule is pending sync
  const isPendingSync = (id: string) => id.startsWith("pending-");

  // Define columns for the DataTable
  const columns: ColumnDef<TestSchedule>[] = [
    {
      accessorKey: "year",
      header: "Year",
    },
    {
      accessorKey: "quarter",
      header: "Quarter",
      cell: ({ row }) => `Q${row.original.quarter}`,
    }, {
      accessorKey: "assigned_personnel",
      header: "Personnel",
    },
    {
      accessorKey: "location",
      header: "Location",
    }, {
      accessorKey: "conducted_on",
      header: "Date",
      cell: ({ row }) => {
        const value = row.original.conducted_on;
        let date: Date;
        if (typeof value === "number") {
          date = new Date(value);
        } else if (typeof value === "string" && /^\d+$/.test(value)) {
          date = new Date(Number(value));
        } else {
          date = new Date(value);
        }
        return (
          <>
            {!isNaN(date.getTime())
              ? format(date, "MMM dd, yyyy")
              : "Invalid date"}
            {isPendingSync(row.original.id) && (
              <Badge
                variant="outline"
                className="ml-2 text-yellow-600 bg-yellow-50"
              >
                Pending Sync
              </Badge>
            )}
          </>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 vehicle-action-btn"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setSelectedScheduleId(row.original.id)}
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                <span>View Tests</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditSchedule(row.original)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteSchedule(row.original)}
                className="text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },];

  // Calculate tests for the selected schedule - moved outside conditional to follow Rules of Hooks
  const selectedSchedule = selectedScheduleId
    ? schedules.find((s) => s.id === selectedScheduleId)
    : null;
  const scheduleTests = useMemo(() => {
    if (!selectedSchedule || !emissionTests) return [];

    const filtered = emissionTests.filter(
      (test) => test.year === selectedSchedule.year && test.quarter === selectedSchedule.quarter
    );

    return filtered;
  }, [selectedSchedule, emissionTests]);

  // Split view: left = schedule list, right = details
  if (selectedScheduleId) {
    return (
      <div className="flex gap-4">
        {/* Left: Schedule List */}
        <div className="w-1/2 border-r pr-2">
          <div className="font-semibold mb-2">Test Schedules</div>
          <div className="rounded-md border overflow-x-auto">
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Quarter</TableHead>
                  <TableHead>Personnel</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow
                    key={schedule.id}
                    className={`cursor-pointer ${schedule.id === selectedScheduleId
                      ? "bg-primary/10 font-bold"
                      : ""
                      }`}
                    onClick={() => setSelectedScheduleId(schedule.id)}
                  >
                    <TableCell>{schedule.year}</TableCell>
                    <TableCell>{`Q${schedule.quarter}`}</TableCell>
                    <TableCell>{schedule.assigned_personnel}</TableCell>
                    <TableCell>{schedule.location}</TableCell>
                    <TableCell>
                      {(() => {
                        const value = schedule.conducted_on;
                        let date: Date;
                        if (typeof value === "number") {
                          date = new Date(value);
                        } else if (
                          typeof value === "string" &&
                          /^\d+$/.test(value)
                        ) {
                          date = new Date(Number(value));
                        } else {
                          date = new Date(value);
                        }
                        return !isNaN(date.getTime())
                          ? format(date, "MMM dd, yyyy")
                          : "Invalid date";
                      })()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button
            className="mt-4 w-full"
            variant="outline"
            onClick={() => setSelectedScheduleId(null)}
          >
            Back to All Schedules
          </Button>
        </div>
        {/* Right: Details */}
        <div className="w-1/2 pl-2">
          <div className="font-semibold mb-2">
            Test Results for Q{selectedSchedule?.quarter},{" "}
            {selectedSchedule?.year}
          </div>          <EmissionTestTable
            tests={scheduleTests}
            isLoading={isLoading}
            onEditTest={onEditTest}
            onDeleteTest={onDeleteTest}
            onAddTest={onAddTest}
            search={testSearch}
            onSearchChange={setTestSearch}
            result={testResult}
            onResultChange={setTestResult}
          />
        </div>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={schedules}
      isLoading={isLoading}
      loadingMessage="Loading schedules..."
      emptyMessage="No test schedules found for the selected filters. Create a new schedule to get started."
      onRowClick={(row) => setSelectedScheduleId(row.original.id)}
      showDensityToggle={true}
      showColumnVisibility={true}
      showPagination={true}
      defaultPageSize={10}
    />
  );
};

export default ScheduleTable;

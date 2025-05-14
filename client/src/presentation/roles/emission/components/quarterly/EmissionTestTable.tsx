import React from "react";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/presentation/components/shared/ui/dropdown-menu";
import { Button } from "@/presentation/components/shared/ui/button";
import { Badge } from "@/presentation/components/shared/ui/badge";
import {
  MoreHorizontal,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { EmissionTest } from "@/hooks/quarterly/useQuarterlyTesting";
import { DataTable } from "@/presentation/components/shared/ui/data-table";

interface EmissionTestTableProps {
  tests: EmissionTest[];
  isLoading: boolean;
  onEditTest: (test: EmissionTest) => void;
  onDeleteTest: (test: EmissionTest) => void;
}

export const EmissionTestTable: React.FC<EmissionTestTableProps> = ({
  tests,
  isLoading,
  onEditTest,
  onDeleteTest,
}) => {
  // Helper to detect if a test is pending sync
  const isPendingSync = (id: string) => id.startsWith("pending-");

  // Table columns
  const columns: ColumnDef<EmissionTest>[] = [
    {
      accessorKey: "vehicle.plateNumber",
      header: "Plate Number",
      cell: ({ row }) => row.original.vehicle?.plateNumber || "Unknown",
    },
    {
      accessorKey: "vehicle.driverName",
      header: "Driver",
      cell: ({ row }) => row.original.vehicle?.driverName || "Unknown",
    },
    {
      accessorKey: "vehicle.officeName",
      header: "Office",
      cell: ({ row }) => row.original.vehicle?.officeName || "Unknown",
    },
    {
      accessorKey: "testDate",
      header: "Test Date",
      cell: ({ row }) => {
        try {
          let date: Date;
          const value = row.original.testDate;
          if (typeof value === "number") {
            date = new Date(value);
          } else if (/^\d{13}$/.test(value)) {
            date = new Date(Number(value));
          } else {
            date = new Date(value);
          }
          if (isNaN(date.getTime())) return "Invalid date";
          return format(date, "MMM dd, yyyy");
        } catch {
          return "Invalid date";
        }
      },
    },
    {
      accessorKey: "result",
      header: "Result",
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original.result ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">Passed</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-red-600">Failed</span>
            </>
          )}
          {isPendingSync(row.original.id) && (
            <Badge
              variant="outline"
              className="ml-2 text-yellow-600 bg-yellow-50"
            >
              Pending Sync
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditTest(row.original)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteTest(row.original)}
                className="text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={tests}
      isLoading={isLoading}
      loadingMessage="Loading test results..."
      emptyMessage="No vehicle test results found. Add a test to get started."
      showPagination={true}
      showDensityToggle={true}
      showColumnVisibility={true}
      defaultDensity="compact"
      defaultPageSize={10}
      pageSizeOptions={[5, 10, 20, 50, 100]}
      className="text-xs"
      stickyHeader={false}
    />
  );
};

export default EmissionTestTable;

import React, { useState, useRef } from "react";
import { format } from "date-fns";
import {
  ColumnDef,
  SortingState,
  PaginationState,
  VisibilityState,
  ColumnFiltersState,
  OnChangeFn,
  RowSelectionState,
  Row,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/presentation/components/shared/ui/dropdown-menu";
import { Button } from "@/presentation/components/shared/ui/button";
import { Skeleton } from "@/presentation/components/shared/ui/skeleton";
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { Vehicle, VehicleFormInput } from "@/core/api/emission-service";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { VehicleDetails } from "./VehicleDetails";
import { Vehicle as ApiVehicle } from "@/core/api/emission-service";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import { formatTestDate } from "@/core/utils/dateUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/shared/ui/table";

interface VehicleTableProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  onView: (vehicle: Vehicle) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  onEditVehicle?: (id: string, data: VehicleFormInput) => Promise<void>;

  // Optional TanStack Table state
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

// Skeleton loader for the table
export const VehicleTableSkeleton: React.FC = () => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Plate Number</TableHead>
            <TableHead>Office</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-4" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-36" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-8 w-20 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export const VehicleTable: React.FC<VehicleTableProps> = ({
  vehicles,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onEditVehicle,

  // Optional TanStack Table state props (with defaults)
  sorting = [{ id: "plateNumber", desc: false }],
  onSortingChange,
  pagination = { pageIndex: 0, pageSize: 10 },
  onPaginationChange,
  columnFilters = [],
  onColumnFiltersChange,
  columnVisibility = {},
  onColumnVisibilityChange,
  rowSelection = {},
  onRowSelectionChange,
}) => {
  // Add: row-to-details functionality
  const [detailsVehicle, setDetailsVehicle] = useState<Vehicle | null>(null);

  // Add a ref to hold the refetch function from VehicleDetails
  const detailsRefetchRef = useRef<null | (() => void)>(null);

  // Define columns
  const columns: ColumnDef<Vehicle>[] = [
    {
      accessorKey: "plate_number",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-medium"
        >
          Plate Number
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.original.plate_number}</div>
      ),
    },
    {
      accessorKey: "office.name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-medium"
        >
          Office
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.original.office?.name || "Unknown Office",
    },
    {
      accessorKey: "driver_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-medium"
        >
          Driver
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.original.driver_name,
    },
    {
      accessorKey: "vehicle_type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-medium"
        >
          Type
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span
          title={`${row.original.vehicle_type}, ${row.original.engine_type} engine, ${row.original.wheels} wheels`}
        >
          {row.original.vehicle_type}
        </span>
      ),
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
              <DropdownMenuItem onClick={() => setDetailsVehicle(row.original)}>
                <Eye className="mr-2 h-4 w-4" />
                <span>View Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(row.original)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <VehicleTableSkeleton />;
  }

  if (detailsVehicle) {
    return (
      <div className="flex gap-6">
        {/* List of vehicles (left) */}
        <div className="w-1/3 border-r pr-4 overflow-y-auto max-h-[70vh]">
          <ul className="divide-y">            {vehicles.map((v) => (
            <li
              key={v.id}
              className={`p-3 cursor-pointer hover:bg-blue-50 ${detailsVehicle.id === v.id ? "bg-blue-100 font-semibold" : ""
                }`}
              onClick={() => setDetailsVehicle(v)}
            >
              <div className="text-sm">{v.plate_number}</div>
              <div className="text-xs text-muted-foreground">
                {v.driver_name} • {v.office?.name || "Unknown Office"}
              </div>
            </li>
          ))}
          </ul>
        </div>
        {/* Details (right) using VehicleDetails component */}
        <div className="flex-1 p-4">
          <div className="mb-4 flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDetailsVehicle(null)}
            >
              &larr; Back to table
            </Button>
          </div>          <VehicleDetails
            vehicle={detailsVehicle}
            isOpen={true}
            onClose={() => setDetailsVehicle(null)}
            onEditVehicle={async (data) => {
              if (!detailsVehicle || !onEditVehicle) return;
              await onEditVehicle(detailsVehicle.id, data);
              // Refetch the details after update
              if (detailsRefetchRef.current) detailsRefetchRef.current();
            }}
            // Pass a callback to get the refetch function
            onRegisterRefetch={(fn) => {
              detailsRefetchRef.current = fn;
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={vehicles}
      isLoading={isLoading}
      loadingMessage="Loading vehicles..."
      emptyMessage="No vehicles found."
      onRowClick={(row: Row<Vehicle>) => setDetailsVehicle(row.original)}
      showDensityToggle={true}
      showColumnVisibility={true}
      showPagination={true}
      defaultPageSize={10}
      defaultDensity="normal"
    />
  );
};

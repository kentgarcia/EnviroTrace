import React, { useState, useRef, useEffect } from "react";
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
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2, X } from "lucide-react";
import { Vehicle } from "@/core/api/emission-service";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { VehicleDetails } from "./VehicleDetails";
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
  vehicleTypes?: string[];
  engineTypes?: string[];
  wheelCounts?: string[];
  offices?: string[];
  onRefreshOffices?: () => void;

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
  vehicleTypes = [],
  engineTypes = [],
  wheelCounts = [],
  offices = [],
  onRefreshOffices,

  // Optional TanStack Table state props (with defaults)
  sorting = [{ id: "identifier", desc: false }],
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

  // Keep the details panel in sync with the latest list data after mutations
  useEffect(() => {
    if (!detailsVehicle) return;

    const updatedVehicle = vehicles.find((vehicle) => vehicle.id === detailsVehicle.id);

    if (!updatedVehicle) {
      setDetailsVehicle(null);
      return;
    }

    if (updatedVehicle !== detailsVehicle) {
      setDetailsVehicle(updatedVehicle);
    }
  }, [vehicles, detailsVehicle]);

  // Define columns
  const columns: ColumnDef<Vehicle>[] = [
    {
      id: "identifier",
      accessorFn: (row) => row.plate_number || row.chassis_number || row.registration_number || "N/A",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-bold text-white uppercase text-[10px] tracking-wider hover:bg-transparent"
        >
          Vehicle ID
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">
            {row.original.plate_number ||
              row.original.chassis_number ||
              row.original.registration_number ||
              "N/A"}
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
            {row.original.plate_number ? "PLATE" : row.original.chassis_number ? "CHASSIS" : row.original.registration_number ? "REG" : "ID"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "office.name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-bold text-white uppercase text-[10px] tracking-wider hover:bg-transparent"
        >
          Office
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 font-medium">
            {row.original.office?.name || "Unknown Office"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "driver_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-bold text-white uppercase text-[10px] tracking-wider hover:bg-transparent"
        >
          Driver
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-slate-600 font-medium">
          {row.original.driver_name}
        </span>
      ),
    },
    {
      accessorKey: "vehicle_type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-bold text-white uppercase text-[10px] tracking-wider hover:bg-transparent"
        >
          Type
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[10px] font-bold uppercase tracking-tight px-2 py-0">
          {row.original.vehicle_type}
        </Badge>
      ),
    },
    {
      accessorKey: "engine_type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-bold text-white uppercase text-[10px] tracking-wider hover:bg-transparent"
        >
          Engine
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-slate-500 font-medium uppercase">
          {row.original.engine_type}
        </span>
      ),
    },
    {
      accessorKey: "wheels",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-bold text-white uppercase text-[10px] tracking-wider hover:bg-transparent"
        >
          Wheels
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-slate-500 font-medium">
          {row.original.wheels}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right text-white font-bold uppercase text-[10px] tracking-wider">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right" onClick={(e) => e.stopPropagation()}>
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
                onClick={(e) => {
                  e.stopPropagation();
                  setDetailsVehicle(row.original);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                <span>View Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(row.original);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(row.original);
                }}
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
          <ul className="divide-y">
            {vehicles.map((v) => (
            <li
              key={v.id}
              className={`p-3 cursor-pointer hover:bg-blue-50 ${detailsVehicle.id === v.id ? "bg-blue-100 font-semibold" : ""
                }`}
              onClick={() => setDetailsVehicle(v)}
            >
              <div className="text-sm">{v.plate_number || v.chassis_number || v.registration_number || "N/A"}</div>
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
          </div>
          <VehicleDetails
            vehicle={detailsVehicle}
            isOpen={true}
            onClose={() => setDetailsVehicle(null)}
            onRegisterRefetch={(fn) => {
              detailsRefetchRef.current = fn;
            }}
            onStartEdit={(vehicle) => {
              onEdit(vehicle);
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
      defaultDensity="compact"
    />
  );
};

import React, { useState, useRef } from "react";
import { format } from "date-fns";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  flexRender,
  PaginationState,
  VisibilityState,
  ColumnFiltersState,
  OnChangeFn,
  RowSelectionState,
  getFilteredRowModel,
  ColumnResizeMode,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUpDown,
  Settings,
  GripHorizontal,
  List,
  Rows3,
} from "lucide-react";
import { SeedlingRequest } from "@/hooks/urban/useSeedlingRequests";
import { Badge } from "@/components/ui/badge";

// Skeleton loader component
export const SeedlingRequestTableSkeleton: React.FC = () => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date Received</TableHead>
            <TableHead>Requester</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
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

interface SeedlingRequestTableProps {
  requests: SeedlingRequest[];
  isLoading: boolean;
  onView: (request: SeedlingRequest) => void;
  onEdit: (request: SeedlingRequest) => void;
  onDelete: (request: SeedlingRequest) => void;

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

export const SeedlingRequestTable: React.FC<SeedlingRequestTableProps> = ({
  requests,
  isLoading,
  onView,
  onEdit,
  onDelete,

  // Optional TanStack Table state props (with defaults)
  sorting = [{ id: "dateReceived", desc: true }],
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
  // Internal state management when parent doesn't provide state handlers
  const [internalSorting, setInternalSorting] =
    React.useState<SortingState>(sorting);
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>(pagination);
  const [internalColumnFilters, setInternalColumnFilters] =
    React.useState<ColumnFiltersState>(columnFilters);
  const [internalColumnVisibility, setInternalColumnVisibility] =
    React.useState<VisibilityState>(columnVisibility);
  const [internalRowSelection, setInternalRowSelection] =
    React.useState<RowSelectionState>(rowSelection);
  const [density, setDensity] = React.useState<
    "compact" | "normal" | "spacious"
  >("normal");
  const [detailsRequest, setDetailsRequest] =
    React.useState<SeedlingRequest | null>(null);
  const [columnResizeMode, setColumnResizeMode] =
    React.useState<ColumnResizeMode>("onChange");

  const densityClasses = {
    compact: "text-xs h-6",
    normal: "text-sm h-9",
    spacious: "text-base h-12",
  };

  // Format date
  const formatDate = (dateValue?: string | number) => {
    if (!dateValue) return "Not set";
    let date: Date;
    if (typeof dateValue === "number") {
      date = new Date(dateValue);
    } else if (!isNaN(Number(dateValue))) {
      date = new Date(Number(dateValue));
    } else {
      date = new Date(dateValue);
    }
    if (isNaN(date.getTime())) return "Invalid date";
    return format(date, "MMM dd, yyyy");
  };

  // Calculate total quantity of all items in a request
  const getTotalItems = (items: { name: string; quantity: number }[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Define table columns
  const columns: ColumnDef<SeedlingRequest>[] = [
    {
      accessorKey: "dateReceived",
      size: 120,
      minSize: 80,
      maxSize: 200,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-medium"
        >
          Date Received
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatDate(row.original.dateReceived),
    },
    {
      accessorKey: "requesterName",
      size: 140,
      minSize: 80,
      maxSize: 300,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-medium"
        >
          Requester
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.requesterName}</span>
      ),
    },
    {
      accessorKey: "address",
      size: 200,
      minSize: 100,
      maxSize: 400,
      header: "Address",
      cell: ({ row }) => (
        <div className="truncate max-w-xs" title={row.original.address}>
          {row.original.address}
        </div>
      ),
    },
    {
      accessorKey: "items",
      size: 120,
      minSize: 80,
      maxSize: 200,
      header: "Items",
      cell: ({ row }) => {
        const items = row.original.items;
        const totalCount = getTotalItems(items);
        return (
          <span>
            {totalCount} seedlings ({items.length} varieties)
          </span>
        );
      },
    },
    {
      id: "actions",
      size: 100,
      minSize: 80,
      maxSize: 160,
      cell: ({ row }) => {
        const request = row.original;

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 vehicle-action-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(request);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(request);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(request);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: requests,
    columns,
    state: {
      sorting: onSortingChange ? sorting : internalSorting,
      pagination: onPaginationChange ? pagination : internalPagination,
      columnFilters: onColumnFiltersChange
        ? columnFilters
        : internalColumnFilters,
      columnVisibility: onColumnVisibilityChange
        ? columnVisibility
        : internalColumnVisibility,
      rowSelection: onRowSelectionChange ? rowSelection : internalRowSelection,
    },
    enableRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode,
    onSortingChange:
      onSortingChange ||
      ((updater) => {
        setInternalSorting(
          typeof updater === "function" ? updater(internalSorting) : updater
        );
      }),
    onPaginationChange:
      onPaginationChange ||
      ((updater) => {
        setInternalPagination(
          typeof updater === "function" ? updater(internalPagination) : updater
        );
      }),
    onColumnFiltersChange:
      onColumnFiltersChange ||
      ((updater) => {
        setInternalColumnFilters(
          typeof updater === "function"
            ? updater(internalColumnFilters)
            : updater
        );
      }),
    onColumnVisibilityChange:
      onColumnVisibilityChange ||
      ((updater) => {
        setInternalColumnVisibility(
          typeof updater === "function"
            ? updater(internalColumnVisibility)
            : updater
        );
      }),
    onRowSelectionChange:
      onRowSelectionChange ||
      ((updater) => {
        setInternalRowSelection(
          typeof updater === "function"
            ? updater(internalRowSelection)
            : updater
        );
      }),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) {
    return <SeedlingRequestTableSkeleton />;
  }

  if (detailsRequest) {
    return (
      <div className="flex gap-6">
        {/* List of requests (left) */}
        <div className="w-1/3 border-r pr-4 overflow-y-auto max-h-[70vh]">
          <ul className="divide-y">
            {requests.map((r) => (
              <li
                key={r.id}
                className={`p-3 cursor-pointer hover:bg-blue-50 ${
                  detailsRequest.id === r.id ? "bg-blue-100 font-semibold" : ""
                }`}
                onClick={() => setDetailsRequest(r)}
              >
                <div className="text-sm">{r.requesterName}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(r.dateReceived)} • {getTotalItems(r.items)}{" "}
                  seedlings
                </div>
              </li>
            ))}
          </ul>
        </div>
        {/* Details (right) */}
        <div className="flex-1 p-4">
          <div className="mb-4 flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDetailsRequest(null)}
            >
              &larr; Back to table
            </Button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Requester</h3>
                <p className="mt-1">{detailsRequest.requesterName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Date Received
                </h3>
                <p className="mt-1">
                  {formatDate(detailsRequest.dateReceived)}
                </p>
              </div>
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="mt-1">{detailsRequest.address}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Requested Items
              </h3>
              <div className="border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        Item
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                        Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {detailsRequest.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">{item.name}</td>
                        <td className="px-4 py-2 text-sm text-right">
                          {item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 text-xs">
      {/* Column Visibility Toggle */}
      <div className="flex justify-between items-center py-1">
        <div className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} requests
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">Density:</span>
          <Button
            size="sm"
            variant={density === "compact" ? "default" : "outline"}
            className="px-2 py-1 text-xs"
            onClick={() => setDensity("compact")}
            title="Compact"
          >
            <GripHorizontal className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={density === "normal" ? "default" : "outline"}
            className="px-2 py-1 text-xs"
            onClick={() => setDensity("normal")}
            title="Normal"
          >
            <Rows3 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={density === "spacious" ? "default" : "outline"}
            className="px-2 py-1 text-xs"
            onClick={() => setDensity("spacious")}
            title="Spacious"
          >
            <List className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 py-1 text-xs bg-white min-h-[28px]"
              >
                <Settings className="mr-2 h-3.5 w-3.5" />
                View Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[160px] text-xs bg-white"
            >
              <DropdownMenuCheckboxItem
                checked={table.getColumn("dateReceived")?.getIsVisible()}
                onCheckedChange={(value) =>
                  table.getColumn("dateReceived")?.toggleVisibility(value)
                }
              >
                Date Received
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={table.getColumn("requesterName")?.getIsVisible()}
                onCheckedChange={(value) =>
                  table.getColumn("requesterName")?.toggleVisibility(value)
                }
              >
                Requester
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={table.getColumn("address")?.getIsVisible()}
                onCheckedChange={(value) =>
                  table.getColumn("address")?.toggleVisibility(value)
                }
              >
                Address
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={table.getColumn("items")?.getIsVisible()}
                onCheckedChange={(value) =>
                  table.getColumn("items")?.toggleVisibility(value)
                }
              >
                Items
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => table.resetColumnVisibility()}
                className="justify-center text-center"
              >
                Reset View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto bg-white">
        <Table
          className={
            density === "compact"
              ? "text-xs"
              : density === "spacious"
              ? "text-base"
              : "text-sm"
          }
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className={densityClasses[density]}
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-2 py-1 relative group"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className="absolute right-0 top-0 h-full w-2 cursor-col-resize group-hover:bg-blue-200 transition"
                        style={{ userSelect: "none", touchAction: "none" }}
                      />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className={`cursor-pointer transition ${densityClasses[density]}`}
                  onClick={(e) => {
                    // Don't trigger view if clicking on dropdown or its contents
                    if (
                      (e.target as HTMLElement).closest(
                        '.vehicle-action-btn, [role="menu"]'
                      )
                    )
                      return;
                    setDetailsRequest(row.original);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-2 py-1"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className={densityClasses[density]}>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-4"
                >
                  No seedling requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {table.getRowModel().rows?.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-2 py-1 text-xs">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[5, 10, 20, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 py-1"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>

            <span>
              Page{" "}
              <span className="font-semibold">
                {table.getState().pagination.pageIndex + 1}
              </span>{" "}
              of <span className="font-semibold">{table.getPageCount()}</span>
            </span>

            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 py-1"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

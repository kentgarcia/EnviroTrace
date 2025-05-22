import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/shared/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/presentation/components/shared/ui/dropdown-menu";
import { Button } from "@/presentation/components/shared/ui/button";
import { GripHorizontal, Rows3, List, Settings } from "lucide-react";
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
  getFilteredRowModel,
  FilterFn,
  RowSelectionState,
  Row,
  ColumnFiltersState,
  OnChangeFn,
  ExpandedState,
} from "@tanstack/react-table";

// Define the density options and their corresponding CSS classes
export type TableDensity = "compact" | "normal" | "spacious";

export const densityClasses = {
  compact: "text-xs h-6",
  normal: "text-sm h-9",
  spacious: "text-base h-12",
};

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  showPagination?: boolean;
  showDensityToggle?: boolean;
  showColumnVisibility?: boolean;
  defaultDensity?: TableDensity;
  onRowClick?: (row: Row<TData>) => void;
  enableRowSelection?: boolean;
  selectionChange?: OnChangeFn<RowSelectionState>;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  className?: string;
  renderRowSubComponent?: (props: { row: Row<TData> }) => React.ReactNode;
  expandedRowIds?: ExpandedState;
  onExpandedChange?: OnChangeFn<ExpandedState>;
  stickyHeader?: boolean;
  filterFn?: FilterFn<TData>;
  showFilterInput?: boolean;
  defaultColumnFilters?: ColumnFiltersState;
  disableSorting?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  loadingMessage = "Loading data...",
  emptyMessage = "No data found.",
  showPagination = true,
  showDensityToggle = true,
  showColumnVisibility = true,
  defaultDensity = "normal",
  onRowClick,
  enableRowSelection = false,
  selectionChange,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50, 100],
  className = "",
  renderRowSubComponent,
  expandedRowIds,
  onExpandedChange,
  stickyHeader = false,
  filterFn,
  showFilterInput = false,
  defaultColumnFilters = [],
  disableSorting = false,
}: DataTableProps<TData, TValue>) {
  // Table state hooks
  const [density, setDensity] = useState<TableDensity>(defaultDensity);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(defaultColumnFilters);
  const [expanded, setExpanded] = useState<ExpandedState>(expandedRowIds || {});

  // Initialize the table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      columnVisibility,
      rowSelection,
      expanded,
      columnFilters,
    },
    enableRowSelection,
    enableMultiRowSelection: enableRowSelection,
    onRowSelectionChange: selectionChange || setRowSelection,
    onSortingChange: disableSorting ? undefined : setSorting,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: onExpandedChange || setExpanded,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: showPagination ? getPaginationRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {loadingMessage}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`space-y-2 text-xs ${className}`}>
      {/* Table Controls: Density & Column Visibility */}
      {(showDensityToggle || showColumnVisibility) && (
        <div className="flex justify-between items-center py-1">
          {/* Removed density buttons, view options UI, and number of items from top */}
        </div>
      )}

      {/* Main Table */}
      <div className="border overflow-x-auto bg-white">
        <Table
          className={
            density === "compact"
              ? "text-xs"
              : density === "spacious"
              ? "text-base"
              : "text-sm"
          }
        >
          <TableHeader
            className={stickyHeader ? "sticky top-0 z-10" : ""}
            style={{ background: "var(--primary)", color: "white" }}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className={densityClasses[density]}
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`px-2 py-1 ${
                      !disableSorting && header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : ""
                    } bg-primary text-white`}
                    onClick={
                      !disableSorting && header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    className={`transition ${densityClasses[density]} ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-2 py-1">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {/* Expandable row content */}
                  {renderRowSubComponent && expanded[row.id] && (
                    <TableRow>
                      <TableCell
                        colSpan={row.getVisibleCells().length}
                        className="p-0"
                      >
                        {renderRowSubComponent({ row })}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow className={densityClasses[density]}>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-4"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Number of items and Pagination Controls */}
      <div className="flex flex-col gap-1 px-2 py-1 text-xs">
        <div className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} items
        </div>
        {showPagination && table.getRowModel().rows.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
              >
                {pageSizeOptions.map((pageSize) => (
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
    </div>
  );
}

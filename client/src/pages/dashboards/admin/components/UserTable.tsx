import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
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
} from "@tanstack/react-table";
import {
  Edit,
  UserX,
  Trash2,
  Settings,
  GripHorizontal,
  List,
  Rows3,
  ArrowUpDown,
} from "lucide-react";
import { UserRole } from "@/lib/user-api";

interface User {
  id: string;
  email: string;
  full_name: string;
  roles: UserRole[];
  status: string;
  created_at: string;
  last_sign_in?: string;
  updated_at?: string;
}

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onRevoke: (user: User) => void;
  getRoleBadgeColor: (role: UserRole) => string;
  getStatusBadgeColor: (status: string) => string;
  formatDateTime: (dateString?: string) => string;
}

export function UserTable({
  users,
  onEdit,
  onDelete,
  onRevoke,
  getRoleBadgeColor,
  getStatusBadgeColor,
  formatDateTime,
}: UserTableProps) {
  const [density, setDensity] = useState<"compact" | "normal" | "spacious">(
    "normal"
  );
  const [sorting, setSorting] = useState<SortingState>([
    { id: "email", desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const densityClasses = {
    compact: "text-xs h-6",
    normal: "text-sm h-9",
    spacious: "text-base h-12",
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "full_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-medium"
        >
          Name
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-medium"
        >
          Email
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "roles",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-medium"
        >
          Roles
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          {row.original.roles.map((role) => (
            <span
              key={role}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                role as UserRole
              )}`}
            >
              {role.replace("_", " ").toUpperCase()}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-medium"
        >
          Status
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
            row.original.status
          )}`}
        >
          {row.original.status.replace("_", " ").toUpperCase()}
        </span>
      ),
    },
    {
      accessorKey: "last_sign_in",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-medium"
        >
          Last Sign In
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatDateTime(row.original.last_sign_in),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center p-0 font-medium"
        >
          Created
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatDateTime(row.original.created_at),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(row.original)}
            title="Edit User"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRevoke(row.original)}
            title="Revoke Access"
            disabled={row.original.status === "super_admin"}
          >
            <UserX className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(row.original)}
            title="Delete User"
            disabled={row.original.status === "super_admin"}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-2 text-xs">
      {/* Table Controls */}
      <div className="flex justify-between items-center py-1">
        <div className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} users
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
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(value)}
                  >
                    {column.id === "full_name"
                      ? "Name"
                      : column.id === "last_sign_in"
                      ? "Last Sign In"
                      : column.id === "created_at"
                      ? "Created"
                      : column.id.charAt(0).toUpperCase() + column.id.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
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
                  <TableHead key={header.id}>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className={densityClasses[density]}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                <TableCell colSpan={columns.length} className="text-center">
                  No users found.
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
}

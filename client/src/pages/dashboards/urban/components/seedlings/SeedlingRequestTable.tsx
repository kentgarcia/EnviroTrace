import React, { useState } from "react";
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
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { SeedlingRequest } from "@/hooks/urban/useSeedlingRequests";
import { DataTable } from "@/components/ui/data-table";

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
  const [detailsRequest, setDetailsRequest] = useState<SeedlingRequest | null>(
    null
  );

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
      header: "Address",
      cell: ({ row }) => (
        <div className="truncate max-w-xs" title={row.original.address}>
          {row.original.address}
        </div>
      ),
    },
    {
      accessorKey: "items",
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
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const request = row.original;

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
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
                className={`p-3 cursor-pointer hover:bg-blue-50 ${detailsRequest.id === r.id ? "bg-blue-100 font-semibold" : ""
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
    <DataTable
      columns={columns}
      data={requests}
      isLoading={isLoading}
      loadingMessage="Loading seedling requests..."
      emptyMessage="No seedling requests found for the selected filters."
      onRowClick={(row: Row<SeedlingRequest>) => setDetailsRequest(row.original)}
      showDensityToggle={true}
      showColumnVisibility={true}
      showPagination={true}
      defaultPageSize={10}
    />
  );
};

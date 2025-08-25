import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Button } from "@/presentation/components/shared/ui/button";
import { Edit, Trash, ArrowUpDown } from "lucide-react";
import { SOURCE_TYPE_LABELS } from "../../../constants";

interface MonitoringRequest {
  id: string;
  status: string;
  title?: string;
  requester_name?: string;
  date?: string;
  source_type?: string;
}

interface MonitoringRequestsTableProps {
  requests: MonitoringRequest[];
  selectedRequestId: string | null;
  onSelectRequest: (id: string | null) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  getStatusColor: (status: string) => string;
}

const MonitoringRequestsTable: React.FC<MonitoringRequestsTableProps> = ({
  requests,
  selectedRequestId,
  onSelectRequest,
  onEdit,
  onDelete,
  getStatusColor,
}) => {

  const columns: ColumnDef<MonitoringRequest>[] = useMemo(() => [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>{row.getValue("title") || "—"}</div>
      ),
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>{row.getValue("date") || "—"}</div>
      ),
    },
    {
      accessorKey: "source_type",
      header: "Source Type",
      cell: ({ row }) => {
        const sourceType = row.getValue("source_type") as string;
        return (
          <Badge variant="outline">
            {SOURCE_TYPE_LABELS[sourceType as keyof typeof SOURCE_TYPE_LABELS] || sourceType || "—"}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value === "all" || row.getValue(id) === value;
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge className={getStatusColor(status)}>
            {status}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        const cellValue = row.getValue(id) as string;
        return value === "all" || cellValue?.toLowerCase() === value.toLowerCase();
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row.original.id);
            }}
            title="Edit request"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row.original.id);
            }}
            title="Delete request"
            className="text-red-600 hover:text-red-700"
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ], [onEdit, onDelete, getStatusColor]);

  const handleRowClick = (row: any) => {
    onSelectRequest(row.original.id);
  };

  // Add custom styles for selected row
  const getRowClassName = (row: any) => {
    return selectedRequestId === row.original.id ? "bg-blue-50 hover:bg-blue-100" : "";
  };

  // Global filter function that searches across multiple columns
  const globalFilterFn = (row: any, columnId: string, value: string) => {
    const searchableFields = [
      row.original.id,
      row.original.title,
      row.original.status,
      row.original.source_type,
      row.original.date,
      row.original.requester_name
    ];

    const searchString = searchableFields
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchString.includes(value.toLowerCase());
  };

  return (
    <DataTable
      columns={columns}
      data={requests}
      onRowClick={handleRowClick}
      showPagination={true}
      showDensityToggle={true}
      showColumnVisibility={true}
      showFilterInput={true}
      defaultPageSize={10}
      pageSizeOptions={[5, 10, 20, 50]}
      emptyMessage="No monitoring requests found."
      className="w-full"
      defaultDensity="normal"
      filterFn={globalFilterFn}
    />
  );
};

export default MonitoringRequestsTable;

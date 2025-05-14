import React from "react";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import { Button } from "@/presentation/components/shared/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

// Mock data for demonstration
const mockOrders = [
  {
    id: "1",
    orderNo: "OP-2024-001",
    plateNo: "ABC-1234",
    operator: "Juan Dela Cruz",
    amount: 1500,
    dateIssued: "2024-06-01",
    status: "Paid",
  },
  {
    id: "2",
    orderNo: "OP-2024-002",
    plateNo: "XYZ-5678",
    operator: "Maria Santos",
    amount: 2000,
    dateIssued: "2024-06-03",
    status: "Unpaid",
  },
];

// Define columns for the table
const columns: ColumnDef<any>[] = [
  {
    accessorKey: "orderNo",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0 font-medium"
      >
        Order No
        <ArrowUpDown className="ml-1 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.orderNo}</span>
    ),
  },
  {
    accessorKey: "plateNo",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0 font-medium"
      >
        Plate No
        <ArrowUpDown className="ml-1 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "operator",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0 font-medium"
      >
        Operator
        <ArrowUpDown className="ml-1 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0 font-medium"
      >
        Amount
        <ArrowUpDown className="ml-1 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => `₱${row.original.amount.toLocaleString()}`,
  },
  {
    accessorKey: "dateIssued",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0 font-medium"
      >
        Date Issued
        <ArrowUpDown className="ml-1 h-4 w-4" />
      </Button>
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
        className={
          row.original.status === "Paid"
            ? "text-green-600 font-semibold"
            : "text-red-600 font-semibold"
        }
      >
        {row.original.status}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: () => (
      <div className="text-right">
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

const OrderOfPayments = () => {
  return (
    <div className="p-8 w-full h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Order of Payments</h1>
        <Button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Add New Order
        </Button>
      </div>
      <div className="bg-white border rounded p-0">
        <DataTable
          columns={columns}
          data={mockOrders}
          showPagination={true}
          showDensityToggle={true}
          showColumnVisibility={true}
          defaultPageSize={10}
          className=""
        />
      </div>
    </div>
  );
};

export default OrderOfPayments;

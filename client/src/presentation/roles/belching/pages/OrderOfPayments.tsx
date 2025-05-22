import React, { useState, useEffect } from "react";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import { Button } from "@/presentation/components/shared/ui/button";
import { ArrowUpDown, MoreHorizontal, Plus } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import {
  fetchOrderOfPayments,
} from "@/lib/api/order-of-payments-api";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";
import { useNavigate } from "@tanstack/react-router";

type OrderOfPayment = {
  id: string;
  orderNo: string;
  plateNo: string;
  operator: string;
  amount: number;
  dateIssued: string;
  status: string;
};

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
  // State for selected date
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // State for orders, loading, and error
  const [orders, setOrders] = useState<OrderOfPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchOrderOfPayments()
      .then((data) => setOrders(data))
      .catch((err) => setError(err.message || "Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  // Filter orders by search and date
  const filteredOrders = orders.filter(
    (order) =>
      order.dateIssued === selectedDate &&
      (order.orderNo.toLowerCase().includes(search.toLowerCase()) ||
        order.plateNo.toLowerCase().includes(search.toLowerCase()) ||
        order.operator.toLowerCase().includes(search.toLowerCase()))
  );

  // Navigate to order entry page
  const handleAddNewOrder = () => {
    navigate({ to: "/smoke-belching/order-of-payment-entry" });
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavBarContainer dashboardType="air-quality" />
        <ColorDivider variant="secondary" />

        {/* Search and Date Picker Filter */}
        <div className="flex flex-wrap items-center gap-4 px-6 py-4 bg-white border-b border-gray-100">
          <label htmlFor="order-date" className="font-medium text-gray-700">
            Show orders for:
          </label>
          <input
            id="order-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded px-2 py-1 text-gray-800"
            max={new Date().toISOString().split("T")[0]}
          />
          <input
            type="text"
            placeholder="Search by Order No, Plate No, or Operator"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-2 py-1 text-gray-800 flex-1 min-w-[200px]"
          />
          <Button
            className="hidden md:inline-flex"
            onClick={handleAddNewOrder}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Order
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredOrders}
              showPagination={true}
              showDensityToggle={true}
              showColumnVisibility={true}
              defaultPageSize={10}
              className=""
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderOfPayments;

import React, { useState, useEffect } from "react";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import { Button } from "@/presentation/components/shared/ui/button";
import { ArrowUpDown, MoreHorizontal, Plus } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import {
  fetchOrderOfPayments,
  createOrderOfPayment,
} from "@/lib/api/order-of-payments-api";
import { Dialog } from "@/presentation/components/shared/ui/dialog";

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    orderNo: "",
    plateNo: "",
    operator: "",
    amount: 0,
    dateIssued: new Date().toISOString().split("T")[0],
    status: "Unpaid",
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchOrderOfPayments()
      .then((data) => setOrders(data))
      .catch((err) => setError(err.message || "Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  // Find the next order number
  useEffect(() => {
    if (!showAddModal) return;
    // Find the highest orderNo (format: OP-YYYY-NNN)
    let maxNum = 0;
    let year = new Date().getFullYear();
    orders.forEach((o) => {
      const match = o.orderNo.match(/OP-(\d{4})-(\d+)/);
      if (match && match[1] === String(year)) {
        const num = parseInt(match[2], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextOrderNo = `OP-${year}-${String(maxNum + 1).padStart(3, "0")}`;
    setAddForm((f) => ({
      ...f,
      orderNo: nextOrderNo,
      dateIssued: new Date().toISOString().split("T")[0],
    }));
  }, [showAddModal, orders]);

  // Filter orders by search and date
  const filteredOrders = orders.filter(
    (order) =>
      order.dateIssued === selectedDate &&
      (order.orderNo.toLowerCase().includes(search.toLowerCase()) ||
        order.plateNo.toLowerCase().includes(search.toLowerCase()) ||
        order.operator.toLowerCase().includes(search.toLowerCase()))
  );

  // Add order handler
  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await createOrderOfPayment(addForm);
      setShowAddModal(false);
      setAddForm({
        ...addForm,
        plateNo: "",
        operator: "",
        amount: 0,
        status: "Unpaid",
      });
      // Refresh orders
      setLoading(true);
      const data = await fetchOrderOfPayments();
      setOrders(data);
    } catch (err: any) {
      alert(err.message || "Failed to add order");
    } finally {
      setAdding(false);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavBarContainer dashboardType="air-quality" />
        {/* Header Section */}
        <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">
            Order of Payments
          </h1>
          <div className="flex gap-2">
            <Button
              className="hidden md:inline-flex"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Order
            </Button>
          </div>
        </div>
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
        {/* Add Order Modal */}
        {showAddModal && (
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setShowAddModal(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <form
                onSubmit={handleAddOrder}
                className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-semibold mb-4">Add New Order</h2>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">
                    Order No
                  </label>
                  <input
                    type="text"
                    value={addForm.orderNo}
                    readOnly
                    className="border rounded px-2 py-1 w-full bg-gray-100"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">
                    Plate No
                  </label>
                  <input
                    type="text"
                    value={addForm.plateNo}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, plateNo: e.target.value }))
                    }
                    required
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">
                    Operator
                  </label>
                  <input
                    type="text"
                    value={addForm.operator}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, operator: e.target.value }))
                    }
                    required
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={addForm.amount}
                    onChange={(e) =>
                      setAddForm((f) => ({
                        ...f,
                        amount: Number(e.target.value),
                      }))
                    }
                    required
                    min={0}
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">
                    Date Issued
                  </label>
                  <input
                    type="date"
                    value={addForm.dateIssued}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, dateIssued: e.target.value }))
                    }
                    required
                    className="border rounded px-2 py-1 w-full"
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    value={addForm.status}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, status: e.target.value }))
                    }
                    className="border rounded px-2 py-1 w-full"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    disabled={adding}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={adding}>
                    {adding ? "Adding..." : "Add Order"}
                  </Button>
                </div>
              </form>
            </div>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default OrderOfPayments;

// client/src/presentation/roles/urban-greening/pages/sapling-requests/SaplingRequestsPage.tsx
/**
 * Sapling Requests Page
 * Manage sapling requests from the community
 */

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/presentation/components/shared/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/presentation/components/shared/ui/alert-dialog";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import {
  Plus,
  RefreshCw,
  Sprout,
  BarChart3,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useSaplingRequests, useSaplingRequestMutations } from "../greening-projects/logic/useSaplingManagement";
import { SaplingRequest } from "@/core/api/sapling-requests-api";
import SaplingRequestForm from "../greening-projects/components/SaplingRequestForm";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const SaplingRequestsPage: React.FC = () => {
  // Generate year options (2020 to current year)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let year = currentYear; year >= 2020; year--) {
      years.push(year);
    }
    return years;
  }, []);

  // Sapling Request state
  const [srSearch, setSrSearch] = useState("");
  const [srYearFilter, setSrYearFilter] = useState<number | undefined>(new Date().getFullYear());
  const [srOpen, setSrOpen] = useState(false);
  const [srMode, setSrMode] = useState<"add" | "edit">("add");
  const [srSelected, setSrSelected] = useState<SaplingRequest | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SaplingRequest | null>(null);

  // Sapling Requests hooks
  const { saplingRequests, refetchSaplingRequests, isLoading } = useSaplingRequests(srYearFilter);
  const { createSapling, updateSapling, deleteSapling } = useSaplingRequestMutations();

  // Statistics Calculation
  const stats = useMemo(() => {
      const total = saplingRequests.length;
      const pending = saplingRequests.filter(r => r.status === "pending").length;
      const approved = saplingRequests.filter(r => r.status === "approved" || r.status === "ready").length;
      const completed = saplingRequests.filter(r => r.status === "completed").length;
      const cancelled = saplingRequests.filter(r => r.status === "cancelled" || r.status === "declined").length;

      // Group by Plant Type
      const typeMap: Record<string, number> = {};
      saplingRequests.forEach(req => {
         let items: any[] = [];
         try {
            items = typeof req.saplings === "string" ? JSON.parse(req.saplings) : (req.saplings as any[]);
         } catch {}
         items.forEach(item => {
             const type = item.plant_type || "Unknown";
             typeMap[type] = (typeMap[type] || 0) + (Number(item.qty) || 0);
         });
      });

      const pieData = Object.entries(typeMap).map(([name, value]) => ({
          name: name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
          value
      })).filter(d => d.value > 0);

      return { total, pending, approved, completed, cancelled, pieData };
  }, [saplingRequests]);

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  // Sapling Requests filtering
  const srFiltered = useMemo(() => {
    const q = srSearch.toLowerCase();
    return saplingRequests.filter((r) =>
      !srSearch ||
      r.requester_name.toLowerCase().includes(q) ||
      r.address.toLowerCase().includes(q)
    );
  }, [saplingRequests, srSearch]);

  const handleAddRequest = () => {
    setSrMode("add");
    setSrSelected(null);
    setSrOpen(true);
  };

  const handleSrSave = async (data: any) => {
    if (srMode === "add") {
      await createSapling.mutateAsync(data);
    } else if (srSelected) {
      await updateSapling.mutateAsync({ id: srSelected.id, data });
    }
    setSrOpen(false);
    setSrSelected(null);
    await refetchSaplingRequests();
  };

  const handleSrDelete = (row: SaplingRequest) => {
    setItemToDelete(row);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteSapling.mutateAsync(itemToDelete.id);
      setSrSelected(null);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      await refetchSaplingRequests();
    }
  };

  const srColumns: ColumnDef<SaplingRequest>[] = useMemo(
    () => [
      { accessorKey: "date_received", header: "Date Received" },
      { accessorKey: "requester_name", header: "Requester" },
      { 
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status || "pending";
            const colors: any = {
                pending: "bg-yellow-100 text-yellow-800",
                approved: "bg-blue-100 text-blue-800",
                ready: "bg-indigo-100 text-indigo-800",
                completed: "bg-green-100 text-green-800",
                declined: "bg-red-100 text-red-800",
                cancelled: "bg-gray-100 text-gray-800"
            };
            return <Badge className={colors[status] || colors.pending}>{status}</Badge>;
        }
      },
      { accessorKey: "address", header: "Address" },
      {
        accessorKey: "saplings",
        header: "Items",
        cell: ({ row }) => {
          const v = row.original.saplings as any;
          let items: any[] = [];
          try {
            items = typeof v === "string" ? JSON.parse(v) : (v as any[]);
          } catch {}
          return (
            <span className="text-xs text-gray-700">
              {items.map((i) => `${i.name} (${i.qty})${i.plant_type ? ' - ' + i.plant_type : ''}`).join(", ")}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="flex flex-col h-full bg-[#F9FBFC]">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Sapling Requests</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage sapling requests from the community
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetchSaplingRequests()}
                disabled={isLoading}
                className="border border-gray-200 bg-white rounded-lg h-9 w-9 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 text-slate-600 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button
                onClick={handleAddRequest}
                className="bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
            <div className="flex flex-col space-y-6 h-full">
               {/* Dashboard Stats */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                  {/* Total Requests Card */}
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                       <div>
                          <p className="text-sm font-medium text-gray-500">Total Requests</p>
                          <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
                          <p className="text-xs text-blue-600 mt-1 flex items-center">
                             <FileText className="w-3 h-3 mr-1" /> All time records
                          </p>
                       </div>
                       <div className="p-3 bg-blue-50 rounded-full">
                          <FileText className="w-6 h-6 text-blue-600" />
                       </div>
                    </CardContent>
                  </Card>

                  {/* Status Breakdown Card */}
                  <Card className="border-0 shadow-sm col-span-1 lg:col-span-2">
                    <CardContent className="p-4">
                       <p className="text-sm font-medium text-gray-500 mb-3">Request Status</p>
                       <div className="grid grid-cols-3 gap-4">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-yellow-100 rounded-lg">
                                <Clock className="w-4 h-4 text-yellow-600" />
                             </div>
                             <div>
                                <div className="text-lg font-bold">{stats.pending}</div>
                                <div className="text-xs text-gray-500">Pending</div>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                             </div>
                             <div>
                                <div className="text-lg font-bold">{stats.completed}</div>
                                <div className="text-xs text-gray-500">Completed</div>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-red-100 rounded-lg">
                                <XCircle className="w-4 h-4 text-red-600" />
                             </div>
                             <div>
                                <div className="text-lg font-bold">{stats.cancelled}</div>
                                <div className="text-xs text-gray-500">Cancelled</div>
                             </div>
                          </div>
                       </div>
                    </CardContent>
                  </Card>

                   {/* Distribution Pie Chart */}
                   <Card className="border-0 shadow-sm row-span-2 lg:row-span-1">
                      <CardContent className="p-4 h-40 relative">
                         <div className="absolute top-4 left-4 z-10">
                            <p className="text-sm font-medium text-gray-500">Requested Types</p>
                         </div>
                         {stats.pieData.length > 0 ? (
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                   <Pie
                                      data={stats.pieData}
                                      cx="50%"
                                      cy="60%"
                                      innerRadius={30}
                                      outerRadius={50}
                                      paddingAngle={2}
                                      dataKey="value"
                                   >
                                      {stats.pieData.map((entry, index) => (
                                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                   </Pie>
                                   <Tooltip />
                                </PieChart>
                             </ResponsiveContainer>
                         ) : (
                             <div className="h-full flex items-center justify-center text-xs text-gray-400">
                                No data available
                             </div>
                         )}
                      </CardContent>
                   </Card>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
              <div className="min-w-0 flex flex-col transition-all duration-300 lg:col-span-2 h-full">
                <Card className="border-0 flex flex-col h-full shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
                    <CardTitle className="flex items-center gap-2">
                      <Sprout className="w-5 h-5" /> Request List
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex flex-col sm:flex-row gap-4 mb-4 shrink-0">
                      <div className="flex-1">
                        <Input
                          placeholder="Search requester or address..."
                          value={srSearch}
                          onChange={(e) => setSrSearch(e.target.value)}
                          className="rounded-lg"
                        />
                      </div>
                      <select
                        value={srYearFilter ?? "all"}
                        onChange={(e) => setSrYearFilter(e.target.value === "all" ? undefined : parseInt(e.target.value))}
                        className="px-3 py-2 border rounded-lg text-sm"
                      >
                        {yearOptions.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                        <option value="all">All Years</option>
                      </select>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <DataTable
                        data={srFiltered}
                        columns={srColumns}
                        onRowClick={(row) => setSrSelected(row.original as SaplingRequest)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col min-h-0 transition-all duration-300 lg:col-span-1 h-full">
                <Card className={`flex-1 flex flex-col min-h-0 ${srSelected ? 'bg-gray-50' : 'bg-white'} shadow-sm`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
                    <CardTitle className="text-lg">{srSelected ? 'Request Details' : 'Select a Request'}</CardTitle>
                    {srSelected && (
                      <Button variant="ghost" size="sm" onClick={() => setSrSelected(null)}>Close</Button>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 overflow-auto space-y-4">
                    {srSelected ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date Received</span>
                          <span className="font-medium">{srSelected.date_received}</span>
                        </div>
                        {srSelected.received_through && (
                             <div className="flex justify-between">
                                <span className="text-gray-600">Received Through</span>
                                <span className="font-medium capitalize">{srSelected.received_through}</span>
                             </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status</span>
                          <Badge variant="outline" className="capitalize">{srSelected.status || "pending"}</Badge>
                        </div>
                         {srSelected.date_donated && (
                             <div className="flex justify-between">
                                <span className="text-gray-600">Date Donated</span>
                                <span className="font-medium">{srSelected.date_donated}</span>
                             </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Requester</span>
                          <span className="font-medium">{srSelected.requester_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Address</span>
                          <span className="font-medium text-right max-w-[200px]">{srSelected.address}</span>
                        </div>
                        
                        <div className="pt-3 border-t">
                          <div className="text-gray-600 mb-2 font-medium">Requested Items</div>
                          <div className="space-y-2">
                            {(() => {
                              let items: any[] = [];
                              try {
                                items =
                                  typeof srSelected.saplings === "string"
                                    ? JSON.parse(srSelected.saplings)
                                    : (srSelected.saplings as any[]);
                              } catch {}
                              return items;
                            })().map((item, idx) => (
                              <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-medium text-gray-900">{item.name}</span>
                                  <Badge variant="outline" className="ml-2">
                                    {item.qty} {item.qty === 1 ? 'pc' : 'pcs'}
                                  </Badge>
                                </div>
                                {item.plant_type && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Type: <span className="capitalize">{item.plant_type.replace(/_/g, ' ')}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSrMode("edit");
                              setSrOpen(true);
                            }}
                            className="rounded-lg"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 rounded-lg"
                            onClick={() => handleSrDelete(srSelected!)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <Sprout className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm">Select a request to view details</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
        {/* End of content grid */}
      
      {/* Sapling Request Form Dialog */}
      <Dialog open={srOpen} onOpenChange={setSrOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl border-none p-0 overflow-hidden max-h-[90vh] flex flex-col">
            <DialogHeader className="bg-[#0033a0] p-6 m-0 border-none shrink-0">
                <DialogTitle className="text-xl font-bold text-white">
              {srMode === "add" ? "Add Sapling Request" : "Edit Sapling Request"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 overflow-y-auto">
            <SaplingRequestForm
              mode={srMode}
              initialData={srSelected || undefined}
              onSave={handleSrSave}
              onCancel={() => setSrOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sapling Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this sapling request from{" "}
              <strong>{itemToDelete?.requester_name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SaplingRequestsPage;

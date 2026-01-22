// client/src/presentation/roles/urban-greening/pages/tree-inventory/TreeInventoryPage.tsx
/**
 * Tree Inventory System - Main Registry Page
 * Unified view for tracking all trees in the system
 */

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/presentation/components/shared/ui/dialog";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/presentation/components/shared/ui/tabs";
import {
  TreePine,
  Plus,
  Search,
  RefreshCw,
  Map,
  BarChart3,
  Leaf,
  AlertTriangle,
  XCircle,
  Eye,
  QrCode,
  ClipboardList
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useSearch } from "@tanstack/react-router";

import { useTreeInventory, useTreeStats, useTreeMutations } from "./logic/useTreeInventory";
import { TreeInventory } from "@/core/api/tree-inventory-api";
import TreeForm from "./components/TreeForm";
import TreeDetailPanel from "./components/TreeDetailPanel";
import TreeInventoryMap from "./components/TreeInventoryMap";
import CarbonStatistics from "./components/CarbonStatistics";

// Search params type
interface TreeInventorySearch {
  action?: "add";
  tab?: "registry" | "map" | "stats";
  status?: string;
  health?: string;
}

const TreeInventoryPage: React.FC = () => {
  // Get URL search params
  const search = useSearch({ strict: false }) as TreeInventorySearch;
  
  const [activeTab, setActiveTab] = useState<"registry" | "map" | "stats">(search?.tab || "registry");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(search?.status || "all");
  const [healthFilter, setHealthFilter] = useState<string>(search?.health || "all");
  
  // Form dialog state - open if action=add in URL
  const [isFormOpen, setIsFormOpen] = useState(search?.action === "add");
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedTree, setSelectedTree] = useState<TreeInventory | null>(null);
  
  // Detail panel state
  const [detailTree, setDetailTree] = useState<TreeInventory | null>(null);

  // API hooks
  const { data: trees = [], isLoading, refetch } = useTreeInventory({
    status: statusFilter !== "all" ? statusFilter : undefined,
    health: healthFilter !== "all" ? healthFilter : undefined,
    search: searchTerm || undefined,
  });
  const { data: stats } = useTreeStats();
  const { createMutation, updateMutation, deleteMutation } = useTreeMutations();

  // Table columns
  const columns: ColumnDef<TreeInventory>[] = useMemo(() => [
    {
      accessorKey: "tree_code",
      header: "Tree Code",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-blue-600">{row.original.tree_code}</span>
      ),
    },
    {
      accessorKey: "species",
      header: "Species",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.species}</div>
          {row.original.common_name && (
            <div className="text-xs text-gray-500">{row.original.common_name}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const colors: Record<string, string> = {
          alive: "bg-green-100 text-green-800",
          cut: "bg-red-100 text-red-800",
          dead: "bg-gray-100 text-gray-800",
          replaced: "bg-blue-100 text-blue-800",
        };
        return (
          <Badge className={colors[status] || "bg-gray-100"}>
            {status.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: "health",
      header: "Health",
      cell: ({ row }) => {
        const health = row.original.health;
        const colors: Record<string, string> = {
          healthy: "bg-green-100 text-green-800",
          needs_attention: "bg-yellow-100 text-yellow-800",
          diseased: "bg-orange-100 text-orange-800",
          dead: "bg-gray-100 text-gray-800",
        };
        const icons: Record<string, React.ReactNode> = {
          healthy: <Leaf className="w-3 h-3 mr-1" />,
          needs_attention: <AlertTriangle className="w-3 h-3 mr-1" />,
          diseased: <XCircle className="w-3 h-3 mr-1" />,
        };
        return (
          <Badge className={`${colors[health] || "bg-gray-100"} flex items-center`}>
            {icons[health]}
            {health.replace("_", " ").toUpperCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: "barangay",
      header: "Location",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.barangay || row.original.address || "—"}
        </div>
      ),
    },
    {
      accessorKey: "planted_date",
      header: "Planted",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.planted_date || "—"}
        </span>
      ),
    },
  ], []);

  // Handlers
  const handleAddTree = () => {
    setFormMode("add");
    setSelectedTree(null);
    setIsFormOpen(true);
  };

  const handleEditTree = (tree: TreeInventory) => {
    setFormMode("edit");
    setSelectedTree(tree);
    setIsFormOpen(true);
  };

  const handleRowClick = (row: any) => {
    setDetailTree(row.original);
  };

  const handleFormSave = async (data: any) => {
    if (formMode === "add") {
      await createMutation.mutateAsync(data);
    } else if (selectedTree) {
      await updateMutation.mutateAsync({ id: selectedTree.id, data });
    }
    setIsFormOpen(false);
  };

  const handleDeleteTree = async (tree: TreeInventory) => {
    if (confirm(`Are you sure you want to remove tree ${tree.tree_code} from the inventory?`)) {
      await deleteMutation.mutateAsync(tree.id);
      setDetailTree(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F9FBFC]">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Tree Inventory</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Unified registry for all trees • {stats?.total_trees || 0} total trees
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isLoading}
                className="border border-gray-200 bg-white rounded-lg h-9 w-9 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 text-slate-600 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button
                onClick={handleAddTree}
                className="bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Tree
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-6">
            <nav className="flex space-x-8 -mb-px">
              <button
                onClick={() => setActiveTab("registry")}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "registry"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <ClipboardList className="w-4 h-4 inline mr-2" />
                Registry
              </button>
              <button
                onClick={() => setActiveTab("map")}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "map"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Map className="w-4 h-4 inline mr-2" />
                Map View
              </button>
              <button
                onClick={() => setActiveTab("stats")}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "stats"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Statistics
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
          {/* Registry Tab */}
          {activeTab === "registry" && (
            <div className="flex gap-6 h-full">
              {/* Left Panel - Table */}
              <div className={`flex flex-col transition-all duration-300 ${detailTree ? 'w-[60%]' : 'flex-1'}`}>
                <Card className="flex-1 flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
                    <CardTitle className="flex items-center gap-2">
                      <TreePine className="w-5 h-5" />
                      Tree Registry
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col overflow-hidden">
                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 mb-4 shrink-0">
                      <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search by code, species, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 rounded-lg"
                          />
                        </div>
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="all">All Status</option>
                        <option value="alive">Alive</option>
                        <option value="cut">Cut</option>
                        <option value="dead">Dead</option>
                        <option value="replaced">Replaced</option>
                      </select>
                      <select
                        value={healthFilter}
                        onChange={(e) => setHealthFilter(e.target.value)}
                        className="px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="all">All Health</option>
                        <option value="healthy">Healthy</option>
                        <option value="needs_attention">Needs Attention</option>
                        <option value="diseased">Diseased</option>
                      </select>
                    </div>

                    {/* Data Table */}
                    {isLoading ? (
                      <div className="flex items-center justify-center h-32 flex-1">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-600">Loading inventory...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-auto rounded border border-gray-100">
                        <DataTable
                          data={trees}
                          columns={columns}
                          onRowClick={handleRowClick}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel - Details or Stats Summary */}
              <div className={`transition-all duration-300 ${detailTree ? 'w-[40%]' : 'w-[300px]'}`}>
                {detailTree ? (
                  <TreeDetailPanel
                    tree={detailTree}
                    onClose={() => setDetailTree(null)}
                    onEdit={() => handleEditTree(detailTree)}
                    onDelete={() => handleDeleteTree(detailTree)}
                  />
                ) : (
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-700">{stats?.alive_trees || 0}</div>
                          <div className="text-xs text-green-600">Alive Trees</div>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-700">{stats?.cut_trees || 0}</div>
                          <div className="text-xs text-red-600">Cut Trees</div>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-700">{stats?.needs_attention_trees || 0}</div>
                          <div className="text-xs text-yellow-600">Needs Attention</div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-700">{stats?.trees_planted_this_year || 0}</div>
                          <div className="text-xs text-blue-600">Planted This Year</div>
                        </div>
                      </div>

                      {stats?.replacement_ratio !== null && stats?.replacement_ratio !== undefined && (
                        <div className="p-3 border rounded-lg">
                          <div className="text-sm text-gray-600">Replacement Ratio</div>
                          <div className="text-xl font-bold text-gray-900">
                            {stats.replacement_ratio}:1
                            {stats.replacement_ratio >= 1 ? (
                              <span className="text-green-600 text-sm ml-2">✓ Good</span>
                            ) : (
                              <span className="text-red-600 text-sm ml-2">⚠ Below target</span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-gray-400 pt-2">
                        Click on a tree row to view details
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Map Tab */}
          {activeTab === "map" && (
            <div className="h-[calc(100vh-200px)]">
              <TreeInventoryMap />
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === "stats" && (
            <div className="overflow-auto h-[calc(100vh-200px)]">
              <CarbonStatistics />
            </div>
          )}
        </div>

        {/* Add/Edit Tree Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl p-0 rounded-2xl border-none overflow-hidden max-h-[90vh] flex flex-col">
            <DialogHeader className="bg-[#0033a0] p-6 m-0 border-none shrink-0">
              <DialogTitle>
                {formMode === "add" ? "Add Tree to Inventory" : "Edit Tree"}
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 overflow-y-auto">
              <TreeForm
                mode={formMode}
                initialData={selectedTree || undefined}
                onSave={handleFormSave}
                onCancel={() => setIsFormOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
};

export default TreeInventoryPage;

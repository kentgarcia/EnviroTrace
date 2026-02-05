// client/src/presentation/roles/urban-greening/pages/tree-inventory/TreeInventoryPage.tsx
/**
 * Tree Inventory System - Main Registry Page
 * Unified view for tracking all trees in the system
 */

import React, { useState, useMemo, useEffect } from "react";
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
  Archive,
  ArchiveRestore,
  ClipboardList,
  Edit2,
  Eye
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useSearch } from "@tanstack/react-router";

import { useTreeInventory, useTreeMutations } from "./logic/useTreeInventory";
import { TreeInventory } from "@/core/api/tree-inventory-api";
import TreeForm from "./components/TreeForm";
import TreeDetailPanel from "./components/TreeDetailPanel";
import TreeInventoryMap from "./components/TreeInventoryMap";
import CarbonStatistics from "./components/CarbonStatistics";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";
import { PERMISSIONS } from "@/core/utils/permissions";

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

  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canCreateTree = hasPermission(PERMISSIONS.TREE.CREATE);
  const canUpdateTree = hasPermission(PERMISSIONS.TREE.UPDATE);
  const canDeleteTree = hasPermission(PERMISSIONS.TREE.DELETE);
  const canViewMonitoring = hasPermission(PERMISSIONS.MONITORING_LOG.VIEW);
  const canCreateMonitoring = hasPermission(PERMISSIONS.MONITORING_LOG.CREATE);
  
  const [activeTab, setActiveTab] = useState<"registry" | "map" | "stats">(search?.tab || "registry");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(search?.status || "all");
  const [healthFilter, setHealthFilter] = useState<string>(search?.health || "all");
  const [showArchived, setShowArchived] = useState(false);
  
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
    is_archived: showArchived,
  });
  const { createMutation, updateMutation, archiveMutation, restoreMutation } = useTreeMutations();

  useEffect(() => {
    if (search?.action === "add" && !canCreateTree) {
      setIsFormOpen(false);
    }
  }, [canCreateTree, search?.action]);

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
          alive: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
          cut: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200",
          dead: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
          replaced: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200",
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
          healthy: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
          needs_attention: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200",
          diseased: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200",
          dead: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
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
      header: "Barangay",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.barangay || "—"}
        </div>
      ),
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.address || "—"}
        </div>
      ),
    },
    {
      accessorKey: "planted_date",
      header: "Planted",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {row.original.planted_date || "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const tree = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setDetailTree(tree);
              }}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {canUpdateTree && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditTree(tree);
                }}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            {!tree.is_archived ? (
              canDeleteTree && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchiveTree(tree);
                  }}
                  className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700"
                >
                  <Archive className="h-4 w-4" />
                </Button>
              )
            ) : (
              canUpdateTree && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestoreTree(tree);
                  }}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                >
                  <ArchiveRestore className="h-4 w-4" />
                </Button>
              )
            )}
          </div>
        );
      },
    },
  ], [canDeleteTree, canUpdateTree]);

  // Handlers
  const handleAddTree = () => {
    if (!canCreateTree) return;
    setFormMode("add");
    setSelectedTree(null);
    setIsFormOpen(true);
  };

  const handleEditTree = (tree: TreeInventory) => {
    if (!canUpdateTree) return;
    setFormMode("edit");
    setSelectedTree(tree);
    setIsFormOpen(true);
  };

  const handleRowClick = (row: any) => {
    setDetailTree(row.original);
  };

  const handleFormSave = async (data: any) => {
    if (formMode === "add") {
      if (!canCreateTree) return;
      await createMutation.mutateAsync(data);
    } else if (selectedTree) {
      if (!canUpdateTree) return;
      await updateMutation.mutateAsync({ id: selectedTree.id, data });
    }
    setIsFormOpen(false);
  };

  const handleArchiveTree = async (tree: TreeInventory) => {
    if (!canDeleteTree) return;
    await archiveMutation.mutateAsync(tree.id);
    setDetailTree(null);
  };

  const handleRestoreTree = async (tree: TreeInventory) => {
    if (!canUpdateTree) return;
    await restoreMutation.mutateAsync(tree.id);
    setDetailTree(null);
  };

  return (
    <div className="flex flex-col h-full page-bg">
        {/* Header Section */}
        <div className="page-header-bg sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Tree Inventory</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Unified registry for all trees
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isLoading}
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg h-9 w-9 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
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
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
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
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
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
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Statistics
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 page-bg">
          {/* Registry Tab */}
          {activeTab === "registry" && (
            <div className="flex gap-6 h-full">
              {/* Left Panel - Table */}
              <div className={`flex flex-col transition-all duration-300 ${detailTree ? 'w-[60%]' : 'flex-1'}`}>
                <Card className="flex-1 flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
                    {/* <CardTitle className="flex items-center gap-2">
                      <TreePine className="w-5 h-5" />
                      Tree Inventory
                    </CardTitle> */}
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
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
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
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                      >
                        <option value="all">All Health</option>
                        <option value="healthy">Healthy</option>
                        <option value="needs_attention">Needs Attention</option>
                        <option value="diseased">Diseased</option>
                      </select>
                      <Button
                        type="button"
                        variant={showArchived ? "default" : "outline"}
                        onClick={() => setShowArchived((prev) => !prev)}
                        className={`rounded-lg text-sm flex items-center gap-2 ${showArchived ? "bg-slate-900 text-white" : "bg-white dark:bg-gray-800"}`}
                      >
                        {showArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                        {showArchived ? "Show Active" : "View Archived"}
                      </Button>
                                    {canCreateTree && (
                                      <Button
                                        onClick={handleAddTree}
                                        className="bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg"
                                      >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Tree
                                      </Button>
                                    )}
                    </div>

                    {/* Data Table */}
                    {isLoading ? (
                      <div className="flex items-center justify-center h-32 flex-1">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-600">Loading inventory...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-auto rounded">
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

              {/* Right Panel - Tree Details */}
              {detailTree && (
                <div className="w-[40%]">
                  <TreeDetailPanel
                    tree={detailTree}
                    onClose={() => setDetailTree(null)}
                    onEdit={() => handleEditTree(detailTree)}
                    onArchive={() => handleArchiveTree(detailTree)}
                    onRestore={() => handleRestoreTree(detailTree)}
                    isArchived={detailTree.is_archived}
                    isArchiving={archiveMutation.isPending}
                    isRestoring={restoreMutation.isPending}
                    canEdit={canUpdateTree}
                    canArchive={canDeleteTree}
                    canRestore={canUpdateTree}
                    canViewMonitoring={canViewMonitoring}
                    canCreateMonitoring={canCreateMonitoring}
                  />
                </div>
              )}
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
          <DialogContent className="max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {formMode === "add" ? "Add Tree to Inventory" : "Edit Tree"}
              </DialogTitle>
            </DialogHeader>
            <div className="p-2 overflow-y-auto">
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

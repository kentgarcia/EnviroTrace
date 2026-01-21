// client/src/presentation/roles/urban-greening/pages/greening-projects/GreeningProjectsPage.tsx
/**
 * Urban Greening Projects Page
 * For sapling projects - both replacement and new greening initiatives
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
  Search,
  RefreshCw,
  Leaf,
  TreePine,
  Flower2,
  Sprout,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Play,
  Eye,
  BarChart3,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import {
  useUrbanGreeningProjects,
  useProjectStats,
  useUrbanGreeningProjectMutations,
} from "./logic/useUrbanGreeningProjects";
import {
  UrbanGreeningProject,
  ProjectType,
  ProjectStatus,
} from "@/core/api/urban-greening-project-api";
import GreeningProjectForm from "./components/GreeningProjectForm";
import GreeningProjectDetails from "./components/GreeningProjectDetails";
import SaplingRequestForm from "./components/SaplingRequestForm";
import SpeciesManagement from "./components/SpeciesManagement";
import { useSaplingRequests, useSaplingRequestMutations } from "./logic/useSaplingManagement";
import { SaplingRequest } from "@/core/api/sapling-requests-api";

const PROJECT_TYPE_CONFIG: Record<ProjectType, { label: string; icon: React.ReactNode; color: string }> = {
  replacement: { label: "Replacement", icon: <TreePine className="w-4 h-4" />, color: "bg-amber-100 text-amber-800" },
  new_greening: { label: "New Greening", icon: <Leaf className="w-4 h-4" />, color: "bg-green-100 text-green-800" },
  reforestation: { label: "Reforestation", icon: <TreePine className="w-4 h-4" />, color: "bg-emerald-100 text-emerald-800" },
  beautification: { label: "Beautification", icon: <Flower2 className="w-4 h-4" />, color: "bg-pink-100 text-pink-800" },
  other: { label: "Other", icon: <Leaf className="w-4 h-4" />, color: "bg-gray-100 text-gray-800" },
};

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string }> = {
  planning: { label: "Planning", color: "bg-gray-100 text-gray-800" },
  procurement: { label: "Procurement", color: "bg-blue-100 text-blue-800" },
  ready: { label: "Ready", color: "bg-indigo-100 text-indigo-800" },
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
  completed: { label: "Completed", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-500" },
};

const GreeningProjectsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("projects");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ProjectType | "all">("all");
  const [yearFilter, setYearFilter] = useState<number | undefined>(new Date().getFullYear());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedProject, setSelectedProject] = useState<UrbanGreeningProject | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [projectDeleteConfirmOpen, setProjectDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<UrbanGreeningProject | null>(null);

  // Sapling Request state
  const [srSearch, setSrSearch] = useState("");
  const [srYearFilter, setSrYearFilter] = useState<number | undefined>(new Date().getFullYear());
  const [srOpen, setSrOpen] = useState(false);
  const [srMode, setSrMode] = useState<"add" | "edit">("add");
  const [srSelected, setSrSelected] = useState<SaplingRequest | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SaplingRequest | null>(null);

  // Species state
  const [speciesSearch, setSpeciesSearch] = useState("");

  // Generate year options (2020 to current year)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let year = currentYear; year >= 2020; year--) {
      years.push(year);
    }
    return years;
  }, []);

  // Check URL params for action
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "add") {
      setFormMode("add");
      setSelectedProject(null);
      setIsFormOpen(true);
    }
  }, []);

  const { data: projects = [], isLoading, refetch } = useUrbanGreeningProjects({
    status: statusFilter === "all" ? undefined : statusFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
    search: searchTerm || undefined,
    year: yearFilter,
  });

  const { data: stats } = useProjectStats();
  const { deleteMutation } = useUrbanGreeningProjectMutations();

  // Sapling Requests hooks
  const { saplingRequests, refetchSaplingRequests } = useSaplingRequests(srYearFilter);
  const { createSapling, updateSapling, deleteSapling } = useSaplingRequestMutations();

  // Sapling Requests filtering
  const srFiltered = useMemo(() => {
    const q = srSearch.toLowerCase();
    return saplingRequests.filter((r) =>
      !srSearch ||
      r.requester_name.toLowerCase().includes(q) ||
      r.address.toLowerCase().includes(q)
    );
  }, [saplingRequests, srSearch]);

  // Delete handlers
  const handleDeleteProject = (project: UrbanGreeningProject) => {
    setProjectToDelete(project);
    setProjectDeleteConfirmOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      await deleteMutation.mutateAsync(projectToDelete.id);
      setProjectDeleteConfirmOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const columns: ColumnDef<UrbanGreeningProject>[] = useMemo(
    () => [
      {
        accessorKey: "project_code",
        header: "Reference No.",
        cell: ({ getValue }) => (
          <span className="font-mono text-sm font-medium">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: "project_type",
        header: "Type",
        cell: ({ getValue }) => {
          const type = getValue() as ProjectType;
          const config = PROJECT_TYPE_CONFIG[type];
          return (
            <Badge className={config.color}>
              {config.icon}
              <span className="ml-1">{config.label}</span>
            </Badge>
          );
        },
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[150px]">
              {row.original.barangay || row.original.location}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "total_plants",
        header: "Plants",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Sprout className="w-4 h-4 text-green-600" />
            <span>{row.original.total_plants}</span>
            {row.original.surviving_plants !== undefined && (
              <span className="text-xs text-gray-500">
                ({row.original.surviving_plants} alive)
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() as ProjectStatus;
          const config = STATUS_CONFIG[status];
          return <Badge className={config.color}>{config.label}</Badge>;
        },
      },
      {
        accessorKey: "planting_date",
        header: "Planting Date",
        cell: ({ row }) => {
          const date = (row.original as any).planting_date;
          return date ? new Date(date).toLocaleDateString() : "-";
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProject(row.original);
                setShowDetails(true);
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteProject(row.original);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const srColumns: ColumnDef<SaplingRequest>[] = useMemo(
    () => [
      { accessorKey: "date_received", header: "Date Received" },
      { accessorKey: "requester_name", header: "Requester" },
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

  const handleAddProject = (type?: ProjectType) => {
    setFormMode("add");
    setSelectedProject(null);
    setIsFormOpen(true);
  };

  const handleEditProject = (project: UrbanGreeningProject) => {
    setFormMode("edit");
    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const handleRowClick = (row: any) => {
    setSelectedProject(row.original);
    setShowDetails(true);
  };

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

  return (
    <>
    <div className="flex flex-col h-full bg-[#F9FBFC]">
        {/* Header */}
        <div className="bg-white px-6 py-4 ">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Urban Greening Projects</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage planting projects, saplings, and urban greening initiatives
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isLoading}
                className="rounded-lg h-9 w-9"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              {activeTab === "projects" && (
                <Button
                  onClick={() => handleAddProject()}
                  className="bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              )}
              {activeTab === "sapling-requests" && (
                <Button
                  onClick={handleAddRequest}
                  className="bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Request
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 flex-shrink-0">
          <div className="px-6">
            <nav className="flex gap-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("projects")}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "projects"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <TreePine className="w-4 h-4 inline mr-2" />
                Greening Projects
              </button>
              <button
                onClick={() => setActiveTab("sapling-requests")}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "sapling-requests"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Sprout className="w-4 h-4 inline mr-2" />
                Sapling Requests
              </button>
              <button
                onClick={() => setActiveTab("species")}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "species"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Leaf className="w-4 h-4 inline mr-2" />
                Species
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 bg-[#F9FBFC] overflow-y-auto">
          {/* Projects Tab */}
          {activeTab === "projects" && (
            <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Leaf className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats?.total_projects || 0}</div>
                    <div className="text-xs text-gray-500">Total Projects</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Play className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats?.active_projects || 0}</div>
                    <div className="text-xs text-gray-500">Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats?.completed_projects || 0}</div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Sprout className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats?.total_plants_planned || 0}</div>
                    <div className="text-xs text-gray-500">Plants Planned</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <TreePine className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats?.total_plants_planted || 0}</div>
                    <div className="text-xs text-gray-500">Planted</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {((stats?.survival_rate || 0) * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">Survival Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Table */}
          <Card className="border-0">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64 rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as ProjectType | "all")}
                    className="h-9 px-3 rounded-lg border border-gray-200 text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="replacement">Replacement</option>
                    <option value="new_greening">New Greening</option>
                    <option value="reforestation">Reforestation</option>
                    <option value="beautification">Beautification</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | "all")}
                    className="h-9 px-3 rounded-lg border border-gray-200 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="planning">Planning</option>
                    <option value="procurement">Procurement</option>
                    <option value="ready">Ready</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <select
                    value={yearFilter ?? "all"}
                    onChange={(e) => setYearFilter(e.target.value === "all" ? undefined : parseInt(e.target.value))}
                    className="h-9 px-3 rounded-lg border border-gray-200 text-sm"
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                    <option value="all">All Years</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={projects}
                columns={columns}
                onRowClick={handleRowClick}
              />
            </CardContent>
          </Card>
            </div>
          )}

          {/* Sapling Requests Tab */}
          {activeTab === "sapling-requests" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="min-w-0 flex flex-col transition-all duration-300 lg:col-span-2">
                <Card className="border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Sprout className="w-5 h-5" /> Sapling Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
                    <DataTable
                      data={srFiltered}
                      columns={srColumns}
                      onRowClick={(row) => setSrSelected(row.original as SaplingRequest)}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col min-h-0 transition-all duration-300 lg:col-span-1">
                <Card className={`flex-1 flex flex-col min-h-0 ${srSelected ? 'bg-gray-50' : 'bg-white'}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
          )}

          {/* Species Tab */}
          {activeTab === "species" && (
            <SpeciesManagement />
          )}
        </div>
    </div>

    {/* Project Form Dialog */}
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl rounded-2xl border-none p-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="bg-[#0033a0] p-6 m-0 border-none shrink-0">
            <DialogTitle className="text-xl font-bold text-white">
              {formMode === "add" ? "New Urban Greening Project" : "Edit Project"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 overflow-y-auto">
            <GreeningProjectForm
              mode={formMode}
              initialData={selectedProject}
              onClose={() => setIsFormOpen(false)}
              onSuccess={() => {
                setIsFormOpen(false);
                refetch();
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Project Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl rounded-2xl border-none p-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="bg-[#0033a0] p-6 m-0 border-none shrink-0">
            <DialogTitle className="text-xl font-bold text-white">Project Details</DialogTitle>
          </DialogHeader>
          <div className="p-6 overflow-y-auto">
            {selectedProject && (
              <GreeningProjectDetails
                project={selectedProject}
                onClose={() => setShowDetails(false)}
                onEdit={() => {
                  setShowDetails(false);
                  handleEditProject(selectedProject);
                }}
                onRefresh={() => refetch()}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Sapling Request Dialog */}
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

      {/* Project Delete Confirmation Dialog */}
      <AlertDialog open={projectDeleteConfirmOpen} onOpenChange={setProjectDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete project{" "}
              <strong>{projectToDelete?.project_code}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProject}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
    </>
  );
};

export default GreeningProjectsPage;

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
  PieChart as PieChartIcon,
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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useContextMenuAction } from "@/core/hooks/useContextMenuAction";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";
import { PERMISSIONS } from "@/core/utils/permissions";

const PROJECT_TYPE_CONFIG: Record<ProjectType, { label: string; icon: React.ReactNode; color: string }> = {
  replacement: { label: "Replacement", icon: <TreePine className="w-4 h-4" />, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200" },
  new_greening: { label: "New Greening", icon: <Leaf className="w-4 h-4" />, color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" },
  reforestation: { label: "Reforestation", icon: <TreePine className="w-4 h-4" />, color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200" },
  beautification: { label: "Beautification", icon: <Flower2 className="w-4 h-4" />, color: "bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200" },
  other: { label: "Other", icon: <Leaf className="w-4 h-4" />, color: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200" },
};

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string }> = {
  planning: { label: "Planning", color: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200" },
  procurement: { label: "Procurement", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200" },
  ready: { label: "Ready", color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200" },
  in_progress: { label: "In Progress", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200" },
  completed: { label: "Completed", color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" },
  cancelled: { label: "Cancelled", color: "bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-300" },
};

const GreeningProjectsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ProjectType | "all">("all");
  const [yearFilter, setYearFilter] = useState<number | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedProject, setSelectedProject] = useState<UrbanGreeningProject | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [projectDeleteConfirmOpen, setProjectDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<UrbanGreeningProject | null>(null);

  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canCreateProject = hasPermission(PERMISSIONS.URBAN_PROJECT.CREATE);
  const canUpdateProject = hasPermission(PERMISSIONS.URBAN_PROJECT.UPDATE);
  const canDeleteProject = hasPermission(PERMISSIONS.URBAN_PROJECT.DELETE);

  // Check URL params for action
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "add" && canCreateProject) {
      setFormMode("add");
      setSelectedProject(null);
      setIsFormOpen(true);
    }
  }, [canCreateProject]);

  // Listen for context menu "add-project" action
  useContextMenuAction("add-project", () => {
    if (!canCreateProject) return;
    setFormMode("add");
    setSelectedProject(null);
    setIsFormOpen(true);
  });

  const { data: projects = [], isLoading, refetch } = useUrbanGreeningProjects({
    status: statusFilter === "all" ? undefined : statusFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
    search: searchTerm || undefined,
    year: yearFilter,
  });

  const { data: apiStats } = useProjectStats();
  const { deleteMutation } = useUrbanGreeningProjectMutations();

  React.useEffect(() => {
    if (isFormOpen && formMode === "add" && !canCreateProject) {
      setIsFormOpen(false);
    }
    if (isFormOpen && formMode === "edit" && !canUpdateProject) {
      setIsFormOpen(false);
    }
  }, [canCreateProject, canUpdateProject, formMode, isFormOpen]);

  // Extract available years from projects based on date_received
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    projects.forEach(project => {
      if ((project as any).date_received) {
        const year = new Date((project as any).date_received).getFullYear();
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [projects]);

  // Calculate stats from the filtered projects
  const filteredStats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'in_progress' || p.status === 'planning' || p.status === 'procurement').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    
    // Sum total plants
    const totalPlants = projects.reduce((acc, p) => acc + (p.total_plants || 0), 0);
    
    // Plant Type Breakdown
    const typeMap: Record<string, number> = {};
    projects.forEach(p => {
      // Assuming p.plants contains the breakdown. If not, we might need to rely on apiStats or other data.
      // Based on API types, p.plants is ProjectPlant[]
      if (Array.isArray(p.plants)) {
          p.plants.forEach(plant => {
              const type = plant.plant_type || "Other";
              typeMap[type] = (typeMap[type] || 0) + (Number(plant.quantity) || 0);
          });
      }
    });

    const pieData = Object.entries(typeMap).map(([name, value]) => ({
      name: name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      value
    })).sort((a, b) => b.value - a.value);

    return { total, active, completed, totalPlants, pieData };
  }, [projects]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ff7c43", "#665191", "#a05195", "#d45087"];

  // Delete handlers
  const handleDeleteProject = (project: UrbanGreeningProject) => {
    if (!canDeleteProject) return;
    setProjectToDelete(project);
    setProjectDeleteConfirmOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!canDeleteProject) return;
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
        accessorKey: "date_received",
        header: "Date Received",
        cell: ({ row }) => {
          const date = (row.original as any).date_received;
          return date ? new Date(date).toLocaleDateString() : "-";
        },
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
        accessorKey: "barangay",
        header: "Barangay",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[150px]">
              {row.original.barangay || "-"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "location",
        header: "Address",
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px] block">
            {(getValue() as string) || "-"}
          </span>
        ),
      },
      {
        accessorKey: "project_lead",
        header: "Lead",
        cell: ({ getValue }) => (
          <span className="text-sm">{(getValue() as string) || "-"}</span>
        ),
      },
      {
        accessorKey: "organization",
        header: "Organization",
        cell: ({ getValue }) => (
          <span className="text-sm">{(getValue() as string) || "-"}</span>
        ),
      },
      {
        accessorKey: "total_plants",
        header: "Plants",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Sprout className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span>{row.original.total_plants}</span>
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
            {canDeleteProject && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(row.original);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [canDeleteProject]
  );

  const handleAddProject = (type?: ProjectType) => {
    if (!canCreateProject) return;
    setFormMode("add");
    setSelectedProject(null);
    setIsFormOpen(true);
  };

  const handleEditProject = (project: UrbanGreeningProject) => {
    if (!canUpdateProject) return;
    setFormMode("edit");
    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const handleRowClick = (row: any) => {
    setSelectedProject(row.original);
    setShowDetails(true);
  };

  return (
    <>
    <div className="flex flex-col h-full page-bg">
        {/* Header */}
        <div className="page-header-bg sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Urban Greening Projects</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage planting projects, saplings, and urban greening initiatives
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
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 page-bg">
            <div className="flex flex-col h-full space-y-6">
          {/* Stats Cards and Charts */}
          <Card className="mb-6 shrink-0 overflow-hidden">
             <div className="flex flex-col lg:flex-row">
                {/* Compact Pie Chart Visual Code */}
                <div className="w-full lg:w-[200px] border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30 p-4 flex flex-col justify-center items-center">
                    <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 text-center">Plant Distribution</h3>
                    <div className="h-[120px] w-full relative">
                      {filteredStats.pieData.length > 0 ? (
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                               <Pie
                                  data={filteredStats.pieData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={30}
                                  outerRadius={50}
                                  paddingAngle={2}
                                  dataKey="value"
                               >
                                  {filteredStats.pieData.map((entry, index) => (
                                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                               </Pie>
                               <Tooltip 
                                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                  formatter={(value: number, name: string) => [value.toLocaleString(), name]} 
                               />
                            </PieChart>
                         </ResponsiveContainer>
                      ) : (
                         <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                            No data
                         </div>
                      )}
                    </div>
                </div>

                {/* Metrics & Legend Section */}
                <div className="flex-1 p-6 flex flex-col gap-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
                            <Leaf className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-2xl font-bold truncate">{filteredStats.total}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">Total Projects</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg shrink-0">
                            <Play className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-2xl font-bold truncate">{filteredStats.active}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">Active</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-2xl font-bold truncate">{filteredStats.completed}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">Completed</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg shrink-0">
                            <Sprout className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-2xl font-bold truncate">{filteredStats.totalPlants.toLocaleString()}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">Total Plants</div>
                          </div>
                        </div>
                    </div>

                    {/* Integrated Legend */}
                    {filteredStats.pieData.length > 0 && (
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                          <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Plant Distribution</div>
                          <div className="flex flex-wrap gap-x-6 gap-y-2">
                              {filteredStats.pieData.map((entry, index) => (
                                  <div key={index} className="flex items-center gap-2 text-xs">
                                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                      <span className="text-gray-600 dark:text-gray-400 font-medium truncate max-w-[150px]" title={entry.name}>{entry.name}</span>
                                      <span className="text-gray-400 dark:text-gray-500">({entry.value.toLocaleString()})</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                    )}
                </div>
             </div>
          </Card>

          {/* Filters and Table */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="pb-4 p-4 shrink-0">
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
                    className="h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
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
                    className="h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
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
                    className="h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
                  >
                    <option value="all">All Years</option>
                    {availableYears.length > 0 ? (
                      availableYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))
                    ) : (
                      <option value={new Date().getFullYear()}>
                        {new Date().getFullYear()}
                      </option>
                    )}
                  </select>
                                  {canCreateProject && (
                                    <Button
                                      onClick={() => handleAddProject()}
                                      className="bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg"
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      New Project
                                    </Button>
                                  )}
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <DataTable
                data={projects}
                columns={columns}
                onRowClick={handleRowClick}
              />
            </div>
          </div>
            </div>
        </div>
    </div>

    {/* Project Form Dialog */}
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl overflow-visible">
          <DialogHeader>
            <DialogTitle>
              {formMode === "add" ? "New Urban Greening Project" : "Edit Project"}
            </DialogTitle>
          </DialogHeader>
          <div>
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
          <DialogHeader className="bg-[#0033a0] dark:bg-gray-800 p-6 m-0 border-none shrink-0">
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
                canEdit={canUpdateProject}
              />
            )}
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


    </>
  );
};

export default GreeningProjectsPage;

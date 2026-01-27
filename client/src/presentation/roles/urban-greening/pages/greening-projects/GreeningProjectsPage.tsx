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

  const { data: apiStats } = useProjectStats();
  const { deleteMutation } = useUrbanGreeningProjectMutations();

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

  return (
    <>
    <div className="flex flex-col h-full bg-[#F9FBFC]">
        {/* Header */}
        <div className="bg-white px-6 py-4 sticky top-0 z-10 shrink-0">
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
                <Button
                  onClick={() => handleAddProject()}
                  className="bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
            <div className="flex flex-col h-full space-y-6">
          {/* Stats Cards and Charts */}
          <Card className="border-0 shadow-sm mb-6 shrink-0 overflow-hidden">
             <div className="flex flex-col lg:flex-row">
                {/* Compact Pie Chart Visual Code */}
                <div className="w-full lg:w-[200px] border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50/30 p-4 flex flex-col justify-center items-center">
                    <h3 className="text-xs font-semibold text-gray-600 mb-2 text-center">Plant Distribution</h3>
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
                         <div className="flex h-full items-center justify-center text-gray-400 text-xs">
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
                          <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                            <Leaf className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-2xl font-bold truncate">{filteredStats.total}</div>
                            <div className="text-xs text-gray-500 truncate">Total Projects</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-100 rounded-lg shrink-0">
                            <Play className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-2xl font-bold truncate">{filteredStats.active}</div>
                            <div className="text-xs text-gray-500 truncate">Active</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-2xl font-bold truncate">{filteredStats.completed}</div>
                            <div className="text-xs text-gray-500 truncate">Completed</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
                            <Sprout className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-2xl font-bold truncate">{filteredStats.totalPlants.toLocaleString()}</div>
                            <div className="text-xs text-gray-500 truncate">Total Plants</div>
                          </div>
                        </div>
                    </div>

                    {/* Integrated Legend */}
                    {filteredStats.pieData.length > 0 && (
                      <div className="border-t border-gray-100 pt-4">
                          <div className="text-[11px] font-medium text-gray-500 mb-2 uppercase tracking-wider">Plant Distribution</div>
                          <div className="flex flex-wrap gap-x-6 gap-y-2">
                              {filteredStats.pieData.map((entry, index) => (
                                  <div key={index} className="flex items-center gap-2 text-xs">
                                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                      <span className="text-gray-600 font-medium truncate max-w-[150px]" title={entry.name}>{entry.name}</span>
                                      <span className="text-gray-400">({entry.value.toLocaleString()})</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                    )}
                </div>
             </div>
          </Card>

          {/* Filters and Table */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-white rounded-lg border border-gray-100 shadow-sm">
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

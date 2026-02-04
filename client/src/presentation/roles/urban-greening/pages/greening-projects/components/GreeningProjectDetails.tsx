// client/src/presentation/roles/urban-greening/pages/greening-projects/components/GreeningProjectDetails.tsx
/**
 * Project Details component with workflow actions
 * - View project info, linked trees, plants
 * - Complete project workflow
 * - Transfer plants to main inventory
 * - Map view for location
 */

import React, { useState } from "react";
import { Card, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Separator } from "@/presentation/components/shared/ui/separator";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/presentation/components/shared/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/presentation/components/shared/ui/dialog";
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
import {
  TreePine,
  Leaf,
  Flower2,
  Sprout,
  MapPin,
  Calendar,
  User,
  Building2,
  Play,
  CheckCircle2,
  Edit,
  Clock,
  Link as LinkIcon,
  ArrowRightCircle,
  Loader2,
  Package,
  XCircle,
  Map,
} from "lucide-react";
import {
  UrbanGreeningProject,
  ProjectType,
  ProjectStatus,
  PlantType,
} from "@/core/api/urban-greening-project-api";
import { useUrbanGreeningProjectMutations } from "../logic/useUrbanGreeningProjects";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Fix leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Default center - San Fernando, Pampanga
const DEFAULT_CENTER: [number, number] = [15.0287, 120.6880];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const PROJECT_TYPE_CONFIG: Record<ProjectType, { label: string; icon: React.ReactNode; color: string }> = {
  replacement: { label: "Replacement", icon: <TreePine className="w-4 h-4" />, color: "bg-amber-100 text-amber-800" },
  new_greening: { label: "New Greening", icon: <Leaf className="w-4 h-4" />, color: "bg-green-100 text-green-800" },
  reforestation: { label: "Reforestation", icon: <TreePine className="w-4 h-4" />, color: "bg-emerald-100 text-emerald-800" },
  beautification: { label: "Beautification", icon: <Flower2 className="w-4 h-4" />, color: "bg-pink-100 text-pink-800" },
  other: { label: "Other", icon: <Leaf className="w-4 h-4" />, color: "bg-gray-100 text-gray-800" },
};

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; icon: React.ReactNode }> = {
  planning: { label: "Planning", color: "bg-gray-100 text-gray-800", icon: <Clock className="w-4 h-4" /> },
  procurement: { label: "Procurement", color: "bg-blue-100 text-blue-800", icon: <Package className="w-4 h-4" /> },
  ready: { label: "Ready", color: "bg-indigo-100 text-indigo-800", icon: <CheckCircle2 className="w-4 h-4" /> },
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-800", icon: <Play className="w-4 h-4" /> },
  completed: { label: "Completed", color: "bg-green-100 text-green-800", icon: <CheckCircle2 className="w-4 h-4" /> },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-500", icon: <XCircle className="w-4 h-4" /> },
};

const PLANT_TYPE_ICONS: Record<PlantType, React.ReactNode> = {
  tree: <TreePine className="w-4 h-4" />,
  ornamental: <Flower2 className="w-4 h-4" />,
  ornamental_private: <Flower2 className="w-4 h-4" />,
  seeds: <Sprout className="w-4 h-4" />,
  seeds_private: <Sprout className="w-4 h-4" />,
  other: <Leaf className="w-4 h-4" />,
};

interface GreeningProjectDetailsProps {
  project: UrbanGreeningProject;
  onClose: () => void;
  onEdit: () => void;
  onRefresh: () => void;
}

const GreeningProjectDetails: React.FC<GreeningProjectDetailsProps> = ({
  project,
  onClose,
  onEdit,
  onRefresh,
}) => {
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);

  const [completeDate, setCompleteDate] = useState(new Date().toISOString().split('T')[0]);
  const [completionNotes, setCompletionNotes] = useState("");

  const { completeMutation, transferMutation } =
    useUrbanGreeningProjectMutations();

  const handleCompleteProject = async () => {
    try {
      await completeMutation.mutateAsync({
        id: project.id,
        data: {
          notes: completionNotes,
        },
      });
      toast.success("Project completed successfully!");
      setShowCompleteDialog(false);
      onRefresh();
    } catch (error) {
      toast.error("Failed to complete project");
    }
  };

  const handleTransferToInventory = async () => {
    try {
      const plantingIds = project.plants?.map((_, idx) => String(idx)) || [];
      await transferMutation.mutateAsync({
        projectId: project.id,
        plantingIds,
      });
      toast.success("Plants transferred to inventory successfully!");
      setShowTransferDialog(false);
      onRefresh();
    } catch (error) {
      toast.error("Failed to transfer plants to inventory");
    }
  };

  const typeConfig = PROJECT_TYPE_CONFIG[project.project_type];
  const statusConfig = STATUS_CONFIG[project.status];

  const canComplete = project.status === "in_progress";
  const canTransfer = project.status === "completed";

  // Calculate totals
  const totalPlants = project.plants?.reduce((sum, p) => sum + p.quantity, 0) || 0;

  // Get map position
  const hasCoordinates = project.latitude && project.longitude;
  const mapCenter: [number, number] = hasCoordinates 
    ? [project.latitude!, project.longitude!] 
    : DEFAULT_CENTER;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className={typeConfig.color}>
              {typeConfig.icon}
              <span className="ml-1">{typeConfig.label}</span>
            </Badge>
            <Badge className={statusConfig.color}>
              {statusConfig.icon}
              <span className="ml-1">{statusConfig.label}</span>
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{project.project_code}</h2>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </div>

      {project.description && (
        <p className="text-sm text-gray-600">{project.description}</p>
      )}

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="plants">Plants</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4 mt-4">
          {/* Project Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {project.barangay && (
              <Card className="border-0 bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs">Barangay</span>
                  </div>
                  <div className="font-medium text-sm">{project.barangay}</div>
                </CardContent>
              </Card>
            )}
            <Card className="border-0 bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs">Location/Address</span>
                </div>
                <div className="font-medium text-sm">{project.location || "-"}</div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">Date Received</span>
                </div>
                <div className="font-medium text-sm">
                  {(project as any).date_received
                    ? new Date((project as any).date_received).toLocaleDateString()
                    : "Not set"}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">Date Sapling Received</span>
                </div>
                <div className="font-medium text-sm">
                  {(project as any).date_sapling_received
                    ? new Date((project as any).date_sapling_received).toLocaleDateString()
                    : "Not set"}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">Planting Date</span>
                </div>
                <div className="font-medium text-sm">
                  {(project as any).planting_date
                    ? new Date((project as any).planting_date).toLocaleDateString()
                    : "Not set"}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Sprout className="w-4 h-4" />
                  <span className="text-xs">Plants</span>
                </div>
                <div className="font-medium text-sm">{totalPlants} plants</div>
              </CardContent>
            </Card>
            {project.contact_number && (
              <Card className="border-0 bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <User className="w-4 h-4" />
                    <span className="text-xs">Contact</span>
                  </div>
                  <div className="font-medium text-sm">{project.contact_number}</div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Plant Types Breakdown */}
          {project.plants && project.plants.length > 0 && (
            <Card className="border-0 bg-white shadow-sm ring-1 ring-gray-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-4">Plant Types Breakdown</h4>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="h-64 w-full md:w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.values(
                            project.plants.reduce((acc: any, plant) => {
                              const type = plant.plant_type;
                              if (!acc[type]) {
                                acc[type] = { name: type, value: 0 };
                              }
                              acc[type].value += plant.quantity;
                              return acc;
                            }, {})
                          )}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {project.plants.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2 space-y-2 text-sm">
                   {Object.entries(
                      project.plants.reduce((acc: Record<string, number>, plant) => {
                        acc[plant.plant_type] = (acc[plant.plant_type] || 0) + plant.quantity;
                        return acc;
                      }, {})
                    ).map(([type, count], idx) => (
                      <div key={type} className="flex justify-between items-center p-2 rounded bg-gray-50">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          />
                          <span className="capitalize text-gray-700">{type.replace('_', ' ')}</span>
                        </div>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team Info */}
          {(project.project_lead || project.organization) && (
            <div className="flex gap-6">
              {project.project_lead && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Lead:</span>
                  <span className="font-medium">{project.project_lead}</span>
                </div>
              )}
              {project.organization && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Org:</span>
                  <span className="font-medium">{project.organization}</span>
                </div>
              )}
            </div>
          )}

          {/* Linked Trees (for replacement projects) */}
          {project.project_type === "replacement" && project.linked_cut_tree_ids && project.linked_cut_tree_ids.length > 0 && (
            <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <LinkIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-medium text-amber-800 dark:text-amber-300">Replacement for Cut Trees</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.linked_cut_tree_ids.map((treeId) => (
                    <Badge key={treeId} variant="outline" className="border-amber-300 dark:border-amber-700">
                      <TreePine className="w-3 h-3 mr-1" />
                      {treeId}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Plants Tab */}
        <TabsContent value="plants" className="space-y-4 mt-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-green-600" />
            Plants ({project.plants?.length || 0} types, {totalPlants} total)
          </h3>
          <div className="space-y-2">
            {project.plants?.map((plant, index) => (
              <Card key={index} className="border">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        {PLANT_TYPE_ICONS[plant.plant_type]}
                      </div>
                      <div>
                        <div className="font-medium">
                          {plant.common_name}
                        </div>
                        {plant.species && (
                          <div className="text-xs text-gray-500 italic">
                            {plant.species}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 capitalize">
                          {plant.plant_type}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{plant.quantity}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Map View Tab */}
        <TabsContent value="map" className="mt-4">
          <div className="rounded-lg overflow-hidden border">
            <div className="h-80">
              <MapContainer
                center={mapCenter}
                zoom={hasCoordinates ? 16 : 12}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {hasCoordinates && (
                  <Marker position={[project.latitude!, project.longitude!]} />
                )}
              </MapContainer>
            </div>
            {hasCoordinates ? (
              <div className="text-xs text-center text-gray-500 py-2 bg-gray-50 border-t">
                <MapPin className="w-3 h-3 inline mr-1" />
                {project.latitude!.toFixed(6)}, {project.longitude!.toFixed(6)}
              </div>
            ) : (
              <div className="text-xs text-center text-gray-500 py-2 bg-yellow-50 border-t">
                <Map className="w-3 h-3 inline mr-1" />
                No coordinates set for this project
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Separator />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {canComplete && (
          <Button
            onClick={() => setShowCompleteDialog(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Complete Project
          </Button>
        )}
        {canTransfer && (
          <Button
            onClick={() => setShowTransferDialog(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <ArrowRightCircle className="w-4 h-4 mr-2" />
            Transfer to Inventory
          </Button>
        )}
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Complete Project Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Complete Project
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Completion Date</Label>
              <Input
                type="date"
                value={completeDate}
                onChange={(e) => setCompleteDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Completion Notes</Label>
              <Textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Summary of project completion, any issues encountered..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCompleteProject}
              className="bg-green-600 hover:bg-green-700"
              disabled={completeMutation.isPending}
            >
              {completeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Complete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer to Inventory Dialog */}
      <AlertDialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ArrowRightCircle className="w-5 h-5 text-emerald-600" />
              Transfer Plants to Inventory
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will add all surviving trees from this project to the main Tree Inventory.
              Non-tree plants will be recorded separately.
              <div className="mt-3 p-3 bg-emerald-50 rounded-lg">
                <div className="font-medium text-emerald-800">
                  {project.plants?.filter((p) => p.plant_type === "tree").reduce((sum, p) => sum + p.quantity, 0) || 0} trees
                </div>
                <div className="text-sm text-emerald-600">
                  will be added to the inventory
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTransferToInventory}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={transferMutation.isPending}
            >
              {transferMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Transfer to Inventory
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GreeningProjectDetails;

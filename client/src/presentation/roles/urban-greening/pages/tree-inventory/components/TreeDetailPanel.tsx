// client/src/presentation/roles/urban-greening/pages/tree-inventory/components/TreeDetailPanel.tsx
/**
 * TreeDetailPanel Component - Display tree details with monitoring history
 */

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/presentation/components/shared/ui/dialog";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Label } from "@/presentation/components/shared/ui/label";
import {
  X,
  Edit,
  Trash2,
  Leaf,
  AlertTriangle,
  MapPin,
  Calendar,
  Ruler,
  QrCode,
  Plus,
  ClipboardCheck,
  Clock,
  Image as ImageIcon,
  User,
  ZoomIn,
} from "lucide-react";
import { TreeInventory, MonitoringLogCreate, TreePhotoMetadata } from "@/core/api/tree-inventory-api";
import { useTreeMonitoringLogs, useMonitoringMutations } from "../logic/useTreeInventory";

interface TreeDetailPanelProps {
  tree: TreeInventory;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TreeDetailPanel: React.FC<TreeDetailPanelProps> = ({
  tree,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [logForm, setLogForm] = useState<{
    health_status: "healthy" | "needs_attention" | "diseased" | "dead";
    notes: string;
    recommendations: string;
  }>({
    health_status: tree.health as "healthy" | "needs_attention" | "diseased" | "dead",
    notes: "",
    recommendations: "",
  });

  // Fetch monitoring logs for this tree
  const { data: monitoringLogs = [], isLoading: logsLoading } = useTreeMonitoringLogs(tree.id);
  const { createMutation } = useMonitoringMutations();

  const statusColors: Record<string, string> = {
    alive: "bg-green-100 text-green-800 border-green-200",
    cut: "bg-red-100 text-red-800 border-red-200",
    dead: "bg-gray-100 text-gray-800 border-gray-200",
    replaced: "bg-blue-100 text-blue-800 border-blue-200",
  };

  const healthColors: Record<string, string> = {
    healthy: "bg-green-100 text-green-800",
    needs_attention: "bg-yellow-100 text-yellow-800",
    diseased: "bg-orange-100 text-orange-800",
    dead: "bg-gray-100 text-gray-800",
  };

  const handleAddLog = async () => {
    const payload: MonitoringLogCreate = {
      tree_id: tree.id,
      health_status: logForm.health_status as "healthy" | "needs_attention" | "diseased" | "dead",
      notes: logForm.notes || undefined,
      recommendations: logForm.recommendations || undefined,
    };
    await createMutation.mutateAsync(payload);
    setIsLogDialogOpen(false);
    // Reset with a valid health status, defaulting to healthy if tree.health is unknown
    const validHealth = tree.health === "unknown" ? "healthy" : tree.health;
    setLogForm({ health_status: validHealth as "healthy" | "needs_attention" | "diseased" | "dead", notes: "", recommendations: "" });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Normalize photos to consistent format
  const normalizedPhotos = (tree.photos || []).map((photo) => {
    if (typeof photo === "string") {
      return {
        url: photo,
        filename: photo.split("/").pop() || "image.jpg",
        size: 0,
        uploaded_at: "",
        uploaded_by_email: undefined,
      };
    }
    return photo as TreePhotoMetadata;
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Tree Details</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto space-y-6">
        {/* Tree Code & Status */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-lg text-blue-600 font-semibold">{tree.tree_code}</span>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={statusColors[tree.status]}>
                {tree.status.toUpperCase()}
              </Badge>
              <Badge className={healthColors[tree.health]}>
                {tree.health === "healthy" && <Leaf className="w-3 h-3 mr-1" />}
                {tree.health === "needs_attention" && <AlertTriangle className="w-3 h-3 mr-1" />}
                {tree.health.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Species */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
          <div className="text-sm text-green-700">Species</div>
          <div className="font-semibold text-green-900">{tree.species}</div>
          {tree.common_name && (
            <div className="text-sm text-green-600">{tree.common_name}</div>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4" />
            Location
          </div>
          <div className="pl-6 space-y-1 text-sm">
            {tree.barangay && <div><span className="text-gray-500">Barangay:</span> {tree.barangay}</div>}
            {tree.address && <div><span className="text-gray-500">Address:</span> {tree.address}</div>}
            {tree.latitude && tree.longitude && (
              <div className="text-xs text-gray-500">
                {tree.latitude.toFixed(6)}, {tree.longitude.toFixed(6)}
              </div>
            )}
          </div>
        </div>

        {/* Measurements */}
        {(tree.height_meters || tree.diameter_cm || tree.age_years) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Ruler className="w-4 h-4" />
              Measurements
            </div>
            <div className="grid grid-cols-3 gap-2 pl-6">
              {tree.height_meters && (
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold">{tree.height_meters}m</div>
                  <div className="text-xs text-gray-500">Height</div>
                </div>
              )}
              {tree.diameter_cm && (
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold">{tree.diameter_cm}cm</div>
                  <div className="text-xs text-gray-500">Diameter</div>
                </div>
              )}
              {tree.age_years && (
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold">{tree.age_years}yr</div>
                  <div className="text-xs text-gray-500">Age</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4" />
            Timeline
          </div>
          <div className="pl-6 space-y-1 text-sm">
            {tree.planted_date && (
              <div><span className="text-gray-500">Planted:</span> {formatDate(tree.planted_date)}</div>
            )}
            {tree.cutting_date && (
              <div className="text-red-600"><span className="text-gray-500">Cut:</span> {formatDate(tree.cutting_date)}</div>
            )}
            <div className="text-xs text-gray-400">Last updated: {formatDate(tree.updated_at)}</div>
          </div>
        </div>

        {/* Notes */}
        {tree.notes && (
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <div className="text-gray-500 text-xs mb-1">Notes</div>
            {tree.notes}
          </div>
        )}

        {/* Photos */}
        {normalizedPhotos.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <ImageIcon className="w-4 h-4" />
              Photos ({normalizedPhotos.length})
            </div>
            <div className="grid grid-cols-2 gap-2">
              {normalizedPhotos.map((photo, index) => (
                <div
                  key={photo.url || index}
                  className="relative group rounded-lg overflow-hidden border border-gray-200 cursor-pointer"
                  onClick={() => setSelectedPhoto(photo.url)}
                >
                  <img
                    src={photo.url}
                    alt={photo.filename || `Photo ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {(photo.uploaded_at || photo.uploaded_by_email) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                      {photo.uploaded_by_email && (
                        <div className="flex items-center gap-1 text-white text-[9px]">
                          <User className="w-2.5 h-2.5" />
                          <span className="truncate">{photo.uploaded_by_email}</span>
                        </div>
                      )}
                      {photo.uploaded_at && (
                        <div className="text-gray-300 text-[9px]">
                          {formatDateTime(photo.uploaded_at)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monitoring History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <ClipboardCheck className="w-4 h-4" />
              Monitoring History
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsLogDialogOpen(true)}
              className="text-xs rounded-lg"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Log
            </Button>
          </div>

          {logsLoading ? (
            <div className="text-sm text-gray-500 text-center py-4">Loading logs...</div>
          ) : monitoringLogs.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4 border rounded-lg bg-gray-50">
              No monitoring logs yet
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {monitoringLogs.map((log) => (
                <div key={log.id} className="p-3 border rounded-lg text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <Badge className={healthColors[log.health_status]} variant="outline">
                      {log.health_status.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(log.inspection_date)}
                    </span>
                  </div>
                  {log.notes && <div className="text-gray-600 mt-1">{log.notes}</div>}
                  {log.recommendations && (
                    <div className="text-blue-600 text-xs mt-1">
                      Recommendation: {log.recommendations}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            className="flex-1 rounded-lg"
            onClick={onEdit}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>

      {/* Add Monitoring Log Dialog */}
      <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
        <DialogContent className="max-w-md p-0 rounded-2xl border-none overflow-hidden">
          <DialogHeader className="bg-[#0033a0] p-4 m-0 border-none">
            <DialogTitle className="text-lg font-bold text-white">
              Add Monitoring Log
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4">
            <div>
              <Label className="text-sm font-medium">Health Status</Label>
              <select
                value={logForm.health_status}
                onChange={(e) => setLogForm((prev) => ({ 
                  ...prev, 
                  health_status: e.target.value as "healthy" | "needs_attention" | "diseased" | "dead"
                }))}
                className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="healthy">Healthy</option>
                <option value="needs_attention">Needs Attention</option>
                <option value="diseased">Diseased</option>
                <option value="dead">Dead</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium">Notes</Label>
              <Textarea
                value={logForm.notes}
                onChange={(e) => setLogForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Observations about the tree..."
                rows={3}
                className="mt-1 rounded-lg"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Recommendations</Label>
              <Textarea
                value={logForm.recommendations}
                onChange={(e) => setLogForm((prev) => ({ ...prev, recommendations: e.target.value }))}
                placeholder="Recommended actions..."
                rows={2}
                className="mt-1 rounded-lg"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-lg"
                onClick={() => setIsLogDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-lg bg-[#0033a0] hover:bg-[#002a80] text-white"
                onClick={handleAddLog}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Saving..." : "Save Log"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Preview Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl p-0 rounded-2xl border-none overflow-hidden bg-black">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-3 right-3 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {selectedPhoto && (
            <img
              src={selectedPhoto}
              alt="Tree photo preview"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TreeDetailPanel;

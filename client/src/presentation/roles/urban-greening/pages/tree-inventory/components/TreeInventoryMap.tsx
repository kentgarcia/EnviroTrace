// client/src/presentation/roles/urban-greening/pages/tree-inventory/components/TreeInventoryMap.tsx
/**
 * TreeInventoryMap Component - Optimized map visualization with clustering
 * Features:
 * - Marker clustering using PostGIS server-side clustering
 * - Lazy loading of tree details on click
 * - Smart expanded-bounds caching (1.5x viewport)
 * - Only refetches when viewport leaves cached bounds
 * - Merges new data, never clears during loading
 * - Memoized markers for performance
 * - Integrated side panel for tree details (no modal)
 */

import React, { useState, useMemo, useCallback, useRef, memo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Button } from "@/presentation/components/shared/ui/button";
import {
  Layers,
  TreePine,
  Loader2,
  X,
  MapPin,
  Calendar,
  Ruler,
  Leaf,
  AlertTriangle,
  User,
  Phone,
  Image as ImageIcon,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from "react-leaflet";
import { useSmartTreesInBounds, useSmartTreeClusters, useTreeById } from "../logic/useTreeInventory";
import { TreeMapItem, TreeCluster, BoundsParams, TreePhotoMetadata } from "@/core/api/tree-inventory-api";
import "leaflet/dist/leaflet.css";

// Default center - San Fernando, Pampanga (Philippines)
const DEFAULT_CENTER: [number, number] = [15.0287, 120.6880];
const DEFAULT_ZOOM = 14;
const CLUSTER_ZOOM_THRESHOLD = 16; // Show individual markers above this zoom

// Color configurations
const statusColors: Record<string, string> = {
  alive: "#22c55e",
  cut: "#ef4444",
  dead: "#6b7280",
  replaced: "#3b82f6",
};

const healthColors: Record<string, string> = {
  healthy: "#22c55e",
  needs_attention: "#eab308",
  diseased: "#f97316",
  dead: "#6b7280",
};

const getMarkerColor = (tree: TreeMapItem): string => {
  if (tree.status === "alive") {
    return healthColors[tree.health] || "#22c55e";
  }
  return statusColors[tree.status] || "#6b7280";
};

// Memoized individual tree marker component
const TreeMarker = memo(({ 
  tree, 
  onTreeClick 
}: { 
  tree: TreeMapItem; 
  onTreeClick: (id: string) => void;
}) => {
  const color = getMarkerColor(tree);
  
  return (
    <CircleMarker
      center={[tree.latitude, tree.longitude]}
      radius={8}
      pathOptions={{
        fillColor: color,
        fillOpacity: 0.9,
        color: "#ffffff",
        weight: 2,
      }}
      eventHandlers={{
        click: () => onTreeClick(tree.id),
      }}
    >
      <Popup>
        <div className="min-w-[180px]">
          <div className="font-mono text-blue-600 text-sm font-semibold">
            {tree.tree_code}
          </div>
          <div className="font-medium mt-1">{tree.species || tree.common_name}</div>
          {tree.address && (
            <div className="text-xs text-gray-500 mt-1">{tree.address}</div>
          )}
          <div className="flex gap-2 mt-2">
            <span className={`px-2 py-0.5 rounded text-xs ${
              tree.status === "alive" ? "bg-green-100 text-green-700" :
              tree.status === "cut" ? "bg-red-100 text-red-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {tree.status.toUpperCase()}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs ${
              tree.health === "healthy" ? "bg-green-100 text-green-700" :
              tree.health === "needs_attention" ? "bg-yellow-100 text-yellow-700" :
              tree.health === "diseased" ? "bg-orange-100 text-orange-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {tree.health.replace("_", " ").toUpperCase()}
            </span>
          </div>
          <button 
            className="mt-2 text-xs text-blue-600 hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              onTreeClick(tree.id);
            }}
          >
            View Details →
          </button>
        </div>
      </Popup>
    </CircleMarker>
  );
});

TreeMarker.displayName = "TreeMarker";

// Memoized cluster marker component
const ClusterMarker = memo(({ 
  cluster 
}: { 
  cluster: TreeCluster;
}) => {
  const size = Math.min(50, Math.max(20, 10 + Math.log2(cluster.tree_count) * 8));
  
  return (
    <CircleMarker
      center={[cluster.cluster_lat, cluster.cluster_lng]}
      radius={size / 2}
      pathOptions={{
        fillColor: "#3b82f6",
        fillOpacity: 0.8,
        color: "#ffffff",
        weight: 2,
      }}
    >
      <Popup>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-700">{cluster.tree_count}</div>
          <div className="text-xs text-gray-600">trees in this area</div>
          {cluster.sample_species && (
            <div className="text-xs text-gray-500 mt-1">
              Including: {cluster.sample_species}
            </div>
          )}
          <div className="text-xs text-blue-500 mt-2">
            Zoom in to see individual trees
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
});

ClusterMarker.displayName = "ClusterMarker";

// Map event handler component for bounds tracking
// Only updates on moveend/zoomend - never during dragging
const MapBoundsTracker = ({ 
  onBoundsChange, 
  onZoomChange 
}: { 
  onBoundsChange: (bounds: BoundsParams) => void;
  onZoomChange: (zoom: number) => void;
}) => {
  const map = useMap();
  const isInitialized = useRef(false);
  
  // Update bounds and zoom on move/zoom end only
  const updateBounds = useCallback(() => {
    const bounds = map.getBounds();
    onBoundsChange({
      min_lat: bounds.getSouth(),
      min_lng: bounds.getWest(),
      max_lat: bounds.getNorth(),
      max_lng: bounds.getEast(),
    });
    onZoomChange(map.getZoom());
  }, [map, onBoundsChange, onZoomChange]);
  
  useMapEvents({
    moveend: updateBounds,
    zoomend: updateBounds,
  });
  
  // Initial load only
  React.useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      updateBounds();
    }
  }, [updateBounds]);
  
  return null;
};

// Integrated tree detail panel - shown on the side of the map
const TreeDetailSidePanel = ({ 
  treeId, 
  onClose 
}: { 
  treeId: string | null; 
  onClose: () => void;
}) => {
  const { data: tree, isLoading } = useTreeById(treeId || "");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  if (!treeId) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Normalize photos
  const normalizedPhotos = (tree?.photos || []).map((photo) => {
    if (typeof photo === "string") {
      return { url: photo, filename: photo.split("/").pop() || "image.jpg" };
    }
    return photo as TreePhotoMetadata;
  });

  const statusColors: Record<string, string> = {
    alive: "bg-green-100 text-green-700 border-green-200",
    cut: "bg-red-100 text-red-700 border-red-200",
    dead: "bg-gray-100 text-gray-700 border-gray-200",
    replaced: "bg-blue-100 text-blue-700 border-blue-200",
  };

  const healthColors: Record<string, string> = {
    healthy: "bg-green-100 text-green-700",
    needs_attention: "bg-yellow-100 text-yellow-700",
    diseased: "bg-orange-100 text-orange-700",
    dead: "bg-gray-100 text-gray-700",
  };
  
  return (
    <div className="absolute top-0 right-0 bottom-0 w-[340px] bg-white z-[1000] border-l border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-green-600 to-green-700 text-white shrink-0">
        <div className="flex items-center gap-2">
          <TreePine className="w-5 h-5" />
          <span className="font-semibold">Tree Details</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : tree ? (
          <div className="p-4 space-y-4">
            {/* Tree Code */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="font-mono text-lg text-blue-700 font-bold">
                {tree.tree_code}
              </div>
              <div className="text-sm text-blue-600 mt-1">
                {tree.species || tree.common_name}
              </div>
            </div>

            {/* Status & Health */}
            <div className="flex gap-2">
              <Badge className={`${statusColors[tree.status] || "bg-gray-100"} border px-3 py-1`}>
                {tree.status.toUpperCase()}
              </Badge>
              <Badge className={`${healthColors[tree.health] || "bg-gray-100"} px-3 py-1 flex items-center gap-1`}>
                {tree.health === "healthy" && <Leaf className="w-3 h-3" />}
                {tree.health === "needs_attention" && <AlertTriangle className="w-3 h-3" />}
                {tree.health.replace("_", " ").toUpperCase()}
              </Badge>
            </div>

            {/* Species Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">Scientific Name</div>
                <div className="text-sm font-medium truncate">{tree.species || "—"}</div>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">Common Name</div>
                <div className="text-sm font-medium truncate">{tree.common_name || "—"}</div>
              </div>
            </div>

            {/* Location */}
            {(tree.address || tree.barangay) && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <MapPin className="w-3 h-3" />
                  Location
                </div>
                {tree.address && <div className="text-sm">{tree.address}</div>}
                {tree.barangay && (
                  <div className="text-sm text-gray-600">Brgy. {tree.barangay}</div>
                )}
                {tree.latitude && tree.longitude && (
                  <div className="text-xs text-gray-400 mt-1 font-mono">
                    {tree.latitude.toFixed(6)}, {tree.longitude.toFixed(6)}
                  </div>
                )}
              </div>
            )}

            {/* Measurements */}
            {(tree.height_meters || tree.diameter_cm || tree.age_years) && (
              <div className="grid grid-cols-3 gap-2">
                {tree.height_meters && (
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-700">{tree.height_meters}</div>
                    <div className="text-xs text-green-600">meters</div>
                  </div>
                )}
                {tree.diameter_cm && (
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-700">{tree.diameter_cm}</div>
                    <div className="text-xs text-green-600">cm dia.</div>
                  </div>
                )}
                {tree.age_years && (
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-700">{tree.age_years}</div>
                    <div className="text-xs text-green-600">years</div>
                  </div>
                )}
              </div>
            )}

            {/* Dates */}
            {tree.planted_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Planted:</span>
                <span className="font-medium">{formatDate(tree.planted_date)}</span>
              </div>
            )}

            {tree.cutting_date && (
              <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                <div className="text-xs text-red-600">Cut on {formatDate(tree.cutting_date)}</div>
                {tree.cutting_reason && (
                  <div className="text-sm text-red-700 mt-1">{tree.cutting_reason}</div>
                )}
              </div>
            )}

            {/* Contact Info */}
            {(tree.managed_by || tree.contact_person || tree.contact_number) && (
              <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="text-xs text-gray-500 font-medium">Management</div>
                {tree.managed_by && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-3 h-3 text-gray-400" />
                    {tree.managed_by}
                  </div>
                )}
                {tree.contact_person && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-3 h-3 text-gray-400" />
                    {tree.contact_person}
                  </div>
                )}
                {tree.contact_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-3 h-3 text-gray-400" />
                    {tree.contact_number}
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {tree.notes && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <div className="text-xs text-yellow-700 mb-1">Notes</div>
                <div className="text-sm text-gray-700">{tree.notes}</div>
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
                  {normalizedPhotos.slice(0, 4).map((photo, idx) => (
                    <div
                      key={photo.url || idx}
                      className="relative rounded-lg overflow-hidden border border-gray-200 cursor-pointer group"
                      onClick={() => setSelectedPhoto(photo.url)}
                    >
                      <img
                        src={photo.url}
                        alt={photo.filename || `Photo ${idx + 1}`}
                        className="w-full h-20 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                  ))}
                </div>
                {normalizedPhotos.length > 4 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{normalizedPhotos.length - 4} more photos
                  </div>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="pt-3 border-t text-xs text-gray-400 space-y-1">
              <div>Created: {formatDate(tree.created_at)}</div>
              {tree.updated_at && <div>Updated: {formatDate(tree.updated_at)}</div>}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Tree not found</div>
        )}
      </div>

      {/* Photo Preview Overlay */}
      {selectedPhoto && (
        <div 
          className="absolute inset-0 bg-black/90 z-10 flex items-center justify-center"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-3 right-3 p-2 bg-white/10 rounded-full text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={selectedPhoto}
            alt="Tree photo"
            className="max-w-full max-h-full object-contain p-4"
          />
        </div>
      )}
    </div>
  );
};

// Main component
const TreeInventoryMap: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [filterHealth, setFilterHealth] = useState<string | undefined>();
  const [viewportBounds, setViewportBounds] = useState<BoundsParams | null>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);

  // Determine whether to use clusters or individual markers
  const useClusters = zoom < CLUSTER_ZOOM_THRESHOLD;

  // Build filter params for viewport (actual viewport, not expanded)
  const filterParams = useMemo(() => viewportBounds ? ({
    ...viewportBounds,
    status: filterStatus,
    health: filterHealth,
  }) : null, [viewportBounds, filterStatus, filterHealth]);

  // Use smart caching hooks - fetches expanded bounds, renders viewport
  const { 
    data: treesData = [], 
    isLoading: isLoadingTrees,
    isFetching: isFetchingTrees,
    isUsingCache: isTreesFromCache,
  } = useSmartTreesInBounds(
    useClusters ? null : filterParams,
    { enabled: !useClusters && !!viewportBounds, limit: 1000 }
  );

  const { 
    data: clustersData = [], 
    isLoading: isLoadingClusters,
    isFetching: isFetchingClusters,
    isUsingCache: isClustersFromCache,
  } = useSmartTreeClusters(
    useClusters ? filterParams : null,
    zoom,
    { enabled: useClusters && !!viewportBounds }
  );

  const isLoading = useClusters ? isLoadingClusters : isLoadingTrees;
  const isFetching = useClusters ? isFetchingClusters : isFetchingTrees;
  const isUsingCache = useClusters ? isClustersFromCache : isTreesFromCache;

  // Memoized markers
  const markers = useMemo(() => {
    if (useClusters) {
      return clustersData.map((cluster, idx) => (
        <ClusterMarker key={`cluster-${idx}`} cluster={cluster} />
      ));
    }
    return treesData.map((tree) => (
      <TreeMarker 
        key={tree.id} 
        tree={tree} 
        onTreeClick={setSelectedTreeId}
      />
    ));
  }, [useClusters, clustersData, treesData]);

  // Callbacks
  const handleBoundsChange = useCallback((newBounds: BoundsParams) => {
    setViewportBounds(newBounds);
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const handleFilterChange = useCallback((type: "status" | "health", value: string) => {
    if (type === "status") {
      setFilterStatus(value === "all" ? undefined : value);
    } else {
      setFilterHealth(value === "all" ? undefined : value);
    }
  }, []);

  // Count display
  const displayCount = useClusters 
    ? clustersData.reduce((sum, c) => sum + c.tree_count, 0)
    : treesData.length;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TreePine className="w-5 h-5" />
            Tree Locations
            <Badge variant="outline" className="ml-2">
              {displayCount} {useClusters ? "total" : "visible"}
            </Badge>
            {isFetching && (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400 ml-2" />
            )}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 relative overflow-hidden">
        {/* Filter Controls */}
        <div className={`absolute top-4 z-[1000] bg-white rounded-lg border p-2 space-y-1 transition-all ${selectedTreeId ? "left-4" : "right-4"}`}>
          <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
            <Layers className="w-3 h-3" />
            Filters
          </div>
          
          <select 
            value={filterStatus || "all"}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full text-xs px-2 py-1 border rounded"
          >
            <option value="all">All Status</option>
            <option value="alive">🟢 Alive</option>
            <option value="cut">🔴 Cut</option>
            <option value="dead">⚫ Dead</option>
            <option value="replaced">🔵 Replaced</option>
          </select>
          
          <select 
            value={filterHealth || "all"}
            onChange={(e) => handleFilterChange("health", e.target.value)}
            className="w-full text-xs px-2 py-1 border rounded"
          >
            <option value="all">All Health</option>
            <option value="healthy">💚 Healthy</option>
            <option value="needs_attention">💛 Needs Attention</option>
            <option value="diseased">🧡 Diseased</option>
          </select>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg border p-3">
          <div className="text-xs font-medium text-gray-500 mb-2">Legend</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              Healthy
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              Needs Attention
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              Diseased
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              Cut
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-gray-500"></span>
              Dead
            </div>
            {useClusters && (
              <>
                <div className="border-t my-1"></div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px]">n</span>
                  Cluster
                </div>
              </>
            )}
          </div>
        </div>

        {/* Zoom indicator with cache status */}
        <div className={`absolute top-32 z-[1000] bg-white rounded-lg border px-3 py-2 transition-all ${selectedTreeId ? "left-4" : "right-4"}`}>
          <div className="text-xs text-gray-500">
            Zoom: {zoom} {useClusters ? "(clustered)" : "(individual)"}
          </div>
          <div className={`text-xs mt-1 ${isUsingCache ? "text-green-600" : "text-blue-600"}`}>
            {isFetching ? "⏳ Fetching..." : isUsingCache ? "✓ Using cache" : "📡 Ready"}
          </div>
        </div>

        {/* Leaflet Map */}
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapBoundsTracker 
            onBoundsChange={handleBoundsChange}
            onZoomChange={handleZoomChange}
          />
          
          {markers}
        </MapContainer>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-[1001]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <p className="mt-2 text-sm text-gray-600">Loading trees...</p>
            </div>
          </div>
        )}

        {/* Tree detail side panel - integrated on the map */}
        <TreeDetailSidePanel 
          treeId={selectedTreeId} 
          onClose={() => setSelectedTreeId(null)} 
        />
      </CardContent>
    </Card>
  );
};

export default TreeInventoryMap;

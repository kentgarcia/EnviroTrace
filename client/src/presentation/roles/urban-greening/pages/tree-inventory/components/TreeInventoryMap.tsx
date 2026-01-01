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
 */

import React, { useState, useMemo, useCallback, useRef, memo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/presentation/components/shared/ui/dialog";
import {
  Layers,
  TreePine,
  Loader2,
} from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from "react-leaflet";
import { useSmartTreesInBounds, useSmartTreeClusters, useTreeById } from "../logic/useTreeInventory";
import { TreeMapItem, TreeCluster, BoundsParams } from "@/core/api/tree-inventory-api";
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

// Tree detail dialog component - lazy loaded
const TreeDetailDialog = ({ 
  treeId, 
  onClose 
}: { 
  treeId: string | null; 
  onClose: () => void;
}) => {
  const { data: tree, isLoading } = useTreeById(treeId || "");
  
  if (!treeId) return null;
  
  return (
    <Dialog open={!!treeId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TreePine className="w-5 h-5 text-green-600" />
            Tree Details
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : tree ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="font-mono text-lg text-blue-700 font-semibold">
                {tree.tree_code}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500">Species</div>
                <div className="font-medium">{tree.species || tree.common_name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Common Name</div>
                <div className="font-medium">{tree.common_name || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <Badge className={
                  tree.status === "alive" ? "bg-green-100 text-green-700" :
                  tree.status === "cut" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
                }>
                  {tree.status.toUpperCase()}
                </Badge>
              </div>
              <div>
                <div className="text-xs text-gray-500">Health</div>
                <Badge className={
                  tree.health === "healthy" ? "bg-green-100 text-green-700" :
                  tree.health === "needs_attention" ? "bg-yellow-100 text-yellow-700" :
                  tree.health === "diseased" ? "bg-orange-100 text-orange-700" :
                  "bg-gray-100 text-gray-700"
                }>
                  {tree.health.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
            </div>
            
            {tree.address && (
              <div>
                <div className="text-xs text-gray-500">Address</div>
                <div className="text-sm">{tree.address}</div>
              </div>
            )}
            
            {tree.barangay && (
              <div>
                <div className="text-xs text-gray-500">Barangay</div>
                <div className="text-sm">{tree.barangay}</div>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-3 pt-2 border-t">
              {tree.height_meters && (
                <div className="text-center">
                  <div className="text-lg font-semibold">{tree.height_meters}m</div>
                  <div className="text-xs text-gray-500">Height</div>
                </div>
              )}
              {tree.diameter_cm && (
                <div className="text-center">
                  <div className="text-lg font-semibold">{tree.diameter_cm}cm</div>
                  <div className="text-xs text-gray-500">Diameter</div>
                </div>
              )}
              {tree.planted_date && (
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {new Date(tree.planted_date).getFullYear()}
                  </div>
                  <div className="text-xs text-gray-500">Planted</div>
                </div>
              )}
            </div>
            
            {tree.notes && (
              <div className="pt-2 border-t">
                <div className="text-xs text-gray-500 mb-1">Notes</div>
                <div className="text-sm text-gray-700">{tree.notes}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">Tree not found</div>
        )}
      </DialogContent>
    </Dialog>
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
        <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg border p-2 space-y-1">
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
        <div className="absolute top-32 right-4 z-[1000] bg-white rounded-lg border px-3 py-2">
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
      </CardContent>

      {/* Tree detail dialog - lazy loaded */}
      <TreeDetailDialog 
        treeId={selectedTreeId} 
        onClose={() => setSelectedTreeId(null)} 
      />
    </Card>
  );
};

export default TreeInventoryMap;

import * as React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L, { divIcon, point, LatLngExpression } from "leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { MapPin, Search, X, Filter, RotateCcw, TreePine, Sprout, Leaf, Eye, EyeOff, Calendar, User } from "lucide-react";
import ReactDOMServer from "react-dom/server";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/presentation/components/shared/ui/dropdown-menu";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { MONITORING_REQUEST_STATUS_OPTIONS } from "../constants";
// API imports
import { getPlantingsByMonitoringRequest } from "@/core/api/planting-api";
import { getTreeManagementByMonitoringRequest } from "@/core/api/tree-management-api";
import type { UrbanGreeningPlanting } from "@/core/api/planting-api";
import type { TreeManagementRequest } from "@/core/api/tree-management-api";

// Types
interface Coordinates {
  lat: number;
  lng: number;
}

type MonitoringStatus = typeof MONITORING_REQUEST_STATUS_OPTIONS[number];

interface MonitoringRequest {
  id: string;
  title: string;
  status: MonitoringStatus;
  location?: Coordinates;
  description?: string;
  requesterName?: string;
  address?: string;
  date?: string;
  source_type?: string; // 'urban_greening' or 'tree_management'
}

interface MapViewProps {
  requests: MonitoringRequest[];
  height?: number;
  center?: Coordinates;
  zoom?: number;
}

const statusColorClass: Record<MonitoringStatus, string> = {
  untracked: "text-gray-600",
  living: "text-green-600",
  dead: "text-red-500",
  replaced: "text-blue-500",
};

const statusLabels: Record<MonitoringStatus, string> = {
  untracked: "Untracked",
  living: "Living",
  dead: "Dead",
  replaced: "Replaced",
};

const createIcon = (status: MonitoringStatus, sourceType?: string) => {
  // Choose icon based on source type
  const IconComponent = sourceType === "tree_management" ? TreePine :
    sourceType === "urban_greening" ? Sprout :
      MapPin;

  // Status-based colors with gradient pairs
  const getStatusGradient = (status: string) => {
    switch (status.toLowerCase()) {
      case 'untracked': return {
        start: '#9ca3af', // darker gray
        end: '#4b5563'   // much darker gray
      };
      case 'living': return {
        start: '#10b981', // darker green
        end: '#047857'   // much darker green
      };
      case 'dead': return {
        start: '#ef4444', // darker red
        end: '#b91c1c'   // much darker red
      };
      case 'replaced': return {
        start: '#3b82f6', // darker blue
        end: '#1d4ed8'   // much darker blue
      };
      // Legacy status values (keeping for backward compatibility)
      case 'pending': return {
        start: '#f59e0b', // darker amber
        end: '#b45309'   // much darker amber
      };
      case 'in-progress': return {
        start: '#3b82f6', // darker blue
        end: '#1d4ed8'   // much darker blue
      };
      case 'completed': return {
        start: '#10b981', // darker green
        end: '#047857'   // much darker green
      };
      case 'approved': return {
        start: '#10b981', // darker green
        end: '#047857'   // much darker green
      };
      case 'rejected': return {
        start: '#ef4444', // darker red
        end: '#b91c1c'   // much darker red
      };
      default: return {
        start: '#9ca3af', // darker gray
        end: '#4b5563'   // much darker gray
      };
    }
  };

  const gradient = getStatusGradient(status);

  return L.divIcon({
    html: ReactDOMServer.renderToString(
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${gradient.start}, ${gradient.end})`,
          border: '2px solid rgba(255, 255, 255, 0.8)',
          boxShadow: `
            0 4px 8px rgba(0, 0, 0, 0.3),
            0 2px 4px rgba(0, 0, 0, 0.2),
            inset 0 1px 2px rgba(255, 255, 255, 0.4)
          `,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Highlight effect for orb-like appearance */}
        <div
          style={{
            position: 'absolute',
            top: '8%',
            left: '20%',
            width: '40%',
            height: '40%',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.4)',
            filter: 'blur(2px)'
          }}
        />
        <IconComponent
          size={18}
          color="white"
          strokeWidth={3}
          style={{
            filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))',
            zIndex: 1,
            position: 'relative'
          }}
        />
      </div>
    ),
    className: "border-0 bg-transparent",
    iconSize: [32, 32],
    iconAnchor: [16, 40],
  });
};

const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  const size = count < 10 ? 40 : count < 100 ? 45 : 50;

  return divIcon({
    html: `<div style="
      background: radial-gradient(circle at 30% 30%, #3b82f6, #1e3a8a);
      color: white;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: ${count < 10 ? '14px' : count < 100 ? '12px' : '10px'};
      border: 2px solid rgba(255, 255, 255, 0.8);
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.3),
        0 2px 6px rgba(0, 0, 0, 0.2),
        inset 0 1px 2px rgba(255, 255, 255, 0.4);
      transition: all 0.2s ease;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
      position: relative;
      overflow: hidden;
    ">
      <div style="
        position: absolute;
        top: 15%;
        left: 25%;
        width: 35%;
        height: 35%;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.4);
        filter: blur(2px);
      "></div>
      <span style="position: relative; z-index: 1;">${count}</span>
    </div>`,
    className: "",
    iconSize: point(size, size, true),
  });
};

const statusOptions: { value: MonitoringStatus; label: string }[] =
  MONITORING_REQUEST_STATUS_OPTIONS.map(status => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1)
  }));

// Helper function to get status badge color
const getStatusBadgeColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'living':
    case 'completed':
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'dead':
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'replaced':
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'untracked':
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Component to display related data in popup
const RelatedDataPopup: React.FC<{ monitoringRequestId: string }> = ({ monitoringRequestId }) => {
  const [plantings, setPlantings] = React.useState<UrbanGreeningPlanting[]>([]);
  const [treeManagement, setTreeManagement] = React.useState<TreeManagementRequest[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        const [plantingsData, treeData] = await Promise.all([
          getPlantingsByMonitoringRequest(monitoringRequestId),
          getTreeManagementByMonitoringRequest(monitoringRequestId)
        ]);
        setPlantings(plantingsData);
        setTreeManagement(treeData);
      } catch (error) {
        console.error('Error fetching related data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedData();
  }, [monitoringRequestId]);

  if (loading) {
    return (
      <div className="mt-3 pt-3 border-t">
        <p className="text-xs text-gray-500">Loading related records...</p>
      </div>
    );
  }

  if (plantings.length === 0 && treeManagement.length === 0) {
    return (
      <div className="mt-3 pt-3 border-t">
        <p className="text-xs text-gray-500">No related planting or tree management records found.</p>
      </div>
    );
  }

  // Calculate summary statistics
  const totalPlants = plantings.reduce((sum, p) => sum + (p.quantity_planted || 0), 0);
  const speciesCount = new Set(plantings.map(p => p.species_name).filter(Boolean)).size;
  const livingPlants = plantings.filter(p => p.status === 'growing' || p.status === 'mature' || p.status === 'planted').length;
  const deadPlants = plantings.filter(p => p.status === 'died' || p.status === 'removed').length;

  return (
    <div className="mt-3 pt-3 border-t space-y-3">
      <h5 className="font-semibold text-sm text-gray-700">Related Environmental Records</h5>

      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="text-center">
            <div className="font-bold text-lg text-green-600">{totalPlants}</div>
            <div className="text-gray-600">Total Plants</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-purple-600">{speciesCount}</div>
            <div className="text-gray-600">Species</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-blue-600">{treeManagement.length}</div>
            <div className="text-gray-600">Tree Requests</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-orange-600">{livingPlants}/{plantings.length}</div>
            <div className="text-gray-600">Survival Rate</div>
          </div>
        </div>
      </div>

      {/* Plantings */}
      {plantings.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Recent Plantings</span>
          </div>
          <div className="space-y-2">
            {plantings.slice(0, 2).map((planting) => (
              <div key={planting.id} className="bg-green-50 rounded p-2 border border-green-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-green-800">{planting.species_name}</span>
                  <Badge className={getStatusBadgeColor(planting.status)} variant="outline">
                    {planting.status}
                  </Badge>
                </div>
                <div className="text-xs text-green-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Sprout className="h-3 w-3" />
                      <span>{planting.quantity_planted} planted</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(planting.planting_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{planting.responsible_person}</span>
                  </div>
                  {planting.location && (
                    <div className="text-xs text-green-600">📍 {planting.location}</div>
                  )}
                </div>
              </div>
            ))}
            {plantings.length > 2 && (
              <p className="text-xs text-gray-500 text-center">
                +{plantings.length - 2} more planting records
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tree Management */}
      {treeManagement.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TreePine className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Tree Management</span>
          </div>
          <div className="space-y-2">
            {treeManagement.slice(0, 2).map((tree) => (
              <div key={tree.id} className="bg-blue-50 rounded p-2 border border-blue-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-blue-800">{tree.request_number}</span>
                  <Badge className={getStatusBadgeColor(tree.status)} variant="outline">
                    {tree.status}
                  </Badge>
                </div>
                <div className="text-xs text-blue-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <TreePine className="h-3 w-3" />
                      <span>{tree.request_type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(tree.request_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{tree.requester_name}</span>
                  </div>
                  {tree.trees_and_quantities && tree.trees_and_quantities.length > 0 && (
                    <div className="text-xs text-blue-600">
                      🌳 Trees: {tree.trees_and_quantities.slice(0, 2).join(', ')}
                      {tree.trees_and_quantities.length > 2 && ` (+${tree.trees_and_quantities.length - 2} more)`}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {treeManagement.length > 2 && (
              <p className="text-xs text-gray-500 text-center">
                +{treeManagement.length - 2} more tree management records
              </p>
            )}
          </div>
        </div>
      )}

      {/* Species Breakdown */}
      {speciesCount > 0 && (
        <div className="bg-purple-50 rounded p-2 border border-purple-200">
          <div className="text-xs text-purple-700">
            <div className="font-medium mb-1">🌿 Species Diversity</div>
            <div className="flex flex-wrap gap-1">
              {Array.from(new Set(plantings.map(p => p.species_name).filter(Boolean))).slice(0, 3).map(species => (
                <span key={species} className="bg-purple-100 px-2 py-1 rounded text-xs">
                  {species}
                </span>
              ))}
              {speciesCount > 3 && (
                <span className="text-purple-600">+{speciesCount - 3} more</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Environmental Impact */}
      {(totalPlants > 0 || treeManagement.length > 0) && (
        <div className="bg-gray-50 rounded p-2 border text-xs text-gray-600">
          <div className="font-medium text-gray-700 mb-1">🌍 Environmental Impact</div>
          <div className="space-y-1">
            {totalPlants > 0 && (
              <div>💨 CO₂ Absorption: ~{(totalPlants * 0.048).toFixed(1)} kg/year</div>
            )}
            {livingPlants > 0 && (
              <div>🌿 Air Purification: {livingPlants} active plants filtering air</div>
            )}
            {treeManagement.length > 0 && (
              <div>🌳 Tree Care: {treeManagement.length} management actions</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Component to handle map center changes and setup
const MapController: React.FC<{
  center: LatLngExpression;
  zoom: number;
  filteredRequests: MonitoringRequest[];
  mapRef: React.MutableRefObject<L.Map | null>;
}> = ({ center, zoom, filteredRequests, mapRef }) => {
  const map = useMap();

  React.useEffect(() => {
    mapRef.current = map;
    if (map && center) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom, mapRef]);

  // Auto-adjust map bounds when filtered requests change
  React.useEffect(() => {
    if (map && filteredRequests.length > 1) {
      const bounds = L.latLngBounds(
        filteredRequests.map(req => [req.location!.lat, req.location!.lng])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, filteredRequests]);

  // Ensure map is properly sized
  React.useEffect(() => {
    if (map) {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  }, [map]);

  return null;
};

function MapControls({
  selectedStatuses,
  onFilterChange,
  searchTerm,
  onSearchChange,
  onReset,
  totalRequests,
  filteredCount,
  filteredRequests,
}: {
  selectedStatuses: MonitoringStatus[];
  onFilterChange: (statuses: MonitoringStatus[]) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onReset: () => void;
  totalRequests: number;
  filteredCount: number;
  filteredRequests: MonitoringRequest[];
}) {
  const [showLegend, setShowLegend] = React.useState(false);

  const handleToggle = (status: MonitoringStatus) => {
    if (selectedStatuses.includes(status)) {
      onFilterChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onFilterChange([...selectedStatuses, status]);
    }
  };

  const handleSelectAll = () => {
    onFilterChange(statusOptions.map(opt => opt.value));
  };

  const handleDeselectAll = () => {
    onFilterChange([]);
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-lg p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-8"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Legend Toggle */}
      <div className="bg-white rounded-lg shadow-lg p-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Map Legend</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLegend(!showLegend)}
            className="h-8 w-8 p-0"
          >
            {showLegend ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        {showLegend && (
          <div className="mt-3 space-y-4">
            {/* Icon Legend */}
            <div>
              <h5 className="text-xs font-medium text-gray-600 mb-2">Marker Icons</h5>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      border: '2px solid #000000',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <TreePine size={12} color="white" strokeWidth={2.5} style={{ filter: 'drop-shadow(0.5px 0.5px 0.5px rgba(0,0,0,0.8))' }} />
                  </div>
                  <span className="text-gray-600">Tree Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#3b82f6',
                      border: '2px solid #000000',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Sprout size={12} color="white" strokeWidth={2.5} style={{ filter: 'drop-shadow(0.5px 0.5px 0.5px rgba(0,0,0,0.8))' }} />
                  </div>
                  <span className="text-gray-600">Urban Greening</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#8b5cf6',
                      border: '2px solid #000000',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <MapPin size={12} color="white" strokeWidth={2.5} style={{ filter: 'drop-shadow(0.5px 0.5px 0.5px rgba(0,0,0,0.8))' }} />
                  </div>
                  <span className="text-gray-600">Other/Unknown</span>
                </div>
              </div>
            </div>

            {/* Status Color Legend */}
            <div>
              <h5 className="text-xs font-medium text-gray-600 mb-2">Status Colors</h5>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: '#9ca3af',
                      border: '2px solid #000000',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}
                  />
                  <span className="text-gray-600">Untracked</span>
                  <span className="text-yellow-600 text-xs ml-auto">⚠️ Needs Inspection</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      border: '2px solid #000000',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}
                  />
                  <span className="text-gray-600">Living</span>
                  <span className="text-green-600 text-xs ml-auto">✓ Healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: '#ef4444',
                      border: '2px solid #000000',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}
                  />
                  <span className="text-gray-600">Dead</span>
                  <span className="text-red-600 text-xs ml-auto">🔄 Needs Replacement</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: '#3b82f6',
                      border: '2px solid #000000',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}
                  />
                  <span className="text-gray-600">Replaced</span>
                  <span className="text-blue-600 text-xs ml-auto">🔄 Recently Replaced</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Environmental Impact Summary */}
      <div className="bg-white rounded-lg shadow-lg p-3">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Environmental Impact</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Total Monitored:</span>
            <span className="font-semibold text-blue-600">{filteredRequests.length}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-green-600">Living Plants:</span>
            <span className="font-semibold text-green-700">
              {filteredRequests.filter(r => r.status?.toLowerCase() === 'living').length}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-red-600">Needs Action:</span>
            <span className="font-semibold text-red-700">
              {filteredRequests.filter(r =>
                r.status?.toLowerCase() === 'dead' || r.status?.toLowerCase() === 'untracked'
              ).length}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Success Rate:</span>
            <span className="font-semibold text-gray-700">
              {filteredRequests.length > 0
                ? ((filteredRequests.filter(r => r.status?.toLowerCase() === 'living').length / filteredRequests.length) * 100).toFixed(1)
                : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Status Filters
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.length === statusOptions.length}
                onCheckedChange={handleSelectAll}
              >
                Select All
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedStatuses.length === 0}
                onCheckedChange={handleDeselectAll}
              >
                Deselect All
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap gap-2">
          {statusOptions.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant={selectedStatuses.includes(opt.value) ? "default" : "outline"}
              onClick={() => handleToggle(opt.value)}
              className="text-xs"
            >
              {opt.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t">
          <span className="text-xs text-gray-500">
            Showing {filteredCount} of {totalRequests} requests
          </span>
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MapView({
  requests,
  height = 600,
  center,
  zoom = 13
}: MapViewProps) {
  const [selectedStatuses, setSelectedStatuses] = React.useState<MonitoringStatus[]>(
    statusOptions.map(opt => opt.value)
  );
  const [searchTerm, setSearchTerm] = React.useState("");

  // Default to Muntinlupa if no center is provided
  const mapCenter: LatLngExpression = center ? [center.lat, center.lng] : [14.4081, 121.0415];

  // Filter requests based on search term and status
  const filteredRequests = React.useMemo(() => {
    let filtered = requests.filter(
      (req) => req.location && selectedStatuses.some(status =>
        status.toLowerCase() === req.status?.toLowerCase()
      )
    );

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.title.toLowerCase().includes(term) ||
          req.description?.toLowerCase().includes(term) ||
          req.requesterName?.toLowerCase().includes(term) ||
          req.address?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [requests, selectedStatuses, searchTerm]);
  // Reset all filters
  const handleReset = React.useCallback(() => {
    setSelectedStatuses(statusOptions.map(opt => opt.value));
    setSearchTerm("");
  }, []);

  // Map reference for programmatic control
  const mapRef = React.useRef<L.Map | null>(null);
  return (
    <div
      className="w-full relative rounded-lg overflow-hidden border bg-gray-50"
      style={{ height }}
    >
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapController
          center={mapCenter}
          zoom={zoom}
          filteredRequests={filteredRequests}
          mapRef={mapRef}
        />

        <MarkerClusterGroup
          iconCreateFunction={createClusterCustomIcon}
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
        >
          {filteredRequests.map((request) => (
            <Marker
              key={request.id}
              position={[request.location!.lat, request.location!.lng]}
              icon={createIcon(request.status, request.source_type)}
            >
              <Popup maxWidth={350} className="monitoring-request-popup">
                <div className="p-2 space-y-3 min-w-[300px] max-h-[400px] overflow-y-auto">
                  <div>
                    <h4 className="font-bold text-base text-gray-900 mb-1">
                      {request.title}
                    </h4>
                    {request.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {request.description.length > 100
                          ? `${request.description.substring(0, 100)}...`
                          : request.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-gray-500">
                    {request.requesterName && (
                      <p><strong>Requester:</strong> {request.requesterName}</p>
                    )}
                    {request.address && (
                      <p><strong>Address:</strong> {request.address}</p>
                    )}
                    {request.date && (
                      <p><strong>Date:</strong> {new Date(request.date).toLocaleDateString()}</p>
                    )}
                    {request.source_type && (
                      <p><strong>Source:</strong> {
                        request.source_type === "tree_management" ? "Tree Management" :
                          request.source_type === "urban_greening" ? "Urban Greening" :
                            request.source_type
                      }</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium capitalize ${statusColorClass[request.status]}`}>
                        {statusLabels[request.status]}
                      </span>
                      {request.source_type && (
                        <div className="flex items-center gap-1">
                          {request.source_type === "tree_management" ? (
                            <TreePine className="h-3 w-3 text-green-600" />
                          ) : request.source_type === "urban_greening" ? (
                            <Leaf className="h-3 w-3 text-blue-600" />
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Related Data Component */}
                  <RelatedDataPopup monitoringRequestId={request.id} />
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 z-[1000] w-full max-w-sm">
        <MapControls
          selectedStatuses={selectedStatuses}
          onFilterChange={setSelectedStatuses}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onReset={handleReset}
          totalRequests={requests.length}
          filteredCount={filteredRequests.length}
          filteredRequests={filteredRequests}
        />
      </div>

      {/* No Results Message */}
      {filteredRequests.length === 0 && requests.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-[999]">
          <div className="text-center p-6 rounded-lg bg-white shadow-lg">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No matching requests found
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button onClick={handleReset} variant="outline">
              Reset Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

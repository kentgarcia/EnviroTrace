import * as React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L, { divIcon, point, LatLngExpression } from "leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { MapPin, Search, X, Filter, RotateCcw } from "lucide-react";
import ReactDOMServer from "react-dom/server";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/presentation/components/shared/ui/dropdown-menu";

// Types
interface Coordinates {
  lat: number;
  lng: number;
}

type MonitoringStatus =
  | "pending"
  | "in-progress"
  | "completed"
  | "approved"
  | "rejected";

interface MonitoringRequest {
  id: string;
  title: string;
  status: MonitoringStatus;
  location?: Coordinates;
  description?: string;
  requesterName?: string;
  address?: string;
  date?: string;
}

interface MapViewProps {
  requests: MonitoringRequest[];
  onSelectRequest: (id: string) => void;
  height?: number;
  center?: Coordinates;
  zoom?: number;
}

const statusColorClass: Record<MonitoringStatus, string> = {
  completed: "text-green-600",
  "in-progress": "text-blue-500",
  pending: "text-yellow-500",
  approved: "text-green-700",
  rejected: "text-red-500",
};

const statusLabels: Record<MonitoringStatus, string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const createIcon = (status: MonitoringStatus) => {
  const colorClass = statusColorClass[status] || "text-gray-400";
  return L.divIcon({
    html: ReactDOMServer.renderToString(
      <div className="relative">
        <MapPin
          className={`h-8 w-8 ${colorClass} fill-current drop-shadow-lg`}
        />
      </div>
    ),
    className: "border-0 bg-transparent",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
  });
};

const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  const size = count < 10 ? 40 : count < 100 ? 45 : 50;

  return divIcon({
    html: `<div style="
      background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)) 50%, hsl(var(--primary)));
      color: hsl(var(--primary-foreground));
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: ${count < 10 ? '14px' : count < 100 ? '12px' : '10px'};
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.2s ease;
    ">${count}</div>`,
    className: "",
    iconSize: point(size, size, true),
  });
};

const statusOptions: { value: MonitoringStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

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
}: {
  selectedStatuses: MonitoringStatus[];
  onFilterChange: (statuses: MonitoringStatus[]) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onReset: () => void;
  totalRequests: number;
  filteredCount: number;
}) {
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
  onSelectRequest,
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
      (req) => req.location && selectedStatuses.includes(req.status)
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
              icon={createIcon(request.status)}
            >
              <Popup maxWidth={300} className="monitoring-request-popup">
                <div className="p-2 space-y-3 min-w-[250px]">
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
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className={`text-sm font-medium capitalize ${statusColorClass[request.status]}`}>
                      {statusLabels[request.status]}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => onSelectRequest(request.id)}
                      className="ml-2"
                    >
                      View Details
                    </Button>
                  </div>
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

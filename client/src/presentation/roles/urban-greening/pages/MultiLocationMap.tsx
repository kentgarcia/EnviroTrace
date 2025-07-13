import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L, { LatLngExpression, divIcon, point } from "leaflet";
import ReactDOMServer from "react-dom/server";
import { MapPin, AlertCircle } from "lucide-react";
import React from "react";
import MarkerClusterGroup from "react-leaflet-markercluster";

interface Coordinates {
    lat: number;
    lng: number;
}

interface LocationData {
    id: string;
    location: Coordinates;
    title: string;
    description?: string;
    type?: "primary" | "secondary" | "warning" | "danger";
    info?: Record<string, any>;
}

interface MultiLocationMapProps {
    locations: LocationData[];
    onSelectLocation?: (location: LocationData) => void;
    center?: Coordinates;
    zoom?: number;
    height?: number;
    clustering?: boolean;
    fitBounds?: boolean;
}

const typeColorClass: Record<string, string> = {
    primary: "text-blue-500 fill-blue-100",
    secondary: "text-gray-500 fill-gray-100",
    warning: "text-yellow-500 fill-yellow-100",
    danger: "text-red-500 fill-red-100",
    default: "text-green-500 fill-green-100",
};

const createLocationIcon = (type: string = "default") => {
    const colorClass = typeColorClass[type] || typeColorClass.default;
    return L.divIcon({
        html: ReactDOMServer.renderToString(
            <div className="relative">
                <MapPin className={`h-8 w-8 ${colorClass} drop-shadow-lg`} />
            </div>
        ),
        className: "border-0 bg-transparent",
        iconSize: [32, 40],
        iconAnchor: [16, 40],
    });
};

const createClusterIcon = (cluster: any) => {
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
    ">${count}</div>`,
        className: "",
        iconSize: point(size, size, true),
    });
};

// Component to handle map setup and bounds
const MapSetupController: React.FC<{
    locations: LocationData[];
    center?: Coordinates;
    zoom: number;
    fitBounds: boolean;
}> = ({ locations, center, zoom, fitBounds }) => {
    const map = useMap();

    React.useEffect(() => {
        if (!map) return;

        if (fitBounds && locations.length > 1) {
            // Fit bounds to show all locations
            const bounds = L.latLngBounds(
                locations.map(loc => [loc.location.lat, loc.location.lng])
            );
            map.fitBounds(bounds, { padding: [20, 20] });
        } else if (center) {
            map.setView([center.lat, center.lng], zoom);
        } else if (locations.length === 1) {
            map.setView([locations[0].location.lat, locations[0].location.lng], zoom);
        }

        // Ensure map is properly sized
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }, [map, locations, center, zoom, fitBounds]);

    return null;
};

export default function MultiLocationMap({
    locations,
    onSelectLocation,
    center,
    zoom = 15,
    height = 400,
    clustering = true,
    fitBounds = true,
}: MultiLocationMapProps) {
    // Validate locations
    const validLocations = React.useMemo(() => {
        return locations.filter(loc =>
            loc.location &&
            typeof loc.location.lat === "number" &&
            typeof loc.location.lng === "number" &&
            loc.location.lat >= -90 &&
            loc.location.lat <= 90 &&
            loc.location.lng >= -180 &&
            loc.location.lng <= 180 &&
            !isNaN(loc.location.lat) &&
            !isNaN(loc.location.lng)
        );
    }, [locations]);

    // Default map center
    const mapCenter: LatLngExpression = React.useMemo(() => {
        if (center) {
            return [center.lat, center.lng];
        }
        if (validLocations.length > 0) {
            return [validLocations[0].location.lat, validLocations[0].location.lng];
        }
        // Default to Manila coordinates
        return [14.6042, 121.0222];
    }, [center, validLocations]);

    if (validLocations.length === 0) {
        return (
            <div
                className="flex items-center justify-center bg-gray-100 text-gray-500 rounded border"
                style={{ height }}
            >
                <div className="text-center">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No valid locations to display</p>
                </div>
            </div>
        );
    }

    const renderMarkers = () => {
        const markers = validLocations.map((locationData) => (
            <Marker
                key={locationData.id}
                position={[locationData.location.lat, locationData.location.lng]}
                icon={createLocationIcon(locationData.type)}
            >
                <Popup maxWidth={300}>
                    <div className="p-2 space-y-2 min-w-[200px]">
                        <h4 className="font-bold text-base text-gray-900">
                            {locationData.title}
                        </h4>
                        {locationData.description && (
                            <p className="text-sm text-gray-600">
                                {locationData.description}
                            </p>
                        )}
                        {locationData.info && Object.keys(locationData.info).length > 0 && (
                            <div className="space-y-1 text-xs text-gray-500">
                                {Object.entries(locationData.info).map(([key, value]) => (
                                    <p key={key}>
                                        <strong>{key}:</strong> {String(value)}
                                    </p>
                                ))}
                            </div>
                        )}
                        {onSelectLocation && (
                            <div className="pt-2 border-t">
                                <button
                                    onClick={() => onSelectLocation(locationData)}
                                    className="w-full px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                                >
                                    View Details
                                </button>
                            </div>
                        )}
                    </div>
                </Popup>
            </Marker>
        ));

        if (clustering && validLocations.length > 5) {
            return (
                <MarkerClusterGroup
                    iconCreateFunction={createClusterIcon}
                    maxClusterRadius={50}
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={false}
                    zoomToBoundsOnClick={true}
                >
                    {markers}
                </MarkerClusterGroup>
            );
        }

        return markers;
    };

    return (
        <div
            className="relative w-full rounded border"
            style={{ height }}
        >
            <MapContainer
                center={mapCenter}
                zoom={zoom}
                scrollWheelZoom={true}
                className="h-full w-full rounded"
                attributionControl={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    maxZoom={19}
                />

                <MapSetupController
                    locations={validLocations}
                    center={center}
                    zoom={zoom}
                    fitBounds={fitBounds}
                />

                {renderMarkers()}
            </MapContainer>

            {/* Location count indicator */}
            {validLocations.length > 0 && (
                <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 text-sm text-gray-700 z-[1000]">
                    {validLocations.length} location{validLocations.length !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
}

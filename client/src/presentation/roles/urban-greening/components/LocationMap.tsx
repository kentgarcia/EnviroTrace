import { MapContainer, TileLayer, Marker, useMap, Circle, CircleMarker, Popup, Tooltip } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import ReactDOMServer from "react-dom/server";
import { MapPin, AlertCircle } from "lucide-react";
import React from "react";

interface Coordinates {
  lat: number;
  lng: number;
}

const createIcon = () => {
  return L.divIcon({
    html: ReactDOMServer.renderToString(
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, #ef4444, #991b1b)',
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
        <MapPin
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

// Component to dynamically update map view when location changes
const MapViewUpdater: React.FC<{ center: LatLngExpression; zoom: number }> = ({
  center,
  zoom,
}) => {
  const map = useMap();

  React.useEffect(() => {
    if (map && center) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);

  return null;
};

interface Hotspot {
  lat: number;
  lng: number;
  label?: string;
  radius?: number; // meters
}

interface LocationMapProps {
  location: Coordinates;
  zoom?: number;
  height?: number;
  // radii (in meters) to draw concentric circles around the central location
  radii?: number[];
  // optional hotspots to highlight on the map
  hotspots?: Hotspot[];
}

export default function LocationMap({
  location,
  zoom = 15,
  height = 180,
  radii = [200, 400, 500],
  hotspots = []
}: LocationMapProps) {
  const defaultIcon = React.useMemo(() => createIcon(), []);

  // Validate coordinates
  const isValidLocation = React.useMemo(() => {
    return (
      location &&
      typeof location.lat === "number" &&
      typeof location.lng === "number" &&
      location.lat >= -90 &&
      location.lat <= 90 &&
      location.lng >= -180 &&
      location.lng <= 180 &&
      !isNaN(location.lat) &&
      !isNaN(location.lng)
    );
  }, [location]);

  const mapCenter: LatLngExpression = React.useMemo(() => {
    if (isValidLocation) {
      return [location.lat, location.lng];
    }
    // Default to Manila coordinates if invalid
    return [14.6042, 121.0222];
  }, [location, isValidLocation]);

  if (!isValidLocation) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 text-gray-500 rounded"
        style={{ height }}
      >
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Invalid location coordinates</p>
          <p className="text-xs">
            {location ? `Lat: ${location.lat}, Lng: ${location.lng}` : "No location provided"}
          </p>
        </div>
      </div>);
  }

  return (
    <div className="relative" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full rounded"
        attributionControl={true}
        style={{ minHeight: height }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <Marker position={mapCenter} icon={defaultIcon} />
        {/* concentric radius circles for zones */}
        {radii.map((r, idx) => (
          <Circle
            key={`radius-${r}`}
            center={mapCenter}
            radius={r}
            pathOptions={{
              color: idx === 0 ? '#16a34a' : idx === 1 ? '#f59e0b' : '#3b82f6',
              weight: 2,
              dashArray: '6',
              opacity: 0.45
            }}
          />
        ))}

        {/* Hotspot markers: darker, larger center marker with subtle glow circle for visibility */}
        {hotspots.map((h, i) => (
          <React.Fragment key={`hotspot-${i}`}>
            {/* glow / hotspot area (uses provided radius or a default) */}
            <Circle
              center={[h.lat, h.lng]}
              radius={h.radius && h.radius > 0 ? h.radius : 30}
              pathOptions={{
                color: '#7f1d1d',
                fillColor: '#7f1d1d',
                fillOpacity: 0.12,
                weight: 0
              }}
            />

            {/* visible hotspot marker */}
            <CircleMarker
              center={[h.lat, h.lng]}
              radius={10}
              pathOptions={{ color: '#7f1d1d', fillColor: '#7f1d1d', fillOpacity: 1, weight: 2, opacity: 0.95 }}
            >
              <Popup>{h.label || `Hotspot ${i + 1}`}</Popup>
              <Tooltip direction="top">{h.label || `Hotspot ${i + 1}`}</Tooltip>
            </CircleMarker>
          </React.Fragment>
        ))}
        <MapViewUpdater center={mapCenter} zoom={zoom} />
      </MapContainer>
    </div>
  );
}

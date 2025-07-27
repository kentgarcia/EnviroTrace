import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
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
      <div className="relative">
        <MapPin className="h-8 w-8 text-red-500 fill-red-100 drop-shadow-lg" />
      </div>
    ),
    className: "border-0 bg-transparent",
    iconSize: [32, 40],
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

interface LocationMapProps {
  location: Coordinates;
  zoom?: number;
  height?: number;
}

export default function LocationMap({
  location,
  zoom = 15,
  height = 180
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
        <MapViewUpdater center={mapCenter} zoom={zoom} />
      </MapContainer>
    </div>
  );
}

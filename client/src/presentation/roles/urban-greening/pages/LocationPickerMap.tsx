import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import ReactDOMServer from "react-dom/server";
import { MapPin } from "lucide-react";
import React from "react";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";

// GeoSearchControl component for react-leaflet
function GeoSearch({ onLocationChange }: { onLocationChange: (loc: Coordinates) => void }) {
  const map = useMap();
  React.useEffect(() => {
    const provider = new OpenStreetMapProvider();
    // Use new GeoSearchControl (class) as per leaflet-geosearch docs
    // @ts-ignore
    const searchControl = new GeoSearchControl({
      provider,
      style: "bar",
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
    });
    map.addControl(searchControl);
    const handler = (e: any) => {
      if (e && e.location) {
        onLocationChange({ lat: e.location.y, lng: e.location.x });
      }
    };
    map.on('geosearch/showlocation', handler);
    return () => {
      map.removeControl(searchControl);
      map.off('geosearch/showlocation', handler);
    };
  }, [map, onLocationChange]);
  return null;
}

interface Coordinates {
  lat: number;
  lng: number;
}

const createIcon = () => {
  return L.divIcon({
    html: ReactDOMServer.renderToString(
      <div className="relative">
        <MapPin className="h-8 w-8 text-blue-500 fill-blue-100 drop-shadow-lg" />
      </div>
    ),
    className: "border-0 bg-transparent",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
  });
};

const defaultIcon = createIcon();

interface LocationPickerMapProps {
  location: Coordinates;
  onLocationChange: (newLocation: Coordinates) => void;
}

function MapEvents({
  onLocationChange,
}: {
  onLocationChange: (newLocation: Coordinates) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function RecenterMap({ location }: { location: Coordinates }) {
  const map = useMap();
  React.useEffect(() => {
    if (location.lat && location.lng) {
      map.flyTo([location.lat, location.lng], map.getZoom());
    }
  }, [location, map]);
  return null;
}

export default function LocationPickerMap({
  location,
  onLocationChange,
}: LocationPickerMapProps) {
  const mapCenter: LatLngExpression = [location.lat, location.lng];

  return (
    <div className="h-[250px] w-full rounded-md overflow-hidden border cursor-pointer">
      <MapContainer
        center={mapCenter}
        zoom={15}
        scrollWheelZoom={true}
        className="h-full w-full"
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={mapCenter} icon={defaultIcon} />
        <MapEvents onLocationChange={onLocationChange} />
        <RecenterMap location={location} />
        <GeoSearch onLocationChange={onLocationChange} />
      </MapContainer>
    </div>
  );
}

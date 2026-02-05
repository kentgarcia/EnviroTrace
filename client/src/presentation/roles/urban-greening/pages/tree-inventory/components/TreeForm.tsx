// client/src/presentation/roles/urban-greening/pages/tree-inventory/components/TreeForm.tsx
/**
 * TreeForm Component - Add/Edit tree in the inventory
 * Features: Dynamic species from DB, map picker with search, reverse geocoding
 */

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { TreeInventory, TreeInventoryCreate, TreeSpecies, TreePhotoMetadata, fetchNextTreeCode } from "@/core/api/tree-inventory-api";
import { useTreeSpecies, useCreateSpecies } from "../logic/useTreeInventory";
import TreeImageUpload, { UploadedImage } from "./TreeImageUpload";
import { Save, X, MapPin, Plus, Search, Loader2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import L from "leaflet";
import { regions, provinces, cities, barangays } from "phil-reg-prov-mun-brgy";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";
import { PERMISSIONS } from "@/core/utils/permissions";

// Fix leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Types for phil-reg-prov-mun-brgy
interface PhilLocation {
  name: string;
  reg_code?: string;
  prov_code?: string;
  mun_code?: string;
}

// Get all barangay names from the library for matching
const getAllBarangayNames = (): string[] => {
  return barangays.map((b: PhilLocation) => b.name);
};

// Normalize initial photos to the uploader's shape
const normalizeInitialPhotos = (photos?: (string | TreePhotoMetadata)[]): UploadedImage[] => {
  if (!photos) {
    return [];
  }
  return photos.map((photo) => {
    if (typeof photo === "string") {
      return {
        url: photo,
        filename: photo.split("/").pop() || "image.jpg",
        size: 0,
        uploaded_at: new Date().toISOString(),
      };
    }
    return photo as UploadedImage;
  });
};

// Default center - San Fernando, Pampanga
const DEFAULT_CENTER: [number, number] = [15.0287, 120.6880];

interface TreeFormProps {
  mode: "add" | "edit";
  initialData?: Partial<TreeInventory>;
  onSave: (data: TreeInventoryCreate) => Promise<void>;
  onCancel: () => void;
}

const TREE_CODE_PATTERN = /^\d{4}-\d{4}$/;

// Search control component for the map
const SearchControl: React.FC<{ onLocationSelect: (lat: number, lng: number, address: string) => void }> = ({ onLocationSelect }) => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    
    const searchControl = new (GeoSearchControl as any)({
      provider,
      style: 'bar',
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: 'Search location...',
    });

    map.addControl(searchControl);

    map.on('geosearch/showlocation', (e: any) => {
      const { x, y, label } = e.location;
      onLocationSelect(y, x, label);
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, onLocationSelect]);

  return null;
};

// Map click handler component
const LocationPicker: React.FC<{
  position: [number, number] | null;
  onPositionChange: (lat: number, lng: number) => void;
}> = ({ position, onPositionChange }) => {
  const map = useMap();

  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  // Center map on position change
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
};

const TreeForm: React.FC<TreeFormProps> = ({
  mode,
  initialData,
  onSave,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomSpecies, setShowCustomSpecies] = useState(false);
  const [speciesSearch, setSpeciesSearch] = useState("");
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [barangaySearch, setBarangaySearch] = useState("");
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canCreateSpecies = hasPermission(PERMISSIONS.TREE_SPECIES.CREATE);
  const initialTreeCode = (initialData?.tree_code ?? "").toUpperCase();
  const [treeCode, setTreeCode] = useState(initialTreeCode);
  const [isAutoCode, setIsAutoCode] = useState(() => {
    if (mode === "add") {
      return true;
    }
    if (!initialTreeCode) {
      return true;
    }
    return TREE_CODE_PATTERN.test(initialTreeCode);
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Get all barangay names (memoized for performance)
  const allBarangays = useMemo(() => getAllBarangayNames(), []);

  // Filter barangays based on search
  const filteredBarangays = useMemo(() => {
    if (!barangaySearch) return allBarangays.slice(0, 50); // Show first 50 by default
    return allBarangays
      .filter(b => b.toLowerCase().includes(barangaySearch.toLowerCase()))
      .slice(0, 100); // Limit to 100 results
  }, [allBarangays, barangaySearch]);

  const [formData, setFormData] = useState({
    species: initialData?.species || "",
    common_name: initialData?.common_name || "",
    status: initialData?.status || "alive",
    health: initialData?.health || "healthy",
    latitude: initialData?.latitude || null as number | null,
    longitude: initialData?.longitude || null as number | null,
    address: initialData?.address || "",
    barangay: initialData?.barangay || "",
    planted_date: initialData?.planted_date || "",
    height_meters: initialData?.height_meters || null as number | null,
    diameter_cm: initialData?.diameter_cm || null as number | null,
    age_years: initialData?.age_years || null as number | null,
    notes: initialData?.notes || "",
    photos: normalizeInitialPhotos(initialData?.photos),
  });

  const suggestedYear = useMemo(() => {
    if (formData.planted_date) {
      const parsedDate = new Date(formData.planted_date);
      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate.getFullYear();
      }
    }
    return new Date().getFullYear();
  }, [formData.planted_date]);

  const currentCodeYear = useMemo(() => {
    const match = treeCode.match(/^(\d{4})-\d{4}$/);
    return match ? Number(match[1]) : null;
  }, [treeCode]);

  const shouldFetchSuggestion = useMemo(() => {
    if (!isAutoCode) return false;
    if (!treeCode) return true;
    if (mode === "add" && !treeCode) return true;
    if (currentCodeYear !== null && currentCodeYear !== suggestedYear) return true;
    return false;
  }, [currentCodeYear, isAutoCode, mode, suggestedYear, treeCode]);

  const suggestionQuery = useQuery({
    queryKey: ["tree-inventory", "next-tree-code", suggestedYear],
    queryFn: () => fetchNextTreeCode(suggestedYear),
    enabled: shouldFetchSuggestion,
    staleTime: 0,
  });

  useEffect(() => {
    if (!isAutoCode) return;
    const nextCode = suggestionQuery.data?.tree_code?.toUpperCase();
    if (nextCode && nextCode !== treeCode) {
      setTreeCode(nextCode);
    }
  }, [isAutoCode, suggestionQuery.data, treeCode]);

  useEffect(() => {
    const normalizedInitialCode = (initialData?.tree_code ?? "").toUpperCase();
    setTreeCode(normalizedInitialCode);
    if (mode === "add") {
      setIsAutoCode(true);
    } else if (!normalizedInitialCode) {
      setIsAutoCode(true);
    } else {
      setIsAutoCode(TREE_CODE_PATTERN.test(normalizedInitialCode));
    }
    setFormError(null);
  }, [initialData?.tree_code, mode]);

  // Fetch species from database
  const { data: speciesList = [], isLoading: speciesLoading } = useTreeSpecies();
  const createSpeciesMutation = useCreateSpecies();

  const [customSpecies, setCustomSpecies] = useState({
    scientific_name: "",
    common_name: "",
    local_name: "",
  });

  const handleTreeCodeChange = useCallback((value: string) => {
    setTreeCode(value.toUpperCase());
    setIsAutoCode(false);
    setFormError(null);
  }, []);

  const handleUseSuggestedCode = useCallback(async () => {
    setIsAutoCode(true);
    setFormError(null);
    setTreeCode("");
    const result = await suggestionQuery.refetch({ throwOnError: false, cancelRefetch: false });
    const nextCode = result.data?.tree_code?.toUpperCase();
    if (nextCode) {
      setTreeCode(nextCode);
    }
  }, [suggestionQuery]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStatusChange = (newStatus: string) => {
    // Auto-set health to dead when status is cut
    const typedStatus = newStatus as "alive" | "cut" | "dead" | "replaced" | "unknown";
    if (newStatus === "cut") {
      setFormData((prev) => ({ ...prev, status: typedStatus, health: "dead" }));
    } else {
      setFormData((prev) => ({ ...prev, status: typedStatus }));
    }
  };

  const handleSpeciesSelect = (species: TreeSpecies) => {
    const commonName = species.common_name || species.local_name || species.scientific_name || "Unknown";
    setFormData((prev) => ({
      ...prev,
      species: species.scientific_name || "",
      common_name: commonName,
    }));
    setSpeciesSearch("");
  };

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        
        // Try to find matching barangay from various OSM fields
        // Philippine barangays can appear in: quarter, suburb, neighbourhood, village, hamlet
        let matchedBarangay = "";
        const addressParts = [
          addr.quarter,           // Often used for barangays in PH
          addr.suburb,
          addr.neighbourhood,
          addr.village,
          addr.hamlet,
          addr.city_district,
          addr.residential,
        ].filter(Boolean);
        
        // Use the library's barangay list for matching
        const allBrgyNames = getAllBarangayNames();
        
        // First try exact match
        for (const part of addressParts) {
          const exactMatch = allBrgyNames.find(b => 
            b.toLowerCase() === part.toLowerCase()
          );
          if (exactMatch) {
            matchedBarangay = exactMatch;
            break;
          }
        }
        
        // If no exact match, try partial match
        if (!matchedBarangay) {
          for (const part of addressParts) {
            const partialMatch = allBrgyNames.find(b => 
              part.toLowerCase().includes(b.toLowerCase()) ||
              b.toLowerCase().includes(part.toLowerCase())
            );
            if (partialMatch) {
              matchedBarangay = partialMatch;
              break;
            }
          }
        }

        // Build address string
        const addressStr = [
          addr.road || addr.street,
          addr.quarter || addr.suburb || addr.neighbourhood,
          addr.city || addr.town || addr.municipality
        ].filter(Boolean).join(", ");

        setFormData((prev) => ({
          ...prev,
          address: addressStr || prev.address,
          barangay: matchedBarangay || prev.barangay,
        }));
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  const handleMapPositionChange = useCallback((lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
    // Auto-populate address from coordinates
    reverseGeocode(lat, lng);
  }, [reverseGeocode]);

  const handleSearchLocationSelect = useCallback((lat: number, lng: number, address: string) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: address,
    }));
    // Also try to match barangay
    reverseGeocode(lat, lng);
  }, [reverseGeocode]);

  const handleClearCoordinates = () => {
    setFormData((prev) => ({
      ...prev,
      latitude: null,
      longitude: null,
      address: "",
      barangay: "",
    }));
  };

  const handleAddCustomSpecies = async () => {
    if (!canCreateSpecies) return;
    if (!customSpecies.common_name) return;
    
    try {
      const newSpecies = await createSpeciesMutation.mutateAsync({
        scientific_name: customSpecies.scientific_name || customSpecies.common_name,
        common_name: customSpecies.common_name,
        local_name: customSpecies.local_name || undefined,
      });
      
      // Select the newly created species
      const newCommonName = newSpecies.common_name || newSpecies.local_name || newSpecies.scientific_name || "Unknown";
      setFormData((prev) => ({
        ...prev,
        species: newSpecies.scientific_name || "",
        common_name: newCommonName,
      }));
      
      setShowCustomSpecies(false);
      setCustomSpecies({ scientific_name: "", common_name: "", local_name: "" });
    } catch (error) {
      // Error handled by mutation
    }
  };

  useEffect(() => {
    if (!canCreateSpecies && showCustomSpecies) {
      setShowCustomSpecies(false);
    }
  }, [canCreateSpecies, showCustomSpecies]);

  const handlePhotosChange = useCallback((photos: UploadedImage[]) => {
    setFormData((prev) => ({ ...prev, photos }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      // Convert photos to the format expected by the API
      const photosPayload = formData.photos.length > 0 
        ? formData.photos.map((photo) => ({
            url: photo.url,
            path: photo.path,
            filename: photo.filename,
            size: photo.size,
            uploaded_at: photo.uploaded_at,
            uploaded_by_id: photo.uploaded_by_id,
            uploaded_by_email: photo.uploaded_by_email,
          }))
        : undefined;

      const normalizedTreeCode = treeCode.trim().toUpperCase();

      const payload: TreeInventoryCreate = {
        species: formData.species || undefined,
        common_name: formData.common_name || "Unknown",
        status: formData.status as "alive" | "cut" | "dead" | "replaced" | "unknown",
        health: formData.health as "healthy" | "needs_attention" | "diseased" | "dead" | "unknown",
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        address: formData.address || undefined,
        barangay: formData.barangay || undefined,
        planted_date: formData.planted_date || undefined,
        height_meters: formData.height_meters || undefined,
        diameter_cm: formData.diameter_cm || undefined,
        age_years: formData.age_years || undefined,
        notes: formData.notes || undefined,
        photos: photosPayload,
      };

      if (normalizedTreeCode) {
        payload.tree_code = normalizedTreeCode;
      }
      await onSave(payload);
    } catch (error) {
      console.error("Error saving tree:", error);
      const apiError = (error as any)?.response?.data?.detail;
      setFormError(typeof apiError === "string" ? apiError : "Failed to save tree");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter species based on search
  const filteredSpecies = speciesList.filter(
    (s) => {
      const search = speciesSearch.toLowerCase();
      return (
        (s.scientific_name?.toLowerCase().includes(search)) ||
        s.common_name.toLowerCase().includes(search) ||
        (s.local_name?.toLowerCase().includes(search))
      );
    }
  );

  const mapCenter: [number, number] = formData.latitude && formData.longitude
    ? [formData.latitude, formData.longitude]
    : DEFAULT_CENTER;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tree Code */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Tree Code</h3>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="flex-1">
            <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Code</Label>
            <Input
              value={treeCode}
              onChange={(e) => handleTreeCodeChange(e.target.value)}
              placeholder="2027-0001"
              className="mt-1"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUseSuggestedCode}
            className="sm:mt-5"
            disabled={suggestionQuery.isLoading || suggestionQuery.isFetching}
          >
            {(suggestionQuery.isLoading || suggestionQuery.isFetching) && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {isAutoCode ? "Regenerate" : "Use suggested"}
          </Button>
        </div>
        <div className="text-xs text-gray-500">
          {isAutoCode ? (
            suggestionQuery.isFetching ? (
              "Generating next available code..."
            ) : (
              `Automatically generated using ${suggestedYear}.`
            )
          ) : (
            <span className="text-amber-600">Manual override active. Ensure the code follows YYYY-NNNN format.</span>
          )}
        </div>
        {suggestionQuery.isError && (
          <div className="text-xs text-red-500">
            Unable to fetch a suggested code right now. Please retry or enter a code manually.
          </div>
        )}
        {formError && (
          <div className="text-xs text-red-600">{formError}</div>
        )}
      </div>

      {/* Species Selection */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Tree Species</h3>
        
        {!showCustomSpecies ? (
          <div className="space-y-3">
            {/* Species Search/Filter */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search or select a species..."
                value={speciesSearch || formData.species}
                onChange={(e) => {
                  setSpeciesSearch(e.target.value);
                  if (!e.target.value) {
                    handleChange("species", "");
                    handleChange("common_name", "");
                  }
                }}
                className="pl-10 rounded-lg"
              />
            </div>

            {/* Species Options */}
            {(speciesSearch || !formData.species) && (
              <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                {speciesLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
                    Loading species...
                  </div>
                ) : filteredSpecies.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No species found. Try adding a custom one.
                  </div>
                ) : (
                  filteredSpecies.map((species) => (
                    <button
                      key={species.id}
                      type="button"
                      onClick={() => handleSpeciesSelect(species)}
                      className={`w-full text-left px-3 py-2 hover:bg-blue-50 border-b last:border-b-0 text-sm ${
                        formData.species === species.scientific_name ? "bg-blue-100" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{species.common_name || species.local_name || species.scientific_name}</div>
                          <div className="text-xs text-gray-500 italic">{species.scientific_name}</div>
                        </div>
                        <div className="flex gap-1">
                          {species.is_native && (
                            <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">Native</span>
                          )}
                          {species.is_endangered && (
                            <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded">Endangered</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Selected Species Display */}
            {formData.species && !speciesSearch && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="font-medium text-green-800">{formData.common_name || formData.species}</div>
                {formData.common_name && (
                  <div className="text-xs text-green-600 italic">{formData.species}</div>
                )}
              </div>
            )}

            {/* Custom Entry Option */}
            {canCreateSpecies && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCustomSpecies(true)}
                className="w-full rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Species
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg border">
            <div className="text-sm font-medium text-gray-700">Add New Species to Database</div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label className="text-xs">Common Name *</Label>
                <Input
                  value={customSpecies.common_name}
                  onChange={(e) => setCustomSpecies(prev => ({ ...prev, common_name: e.target.value }))}
                  placeholder="e.g., Narra, Mango, Mahogany"
                  className="mt-1 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Scientific Name</Label>
                  <Input
                    value={customSpecies.scientific_name}
                    onChange={(e) => setCustomSpecies(prev => ({ ...prev, scientific_name: e.target.value }))}
                    placeholder="e.g., Pterocarpus indicus"
                    className="mt-1 rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-xs">Local Name</Label>
                  <Input
                    value={customSpecies.local_name}
                    onChange={(e) => setCustomSpecies(prev => ({ ...prev, local_name: e.target.value }))}
                    placeholder="e.g., Narra"
                    className="mt-1 rounded-lg"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCustomSpecies(false)}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleAddCustomSpecies}
                disabled={!customSpecies.common_name || createSpeciesMutation.isPending}
                className="rounded-lg bg-[#0033a0] hover:bg-[#002a80] text-white"
              >
                {createSpeciesMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Add to Database
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Status & Health */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Status & Health</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Status</Label>
            <select
              value={formData.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            >
              <option value="unknown">Unknown</option>
              <option value="alive">Alive</option>
              <option value="cut">Cut</option>
              <option value="dead">Dead</option>
              <option value="replaced">Replaced</option>
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium">Health</Label>
            <select
              value={formData.health}
              onChange={(e) => handleChange("health", e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            >
              <option value="unknown">Unknown</option>
              <option value="healthy">Healthy</option>
              <option value="needs_attention">Needs Attention</option>
              <option value="diseased">Diseased</option>
              <option value="dead">Dead</option>
            </select>
          </div>
        </div>
      </div>

      {/* Location with Map */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Location</h3>
        
        <div className="text-sm text-gray-600">
          Click on the map to pin location or search for an address. Coordinates are optional.
        </div>

        {/* Map Picker with Search */}
        <div className="rounded-lg overflow-hidden border">
          <div className="h-56">
            <MapContainer
              center={mapCenter}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <SearchControl onLocationSelect={handleSearchLocationSelect} />
              <LocationPicker
                position={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : null}
                onPositionChange={handleMapPositionChange}
              />
            </MapContainer>
          </div>
          <div className="text-xs text-center text-gray-500 py-1.5 bg-gray-50 border-t">
            Search for a location or click on the map to set pin
            {isReverseGeocoding && (
              <span className="ml-2 inline-flex items-center">
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                Getting address...
              </span>
            )}
          </div>
        </div>

        {/* Coordinates Display */}
        {formData.latitude && formData.longitude && (
          <div className="flex items-center justify-between text-xs bg-green-50 p-2 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700 font-mono">
              <MapPin className="w-3 h-3" />
              {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearCoordinates}
              className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
        )}

        {/* Address Fields - Auto-populated */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <Label className="text-sm font-medium">Barangay</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search barangay..."
                value={barangaySearch || formData.barangay}
                onChange={(e) => {
                  setBarangaySearch(e.target.value);
                  if (!e.target.value) {
                    handleChange("barangay", "");
                  }
                }}
                className="pl-10 rounded-lg"
              />
            </div>
            {/* Barangay Dropdown */}
            {(barangaySearch && !formData.barangay) && (
              <div className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    handleChange("barangay", "Unknown");
                    setBarangaySearch("");
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b text-sm text-gray-500"
                >
                  Unknown
                </button>
                {filteredBarangays.map((brgy, idx) => (
                  <button
                    key={`${brgy}-${idx}`}
                    type="button"
                    onClick={() => {
                      handleChange("barangay", brgy);
                      setBarangaySearch("");
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b last:border-b-0 text-sm"
                  >
                    {brgy}
                  </button>
                ))}
                {filteredBarangays.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">No barangays found</div>
                )}
              </div>
            )}
            {/* Selected Barangay */}
            {formData.barangay && !barangaySearch && (
              <div className="mt-1 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-sm text-green-800 dark:text-green-300 flex justify-between items-center">
                <span>{formData.barangay}</span>
                <button
                  type="button"
                  onClick={() => handleChange("barangay", "")}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <div>
            <Label className="text-sm font-medium">Address/Landmark</Label>
            <Input
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Auto-filled from map or enter manually"
              className="mt-1 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Optional Measurements */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
          Measurements <span className="font-normal text-gray-400">(Optional)</span>
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-sm font-medium">Height</Label>
            <div className="flex mt-1">
              <Input
                type="number"
                step="0.1"
                min="0"
                value={formData.height_meters || ""}
                onChange={(e) => handleChange("height_meters", e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="—"
                className="rounded-l-lg rounded-r-none"
              />
              <span className="px-2 py-2 bg-gray-100 border border-l-0 rounded-r-lg text-sm text-gray-500">m</span>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Diameter</Label>
            <div className="flex mt-1">
              <Input
                type="number"
                step="0.1"
                min="0"
                value={formData.diameter_cm || ""}
                onChange={(e) => handleChange("diameter_cm", e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="—"
                className="rounded-l-lg rounded-r-none"
              />
              <span className="px-2 py-2 bg-gray-100 border border-l-0 rounded-r-lg text-sm text-gray-500">cm</span>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Age</Label>
            <div className="flex mt-1">
              <Input
                type="number"
                min="0"
                value={formData.age_years || ""}
                onChange={(e) => handleChange("age_years", e.target.value ? parseInt(e.target.value) : null)}
                placeholder="—"
                className="rounded-l-lg rounded-r-none"
              />
              <span className="px-2 py-2 bg-gray-100 border border-l-0 rounded-r-lg text-sm text-gray-500">yr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
          Additional Info <span className="font-normal text-gray-400">(Optional)</span>
        </h3>
        <div>
          <Label className="text-sm font-medium">Date Planted</Label>
          <Input
            type="date"
            value={formData.planted_date}
            onChange={(e) => handleChange("planted_date", e.target.value)}
            className="mt-1 rounded-lg"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Notes</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Any additional observations..."
            rows={2}
            className="mt-1 rounded-lg"
          />
        </div>
      </div>

      {/* Photo Documentation */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
          Photo Documentation <span className="font-normal text-gray-400">(Optional)</span>
        </h3>
        <TreeImageUpload
          initialPhotos={formData.photos}
          onPhotosChange={handlePhotosChange}
          treeId={initialData?.id}
          maxImages={10}
          disabled={isSubmitting}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? "Saving..." : mode === "add" ? "Add Tree" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default TreeForm;

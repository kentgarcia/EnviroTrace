
// client/src/presentation/roles/urban-greening/pages/greening-projects/components/GreeningProjectForm.tsx
/**
 * Form for creating/editing Urban Greening Projects
 * Plants array with species lookup from database
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/presentation/components/shared/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/presentation/components/shared/ui/tabs";
import {
  Plus,
  Trash2,
  Search,
  TreePine,
  MapPin,
  Sprout,
  Calendar,
  User,
  Building2,
  Loader2,
  X,
  Link as LinkIcon,
  Copy,
} from "lucide-react";
import {
  UrbanGreeningProject,
  UrbanGreeningProjectCreate,
  ProjectType,
  PlantType,
} from "@/core/api/urban-greening-project-api";
import { useUrbanGreeningProjectMutations } from "../logic/useUrbanGreeningProjects";
import { useTreeInventory, useTreeSpecies } from "@/presentation/roles/urban-greening/pages/tree-inventory/logic/useTreeInventory";
import { createTreeSpecies, TreeSpeciesCreate } from "@/core/api/tree-inventory-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/core/hooks/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/presentation/components/shared/ui/dialog";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import L from "leaflet";
import { barangays } from "phil-reg-prov-mun-brgy";
import { CreatableCombobox } from "@/presentation/components/shared/ui/creatable-combobox";
import { Control } from "react-hook-form";

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

// Get all barangay names
const getAllBarangayNames = (): string[] => {
  return barangays.map((b: PhilLocation) => b.name);
};

// Default center - San Fernando, Pampanga
const DEFAULT_CENTER: [number, number] = [15.0287, 120.6880];

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

const PROJECT_TYPE_OPTIONS = [
    { value: "replacement", label: "Replacement" },
    { value: "new_greening", label: "New Greening" },
    { value: "reforestation", label: "Reforestation" },
    { value: "beautification", label: "Beautification" },
];

const STATUS_OPTIONS = [
    { value: "planning", label: "Planning" },
    { value: "procurement", label: "Procurement" },
    { value: "ready", label: "Ready" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

const PLANT_TYPE_OPTIONS = [
  { value: "tree", label: "Trees" },
  { value: "ornamental", label: "Ornamental Plants" },
  { value: "ornamental_private", label: "Ornamental Plants (Private)" },
  { value: "seeds", label: "Seeds" },
  { value: "seeds_private", label: "Seeds (Private)" },
];

const projectSchema = z.object({
  project_type: z.string().min(1, "Project type is required"),
  status: z.string().min(1, "Status is required"),
  note: z.string().optional(),
  contact_number: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  barangay: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  planting_date: z.string().optional(),
  date_received: z.string().optional(),
  date_sapling_received: z.string().optional(),
  date_of_inspection: z.string().optional(),
  project_lead: z.string().optional(),
  organization: z.string().optional(),
  linked_request_ids: z.array(z.string()).optional(),
  plants: z.array(
    z.object({
      species_name: z.string().min(1, "Species name is required"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
    })
  ).min(1, "At least one plant is required"),
});

type ProjectFormData = z.infer<typeof projectSchema>;

// Plant Item Component (single row for each plant)
const PlantItem = ({ 
  index, 
  control, 
  remove, 
  species, 
  onAddSpecies 
}: { 
  index: number; 
  control: Control<ProjectFormData>; 
  remove: (index: number) => void; 
  species: any[];
  onAddSpecies: (index: number, currentName: string) => void;
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    if (showDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showDropdown]);

  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1">
        <FormField
          control={control}
          name={`plants.${index}.species_name`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    placeholder="Species Name"
                    className="bg-white"
                    onFocus={(e) => {
                      e.stopPropagation();
                      setShowDropdown(true);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(true);
                    }}
                    onChange={(e) => {
                      field.onChange(e);
                      setShowDropdown(true);
                    }}
                  />
                  {showDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto left-0">
                      {species
                        .filter((s) =>
                          s.common_name.toLowerCase().includes((field.value || "").toLowerCase()) ||
                          (s.scientific_name && s.scientific_name.toLowerCase().includes((field.value || "").toLowerCase()))
                        )
                        .slice(0, 10)
                        .map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              field.onChange(s.common_name);
                              setShowDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm border-b border-gray-100"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{s.common_name}</span>
                              {s.species_type && (
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  s.species_type === 'Tree' ? 'bg-emerald-100 text-emerald-700' :
                                  s.species_type === 'Ornamental' ? 'bg-purple-100 text-purple-700' :
                                  s.species_type === 'Seed' ? 'bg-amber-100 text-amber-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {s.species_type}
                                </span>
                              )}
                            </div>
                            {s.scientific_name && (
                              <div className="text-xs text-gray-500 italic">{s.scientific_name}</div>
                            )}
                          </button>
                        ))}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddSpecies(index, field.value);
                          setShowDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm bg-blue-50/50 text-blue-600 font-medium"
                      >
                        <Plus className="w-4 h-4 inline mr-2" />
                        Add "{field.value}" as new species
                      </button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="w-[100px]">
        <FormField
          control={control}
          name={`plants.${index}.quantity`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  className="bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => remove(index)}
        className="h-10 w-8 text-gray-400 hover:text-red-500 flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};


interface GreeningProjectFormProps {
  mode: "add" | "edit";
  initialData?: UrbanGreeningProject | null;
  preselectedType?: ProjectType;
  linkedRequestId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const GreeningProjectForm: React.FC<GreeningProjectFormProps> = ({
  mode,
  initialData,
  preselectedType,
  linkedRequestId,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showTreeSearch, setShowTreeSearch] = useState(false);
  const [selectedReplacementTrees, setSelectedReplacementTrees] = useState<
    { id: string; code: string; species: string }[]
  >([]);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [barangaySearch, setBarangaySearch] = useState("");
  const [addSpeciesTarget, setAddSpeciesTarget] = useState<{plantIndex: number} | null>(null);
  const [isAddSpeciesOpen, setIsAddSpeciesOpen] = useState(false);
  const [newSpeciesForm, setNewSpeciesForm] = useState<TreeSpeciesCreate>({
    common_name: "",
    scientific_name: "",
    description: "",
    species_type: "Tree",
  });

  const { createMutation, updateMutation } = useUrbanGreeningProjectMutations();
  const { data: trees = [] } = useTreeInventory({ status: "cut", search: searchTerm });
  const { data: species = [] } = useTreeSpecies();

  // Create species mutation
  const createSpeciesMutation = useMutation({
    mutationFn: createTreeSpecies,
    onSuccess: (newSpecies) => {
      queryClient.invalidateQueries({ queryKey: ["tree-species"] });
      if (addSpeciesTarget) {
        form.setValue(`plants.${addSpeciesTarget.plantIndex}.species_name`, newSpecies.common_name);
      }
      toast({
        title: "Success",
        description: "Species added successfully",
      });
      setIsAddSpeciesOpen(false);
      setNewSpeciesForm({ common_name: "", scientific_name: "", description: "", species_type: "Tree" });
      setAddSpeciesTarget(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to add species",
        variant: "destructive",
      });
    },
  });

  // Get all barangay names (memoized for performance)
  const allBarangays = useMemo(() => getAllBarangayNames(), []);

  // Filter barangays based on search
  const filteredBarangays = useMemo(() => {
    if (!barangaySearch) return allBarangays.slice(0, 50);
    return allBarangays
      .filter(b => b.toLowerCase().includes(barangaySearch.toLowerCase()))
      .slice(0, 100);
  }, [allBarangays, barangaySearch]);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      project_type: preselectedType || "new_greening",
      status: "planning",
      note: "",
      contact_number: "",
      location: "",
      barangay: "",
      latitude: undefined,
      longitude: undefined,
      planting_date: "",
      date_received: new Date().toISOString().split("T")[0],
      date_sapling_received: "",
      date_of_inspection: "",
      project_lead: "",
      organization: "",
      linked_request_ids: linkedRequestId ? [linkedRequestId] : [],
      plants: [{ species_name: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "plants",
  });

  const projectType = form.watch("project_type");

  // Initialize form with existing data
  useEffect(() => {
    if (mode === "edit" && initialData) {
      // Simple mapping of plants
      const plants = initialData.plants?.map((p: any) => ({
        species_name: p.species || p.common_name || "",
        quantity: p.quantity
      })) || [];

      form.reset({
        project_type: initialData.project_type,
        status: initialData.status || "planning",
        note: initialData.description || "",
        contact_number: (initialData as any).contact_number || "",
        location: initialData.location,
        barangay: initialData.barangay || "",
        latitude: initialData.latitude,
        longitude: initialData.longitude,
        planting_date: (initialData as any).planting_date?.split("T")[0] || "",
        date_received: (initialData as any).date_received?.split("T")[0] || "",
        date_sapling_received: (initialData as any).date_sapling_received?.split("T")[0] || "",
        date_of_inspection: (initialData as any).date_of_inspection?.split("T")[0] || "",
        project_lead: initialData.project_lead || "",
        organization: initialData.organization || "",
        linked_request_ids: initialData.linked_cutting_request_id ? [initialData.linked_cutting_request_id] : [],
        plants: plants.length > 0 ? plants : [{ species_name: "", quantity: 1 }],
      });
    }
  }, [mode, initialData, form]);

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    form.setValue("latitude", lat);
    form.setValue("longitude", lng);
    // Auto-populate location with coordinates if no address
    const locationText = address || `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    form.setValue("location", locationText);
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
        
        // Try to find matching barangay
        let matchedBarangay = "";
        const addressParts = [
          addr.quarter,
          addr.suburb,
          addr.neighbourhood,
          addr.village,
          addr.hamlet,
          addr.city_district,
          addr.residential,
        ].filter(Boolean);
        
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

        form.setValue("location", addressStr || `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`);
        if (matchedBarangay) {
          form.setValue("barangay", matchedBarangay);
        }
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, [form]);

  const handleMapPositionChange = useCallback((lat: number, lng: number) => {
    form.setValue("latitude", lat);
    form.setValue("longitude", lng);
    // Auto-populate address from coordinates
    reverseGeocode(lat, lng);
  }, [form, reverseGeocode]);

  const handleSearchLocationSelect = useCallback((lat: number, lng: number, address: string) => {
    form.setValue("latitude", lat);
    form.setValue("longitude", lng);
    form.setValue("location", address);
    // Also try to match barangay
    reverseGeocode(lat, lng);
  }, [form, reverseGeocode]);

  const handleClearCoordinates = () => {
    form.setValue("latitude", undefined);
    form.setValue("longitude", undefined);
    form.setValue("location", "");
    form.setValue("barangay", "");
  };

  const handleAddReplacementTree = (tree: { id: string; code: string; species: string }) => {
    if (!selectedReplacementTrees.find((t) => t.id === tree.id)) {
      setSelectedReplacementTrees([...selectedReplacementTrees, tree]);
    }
    setShowTreeSearch(false);
    setSearchTerm("");
  };

  const handleRemoveReplacementTree = (treeId: string) => {
    setSelectedReplacementTrees(selectedReplacementTrees.filter((t) => t.id !== treeId));
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      // Lookup species_type for each plant from species database
      const plants = data.plants.map((p) => {
        const speciesInfo = species.find(s => s.common_name === p.species_name);
        return {
          plant_type: speciesInfo?.species_type?.toLowerCase() || "other",
          species: p.species_name || undefined,
          common_name: p.species_name,
          quantity: p.quantity,
        };
      });

      // Convert empty strings to undefined for date fields
      const payload: UrbanGreeningProjectCreate = {
        project_type: data.project_type,
        status: data.status,
        description: data.note || undefined,
        location: data.location,
        barangay: data.barangay || undefined,
        latitude: data.latitude,
        longitude: data.longitude,
        planting_date: data.planting_date || undefined,
        date_received_of_request: data.date_received || undefined,
        date_sapling_received: data.date_sapling_received || undefined,
        date_of_inspection: data.date_of_inspection || undefined,
        project_lead: data.project_lead || undefined,
        organization: data.organization || undefined,
        linked_cutting_request_id: data.linked_request_ids?.[0] || undefined,
        linked_cut_tree_ids:
          projectType === "replacement" && selectedReplacementTrees.length > 0
            ? selectedReplacementTrees.map((t) => t.id)
            : undefined,
        plants: plants,
        contact_number: data.contact_number || undefined,
      } as any;

      if (mode === "add") {
        await createMutation.mutateAsync(payload);
      } else if (initialData?.id) {
        await updateMutation.mutateAsync({ id: initialData.id, data: payload as any });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save project",
        variant: "destructive",
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;



  const handleCreateSpecies = (e: React.FormEvent) => {
    e.preventDefault();
    createSpeciesMutation.mutate(newSpeciesForm);
  };

  return (
    <>
      {/* Add Species Dialog */}
      <Dialog open={isAddSpeciesOpen} onOpenChange={setIsAddSpeciesOpen}>
        <DialogContent className="rounded-lg">
          <DialogHeader>
            <DialogTitle>Add New Species</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSpecies} className="space-y-4">
            <div>
              <Label htmlFor="new-common-name">Common Name *</Label>
              <Input
                id="new-common-name"
                value={newSpeciesForm.common_name}
                onChange={(e) =>
                  setNewSpeciesForm({ ...newSpeciesForm, common_name: e.target.value })
                }
                required
                className="rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="new-species-type">Species Type</Label>
              <Input
                id="new-species-type"
                value={newSpeciesForm.species_type || "Tree"}
                readOnly
                className="rounded-lg bg-gray-50 text-gray-600"
                title="Automatically determined from plant type"
              />
              <p className="text-xs text-gray-500 mt-1">
                Automatically set based on the selected plant type
              </p>
            </div>
            <div>
              <Label htmlFor="new-scientific-name">Scientific Name</Label>
              <Input
                id="new-scientific-name"
                value={newSpeciesForm.scientific_name}
                onChange={(e) =>
                  setNewSpeciesForm({ ...newSpeciesForm, scientific_name: e.target.value })
                }
                className="rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="new-description">Description</Label>
              <Textarea
                id="new-description"
                value={newSpeciesForm.description}
                onChange={(e) =>
                  setNewSpeciesForm({ ...newSpeciesForm, description: e.target.value })
                }
                rows={3}
                className="rounded-lg"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddSpeciesOpen(false)}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg"
                disabled={createSpeciesMutation.isPending}
              >
                {createSpeciesMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Add Species
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Project Details</TabsTrigger>
            <TabsTrigger value="plants">Plants</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Reference Number (Display Only in Edit Mode) */}
            {mode === "edit" && initialData && (
              <div>
                <Label className="text-sm text-gray-600">Reference No.</Label>
                <div className="font-mono text-sm font-medium p-2 bg-gray-50 rounded border">
                  {initialData.project_code || "Auto-generated"}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="project_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type *</FormLabel>
                      <FormControl>
                        <CreatableCombobox
                          items={PROJECT_TYPE_OPTIONS}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select or type..."
                          className="bg-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <FormControl>
                      <CreatableCombobox
                        items={STATUS_OPTIONS}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select status..."
                        className="bg-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="date_received"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Date Received of Request
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date_sapling_received"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Date Sapling/Plants/Seeds Received
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date_of_inspection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Date of Inspection
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <FormField
              control={form.control}
              name="planting_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Planting Date
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add any additional notes or observations"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Replacement Trees (only for replacement projects) */}
            {projectType === "replacement" && (
              <Card className="border border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-amber-600" />
                      Link to Cut Trees (Optional)
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTreeSearch(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Tree
                    </Button>
                  </div>

                  {selectedReplacementTrees.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {selectedReplacementTrees.map((tree) => (
                        <div
                          key={tree.id}
                          className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center gap-2">
                            <TreePine className="w-4 h-4 text-gray-500" />
                            <span className="font-mono text-sm">{tree.code}</span>
                            <span className="text-sm text-gray-600">{tree.species}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveReplacementTree(tree.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {showTreeSearch && (
                    <div className="mt-3 p-3 bg-white rounded-lg border">
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search cut trees by code or species..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {trees.slice(0, 10).map((tree) => (
                          <button
                            key={tree.id}
                            type="button"
                            className="w-full p-2 text-left hover:bg-gray-100 rounded flex items-center justify-between"
                            onClick={() =>
                              handleAddReplacementTree({
                                id: tree.id,
                                code: tree.tree_code,
                                species: tree.common_name || tree.species || "Unknown",
                              })
                            }
                          >
                            <div className="flex items-center gap-2">
                              <TreePine className="w-4 h-4 text-gray-400" />
                              <span className="font-mono text-sm">{tree.tree_code}</span>
                              <span className="text-sm text-gray-600">
                                {tree.common_name || tree.species}
                              </span>
                            </div>
                          </button>
                        ))}
                        {trees.length === 0 && (
                          <div className="text-sm text-gray-500 text-center py-2">
                            No cut trees found
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => setShowTreeSearch(false)}
                      >
                        Close Search
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="project_lead"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Responsible Person
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter full name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., +63 912 345 6789" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    Organization
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Organization or office" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* Plants Tab */}
          <TabsContent value="plants" className="space-y-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <Label className="text-base font-semibold">Project Plants</Label>
                <p className="text-sm text-gray-500 mt-1">Species type is automatically determined from the species database</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ species_name: "", quantity: 1 })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Plant
              </Button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-[1fr,100px,32px] gap-2 text-sm text-gray-500 font-medium px-1">
                <div>Species</div>
                <div>Quantity</div>
              </div>
              {fields.map((field, index) => (
                <PlantItem
                  key={field.id}
                  index={index}
                  control={form.control}
                  remove={remove}
                  species={species}
                  onAddSpecies={(plantIdx, name) => {
                     setAddSpeciesTarget({ plantIndex: plantIdx });
                     setNewSpeciesForm({
                       common_name: name,
                       scientific_name: "",
                       description: "",
                       species_type: "Other",
                     });
                     setIsAddSpeciesOpen(true);
                  }}
                />
              ))}
            </div>

            {/* Summary */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Plants</span>
                  <span className="text-lg font-bold text-green-600">
                     {form.watch("plants")?.reduce((total, p) => total + (p.quantity || 0), 0) || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="space-y-4 mt-4">
            <div className="text-sm text-gray-600">
              Click on the map to pin location or search for an address. Coordinates are optional.
            </div>

            {/* Map Picker with Search */}
            <div className="rounded-lg overflow-hidden border">
              <div className="h-80">
                <MapContainer
                  center={form.watch("latitude") && form.watch("longitude") 
                    ? [form.watch("latitude")!, form.watch("longitude")!]
                    : DEFAULT_CENTER
                  }
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <SearchControl onLocationSelect={handleSearchLocationSelect} />
                  <LocationPicker
                    position={form.watch("latitude") && form.watch("longitude") 
                      ? [form.watch("latitude")!, form.watch("longitude")!]
                      : null
                    }
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
            {form.watch("latitude") && form.watch("longitude") && (
              <div className="flex items-center justify-between text-xs bg-green-50 p-2 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700 font-mono">
                  <MapPin className="w-3 h-3" />
                  {form.watch("latitude")!.toFixed(6)}, {form.watch("longitude")!.toFixed(6)}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <FormLabel>Barangay</FormLabel>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                  <Input
                    placeholder="Search barangay..."
                    value={barangaySearch || form.watch("barangay") || ""}
                    onChange={(e) => {
                      setBarangaySearch(e.target.value);
                      if (!e.target.value) {
                        form.setValue("barangay", "");
                      }
                    }}
                    className="pl-10 rounded-lg"
                  />
                </div>
                {/* Barangay Dropdown */}
                {(barangaySearch && !form.watch("barangay")) && (
                  <div className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
                    {filteredBarangays.map((brgy, idx) => (
                      <button
                        key={`${brgy}-${idx}`}
                        type="button"
                        onClick={() => {
                          form.setValue("barangay", brgy);
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
                {form.watch("barangay") && !barangaySearch && (
                  <div className="mt-1 p-2 bg-green-50 rounded-lg border border-green-200 text-sm text-green-800 flex justify-between items-center">
                    <span>{form.watch("barangay")}</span>
                    <button
                      type="button"
                      onClick={() => form.setValue("barangay", "")}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Location / Address *
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Auto-filled from map or enter manually" className="rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {mode === "add" ? "Create Project" : "Update Project"}
          </Button>
        </div>
      </form>
    </Form>
    </>
  );
};

export default GreeningProjectForm;

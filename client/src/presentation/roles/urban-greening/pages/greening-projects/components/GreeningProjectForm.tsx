// client/src/presentation/roles/urban-greening/pages/greening-projects/components/GreeningProjectForm.tsx
/**
 * Form for creating/editing Urban Greening Projects
 * Supports replacement projects (linked to cut trees) and new greening projects
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/shared/ui/select";
import {
  Plus,
  Trash2,
  Search,
  TreePine,
  Leaf,
  Flower2,
  MapPin,
  Sprout,
  Calendar,
  User,
  Building2,
  Loader2,
  X,
  Link as LinkIcon,
} from "lucide-react";
import {
  UrbanGreeningProject,
  UrbanGreeningProjectCreate,
  ProjectType,
  PlantType,
  ProjectPlant,
  ProjectStatus,
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

const PLANT_TYPES: { value: PlantType; label: string; icon: React.ReactNode }[] = [
  { value: "tree", label: "Trees", icon: <TreePine className="w-4 h-4" /> },
  { value: "ornamental", label: "Ornamental Plants", icon: <Flower2 className="w-4 h-4" /> },
  { value: "ornamental_private", label: "Ornamental Plants (Private)", icon: <Flower2 className="w-4 h-4" /> },
  { value: "seeds", label: "Seeds", icon: <Sprout className="w-4 h-4" /> },
  { value: "seeds_private", label: "Seeds (Private)", icon: <Sprout className="w-4 h-4" /> },
  { value: "other", label: "Other", icon: <Leaf className="w-4 h-4" /> },
];

const projectSchema = z.object({
  project_type: z.enum(["replacement", "new_greening", "reforestation", "beautification", "other"]),
  status: z.enum(["planning", "procurement", "ready", "in_progress", "completed", "cancelled"]),
  note: z.string().optional(),
  contact_number: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  barangay: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  planting_date: z.string().optional(),
  project_lead: z.string().optional(),
  organization: z.string().optional(),
  linked_request_ids: z.array(z.string()).optional(),
  plants: z.array(
    z.object({
      plant_type: z.enum(["tree", "ornamental", "ornamental_private", "seeds", "seeds_private", "other"]),
      species_name: z.string().min(1, "Species name is required"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
    })
  ).min(1, "At least one plant entry is required"),
});

type ProjectFormData = z.infer<typeof projectSchema>;

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
  const [showSpeciesDropdown, setShowSpeciesDropdown] = useState<number | null>(null);
  const [isAddSpeciesOpen, setIsAddSpeciesOpen] = useState(false);
  const [currentPlantIndex, setCurrentPlantIndex] = useState<number | null>(null);
  const [newSpeciesForm, setNewSpeciesForm] = useState<TreeSpeciesCreate>({
    common_name: "",
    scientific_name: "",
    description: "",
  });

  const { createMutation, updateMutation } = useUrbanGreeningProjectMutations();
  const { data: trees = [] } = useTreeInventory({ status: "cut", search: searchTerm });
  const { data: species = [] } = useTreeSpecies();

  // Create species mutation
  const createSpeciesMutation = useMutation({
    mutationFn: createTreeSpecies,
    onSuccess: (newSpecies) => {
      queryClient.invalidateQueries({ queryKey: ["tree-species"] });
      if (currentPlantIndex !== null) {
        form.setValue(`plants.${currentPlantIndex}.species_name`, newSpecies.common_name);
      }
      toast({
        title: "Success",
        description: "Species added successfully",
      });
      setIsAddSpeciesOpen(false);
      setNewSpeciesForm({ common_name: "", scientific_name: "", description: "" });
      setCurrentPlantIndex(null);
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
      project_lead: "",
      organization: "",
      linked_request_ids: linkedRequestId ? [linkedRequestId] : [],
      plants: [
        {
          plant_type: "tree",
          species_name: "",
          quantity: 1,
        },
      ],
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
        project_lead: initialData.project_lead || "",
        organization: initialData.organization || "",
        linked_request_ids: initialData.linked_cutting_request_id ? [initialData.linked_cutting_request_id] : [],
        plants: initialData.plants?.length
          ? initialData.plants.map((p) => ({
              plant_type: p.plant_type,
              species_name: p.species || p.common_name || "",
              quantity: p.quantity,
            }))
          : [
              {
                plant_type: "tree" as PlantType,
                species_name: "",
                quantity: 1,
              },
            ],
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

  const handleSpeciesSelect = (index: number, speciesId: string) => {
    const selectedSpecies = species.find((s) => s.id === speciesId);
    if (selectedSpecies) {
      form.setValue(`plants.${index}.species_id`, speciesId);
      form.setValue(`plants.${index}.species_name`, selectedSpecies.scientific_name);
      form.setValue(`plants.${index}.common_name`, selectedSpecies.common_name || "");
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const payload: UrbanGreeningProjectCreate = {
        project_type: data.project_type,
        status: data.status,
        description: data.note,
        location: data.location,
        barangay: data.barangay,
        latitude: data.latitude,
        longitude: data.longitude,
        planting_date: data.planting_date,
        project_lead: data.project_lead,
        organization: data.organization,
        linked_cutting_request_id: data.linked_request_ids?.[0],
        linked_cut_tree_ids:
          projectType === "replacement"
            ? selectedReplacementTrees.map((t) => t.id)
            : undefined,
        plants: data.plants.map((p) => ({
          plant_type: p.plant_type,
          species: p.species_name,
          common_name: p.species_name,
          quantity: p.quantity,
        })),
        contact_number: data.contact_number,
      } as any;

      if (mode === "add") {
        await createMutation.mutateAsync(payload);
      } else if (initialData?.id) {
        await updateMutation.mutateAsync({ id: initialData.id, data: payload as any });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = () => setShowSpeciesDropdown(null);
    if (showSpeciesDropdown !== null) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showSpeciesDropdown]);

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
            {/* Record Number (Edit mode only) */}
            {mode === "edit" && initialData && (
              <div>
                <Label className="text-sm text-gray-600">Record Number</Label>
                <div className="font-mono text-sm font-medium p-2 bg-gray-50 rounded border">
                  {initialData.project_code || initialData.id}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="project_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Type *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="replacement">Replacement</SelectItem>
                        <SelectItem value="new_greening">New Greening</SelectItem>
                        <SelectItem value="reforestation">Reforestation</SelectItem>
                        <SelectItem value="beautification">Beautification</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="procurement">Procurement</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
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
                          className="flex items-center justify-between p-2 bg-white rounded-lg border"
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
            <div className="flex items-center justify-between">
              <Label>Plants to be Added *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    plant_type: "tree",
                    species_name: "",
                    quantity: 1,
                  })
                }
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Plant
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Sprout className="w-4 h-4" />
                        Plant Entry #{index + 1}
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`plants.${index}.plant_type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plant Type *</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PLANT_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center gap-2">
                                      {type.icon}
                                      {type.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`plants.${index}.species_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Species Name *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  placeholder="Search species..."
                                  onFocus={() => setShowSpeciesDropdown(index)}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    setShowSpeciesDropdown(index);
                                  }}
                                />
                                {showSpeciesDropdown === index && field.value && (
                                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {species
                                      .filter((s) =>
                                        s.common_name.toLowerCase().includes(field.value.toLowerCase()) ||
                                        (s.scientific_name && s.scientific_name.toLowerCase().includes(field.value.toLowerCase()))
                                      )
                                      .slice(0, 10)
                                      .map((s) => (
                                        <button
                                          key={s.id}
                                          type="button"
                                          onClick={() => {
                                            field.onChange(s.common_name);
                                            setShowSpeciesDropdown(null);
                                          }}
                                          className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm border-b border-gray-100"
                                        >
                                          <div className="font-medium">{s.common_name}</div>
                                          {s.scientific_name && (
                                            <div className="text-xs text-gray-500 italic">{s.scientific_name}</div>
                                          )}
                                        </button>
                                      ))}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCurrentPlantIndex(index);
                                        setNewSpeciesForm({
                                          common_name: field.value || "",
                                          scientific_name: "",
                                          description: "",
                                        });
                                        setIsAddSpeciesOpen(true);
                                        setShowSpeciesDropdown(null);
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

                      <FormField
                        control={form.control}
                        name={`plants.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Plants</span>
                  <span className="text-lg font-bold text-green-600">
                    {fields.reduce((sum, _, i) => sum + (form.watch(`plants.${i}.quantity`) || 0), 0)}
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
                  <div className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto border rounded-lg bg-white shadow-lg">
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

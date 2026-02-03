// client/src/presentation/components/shared/species/SpeciesForm.tsx
/**
 * Shared Species Form Component
 * Used by both Tree Inventory and Greening Projects for managing tree species
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { TreeSpecies, TreeSpeciesCreate, fetchTreeSpecies } from "@/core/api/tree-inventory-api";
import { Leaf, AlertCircle, ChevronDown, ChevronUp, Ruler, Wind, Trash2 } from "lucide-react";
import { CreatableCombobox, ComboboxItem } from "@/presentation/components/shared/ui/creatable-combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/shared/ui/select";

interface SpeciesFormProps {
  mode: "add" | "edit";
  initialData?: TreeSpecies;
  onSave: (data: TreeSpeciesCreate) => Promise<void>;
  onCancel: () => void;
}

const GROWTH_SPEED_OPTIONS = ["Slow", "Moderate", "Fast"];
const BASE_SPECIES_TYPE_OPTIONS = ["Tree", "Ornamental", "Seed"];

// Collapsible section header component
const SectionHeader = ({ 
  title, 
  icon: Icon, 
  isOpen, 
  onToggle,
  colorClass = "text-blue-600"
}: { 
  title: string; 
  icon: React.ElementType; 
  isOpen: boolean; 
  onToggle: () => void;
  colorClass?: string;
}) => (
  <button
    type="button"
    onClick={onToggle}
    className={`w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors ${isOpen ? 'bg-gray-50' : ''}`}
  >
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${colorClass}`} />
      <span className="font-medium text-gray-800">{title}</span>
    </div>
    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
  </button>
);

// Min/Max/Avg input group component
const MinMaxAvgInput = ({
  label,
  minName,
  maxName,
  avgName,
  unit,
  minValue,
  maxValue,
  avgValue,
  onChange,
}: {
  label: string;
  minName: string;
  maxName: string;
  avgName: string;
  unit: string;
  minValue?: number;
  maxValue?: number;
  avgValue?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">{label} ({unit})</Label>
    <div className="grid grid-cols-3 gap-2">
      <div>
        <Input
          type="number"
          step="any"
          name={minName}
          value={minValue ?? ""}
          onChange={onChange}
          placeholder="Min"
          className="text-sm"
        />
        <span className="text-xs text-gray-500 mt-1">Min</span>
      </div>
      <div>
        <Input
          type="number"
          step="any"
          name={maxName}
          value={maxValue ?? ""}
          onChange={onChange}
          placeholder="Max"
          className="text-sm"
        />
        <span className="text-xs text-gray-500 mt-1">Max</span>
      </div>
      <div>
        <Input
          type="number"
          step="any"
          name={avgName}
          value={avgValue ?? ""}
          onChange={onChange}
          placeholder="Avg"
          className="text-sm"
        />
        <span className="text-xs text-gray-500 mt-1">Avg</span>
      </div>
    </div>
  </div>
);

const SpeciesForm: React.FC<SpeciesFormProps> = ({ mode, initialData, onSave, onCancel }) => {
  // Fetch all species to get unique types - use same query key pattern for cache consistency
  const { data: allSpecies = [] } = useQuery({
    queryKey: ["tree-species", ""], // Match the same pattern as useTreeSpecies
    queryFn: () => fetchTreeSpecies(),
    staleTime: 1 * 60 * 1000, // 1 minute - allow frequent updates
    refetchOnWindowFocus: false, // Don't refetch on window focus to prevent render loops
    refetchOnMount: true, // Refetch when form opens to get latest species types
  });
  
  // Extract unique species types from database (memoized)
  const availableTypes = useMemo(() => {
    if (!allSpecies || allSpecies.length === 0) {
      return BASE_SPECIES_TYPE_OPTIONS;
    }
    
    const uniqueTypes = new Set<string>();
    allSpecies.forEach(species => {
      if (species.species_type) {
        uniqueTypes.add(species.species_type);
      }
    });
    
    // Combine base types with custom types from database
    const customTypes = Array.from(uniqueTypes).filter(
      type => !BASE_SPECIES_TYPE_OPTIONS.includes(type)
    );
    
    return [...BASE_SPECIES_TYPE_OPTIONS, ...customTypes.sort()];
  }, [allSpecies]);
  
  const [formData, setFormData] = useState<TreeSpeciesCreate>({
    scientific_name: initialData?.scientific_name || "",
    common_name: initialData?.common_name || "",
    local_name: initialData?.local_name || "",
    family: initialData?.family || "",
    species_type: initialData?.species_type || "Tree",
    is_native: initialData?.is_native || false,
    is_endangered: initialData?.is_endangered || false,
    description: initialData?.description || "",
    
    // Physical / Growth fields
    wood_density_min: initialData?.wood_density_min,
    wood_density_max: initialData?.wood_density_max,
    wood_density_avg: initialData?.wood_density_avg,
    avg_mature_height_min_m: initialData?.avg_mature_height_min_m,
    avg_mature_height_max_m: initialData?.avg_mature_height_max_m,
    avg_mature_height_avg_m: initialData?.avg_mature_height_avg_m,
    avg_trunk_diameter_min_cm: initialData?.avg_trunk_diameter_min_cm,
    avg_trunk_diameter_max_cm: initialData?.avg_trunk_diameter_max_cm,
    avg_trunk_diameter_avg_cm: initialData?.avg_trunk_diameter_avg_cm,
    growth_rate_m_per_year: initialData?.growth_rate_m_per_year,
    growth_speed_label: initialData?.growth_speed_label || "",
    
    // Carbon / CO2 fields
    co2_absorbed_kg_per_year: initialData?.co2_absorbed_kg_per_year,
    co2_stored_mature_min_kg: initialData?.co2_stored_mature_min_kg,
    co2_stored_mature_max_kg: initialData?.co2_stored_mature_max_kg,
    co2_stored_mature_avg_kg: initialData?.co2_stored_mature_avg_kg,
    carbon_fraction: initialData?.carbon_fraction,
    
    // Removal impact factors
    decay_years_min: initialData?.decay_years_min,
    decay_years_max: initialData?.decay_years_max,
    lumber_carbon_retention_pct: initialData?.lumber_carbon_retention_pct,
    burned_carbon_release_pct: initialData?.burned_carbon_release_pct,
    
    notes: initialData?.notes || "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Prepare combobox items for species type (memoized to prevent infinite loops)
  const speciesTypeItems = useMemo<ComboboxItem[]>(() => 
    availableTypes.map(type => ({
      value: type,
      label: type
    })),
    [availableTypes]
  );
  
  // Memoized onChange handler for species type
  const handleSpeciesTypeChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, species_type: value }));
    setErrors(prev => {
      if (prev.species_type) {
        const { species_type, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);
  
  // Memoized onChange handler for growth speed
  const handleGrowthSpeedChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, growth_speed_label: value }));
  }, []);
  
  // Collapsible sections state
  const [showPhysicalFields, setShowPhysicalFields] = useState(
    !!(initialData?.wood_density_avg || initialData?.avg_mature_height_avg_m || initialData?.growth_rate_m_per_year)
  );
  const [showCarbonFields, setShowCarbonFields] = useState(
    !!(initialData?.co2_absorbed_kg_per_year || initialData?.co2_stored_mature_avg_kg || initialData?.carbon_fraction)
  );
  const [showRemovalFields, setShowRemovalFields] = useState(
    !!(initialData?.decay_years_min || initialData?.lumber_carbon_retention_pct)
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === "" ? undefined : parseFloat(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  const handleIntegerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const intValue = value === "" ? undefined : parseInt(value, 10);
    
    setFormData(prev => ({
      ...prev,
      [name]: intValue
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.common_name?.trim()) {
      newErrors.common_name = "Common name is required";
    }
    
    if (!formData.species_type?.trim()) {
      newErrors.species_type = "Species type is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error: any) {
      console.error("Error saving species:", error);
      setErrors({ submit: error.message || "Failed to save species" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-800">{errors.submit}</span>
        </div>
      )}

      {/* === BASIC INFO SECTION === */}
      <div className="space-y-4">
        {/* Common Name (Required) */}
        <div>
          <Label htmlFor="common_name" className="text-sm font-medium">
            Common Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="common_name"
            name="common_name"
            value={formData.common_name}
            onChange={handleChange}
            placeholder="e.g., Narra, Mahogany"
            className={`mt-1 ${errors.common_name ? 'border-red-500' : ''}`}
          />
          {errors.common_name && (
            <p className="text-xs text-red-500 mt-1">{errors.common_name}</p>
          )}
        </div>

        {/* Scientific Name */}
        <div>
          <Label htmlFor="scientific_name" className="text-sm font-medium">
            Scientific Name
          </Label>
          <Input
            id="scientific_name"
            name="scientific_name"
            value={formData.scientific_name}
            onChange={handleChange}
            placeholder="e.g., Pterocarpus indicus"
            className="mt-1 italic"
          />
        </div>

        {/* Local Name & Family */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="local_name" className="text-sm font-medium">
              Local Name
            </Label>
            <Input
              id="local_name"
              name="local_name"
              value={formData.local_name}
              onChange={handleChange}
              placeholder="e.g., Narra"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="family" className="text-sm font-medium">
              Family
            </Label>
            <Input
              id="family"
              name="family"
              value={formData.family}
              onChange={handleChange}
              placeholder="e.g., Fabaceae"
              className="mt-1"
            />
          </div>
        </div>

        {/* Species Type - CreatableCombobox */}
        <div>
          <Label htmlFor="species_type" className="text-sm font-medium">
            Species Type <span className="text-red-500">*</span>
          </Label>
          <CreatableCombobox
            items={speciesTypeItems}
            value={formData.species_type || ""}
            onChange={handleSpeciesTypeChange}
            placeholder="Select or create species type..."
            emptyMessage="No species types found"
            className="mt-1"
          />
          {errors.species_type && (
            <p className="text-xs text-red-500 mt-1">{errors.species_type}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Tree: For tree inventory | Ornamental & Seed: For urban greening projects
          </p>
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_native"
              name="is_native"
              checked={formData.is_native}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <Label htmlFor="is_native" className="text-sm font-medium cursor-pointer">
              Native Species
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_endangered"
              name="is_endangered"
              checked={formData.is_endangered}
              onChange={handleChange}
              className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
            />
            <Label htmlFor="is_endangered" className="text-sm font-medium cursor-pointer">
              Endangered
            </Label>
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="General description of this species..."
            rows={2}
            className="mt-1"
          />
        </div>
      </div>

      {/* === PHYSICAL / GROWTH SECTION === */}
      <div className="space-y-3">
        <SectionHeader
          title="Physical / Growth Data"
          icon={Ruler}
          isOpen={showPhysicalFields}
          onToggle={() => setShowPhysicalFields(!showPhysicalFields)}
        />
        
        {showPhysicalFields && (
          <div className="p-4 border border-gray-200 rounded-lg space-y-4 bg-gray-50/50">
            <MinMaxAvgInput
              label="Wood Density"
              minName="wood_density_min"
              maxName="wood_density_max"
              avgName="wood_density_avg"
              unit="g/cm³"
              minValue={formData.wood_density_min}
              maxValue={formData.wood_density_max}
              avgValue={formData.wood_density_avg}
              onChange={handleNumberChange}
            />
            
            <MinMaxAvgInput
              label="Mature Height"
              minName="avg_mature_height_min_m"
              maxName="avg_mature_height_max_m"
              avgName="avg_mature_height_avg_m"
              unit="m"
              minValue={formData.avg_mature_height_min_m}
              maxValue={formData.avg_mature_height_max_m}
              avgValue={formData.avg_mature_height_avg_m}
              onChange={handleNumberChange}
            />
            
            <MinMaxAvgInput
              label="Trunk Diameter (DBH)"
              minName="avg_trunk_diameter_min_cm"
              maxName="avg_trunk_diameter_max_cm"
              avgName="avg_trunk_diameter_avg_cm"
              unit="cm"
              minValue={formData.avg_trunk_diameter_min_cm}
              maxValue={formData.avg_trunk_diameter_max_cm}
              avgValue={formData.avg_trunk_diameter_avg_cm}
              onChange={handleNumberChange}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="growth_rate_m_per_year" className="text-sm font-medium">
                  Growth Rate (m/year)
                </Label>
                <Input
                  id="growth_rate_m_per_year"
                  name="growth_rate_m_per_year"
                  type="number"
                  step="any"
                  value={formData.growth_rate_m_per_year ?? ""}
                  onChange={handleNumberChange}
                  placeholder="e.g., 1.0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="growth_speed_label" className="text-sm font-medium">
                  Growth Speed
                </Label>
                <Select
                  value={formData.growth_speed_label || ""}
                  onValueChange={handleGrowthSpeedChange}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select growth speed..." />
                  </SelectTrigger>
                  <SelectContent>
                    {GROWTH_SPEED_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* === CARBON / CO2 SECTION === */}
      <div className="space-y-3">
        <SectionHeader
          title="Carbon / CO₂ Data"
          icon={Wind}
          isOpen={showCarbonFields}
          onToggle={() => setShowCarbonFields(!showCarbonFields)}
          colorClass="text-green-600"
        />
        
        {showCarbonFields && (
          <div className="p-4 border border-gray-200 rounded-lg space-y-4 bg-green-50/30">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="co2_absorbed_kg_per_year" className="text-sm font-medium">
                  CO₂ Absorbed (kg/year)
                </Label>
                <Input
                  id="co2_absorbed_kg_per_year"
                  name="co2_absorbed_kg_per_year"
                  type="number"
                  step="any"
                  value={formData.co2_absorbed_kg_per_year ?? ""}
                  onChange={handleNumberChange}
                  placeholder="e.g., 22.5"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="carbon_fraction" className="text-sm font-medium">
                  Carbon Fraction
                </Label>
                <Input
                  id="carbon_fraction"
                  name="carbon_fraction"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.carbon_fraction ?? ""}
                  onChange={handleNumberChange}
                  placeholder="e.g., 0.48"
                  className="mt-1"
                />
                <span className="text-xs text-gray-500">Biomass → Carbon (0-1)</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">CO₂ Stored at Maturity (kg)</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Input
                    type="number"
                    step="any"
                    name="co2_stored_mature_min_kg"
                    value={formData.co2_stored_mature_min_kg ?? ""}
                    onChange={handleNumberChange}
                    placeholder="Min"
                    className="text-sm"
                  />
                  <span className="text-xs text-gray-500 mt-1">Min</span>
                </div>
                <div>
                  <Input
                    type="number"
                    step="any"
                    name="co2_stored_mature_max_kg"
                    value={formData.co2_stored_mature_max_kg ?? ""}
                    onChange={handleNumberChange}
                    placeholder="Max"
                    className="text-sm"
                  />
                  <span className="text-xs text-gray-500 mt-1">Max</span>
                </div>
                <div>
                  <Input
                    type="number"
                    step="any"
                    name="co2_stored_mature_avg_kg"
                    value={formData.co2_stored_mature_avg_kg ?? ""}
                    onChange={handleNumberChange}
                    placeholder="Avg"
                    className="text-sm"
                  />
                  <span className="text-xs text-gray-500 mt-1">Avg</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* === REMOVAL IMPACT SECTION === */}
      <div className="space-y-3">
        <SectionHeader
          title="Removal Impact Factors"
          icon={Trash2}
          isOpen={showRemovalFields}
          onToggle={() => setShowRemovalFields(!showRemovalFields)}
          colorClass="text-red-600"
        />
        
        {showRemovalFields && (
          <div className="p-4 border border-gray-200 rounded-lg space-y-4 bg-red-50/30">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Decay Years (Min)</Label>
                <Input
                  name="decay_years_min"
                  type="number"
                  step="1"
                  value={formData.decay_years_min ?? ""}
                  onChange={handleIntegerChange}
                  placeholder="e.g., 10"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Decay Years (Max)</Label>
                <Input
                  name="decay_years_max"
                  type="number"
                  step="1"
                  value={formData.decay_years_max ?? ""}
                  onChange={handleIntegerChange}
                  placeholder="e.g., 20"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lumber_carbon_retention_pct" className="text-sm font-medium">
                  Lumber Carbon Retention
                </Label>
                <Input
                  id="lumber_carbon_retention_pct"
                  name="lumber_carbon_retention_pct"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.lumber_carbon_retention_pct ?? ""}
                  onChange={handleNumberChange}
                  placeholder="e.g., 0.80"
                  className="mt-1"
                />
                <span className="text-xs text-gray-500">0-1 (e.g., 0.80 = 80%)</span>
              </div>
              <div>
                <Label htmlFor="burned_carbon_release_pct" className="text-sm font-medium">
                  Burned Carbon Release
                </Label>
                <Input
                  id="burned_carbon_release_pct"
                  name="burned_carbon_release_pct"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.burned_carbon_release_pct ?? ""}
                  onChange={handleNumberChange}
                  placeholder="e.g., 1.00"
                  className="mt-1"
                />
                <span className="text-xs text-gray-500">Usually 1.0 (100%)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* === NOTES SECTION === */}
      <div>
        <Label htmlFor="notes" className="text-sm font-medium">
          Notes
        </Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional notes about ecological value, special characteristics..."
          rows={2}
          className="mt-1"
        />
      </div>

      {/* === ACTION BUTTONS === */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Leaf className="w-4 h-4 mr-2" />
              {mode === "add" ? "Add Species" : "Save Changes"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default SpeciesForm;

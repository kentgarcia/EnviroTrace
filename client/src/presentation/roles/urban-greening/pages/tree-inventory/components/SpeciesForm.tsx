// client/src/presentation/roles/urban-greening/pages/tree-inventory/components/SpeciesForm.tsx
/**
 * Form component for adding/editing tree species
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { TreeSpecies, TreeSpeciesCreate } from "@/core/api/tree-inventory-api";
import { Leaf, AlertCircle } from "lucide-react";

interface SpeciesFormProps {
  mode: "add" | "edit";
  initialData?: TreeSpecies;
  onSave: (data: TreeSpeciesCreate) => Promise<void>;
  onCancel: () => void;
}

const SpeciesForm: React.FC<SpeciesFormProps> = ({ mode, initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<TreeSpeciesCreate>({
    scientific_name: initialData?.scientific_name || "",
    common_name: initialData?.common_name || "",
    local_name: initialData?.local_name || "",
    family: initialData?.family || "",
    is_native: initialData?.is_native || false,
    is_endangered: initialData?.is_endangered || false,
    description: initialData?.description || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.common_name?.trim()) {
      newErrors.common_name = "Common name is required";
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

      {/* Local Name */}
      <div>
        <Label htmlFor="local_name" className="text-sm font-medium">
          Local Name (Filipino)
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

      {/* Family */}
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
          placeholder="Additional notes about this species..."
          rows={3}
          className="mt-1"
        />
      </div>

      {/* Action Buttons */}
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

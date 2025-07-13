import React, { useState } from "react";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Button } from "@/presentation/components/shared/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/presentation/components/shared/ui/select";
import { DatePicker } from "@/presentation/components/shared/ui/date-picker";
import { toast } from "sonner";

interface UrbanGreeningRecordFormProps {
    mode: "add" | "edit" | "view";
    initialData?: any;
    onSave: (data: any) => void;
    onCancel: () => void;
}

const UrbanGreeningRecordForm: React.FC<UrbanGreeningRecordFormProps> = ({
    mode,
    initialData,
    onSave,
    onCancel,
}) => {
    const [formData, setFormData] = useState({
        projectName: initialData?.projectName || "",
        type: initialData?.type || "ornamental",
        quantity: initialData?.quantity || 1,
        species: initialData?.species || "",
        plantingDate: initialData?.plantingDate ? new Date(initialData.plantingDate) : new Date(),
        location: initialData?.location || "",
        coordinates: initialData?.coordinates || { lat: 0, lng: 0 },
        status: initialData?.status || "planned",
        responsiblePerson: initialData?.responsiblePerson || "",
        notes: initialData?.notes || "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.projectName || !formData.species || !formData.location || formData.quantity <= 0) {
            toast.error("Please fill in all required fields");
            return;
        }

        onSave({
            ...formData,
            plantingDate: formData.plantingDate.toISOString().split('T')[0],
            id: initialData?.id || `UG-${Date.now()}`,
        });

        toast.success(mode === "add" ? "Urban greening project added successfully" : "Urban greening project updated successfully");
    };

    const isReadOnly = mode === "view";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="projectName">Project Name *</Label>
                    <Input
                        id="projectName"
                        value={formData.projectName}
                        onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                        placeholder="Enter project name"
                        disabled={isReadOnly}
                    />
                </div>
                <div>
                    <Label htmlFor="type">Project Type</Label>
                    <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                        disabled={isReadOnly}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ornamental">Ornamental Plants</SelectItem>
                            <SelectItem value="trees">Trees</SelectItem>
                            <SelectItem value="seeds">Seeds (Public)</SelectItem>
                            <SelectItem value="seeds_private">Seeds (Private)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="species">Species/Plants *</Label>
                    <Input
                        id="species"
                        value={formData.species}
                        onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                        placeholder="Enter species or plant types"
                        disabled={isReadOnly}
                    />
                </div>
                <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                        placeholder="Enter quantity"
                        disabled={isReadOnly}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">        <div>
                <Label htmlFor="plantingDate">Planting Date</Label>
                <DatePicker
                    selected={formData.plantingDate}
                    onSelect={isReadOnly ? undefined : (date) => date && setFormData({ ...formData, plantingDate: date })}
                />
            </div>
                <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                        disabled={isReadOnly}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="planned">Planned</SelectItem>
                            <SelectItem value="planted">Planted</SelectItem>
                            <SelectItem value="maintained">Under Maintenance</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter project location"
                    disabled={isReadOnly}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.coordinates.lat}
                        onChange={(e) => setFormData({
                            ...formData,
                            coordinates: { ...formData.coordinates, lat: parseFloat(e.target.value) || 0 }
                        })}
                        placeholder="14.5995"
                        disabled={isReadOnly}
                    />
                </div>
                <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.coordinates.lng}
                        onChange={(e) => setFormData({
                            ...formData,
                            coordinates: { ...formData.coordinates, lng: parseFloat(e.target.value) || 0 }
                        })}
                        placeholder="120.9842"
                        disabled={isReadOnly}
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="responsiblePerson">Responsible Person/Department</Label>
                <Input
                    id="responsiblePerson"
                    value={formData.responsiblePerson}
                    onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                    placeholder="Enter responsible person or department"
                    disabled={isReadOnly}
                />
            </div>

            <div>
                <Label htmlFor="notes">Project Notes</Label>
                <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional project details, maintenance schedules, etc."
                    rows={3}
                    disabled={isReadOnly}
                />
            </div>

            {!isReadOnly && (
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        {mode === "add" ? "Add Project" : "Save Changes"}
                    </Button>
                </div>
            )}
        </form>
    );
};

export default UrbanGreeningRecordForm;

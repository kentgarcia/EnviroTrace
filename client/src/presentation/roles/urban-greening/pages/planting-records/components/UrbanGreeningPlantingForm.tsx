import React, { useState, useEffect } from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Card, CardContent } from "@/presentation/components/shared/ui/card";
import { UrbanGreeningPlanting } from "@/core/api/planting-api";

interface UrbanGreeningPlantingFormProps {
    mode: "add" | "edit" | "view";
    initialData?: UrbanGreeningPlanting | null;
    onSave: (data: any) => void;
    onCancel: () => void;
}

const UrbanGreeningPlantingForm: React.FC<UrbanGreeningPlantingFormProps> = ({
    mode,
    initialData,
    onSave,
    onCancel,
}) => {
    const [formData, setFormData] = useState({
        planting_type: "ornamental_plants",
        species_name: "",
        quantity_planted: 1,
        planting_date: new Date().toISOString().split('T')[0],
        location: "",
        barangay: "",
        coordinates: "",
        planting_method: "",
        status: "planted",
        survival_rate: 0,
        responsible_person: "",
        contact_number: "",
        organization: "",
        project_name: "",
        funding_source: "",
        maintenance_schedule: "",
        notes: "",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                planting_type: initialData.planting_type || "ornamental_plants",
                species_name: initialData.species_name || "",
                quantity_planted: initialData.quantity_planted || 1,
                planting_date: initialData.planting_date?.split('T')[0] || new Date().toISOString().split('T')[0],
                location: initialData.location || "",
                barangay: initialData.barangay || "",
                coordinates: initialData.coordinates || "",
                planting_method: initialData.planting_method || "",
                status: initialData.status || "planted",
                survival_rate: initialData.survival_rate || 0,
                responsible_person: initialData.responsible_person || "",
                contact_number: initialData.contact_number || "",
                organization: initialData.organization || "",
                project_name: initialData.project_name || "",
                funding_source: initialData.funding_source || "",
                maintenance_schedule: initialData.maintenance_schedule || "",
                notes: initialData.notes || "",
            });
        }
    }, [initialData]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === "number") {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const isReadOnly = mode === "view";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Planting Information</h3>
                        <div className="space-y-4">
                            {mode !== "add" && (
                                <div>
                                    <Label htmlFor="record_number">Record Number</Label>
                                    <Input
                                        id="record_number"
                                        value={initialData?.record_number || ""}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                            )}

                            <div>
                                <Label htmlFor="planting_type">Planting Type *</Label>
                                <select
                                    id="planting_type"
                                    name="planting_type"
                                    value={formData.planting_type}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="ornamental_plants">Ornamental Plants</option>
                                    <option value="trees">Trees</option>
                                    <option value="seeds">Seeds</option>
                                    <option value="seeds_private">Seeds (Private)</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="species_name">Species Name *</Label>
                                <Input
                                    id="species_name"
                                    name="species_name"
                                    value={formData.species_name}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="quantity_planted">Quantity Planted *</Label>
                                <Input
                                    id="quantity_planted"
                                    name="quantity_planted"
                                    type="number"
                                    min="1"
                                    value={formData.quantity_planted}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="planting_date">Planting Date *</Label>
                                <Input
                                    id="planting_date"
                                    name="planting_date"
                                    type="date"
                                    value={formData.planting_date}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="planted">Planted</option>
                                    <option value="growing">Growing</option>
                                    <option value="mature">Mature</option>
                                    <option value="died">Died</option>
                                    <option value="removed">Removed</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="survival_rate">Survival Rate (%)</Label>
                                <Input
                                    id="survival_rate"
                                    name="survival_rate"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={formData.survival_rate}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Location Information */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Location Information</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="location">Location *</Label>
                                <Textarea
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    required
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="barangay">Barangay</Label>
                                <Input
                                    id="barangay"
                                    name="barangay"
                                    value={formData.barangay}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                />
                            </div>

                            <div>
                                <Label htmlFor="coordinates">GPS Coordinates</Label>
                                <Input
                                    id="coordinates"
                                    name="coordinates"
                                    value={formData.coordinates}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    placeholder="e.g. 14.5995, 120.9842"
                                />
                            </div>

                            <div>
                                <Label htmlFor="planting_method">Planting Method</Label>
                                <select
                                    id="planting_method"
                                    name="planting_method"
                                    value={formData.planting_method}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select method</option>
                                    <option value="direct_seeding">Direct Seeding</option>
                                    <option value="transplanting">Transplanting</option>
                                    <option value="grafting">Grafting</option>
                                    <option value="cutting">Cutting</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Responsible Person Information */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Responsible Person</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="responsible_person">Full Name *</Label>
                                <Input
                                    id="responsible_person"
                                    name="responsible_person"
                                    value={formData.responsible_person}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="contact_number">Contact Number</Label>
                                <Input
                                    id="contact_number"
                                    name="contact_number"
                                    value={formData.contact_number}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                />
                            </div>

                            <div>
                                <Label htmlFor="organization">Organization</Label>
                                <Input
                                    id="organization"
                                    name="organization"
                                    value={formData.organization}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Project Information */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Project Information</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="project_name">Project Name</Label>
                                <Input
                                    id="project_name"
                                    name="project_name"
                                    value={formData.project_name}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                />
                            </div>

                            <div>
                                <Label htmlFor="funding_source">Funding Source</Label>
                                <select
                                    id="funding_source"
                                    name="funding_source"
                                    value={formData.funding_source}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select source</option>
                                    <option value="government">Government</option>
                                    <option value="private">Private</option>
                                    <option value="donation">Donation</option>
                                    <option value="ngo">NGO</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="maintenance_schedule">Maintenance Schedule</Label>
                                <Textarea
                                    id="maintenance_schedule"
                                    name="maintenance_schedule"
                                    value={formData.maintenance_schedule}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="notes">Additional Notes</Label>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    {mode === "view" ? "Close" : "Cancel"}
                </Button>
                {mode !== "view" && (
                    <Button type="submit">
                        {mode === "add" ? "Create Planting Record" : "Update Planting Record"}
                    </Button>
                )}
            </div>
        </form>
    );
};

export default UrbanGreeningPlantingForm;

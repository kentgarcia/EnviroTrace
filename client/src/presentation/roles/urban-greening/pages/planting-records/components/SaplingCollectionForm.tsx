import React, { useState, useEffect } from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Card, CardContent } from "@/presentation/components/shared/ui/card";
import { SaplingCollection } from "@/core/api/planting-api";

interface SaplingCollectionFormProps {
    mode: "add" | "edit" | "view";
    initialData?: SaplingCollection | null;
    onSave: (data: any) => void;
    onCancel: () => void;
}

const SaplingCollectionForm: React.FC<SaplingCollectionFormProps> = ({
    mode,
    initialData,
    onSave,
    onCancel,
}) => {
    const [formData, setFormData] = useState({
        species_name: "",
        quantity_collected: 1,
        collection_date: new Date().toISOString().split('T')[0],
        collection_location: "",
        collector_name: "",
        collector_contact: "",
        purpose: "replacement",
        target_planting_date: "",
        target_location: "",
        nursery_location: "",
        status: "collected",
        health_condition: "",
        size_category: "",
        survival_rate: 0,
        distribution_date: "",
        recipient_name: "",
        recipient_contact: "",
        recipient_address: "",
        care_instructions: "",
        notes: "",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                species_name: initialData.species_name || "",
                quantity_collected: initialData.quantity_collected || 1,
                collection_date: initialData.collection_date?.split('T')[0] || new Date().toISOString().split('T')[0],
                collection_location: initialData.collection_location || "",
                collector_name: initialData.collector_name || "",
                collector_contact: initialData.collector_contact || "",
                purpose: initialData.purpose || "replacement",
                target_planting_date: initialData.target_planting_date?.split('T')[0] || "",
                target_location: initialData.target_location || "",
                nursery_location: initialData.nursery_location || "",
                status: initialData.status || "collected",
                health_condition: initialData.health_condition || "",
                size_category: initialData.size_category || "",
                survival_rate: initialData.survival_rate || 0,
                distribution_date: initialData.distribution_date?.split('T')[0] || "",
                recipient_name: initialData.recipient_name || "",
                recipient_contact: initialData.recipient_contact || "",
                recipient_address: initialData.recipient_address || "",
                care_instructions: initialData.care_instructions || "",
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
                {/* Collection Information */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Collection Information</h3>
                        <div className="space-y-4">
                            {mode !== "add" && (
                                <div>
                                    <Label htmlFor="collection_number">Collection Number</Label>
                                    <Input
                                        id="collection_number"
                                        value={initialData?.collection_number || ""}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                            )}

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
                                <Label htmlFor="quantity_collected">Quantity Collected *</Label>
                                <Input
                                    id="quantity_collected"
                                    name="quantity_collected"
                                    type="number"
                                    min="1"
                                    value={formData.quantity_collected}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="collection_date">Collection Date *</Label>
                                <Input
                                    id="collection_date"
                                    name="collection_date"
                                    type="date"
                                    value={formData.collection_date}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="collection_location">Collection Location *</Label>
                                <Textarea
                                    id="collection_location"
                                    name="collection_location"
                                    value={formData.collection_location}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    required
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="purpose">Purpose *</Label>
                                <select
                                    id="purpose"
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="replacement">Replacement</option>
                                    <option value="reforestation">Reforestation</option>
                                    <option value="distribution">Distribution</option>
                                    <option value="nursery">Nursery</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Collector Information */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Collector Information</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="collector_name">Collector Name *</Label>
                                <Input
                                    id="collector_name"
                                    name="collector_name"
                                    value={formData.collector_name}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="collector_contact">Collector Contact</Label>
                                <Input
                                    id="collector_contact"
                                    name="collector_contact"
                                    value={formData.collector_contact}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Status and Health */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Status and Health</h3>
                        <div className="space-y-4">
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
                                    <option value="collected">Collected</option>
                                    <option value="nursery">In Nursery</option>
                                    <option value="ready_for_planting">Ready for Planting</option>
                                    <option value="planted">Planted</option>
                                    <option value="distributed">Distributed</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="health_condition">Health Condition</Label>
                                <select
                                    id="health_condition"
                                    name="health_condition"
                                    value={formData.health_condition}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select condition</option>
                                    <option value="excellent">Excellent</option>
                                    <option value="good">Good</option>
                                    <option value="fair">Fair</option>
                                    <option value="poor">Poor</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="size_category">Size Category</Label>
                                <select
                                    id="size_category"
                                    name="size_category"
                                    value={formData.size_category}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select size</option>
                                    <option value="seedling">Seedling</option>
                                    <option value="sapling">Sapling</option>
                                    <option value="juvenile">Juvenile</option>
                                    <option value="mature">Mature</option>
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

                {/* Location Planning */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Location Planning</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="target_planting_date">Target Planting Date</Label>
                                <Input
                                    id="target_planting_date"
                                    name="target_planting_date"
                                    type="date"
                                    value={formData.target_planting_date}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                />
                            </div>

                            <div>
                                <Label htmlFor="target_location">Target Location</Label>
                                <Textarea
                                    id="target_location"
                                    name="target_location"
                                    value={formData.target_location}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    rows={2}
                                />
                            </div>

                            <div>
                                <Label htmlFor="nursery_location">Nursery Location</Label>
                                <Textarea
                                    id="nursery_location"
                                    name="nursery_location"
                                    value={formData.nursery_location}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    rows={2}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Distribution Information */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Distribution Information</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="distribution_date">Distribution Date</Label>
                                <Input
                                    id="distribution_date"
                                    name="distribution_date"
                                    type="date"
                                    value={formData.distribution_date}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                />
                            </div>

                            <div>
                                <Label htmlFor="recipient_name">Recipient Name</Label>
                                <Input
                                    id="recipient_name"
                                    name="recipient_name"
                                    value={formData.recipient_name}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                />
                            </div>

                            <div>
                                <Label htmlFor="recipient_contact">Recipient Contact</Label>
                                <Input
                                    id="recipient_contact"
                                    name="recipient_contact"
                                    value={formData.recipient_contact}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                />
                            </div>

                            <div>
                                <Label htmlFor="recipient_address">Recipient Address</Label>
                                <Textarea
                                    id="recipient_address"
                                    name="recipient_address"
                                    value={formData.recipient_address}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Care Instructions and Notes */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Care Instructions & Notes</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="care_instructions">Care Instructions</Label>
                                <Textarea
                                    id="care_instructions"
                                    name="care_instructions"
                                    value={formData.care_instructions}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    rows={4}
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
                        {mode === "add" ? "Create Collection Record" : "Update Collection Record"}
                    </Button>
                )}
            </div>
        </form>
    );
};

export default SaplingCollectionForm;

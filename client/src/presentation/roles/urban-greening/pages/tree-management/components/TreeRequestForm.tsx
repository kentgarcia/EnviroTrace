import React, { useState, useEffect } from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Card, CardContent } from "@/presentation/components/shared/ui/card";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { TreeRequest } from "../logic/useTreeRequests";

interface TreeRequestFormProps {
    mode: "add" | "edit" | "view";
    initialData?: TreeRequest | null;
    onSave: (data: any) => void;
    onCancel: () => void;
}

const TreeRequestForm: React.FC<TreeRequestFormProps> = ({
    mode,
    initialData,
    onSave,
    onCancel,
}) => {
    const [formData, setFormData] = useState({
        request_number: "",
        request_type: "pruning",
        requester_name: "",
        property_address: "",
        status: "filed",
        request_date: new Date().toISOString().split('T')[0],
        fee_record_id: null as string | null,
        notes: "",
        inspectors: [] as string[],
        trees_and_quantities: [] as string[],
        picture_links: [] as string[],
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                request_number: initialData.request_number || "",
                request_type: initialData.request_type || "pruning",
                requester_name: initialData.requester_name || "",
                property_address: initialData.property_address || "",
                status: initialData.status || "filed",
                request_date: initialData.request_date?.split('T')[0] || new Date().toISOString().split('T')[0],
                fee_record_id: initialData.fee_record_id || null,
                notes: initialData.notes || "",
                inspectors: initialData.inspectors || [],
                trees_and_quantities: initialData.trees_and_quantities || [],
                picture_links: initialData.picture_links || [],
            });
        }
    }, [initialData]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === "number") {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // For add mode, don't include processing fields
        const submitData = mode === "add" ? {
            request_number: formData.request_number,
            request_type: formData.request_type,
            requester_name: formData.requester_name,
            property_address: formData.property_address,
            status: formData.status,
            request_date: formData.request_date,
            notes: formData.notes,
        } : {
            ...formData,
            fee_record_id: formData.fee_record_id === "" ? null : formData.fee_record_id,
        };

        onSave(submitData);
    };

    const isReadOnly = mode === "view";

    const getStatusColor = (status: string) => {
        switch (status) {
            case "filed": return "bg-blue-100 text-blue-800";
            case "on_hold": return "bg-gray-100 text-gray-800";
            case "for_signature": return "bg-indigo-100 text-indigo-800";
            case "payment_pending": return "bg-orange-100 text-orange-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Request Information</h3>
                        <div className="space-y-4">
                            {mode !== "add" && (
                                <div>
                                    <Label htmlFor="request_number">Request Number</Label>
                                    <Input
                                        id="request_number"
                                        name="request_number"
                                        value={formData.request_number}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                            )}

                            <div>
                                <Label htmlFor="request_type">Request Type</Label>
                                <select
                                    id="request_type"
                                    name="request_type"
                                    value={formData.request_type}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="pruning">Pruning</option>
                                    <option value="cutting">Tree Cutting</option>
                                    <option value="violation_complaint">Violation/Complaint</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="request_date">Request Date</Label>
                                <Input
                                    id="request_date"
                                    name="request_date"
                                    type="date"
                                    value={formData.request_date}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                />
                            </div>

                            {mode !== "add" && (
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <div className="flex items-center gap-2">
                                        <select
                                            id="status"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            disabled={isReadOnly}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="filed">Filed</option>
                                            <option value="on_hold">On Hold</option>
                                            <option value="for_signature">For Signature</option>
                                            <option value="payment_pending">Payment Pending</option>
                                        </select>
                                        <Badge className={getStatusColor(formData.status)}>
                                            {formData.status.replace("_", " ").toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Requester Information */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Requester Information</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="requester_name">Full Name *</Label>
                                <Input
                                    id="requester_name"
                                    name="requester_name"
                                    value={formData.requester_name}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="property_address">Address *</Label>
                                <Textarea
                                    id="property_address"
                                    name="property_address"
                                    value={formData.property_address}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    required
                                    rows={3}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Request Details */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Request Details</h3>
                        <div className="space-y-4">
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

                {/* Inspection Information */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Inspection Information</h3>
                        <div className="space-y-6">
                            <div>
                                <Label htmlFor="inspectors">Inspectors</Label>
                                <div className="space-y-2">
                                    {formData.inspectors.map((inspector, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <Input
                                                value={inspector}
                                                onChange={(e) => {
                                                    const newInspectors = [...formData.inspectors];
                                                    newInspectors[index] = e.target.value;
                                                    setFormData(prev => ({ ...prev, inspectors: newInspectors }));
                                                }}
                                                readOnly={isReadOnly}
                                                placeholder="Inspector name"
                                                className="flex-1"
                                            />
                                            {!isReadOnly && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const newInspectors = formData.inspectors.filter((_, i) => i !== index);
                                                        setFormData(prev => ({ ...prev, inspectors: newInspectors }));
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    {!isReadOnly && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    inspectors: [...prev.inspectors, '']
                                                }));
                                            }}
                                        >
                                            Add Inspector
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="trees_and_quantities">Trees & Quantities</Label>
                                <div className="space-y-2">
                                    {formData.trees_and_quantities.map((tree, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <Input
                                                value={tree}
                                                onChange={(e) => {
                                                    const newTrees = [...formData.trees_and_quantities];
                                                    newTrees[index] = e.target.value;
                                                    setFormData(prev => ({ ...prev, trees_and_quantities: newTrees }));
                                                }}
                                                readOnly={isReadOnly}
                                                placeholder="e.g., Narra: 5 trees"
                                                className="flex-1"
                                            />
                                            {!isReadOnly && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const newTrees = formData.trees_and_quantities.filter((_, i) => i !== index);
                                                        setFormData(prev => ({ ...prev, trees_and_quantities: newTrees }));
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    {!isReadOnly && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    trees_and_quantities: [...prev.trees_and_quantities, '']
                                                }));
                                            }}
                                        >
                                            Add Tree Entry
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="picture_links">Picture Links</Label>
                                <div className="space-y-2">
                                    {formData.picture_links.map((link, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <Input
                                                value={link}
                                                onChange={(e) => {
                                                    const newLinks = [...formData.picture_links];
                                                    newLinks[index] = e.target.value;
                                                    setFormData(prev => ({ ...prev, picture_links: newLinks }));
                                                }}
                                                readOnly={isReadOnly}
                                                placeholder="Picture URL (future bucket integration)"
                                                className="flex-1"
                                            />
                                            {!isReadOnly && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const newLinks = formData.picture_links.filter((_, i) => i !== index);
                                                        setFormData(prev => ({ ...prev, picture_links: newLinks }));
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    {!isReadOnly && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    picture_links: [...prev.picture_links, '']
                                                }));
                                            }}
                                        >
                                            Add Picture Link
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Processing Information (for edit/view modes) */}
            {mode !== "add" && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Processing Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="fee_record_id">Fee Record ID</Label>
                                <Input
                                    id="fee_record_id"
                                    name="fee_record_id"
                                    value={formData.fee_record_id || ""}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    placeholder="Will be linked to Fee Records"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="notes">Processing Notes</Label>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    rows={3}
                                    placeholder="Additional processing notes"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    {mode === "view" ? "Close" : "Cancel"}
                </Button>
                {mode !== "view" && (
                    <Button type="submit">
                        {mode === "add" ? "Create Request" : "Update Request"}
                    </Button>
                )}
            </div>
        </form>
    );
};

export default TreeRequestForm;

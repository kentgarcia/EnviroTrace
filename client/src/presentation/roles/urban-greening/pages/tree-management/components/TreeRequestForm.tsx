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
        contact_number: "",
        email: "",
        property_address: "",
        tree_species: "",
        tree_count: 1,
        tree_location: "",
        tree_coordinates: "",
        reason_for_request: "",
        urgency_level: "normal",
        request_date: new Date().toISOString().split('T')[0],
        scheduled_date: "",
        status: "filed",
        inspection_notes: "",
        fee_amount: 0,
        assigned_inspector: "",
        completion_date: "",
        fee_status: "pending",
        permit_number: "",
        attachment_files: "",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                request_number: initialData.request_number || "",
                request_type: initialData.request_type || "pruning",
                requester_name: initialData.requester_name || "",
                contact_number: initialData.contact_number || "",
                email: initialData.email || "",
                property_address: initialData.property_address || "",
                tree_species: initialData.tree_species || "",
                tree_count: initialData.tree_count || 1,
                tree_location: initialData.tree_location || "",
                tree_coordinates: "", // Not in API model
                reason_for_request: initialData.reason_for_request || "",
                urgency_level: initialData.urgency_level || "normal",
                request_date: initialData.request_date?.split('T')[0] || new Date().toISOString().split('T')[0],
                scheduled_date: initialData.scheduled_date?.split('T')[0] || "",
                status: initialData.status || "filed",
                inspection_notes: initialData.inspection_notes || "",
                fee_amount: initialData.fee_amount || 0,
                assigned_inspector: initialData.assigned_inspector || "",
                completion_date: initialData.completion_date?.split('T')[0] || "",
                fee_status: initialData.fee_status || "pending",
                permit_number: initialData.permit_number || "",
                attachment_files: initialData.attachment_files || "",
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
        onSave(formData);
    };

    const isReadOnly = mode === "view";

    const getStatusColor = (status: string) => {
        switch (status) {
            case "filed": return "bg-blue-100 text-blue-800";
            case "under_review": return "bg-yellow-100 text-yellow-800";
            case "approved": return "bg-green-100 text-green-800";
            case "rejected": return "bg-red-100 text-red-800";
            case "in_progress": return "bg-purple-100 text-purple-800";
            case "completed": return "bg-emerald-100 text-emerald-800";
            case "payment_pending": return "bg-orange-100 text-orange-800";
            case "for_signature": return "bg-indigo-100 text-indigo-800";
            case "on_hold": return "bg-gray-100 text-gray-800";
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
                                <Label htmlFor="urgency_level">Urgency Level</Label>
                                <select
                                    id="urgency_level"
                                    name="urgency_level"
                                    value={formData.urgency_level}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="emergency">Emergency</option>
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

                            <div>
                                <Label htmlFor="scheduled_date">Expected Completion Date</Label>
                                <Input
                                    id="scheduled_date"
                                    name="scheduled_date"
                                    type="date"
                                    value={formData.scheduled_date}
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
                                            <option value="under_review">Under Review</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="payment_pending">Payment Pending</option>
                                            <option value="for_signature">For Signature</option>
                                            <option value="on_hold">On Hold</option>
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
                                <Label htmlFor="contact_number">Contact Number *</Label>
                                <Input
                                    id="contact_number"
                                    name="contact_number"
                                    value={formData.contact_number}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
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

                {/* Tree Information */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Tree Information</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="tree_species">Tree Species *</Label>
                                <Input
                                    id="tree_species"
                                    name="tree_species"
                                    value={formData.tree_species}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="tree_count">Number of Trees *</Label>
                                <Input
                                    id="tree_count"
                                    name="tree_count"
                                    type="number"
                                    min="1"
                                    value={formData.tree_count}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="tree_location">Tree Location *</Label>
                                <Textarea
                                    id="tree_location"
                                    name="tree_location"
                                    value={formData.tree_location}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    required
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="tree_coordinates">GPS Coordinates</Label>
                                <Input
                                    id="tree_coordinates"
                                    name="tree_coordinates"
                                    value={formData.tree_coordinates}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    placeholder="e.g. 14.5995, 120.9842"
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
                                <Label htmlFor="reason_for_request">Reason for Request *</Label>
                                <Textarea
                                    id="reason_for_request"
                                    name="reason_for_request"
                                    value={formData.reason_for_request}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    required
                                    rows={4}
                                />
                            </div>

                            <div>
                                <Label htmlFor="inspection_notes">Additional Notes</Label>
                                <Textarea
                                    id="inspection_notes"
                                    name="inspection_notes"
                                    value={formData.inspection_notes}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <Label htmlFor="attachment_files">Attachment Files</Label>
                                    <Input
                                        id="attachment_files"
                                        name="attachment_files"
                                        value={formData.attachment_files}
                                        onChange={handleInputChange}
                                        readOnly={isReadOnly}
                                        placeholder="File paths or references"
                                    />
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
                                <Label htmlFor="fee_amount">Fee Amount (PHP)</Label>
                                <Input
                                    id="fee_amount"
                                    name="fee_amount"
                                    type="number"
                                    step="0.01"
                                    value={formData.fee_amount}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                />
                            </div>

                            <div>
                                <Label htmlFor="fee_status">Fee Status</Label>
                                <select
                                    id="fee_status"
                                    name="fee_status"
                                    value={formData.fee_status}
                                    onChange={handleInputChange}
                                    disabled={isReadOnly}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="waived">Waived</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="permit_number">Permit Number</Label>
                                <Input
                                    id="permit_number"
                                    name="permit_number"
                                    value={formData.permit_number}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                />
                            </div>

                            <div>
                                <Label htmlFor="assigned_inspector">Assigned Inspector</Label>
                                <Input
                                    id="assigned_inspector"
                                    name="assigned_inspector"
                                    value={formData.assigned_inspector}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
                                />
                            </div>

                            <div>
                                <Label htmlFor="completion_date">Completion Date</Label>
                                <Input
                                    id="completion_date"
                                    name="completion_date"
                                    type="date"
                                    value={formData.completion_date}
                                    onChange={handleInputChange}
                                    readOnly={isReadOnly}
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

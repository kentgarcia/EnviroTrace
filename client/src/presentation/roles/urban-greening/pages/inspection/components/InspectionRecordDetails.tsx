import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Label } from "@/presentation/components/shared/ui/label";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Edit, Trash } from "lucide-react";
import { InspectionRecord } from "../logic/useInspectionRecords";
import InspectionRecordForm from "./InspectionRecordForm";
import { getTypeBadgeVariant, getStatusBadgeVariant } from "../utils/badgeUtils";

interface Props {
    record: InspectionRecord | null;
    recordIndex: number | null;
    onEdit?: (index: number) => void;
    onDelete?: (index: number) => void;
    loading?: boolean;
    // Form props
    isEditing?: boolean;
    isAdding?: boolean;
    formRecord?: InspectionRecord;
    setFormRecord?: React.Dispatch<React.SetStateAction<InspectionRecord>>;
    treeName?: string;
    setTreeName?: React.Dispatch<React.SetStateAction<string>>;
    treeQty?: number;
    setTreeQty?: React.Dispatch<React.SetStateAction<number>>;
    inspectorInput?: string;
    setInspectorInput?: React.Dispatch<React.SetStateAction<string>>;
    handleAddTree?: () => void;
    handleAddInspector?: () => void;
    handlePictureChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSave?: () => void;
    handleCancelEdit?: () => void;
    onStartAdd?: () => void;
    // New functions for editing trees and inspectors
    handleRemoveTree?: (index: number) => void;
    handleRemoveInspector?: (index: number) => void;
}

export default function InspectionRecordDetails({
    record,
    recordIndex,
    onEdit,
    onDelete,
    loading = false,
    isEditing = false,
    isAdding = false,
    formRecord,
    setFormRecord,
    treeName,
    setTreeName,
    treeQty,
    setTreeQty,
    inspectorInput,
    setInspectorInput,
    handleAddTree,
    handleAddInspector,
    handlePictureChange,
    handleSave,
    handleCancelEdit,
    onStartAdd,
    handleRemoveTree,
    handleRemoveInspector,
}: Props) {
    // Show form when editing or adding
    if (isEditing || isAdding) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>{isEditing ? "Edit Inspection Record" : "Add New Inspection Record"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <InspectionRecordForm
                        record={formRecord!}
                        setRecord={setFormRecord!}
                        treeName={treeName!}
                        setTreeName={setTreeName!}
                        treeQty={treeQty!}
                        setTreeQty={setTreeQty!}
                        inspectorInput={inspectorInput!}
                        setInspectorInput={setInspectorInput!}
                        handleAddTree={handleAddTree!}
                        handleAddInspector={handleAddInspector!}
                        handlePictureChange={handlePictureChange!}
                        handleSave={handleSave!}
                        handleCancelEdit={handleCancelEdit}
                        handleRemoveTree={handleRemoveTree!}
                        handleRemoveInspector={handleRemoveInspector!}
                        isEditing={isEditing}
                    />
                </CardContent>
            </Card>
        );
    }

    // Show empty state with Add button when no record selected
    if (!record || recordIndex === null) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Inspection Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 space-y-4">
                        <p className="text-gray-500">Select an inspection record to view details</p>
                        <Button onClick={onStartAdd} className="w-full">
                            Add New Inspection Record
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Inspection Details</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <Label className="text-sm font-medium">Report No</Label>
                        <p className="text-sm text-muted-foreground">{record.reportNo}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Inspectors</Label>
                        <p className="text-sm">{record.inspectors.join(", ")}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium">Date</Label>
                            <p className="text-sm">{record.date}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Type</Label>
                            <div className="mt-1">
                                <Badge variant={getTypeBadgeVariant(record.type)}>
                                    {record.type}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Location</Label>
                        <p className="text-sm text-muted-foreground">{record.location}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium">Status</Label>
                            <div className="mt-1">
                                <Badge variant={getStatusBadgeVariant(record.status)}>
                                    {record.status}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Follow-up</Label>
                            <p className="text-sm">{record.followUp}</p>
                        </div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Trees</Label>
                        <p className="text-sm">{record.trees.map(t => `${t.name} (${t.quantity})`).join(", ")}</p>
                    </div>
                    {record.notes && (
                        <div>
                            <Label className="text-sm font-medium">Notes</Label>
                            <p className="text-sm text-muted-foreground">{record.notes}</p>
                        </div>
                    )}
                    {record.pictures.length > 0 && (
                        <div>
                            <Label className="text-sm font-medium">Pictures</Label>
                            <div className="flex gap-1 flex-wrap mt-1">
                                {record.pictures.map((file, i) => (
                                    <img key={i} src={URL.createObjectURL(file)} alt="preview" className="h-12 w-12 object-cover rounded border" />
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="flex gap-2 pt-4">
                        <Button onClick={() => onEdit?.(recordIndex)} className="flex-1">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete this inspection record?')) {
                                    onDelete?.(recordIndex);
                                }
                            }}
                            className="flex-1"
                        >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

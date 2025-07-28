import React from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { InspectionRecord, TreeItem } from "../logic/useInspectionRecords";

interface Props {
    record: InspectionRecord;
    setRecord: React.Dispatch<React.SetStateAction<InspectionRecord>>;
    treeName: string;
    setTreeName: React.Dispatch<React.SetStateAction<string>>;
    treeQty: number;
    setTreeQty: React.Dispatch<React.SetStateAction<number>>;
    inspectorInput: string;
    setInspectorInput: React.Dispatch<React.SetStateAction<string>>;
    handleAddTree: () => void;
    handleAddInspector: () => void;
    handleRemoveInspector: (index: number) => void;
    handleRemoveTree: (index: number) => void;
    handlePictureChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSave: () => void;
    handleCancelEdit?: () => void;
    isEditing?: boolean;
}

export default function InspectionRecordForm({
    record,
    setRecord,
    treeName,
    setTreeName,
    treeQty,
    setTreeQty,
    inspectorInput,
    setInspectorInput,
    handleAddTree,
    handleAddInspector,
    handleRemoveInspector,
    handleRemoveTree,
    handlePictureChange,
    handleSave,
    handleCancelEdit,
    isEditing = false,
}: Props) {
    const isFormValid = record.date && record.location && record.type && record.status;

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            if (isFormValid) {
                handleSave();
            } else {
                alert('Please fill in all required fields: Date, Location, Type, and Status');
            }
        }}>
            <div className="mb-3">
                <label className="block font-medium">Report No</label>
                <input
                    className="border rounded px-3 py-2 w-full bg-gray-50"
                    value={record.reportNo}
                    readOnly
                    placeholder="Auto-generated on save"
                />
                <p className="text-sm text-gray-500 mt-1">Report number will be auto-generated</p>
            </div>
            <div className="mb-3">
                <label className="block font-medium">Inspectors</label>
                <div className="flex gap-2 mb-2">
                    <input className="border rounded px-3 py-2 flex-1" value={inspectorInput} onChange={e => setInspectorInput(e.target.value)} placeholder="Add inspector" />
                    <Button type="button" onClick={handleAddInspector}>Add</Button>
                </div>
                <ul className="space-y-1">
                    {record.inspectors.map((name, idx) => (
                        <li key={idx} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded">
                            <input
                                className="border rounded px-2 py-1 flex-1 text-sm"
                                value={name}
                                onChange={e => {
                                    const newInspectors = [...record.inspectors];
                                    newInspectors[idx] = e.target.value;
                                    setRecord(r => ({ ...r, inspectors: newInspectors }));
                                }}
                                placeholder="Inspector name"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveInspector(idx)}
                                className="text-red-500 hover:text-red-700 px-2 py-1 h-auto"
                            >
                                ×
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mb-3">
                <label className="block font-medium">Date *</label>
                <input
                    type="date"
                    className="border rounded px-3 py-2 w-full"
                    value={record.date}
                    onChange={e => setRecord(r => ({ ...r, date: e.target.value }))}
                    required
                />
            </div>
            <div className="mb-3">
                <label className="block font-medium">Location *</label>
                <input
                    className="border rounded px-3 py-2 w-full"
                    value={record.location}
                    onChange={e => setRecord(r => ({ ...r, location: e.target.value }))}
                    placeholder="Enter address"
                    required
                />
            </div>
            <div className="mb-3">
                <label className="block font-medium">Type *</label>
                <select
                    className="border rounded px-3 py-2 w-full"
                    value={record.type}
                    onChange={e => setRecord(r => ({ ...r, type: e.target.value }))}
                    required
                >
                    <option value="">Select type</option>
                    <option value="Pruning">Pruning</option>
                    <option value="Cutting">Cutting</option>
                    <option value="Ballout">Ballout</option>
                    <option value="Violation/Complaint">Violation/Complaint</option>
                </select>
            </div>
            <div className="mb-3">
                <label className="block font-medium">Status *</label>
                <select
                    className="border rounded px-3 py-2 w-full"
                    value={record.status}
                    onChange={e => setRecord(r => ({ ...r, status: e.target.value }))}
                    required
                >
                    <option value="">Select status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>
            <div className="mb-3">
                <label className="block font-medium">Follow-up</label>
                <input className="border rounded px-3 py-2 w-full" value={record.followUp} onChange={e => setRecord(r => ({ ...r, followUp: e.target.value }))} />
            </div>
            <div className="mb-3">
                <label className="block font-medium">Trees</label>
                <div className="flex gap-2 mb-2">
                    <input className="border rounded px-3 py-2 flex-1" value={treeName} onChange={e => setTreeName(e.target.value)} placeholder="Tree name" />
                    <input type="number" min={1} className="border rounded px-3 py-2 w-20" value={treeQty} onChange={e => setTreeQty(Number(e.target.value))} />
                    <Button type="button" onClick={handleAddTree}>Add</Button>
                </div>
                <ul className="space-y-1">
                    {record.trees.map((tree, idx) => (
                        <li key={idx} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded">
                            <input
                                className="border rounded px-2 py-1 flex-1 text-sm"
                                value={tree.name}
                                onChange={e => {
                                    const newTrees = [...record.trees];
                                    newTrees[idx] = { ...newTrees[idx], name: e.target.value };
                                    setRecord(r => ({ ...r, trees: newTrees }));
                                }}
                                placeholder="Tree name"
                            />
                            <input
                                type="number"
                                min={1}
                                className="border rounded px-2 py-1 w-16 text-sm"
                                value={tree.quantity}
                                onChange={e => {
                                    const newTrees = [...record.trees];
                                    newTrees[idx] = { ...newTrees[idx], quantity: Number(e.target.value) };
                                    setRecord(r => ({ ...r, trees: newTrees }));
                                }}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveTree(idx)}
                                className="text-red-500 hover:text-red-700 px-2 py-1 h-auto"
                            >
                                ×
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mb-3">
                <label className="block font-medium">Notes</label>
                <textarea className="border rounded px-3 py-2 w-full" value={record.notes} onChange={e => setRecord(r => ({ ...r, notes: e.target.value }))} />
            </div>
            <div className="mb-3">
                <label className="block font-medium mb-2">Pictures</label>
                <div className="relative">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePictureChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="file-upload"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                        asChild
                    >
                        <label htmlFor="file-upload" className="cursor-pointer flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Choose Files
                        </label>
                    </Button>
                </div>
                {record.pictures.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                        {record.pictures.map((file, idx) => (
                            <img key={idx} src={URL.createObjectURL(file)} alt="preview" className="h-16 w-16 object-cover rounded border" />
                        ))}
                    </div>
                )}
            </div>
            <div className="flex gap-2 mt-4">
                <Button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded flex-1"
                    disabled={!isFormValid}
                >
                    {isEditing ? "Update" : "Save"}
                </Button>
                {isEditing && handleCancelEdit && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="px-4 py-2 rounded flex-1"
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
}

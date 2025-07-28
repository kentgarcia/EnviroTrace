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
    handlePictureChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSave: () => void;
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
    handlePictureChange,
    handleSave,
}: Props) {
    return (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="mb-3">
                <label className="block font-medium">Report No</label>
                <input className="border rounded px-3 py-2 w-full" value={record.reportNo} onChange={e => setRecord(r => ({ ...r, reportNo: e.target.value }))} />
            </div>
            <div className="mb-3">
                <label className="block font-medium">Inspectors</label>
                <div className="flex gap-2 mb-2">
                    <input className="border rounded px-3 py-2 flex-1" value={inspectorInput} onChange={e => setInspectorInput(e.target.value)} placeholder="Add inspector" />
                    <Button type="button" onClick={handleAddInspector}>Add</Button>
                </div>
                <ul className="list-disc pl-5">
                    {record.inspectors.map((name, idx) => <li key={idx}>{name}</li>)}
                </ul>
            </div>
            <div className="mb-3">
                <label className="block font-medium">Date</label>
                <input type="date" className="border rounded px-3 py-2 w-full" value={record.date} onChange={e => setRecord(r => ({ ...r, date: e.target.value }))} />
            </div>
            <div className="mb-3">
                <label className="block font-medium">Location</label>
                <input className="border rounded px-3 py-2 w-full" value={`Lat: ${record.location.lat}, Lng: ${record.location.lng}`} readOnly />
                {/* TODO: Add map picker here */}
            </div>
            <div className="mb-3">
                <label className="block font-medium">Type</label>
                <input className="border rounded px-3 py-2 w-full" value={record.type} onChange={e => setRecord(r => ({ ...r, type: e.target.value }))} />
            </div>
            <div className="mb-3">
                <label className="block font-medium">Status</label>
                <select className="border rounded px-3 py-2 w-full" value={record.status} onChange={e => setRecord(r => ({ ...r, status: e.target.value }))}>
                    <option value="">Select status</option>
                    <option value="Living">Living</option>
                    <option value="Dead">Dead</option>
                    <option value="Replaced">Replaced</option>
                    <option value="Untracked">Untracked</option>
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
                <ul className="list-disc pl-5">
                    {record.trees.map((tree, idx) => <li key={idx}>{tree.name} ({tree.quantity})</li>)}
                </ul>
            </div>
            <div className="mb-3">
                <label className="block font-medium">Notes</label>
                <textarea className="border rounded px-3 py-2 w-full" value={record.notes} onChange={e => setRecord(r => ({ ...r, notes: e.target.value }))} />
            </div>
            <div className="mb-3">
                <label className="block font-medium">Pictures</label>
                <input type="file" multiple accept="image/*" onChange={handlePictureChange} />
                <div className="flex gap-2 mt-2 flex-wrap">
                    {record.pictures.map((file, idx) => (
                        <img key={idx} src={URL.createObjectURL(file)} alt="preview" className="h-16 w-16 object-cover rounded border" />
                    ))}
                </div>
            </div>
            <Button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mt-4">Save</Button>
        </form>
    );
}

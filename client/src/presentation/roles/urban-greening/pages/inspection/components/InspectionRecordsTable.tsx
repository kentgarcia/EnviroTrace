import React from "react";
import { InspectionRecord } from "../logic/useInspectionRecords";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/presentation/components/shared/ui/table";


export interface Props {
    records: InspectionRecord[];
    selectedIdx: number | null;
    setSelectedIdx: (idx: number) => void;
}

const InspectionRecordsTable: React.FC<Props> = ({ records, selectedIdx, setSelectedIdx }) => {
    if (records.length === 0) return (
        <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Inspection Records</h3>
            <div className="text-center text-muted-foreground py-8">No inspection records found.</div>
        </div>
    );
    return (
        <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Inspection Records</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Report No</TableHead>
                        <TableHead>Inspectors</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Follow-up</TableHead>
                        <TableHead>Trees</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Pictures</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records.map((rec, idx) => (
                        <TableRow
                            key={rec.reportNo}
                            className={`cursor-pointer ${selectedIdx === idx ? "bg-blue-50" : ""}`}
                            onClick={() => setSelectedIdx(idx)}
                        >
                            <TableCell className="font-medium">{rec.reportNo}</TableCell>
                            <TableCell>{rec.inspectors.join(", ")}</TableCell>
                            <TableCell>{rec.date}</TableCell>
                            <TableCell>Lat: {rec.location.lat}, Lng: {rec.location.lng}</TableCell>
                            <TableCell>{rec.type}</TableCell>
                            <TableCell>{rec.status}</TableCell>
                            <TableCell>{rec.followUp}</TableCell>
                            <TableCell>{rec.trees.map(t => `${t.name} (${t.quantity})`).join(", ")}</TableCell>
                            <TableCell>{rec.notes}</TableCell>
                            <TableCell>
                                <div className="flex gap-1 flex-wrap">
                                    {rec.pictures.map((file, i) => (
                                        <img key={i} src={URL.createObjectURL(file)} alt="preview" className="h-8 w-8 object-cover rounded border" />
                                    ))}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default InspectionRecordsTable;


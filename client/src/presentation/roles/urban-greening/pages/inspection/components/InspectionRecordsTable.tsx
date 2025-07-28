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
import { Badge } from "@/presentation/components/shared/ui/badge";
import { getTypeBadgeVariant, getStatusBadgeVariant } from "../utils/badgeUtils";


export interface Props {
    records: InspectionRecord[];
    selectedIdx: number | null;
    setSelectedIdx: (idx: number) => void;
    loading?: boolean;
}

const InspectionRecordsTable: React.FC<Props> = ({ records, selectedIdx, setSelectedIdx, loading = false }) => {
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
                            <TableCell>{rec.location}</TableCell>
                            <TableCell>
                                <Badge variant={getTypeBadgeVariant(rec.type)}>
                                    {rec.type}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={getStatusBadgeVariant(rec.status)}>
                                    {rec.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{rec.followUp}</TableCell>
                            <TableCell>{rec.trees.map(t => `${t.name} (${t.quantity})`).join(", ")}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default InspectionRecordsTable;


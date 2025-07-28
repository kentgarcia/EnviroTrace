import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { InspectionRecord } from "../logic/useInspectionRecords";

interface Props {
    record: InspectionRecord | null;
}

export default function InspectionRecordDetails({ record }: Props) {
    if (!record) return <div className="text-gray-500">No record selected.</div>;
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Inspection Details</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <span className="font-medium">Report No:</span> {record.reportNo}
                    </div>
                    <div>
                        <span className="font-medium">Inspectors:</span> {record.inspectors.join(", ")}
                    </div>
                    <div>
                        <span className="font-medium">Date:</span> {record.date}
                    </div>
                    <div>
                        <span className="font-medium">Location:</span> Lat: {record.location.lat}, Lng: {record.location.lng}
                    </div>
                    <div>
                        <span className="font-medium">Type:</span> {record.type}
                    </div>
                    <div>
                        <span className="font-medium">Status:</span> {record.status}
                    </div>
                    <div>
                        <span className="font-medium">Follow-up:</span> {record.followUp}
                    </div>
                    <div>
                        <span className="font-medium">Trees:</span> {record.trees.map(t => `${t.name} (${t.quantity})`).join(", ")}
                    </div>
                    <div>
                        <span className="font-medium">Notes:</span> {record.notes}
                    </div>
                    {record.pictures.length > 0 && (
                        <div>
                            <span className="font-medium">Pictures:</span>
                            <div className="flex gap-1 flex-wrap mt-1">
                                {record.pictures.map((file, i) => (
                                    <img key={i} src={URL.createObjectURL(file)} alt="preview" className="h-12 w-12 object-cover rounded border" />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

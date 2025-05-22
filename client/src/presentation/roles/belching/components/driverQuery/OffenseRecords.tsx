import React from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/presentation/components/shared/ui/table";
import { DriverRecord } from "@/lib/api/driver-api";

interface OffenseRecordsProps {
    selectedDriver: DriverRecord | null;
    onAddOffense: () => void;
    onPrintOffenses: () => void;
}

const OffenseRecords: React.FC<OffenseRecordsProps> = ({
    selectedDriver,
    onAddOffense,
    onPrintOffenses,
}) => {
    return (
        <div className="border border-gray-300">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-bold text-blue-900">
                    Offense Records
                </h3>
                {selectedDriver && (
                    <Button
                        size="sm"
                        onClick={onAddOffense}
                        className="bg-blue-700 text-white"
                    >
                        Add Offense
                    </Button>
                )}
            </div>

            {selectedDriver ? (
                <>
                    {selectedDriver.offenses.length > 0 ? (<Table>
                        <TableHeader className="bg-primary">
                            <TableRow>
                                <TableHead className="text-white">Date</TableHead>
                                <TableHead className="text-white">Plate No.</TableHead>
                                <TableHead className="text-white">Offense</TableHead>
                                <TableHead className="text-white">Payment</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {selectedDriver.offenses.map((off, idx) => (
                                <TableRow key={off.id || idx}>
                                    <TableCell>{off.date}</TableCell>
                                    <TableCell>{off.plate_no}</TableCell>
                                    <TableCell>
                                        <div>{off.offense_level}</div>
                                        <div className="text-xs text-gray-500">{off.place_apprehended}</div>
                                    </TableCell>
                                    <TableCell>
                                        {off.payment_status === 'paid' ? (
                                            <span className="text-green-600 font-bold">Paid</span>
                                        ) : (
                                            <span className="text-red-600 font-bold">Unpaid</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No offense records found for this driver</p>
                            <Button
                                onClick={onAddOffense}
                                className="mt-4 bg-blue-700 text-white"
                                size="sm"
                            >
                                Add First Offense
                            </Button>
                        </div>
                    )}
                    {selectedDriver.offenses.length > 0 && (
                        <div className="pt-4 text-right">
                            <Button onClick={onPrintOffenses} className="bg-green-700 text-white">
                                Print Driver Offense
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <p>Select a driver to view and manage their offense records</p>
                </div>
            )}
        </div>
    );
};

export default OffenseRecords;

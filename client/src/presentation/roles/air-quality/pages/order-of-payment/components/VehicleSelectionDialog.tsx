import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/presentation/components/shared/ui/dialog";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/presentation/components/shared/ui/table";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Checkbox } from "@/presentation/components/shared/ui/checkbox";
import { Search, Car, AlertTriangle } from "lucide-react";

// Mock data - in a real app, this would come from your API
const mockVehicles = [
    {
        id: "1",
        plate_number: "ABC123",
        operator_name: "John Doe",
        vehicle_type: "Private",
        driver_name: "John Doe",
        violations: [
            { id: "v1", type: "Smoke Emission", severity: "High", fine_amount: 5000 },
            { id: "v2", type: "No OR/CR", severity: "Medium", fine_amount: 3000 },
        ]
    },
    {
        id: "2",
        plate_number: "XYZ789",
        operator_name: "Jane Smith",
        vehicle_type: "Commercial",
        driver_name: "Mike Johnson",
        violations: [
            { id: "v3", type: "Smoke Emission", severity: "Medium", fine_amount: 3000 },
        ]
    },
    {
        id: "3",
        plate_number: "DEF456",
        operator_name: "Bob Wilson",
        vehicle_type: "Private",
        driver_name: "Bob Wilson",
        violations: [
            { id: "v4", type: "Expired Registration", severity: "Low", fine_amount: 2000 },
            { id: "v5", type: "Smoke Emission", severity: "High", fine_amount: 5000 },
            { id: "v6", type: "No Insurance", severity: "Medium", fine_amount: 4000 },
        ]
    },
];

interface VehicleSelectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onVehicleSelected: (vehicle: any, selectedViolations: any[]) => void;
}

const VehicleSelectionDialog: React.FC<VehicleSelectionDialogProps> = ({
    isOpen,
    onClose,
    onVehicleSelected,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [selectedViolations, setSelectedViolations] = useState<string[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState(mockVehicles);

    useEffect(() => {
        // Filter vehicles based on search query
        const filtered = mockVehicles.filter(vehicle =>
            vehicle.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.operator_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.driver_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredVehicles(filtered);
    }, [searchQuery]);

    // Reset dialog state when opened
    useEffect(() => {
        if (isOpen) {
            setSearchQuery("");
            setSelectedVehicle(null);
            setSelectedViolations([]);
        }
    }, [isOpen]);

    const handleVehicleSelect = (vehicle: any) => {
        setSelectedVehicle(vehicle);
        // Auto-select all violations for the selected vehicle
        const allViolationIds = vehicle.violations.map((v: any) => v.id);
        setSelectedViolations(allViolationIds);
    };

    const handleViolationToggle = (violationId: string) => {
        setSelectedViolations(prev =>
            prev.includes(violationId)
                ? prev.filter(id => id !== violationId)
                : [...prev, violationId]
        );
    };

    const handleConfirm = () => {
        if (selectedVehicle && selectedViolations.length > 0) {
            const violations = selectedVehicle.violations.filter((v: any) =>
                selectedViolations.includes(v.id)
            );
            onVehicleSelected(selectedVehicle, violations);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const totalFine = selectedVehicle
        ? selectedVehicle.violations
            .filter((v: any) => selectedViolations.includes(v.id))
            .reduce((sum: number, v: any) => sum + v.fine_amount, 0)
        : 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        Select Vehicle for Order of Payment
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Search */}
                    <div className="space-y-2">
                        <Label htmlFor="vehicleSearch">Search Vehicle</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="vehicleSearch"
                                placeholder="Search by plate number, operator, or driver name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Vehicle List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Available Vehicles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Plate Number</TableHead>
                                            <TableHead>Operator</TableHead>
                                            <TableHead>Driver</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Violations</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredVehicles.map((vehicle) => (
                                            <TableRow
                                                key={vehicle.id}
                                                className={`cursor-pointer hover:bg-muted/50 ${selectedVehicle?.id === vehicle.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                                                    }`}
                                            >
                                                <TableCell className="font-medium">{vehicle.plate_number}</TableCell>
                                                <TableCell>{vehicle.operator_name}</TableCell>
                                                <TableCell>{vehicle.driver_name}</TableCell>
                                                <TableCell>{vehicle.vehicle_type}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {vehicle.violations.length} violations
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant={selectedVehicle?.id === vehicle.id ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handleVehicleSelect(vehicle)}
                                                    >
                                                        {selectedVehicle?.id === vehicle.id ? "Selected" : "Select"}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Violations Selection */}
                    {selectedVehicle && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    Select Violations for {selectedVehicle.plate_number}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {selectedVehicle.violations.map((violation: any) => (
                                        <div
                                            key={violation.id}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Checkbox
                                                    id={violation.id}
                                                    checked={selectedViolations.includes(violation.id)}
                                                    onCheckedChange={() => handleViolationToggle(violation.id)}
                                                />
                                                <div>
                                                    <Label htmlFor={violation.id} className="font-medium cursor-pointer">
                                                        {violation.type}
                                                    </Label>
                                                    <Badge className={`ml-2 ${getSeverityColor(violation.severity)}`}>
                                                        {violation.severity}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">₱{violation.fine_amount.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedViolations.length > 0 && (
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Total Fine Amount:</span>
                                            <span className="text-lg font-bold text-blue-600">
                                                ₱{totalFine.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!selectedVehicle || selectedViolations.length === 0}
                        >
                            Create Order of Payment
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default VehicleSelectionDialog;

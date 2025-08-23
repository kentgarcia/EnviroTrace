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
import { Checkbox } from "@/presentation/components/shared/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/presentation/components/shared/ui/table";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Search, Car, AlertTriangle, Loader2 } from "lucide-react";
import { searchAirQualityRecords, fetchAirQualityViolationsByRecordId } from "@/core/api/air-quality-api";
import { useFeeCalculation } from "../logic/useFeeCalculation";

interface VehicleSelectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onVehicleSelected: (vehicle: any) => void;
}

const VehicleSelectionDialog: React.FC<VehicleSelectionDialogProps> = ({
    isOpen,
    onClose,
    onVehicleSelected,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [selectedViolations, setSelectedViolations] = useState<string[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingViolations, setIsLoadingViolations] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fee calculation hook
    const { calculateViolationFees, getDriverOffenseLevel, getOperatorOffenseLevel, loading: feesLoading } = useFeeCalculation();

    // Search vehicles using the backend API
    const searchVehicles = async (query: string) => {
        if (!query.trim()) {
            setVehicles([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Use a single search call that will search both plate number and operator name
            const searchParams = {
                q: query, // General search term that searches both plate and operator
                limit: 20
            };
            console.log("Searching with general term:", searchParams);
            const records = await searchAirQualityRecords(searchParams);
            console.log("Search results:", records);

            // Transform the backend data to match our component structure
            const transformedVehicles = records.map((record: any) => ({
                id: record.id,
                plate_number: record.plate_number,
                operator_name: record.operator_company_name || (record.owner_first_name && record.owner_last_name ?
                    `${record.owner_first_name} ${record.owner_last_name}` : 'N/A'),
                vehicle_type: record.vehicle_type,
                driver_name: record.owner_first_name && record.owner_last_name ?
                    `${record.owner_first_name} ${record.owner_last_name}` : 'N/A',
                violations: [] // Will be loaded when vehicle is selected
            }));

            console.log("Transformed vehicles:", transformedVehicles);
            setVehicles(transformedVehicles);
        } catch (error) {
            console.error("Search failed:", error);
            setError("Failed to search vehicles. Please try again.");
            setVehicles([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchVehicles(searchQuery);
        }, 300); // 300ms delay

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Reset dialog state when opened
    useEffect(() => {
        if (isOpen) {
            setSearchQuery("");
            setSelectedVehicle(null);
            setSelectedViolations([]);
            setVehicles([]);
            setError(null);
        }
    }, [isOpen]);

    const handleVehicleSelect = async (vehicle: any) => {
        setSelectedVehicle(vehicle);
        setSelectedViolations([]); // Reset selected violations
        setIsLoadingViolations(true);

        try {
            // Load violations for the selected vehicle
            const violations = await fetchAirQualityViolationsByRecordId(vehicle.id);

            // Transform violations to match our component structure
            const transformedViolations = violations.map((violation: any) => ({
                id: violation.id,
                type: violation.smoke_density_test_result_no ?
                    `Smoke Belching Test #${violation.smoke_density_test_result_no}` :
                    "Smoke Belching Apprehension",
                ordinance_report_no: violation.ordinance_infraction_report_no,
                test_result_no: violation.smoke_density_test_result_no,
                severity: violation.smoke_density_test_result_no ? "High" : "Medium", // Test results are more serious
                fine_amount: 3000, // This should come from your air quality fees table
                place_of_apprehension: violation.place_of_apprehension,
                date_of_apprehension: violation.date_of_apprehension,
                paid_driver: violation.paid_driver,
                paid_operator: violation.paid_operator
            }));

            // Update the vehicle with loaded violations
            const updatedVehicle = { ...vehicle, violations: transformedViolations };
            setSelectedVehicle(updatedVehicle);

        } catch (error) {
            console.error("Failed to load violations:", error);
            setError("Failed to load violations for this vehicle.");
        } finally {
            setIsLoadingViolations(false);
        }
    };

    const handleViolationToggle = (violationId: string) => {
        setSelectedViolations(prev => {
            if (prev.includes(violationId)) {
                return prev.filter(id => id !== violationId);
            } else {
                return [...prev, violationId];
            }
        });
    };

    const handleConfirm = () => {
        if (selectedVehicle && selectedViolations.length > 0) {
            // Filter selected violations
            const selectedViolationDetails = selectedVehicle.violations.filter((violation: any) =>
                selectedViolations.includes(violation.id)
            );

            // Create vehicle object with only selected violations
            const vehicleWithSelectedViolations = {
                ...selectedVehicle,
                violations: selectedViolationDetails
            };

            onVehicleSelected(vehicleWithSelectedViolations);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200'; // Failed smoke test - most serious
            case 'medium':
                return 'bg-orange-100 text-orange-800 border-orange-200'; // Apprehension without test
            case 'low':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Minor violation
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

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
                            {isLoading && (
                                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                        </div>
                        {error && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}
                    </div>

                    {/* Vehicle List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Available Vehicles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    <span>Searching vehicles...</span>
                                </div>
                            ) : vehicles.length === 0 && searchQuery ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No vehicles found matching "{searchQuery}"
                                </div>
                            ) : vehicles.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Enter a search term to find vehicles
                                </div>
                            ) : (
                                <div className="border rounded">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Plate Number</TableHead>
                                                <TableHead>Operator</TableHead>
                                                <TableHead>Driver</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {vehicles.map((vehicle) => (
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
                                                        {selectedVehicle?.id === vehicle.id && isLoadingViolations ? (
                                                            <div className="flex items-center">
                                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                                <span className="text-sm">Loading violations...</span>
                                                            </div>
                                                        ) : selectedVehicle?.id === vehicle.id && selectedVehicle.violations ? (
                                                            <Badge variant="outline">
                                                                {selectedVehicle.violations.length} violations
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline">
                                                                Click to load
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant={selectedVehicle?.id === vehicle.id ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => handleVehicleSelect(vehicle)}
                                                            disabled={isLoadingViolations && selectedVehicle?.id === vehicle.id}
                                                        >
                                                            {selectedVehicle?.id === vehicle.id ? "Selected" : "Select"}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Violations Selection */}
                    {selectedVehicle && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    Smoke Belching Violations for {selectedVehicle.plate_number}
                                </CardTitle>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Select violations to include in the order of payment. Each violation represents a smoke belching test failure or apprehension.
                                    </p>
                                    {selectedVehicle.violations && selectedVehicle.violations.length > 0 && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedViolations(selectedVehicle.violations.map((v: any) => v.id))}
                                            >
                                                Select All
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedViolations([])}
                                            >
                                                Clear All
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoadingViolations ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                        <span>Loading violations...</span>
                                    </div>
                                ) : selectedVehicle.violations && selectedVehicle.violations.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedVehicle.violations.map((violation: any) => {
                                            const driverOffenseLevel = getDriverOffenseLevel(violation, selectedVehicle.violations);
                                            const operatorOffenseLevel = getOperatorOffenseLevel(violation, selectedVehicle.violations);

                                            return (
                                                <div
                                                    key={violation.id}
                                                    className="flex items-center space-x-3 p-3 border rounded-lg"
                                                >
                                                    <Checkbox
                                                        checked={selectedViolations.includes(violation.id)}
                                                        onCheckedChange={() => handleViolationToggle(violation.id)}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1">
                                                        <Label className="font-medium cursor-pointer" onClick={() => handleViolationToggle(violation.id)}>
                                                            {violation.type}
                                                        </Label>
                                                        <div className="flex gap-2 mt-1">
                                                            <Badge className={`${getSeverityColor(violation.severity)}`}>
                                                                {violation.severity}
                                                            </Badge>
                                                            {violation.paid_driver && violation.paid_operator && (
                                                                <Badge variant="secondary">Paid</Badge>
                                                            )}
                                                            {violation.test_result_no && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    Test #{violation.test_result_no}
                                                                </Badge>
                                                            )}
                                                            <Badge variant="outline" className="text-xs bg-orange-50">
                                                                Driver: {driverOffenseLevel}{driverOffenseLevel === 1 ? 'st' : driverOffenseLevel === 2 ? 'nd' : 'rd'} offense
                                                            </Badge>
                                                            <Badge variant="outline" className="text-xs bg-purple-50">
                                                                Operator: {operatorOffenseLevel}{operatorOffenseLevel === 1 ? 'st' : operatorOffenseLevel === 2 ? 'nd' : 'rd'} offense
                                                            </Badge>
                                                        </div>
                                                        {violation.ordinance_report_no && (
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                Ordinance Report: {violation.ordinance_report_no}
                                                            </p>
                                                        )}
                                                        {violation.place_of_apprehension && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                📍 {violation.place_of_apprehension} • 📅 {violation.date_of_apprehension}
                                                            </p>
                                                        )}
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            Payment Status:
                                                            {violation.paid_driver ? " Driver ✓" : " Driver ✗"}
                                                            {violation.paid_operator ? " Operator ✓" : " Operator ✗"}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold">₱{violation.fine_amount.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No smoke belching violations found for this vehicle
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
                            disabled={!selectedVehicle || !selectedVehicle.violations || selectedViolations.length === 0}
                        >
                            Create Order of Payment ({selectedViolations.length} violations)
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default VehicleSelectionDialog;

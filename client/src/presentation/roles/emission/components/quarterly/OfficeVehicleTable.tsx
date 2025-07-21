import React, { useState, useCallback, useMemo, memo } from "react";
import { CheckCircle, XCircle, Clock, Plus, Check, X, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Checkbox } from "@/presentation/components/shared/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/presentation/components/shared/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/presentation/components/shared/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/presentation/components/shared/ui/table";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/presentation/components/shared/ui/collapsible";
import { Vehicle, EmissionTest } from "@/core/api/emission-service";

interface VehicleWithTests extends Vehicle {
    tests: {
        Q1: EmissionTest | null;
        Q2: EmissionTest | null;
        Q3: EmissionTest | null;
        Q4: EmissionTest | null;
    };
    remarks?: string;
}

interface OfficeGroup {
    office_id: string;
    office_name: string;
    vehicles: VehicleWithTests[];
}

interface OfficeVehicleTableProps {
    officeGroups: OfficeGroup[];
    selectedYear: number;
    isLoading: boolean;
    onAddTest: (vehicleId: string, quarter: number) => void;
    onEditTest: (test: EmissionTest) => void;
    onAddRemarks: (vehicleId: string, remarks: string) => void;
    onBatchAddTests?: (vehicleIds: string[], quarter: number, result: boolean) => Promise<void>;
    onUpdateTest?: (vehicleId: string, quarter: number, result: boolean | null) => Promise<void>;
    onBatchUpdateTests?: (vehicleIds: string[], quarter: number, result: boolean | null) => Promise<void>;
}

const QuarterDropdown: React.FC<{
    test: EmissionTest | null;
    quarter: number;
    vehicleId: string;
    onUpdateTest?: (vehicleId: string, quarter: number, result: boolean | null) => Promise<void>;
}> = memo(({ test, quarter, vehicleId, onUpdateTest }) => {
    const getStatusValue = useCallback(() => {
        if (!test) return "not-tested";
        return test.result ? "pass" : "fail";
    }, [test]);

    const getStatusDisplay = useCallback(() => {
        if (!test) return "Not Tested";
        return test.result ? "Pass" : "Fail";
    }, [test]);

    const getStatusColor = useCallback(() => {
        if (!test) return "text-gray-500";
        return test.result ? "text-green-600" : "text-red-600";
    }, [test]);

    const handleStatusChange = useCallback(async (value: string) => {
        if (!onUpdateTest) return;

        let result: boolean | null = null;
        if (value === "pass") result = true;
        else if (value === "fail") result = false;
        // "not-tested" keeps result as null

        await onUpdateTest(vehicleId, quarter, result);
    }, [onUpdateTest, vehicleId, quarter]);

    return (
        <TableCell className="text-center">
            <Select
                value={getStatusValue()}
                onValueChange={handleStatusChange}
            >
                <SelectTrigger className={`w-24 h-8 text-xs ${getStatusColor()}`}>
                    <SelectValue>
                        {getStatusDisplay()}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="not-tested" className="text-gray-500">
                        Not Tested
                    </SelectItem>
                    <SelectItem value="pass" className="text-green-600">
                        Pass
                    </SelectItem>
                    <SelectItem value="fail" className="text-red-600">
                        Fail
                    </SelectItem>
                </SelectContent>
            </Select>
        </TableCell>
    );
});

QuarterDropdown.displayName = 'QuarterDropdown';

// Memoized VehicleRow component
const VehicleRow: React.FC<{
    vehicle: VehicleWithTests;
    selectedYear: number;
    batchMode: boolean;
    isSelected: boolean;
    onToggleSelection: (vehicleId: string) => void;
    onUpdateTest?: (vehicleId: string, quarter: number, result: boolean | null) => Promise<void>;
    onAddRemarks: (vehicleId: string, remarks: string) => void;
}> = memo(({ vehicle, selectedYear, batchMode, isSelected, onToggleSelection, onUpdateTest, onAddRemarks }) => {
    const handleToggle = useCallback(() => {
        onToggleSelection(vehicle.id);
    }, [onToggleSelection, vehicle.id]);

    const handleAddRemarks = useCallback(() => {
        const remarks = prompt("Add remarks for this vehicle:", vehicle.remarks || "");
        if (remarks !== null) {
            onAddRemarks(vehicle.id, remarks);
        }
    }, [onAddRemarks, vehicle.id, vehicle.remarks]);

    return (
        <TableRow key={vehicle.id}>
            {batchMode && (
                <TableCell>
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={handleToggle}
                    />
                </TableCell>
            )}
            <TableCell className="font-medium">
                {vehicle.plate_number}
            </TableCell>
            <TableCell>{vehicle.driver_name}</TableCell>
            <TableCell>{vehicle.vehicle_type}</TableCell>

            <QuarterDropdown
                test={vehicle.tests.Q1}
                quarter={1}
                vehicleId={vehicle.id}
                onUpdateTest={onUpdateTest}
            />
            <QuarterDropdown
                test={vehicle.tests.Q2}
                quarter={2}
                vehicleId={vehicle.id}
                onUpdateTest={onUpdateTest}
            />
            <QuarterDropdown
                test={vehicle.tests.Q3}
                quarter={3}
                vehicleId={vehicle.id}
                onUpdateTest={onUpdateTest}
            />
            <QuarterDropdown
                test={vehicle.tests.Q4}
                quarter={4}
                vehicleId={vehicle.id}
                onUpdateTest={onUpdateTest}
            />

            <TableCell>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddRemarks}
                    className="text-xs"
                >
                    {vehicle.remarks ? "Edit" : "Add"} Remarks
                </Button>
                {vehicle.remarks && (
                    <div className="text-xs text-gray-600 mt-1 max-w-xs truncate">
                        {vehicle.remarks}
                    </div>
                )}
            </TableCell>
        </TableRow>
    );
});

VehicleRow.displayName = 'VehicleRow';

export const OfficeVehicleTable: React.FC<OfficeVehicleTableProps> = memo(({
    officeGroups,
    selectedYear,
    isLoading,
    onAddTest,
    onEditTest,
    onAddRemarks,
    onBatchAddTests,
    onUpdateTest,
    onBatchUpdateTests,
}) => {
    const [expandedOffices, setExpandedOffices] = useState<Set<string>>(new Set());
    const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());
    const [batchMode, setBatchMode] = useState(false);

    const toggleOffice = useCallback((officeId: string) => {
        setExpandedOffices(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(officeId)) {
                newExpanded.delete(officeId);
            } else {
                newExpanded.add(officeId);
            }
            return newExpanded;
        });
    }, []);

    const toggleVehicleSelection = useCallback((vehicleId: string) => {
        setSelectedVehicles(prev => {
            const newSelected = new Set(prev);
            if (newSelected.has(vehicleId)) {
                newSelected.delete(vehicleId);
            } else {
                newSelected.add(vehicleId);
            }
            return newSelected;
        });
    }, []);

    const selectAllVehiclesInOffice = useCallback((vehicles: VehicleWithTests[]) => {
        setSelectedVehicles(prev => {
            const newSelected = new Set(prev);
            vehicles.forEach(vehicle => newSelected.add(vehicle.id));
            return newSelected;
        });
    }, []);

    const deselectAllVehicles = useCallback(() => {
        setSelectedVehicles(new Set());
    }, []);

    const handleBatchTest = useCallback(async (quarter: number, result: boolean | null) => {
        if (onBatchUpdateTests && selectedVehicles.size > 0) {
            await onBatchUpdateTests(Array.from(selectedVehicles), quarter, result);
            setSelectedVehicles(new Set());
        }
    }, [onBatchUpdateTests, selectedVehicles]);

    const getOfficeStats = useCallback((vehicles: VehicleWithTests[]) => {
        const stats = {
            total: vehicles.length,
            tested: 0,
            passed: 0,
            failed: 0,
            untested: 0,
        };

        vehicles.forEach((vehicle) => {
            const quarters = [vehicle.tests.Q1, vehicle.tests.Q2, vehicle.tests.Q3, vehicle.tests.Q4];
            const hasAnyTest = quarters.some(test => test !== null);

            if (hasAnyTest) {
                stats.tested++;
                const hasPassedTest = quarters.some(test => test?.result === true);
                const hasFailedTest = quarters.some(test => test?.result === false);

                if (hasPassedTest && !hasFailedTest) {
                    stats.passed++;
                } else if (hasFailedTest) {
                    stats.failed++;
                }
            } else {
                stats.untested++;
            }
        });

        return stats;
    }, []);

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center h-32">
                        <div className="text-gray-500">Loading vehicles...</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Batch Edit Controls */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                    <Button
                        variant={batchMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                            setBatchMode(!batchMode);
                            setSelectedVehicles(new Set());
                        }}
                    >
                        {batchMode ? "Exit Batch Mode" : "Batch Edit Mode"}
                    </Button>

                    {batchMode && (
                        <>
                            <div className="text-sm text-gray-600">
                                {selectedVehicles.size} vehicle(s) selected
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={deselectAllVehicles}
                                disabled={selectedVehicles.size === 0}
                            >
                                Clear Selection
                            </Button>
                        </>
                    )}
                </div>

                {batchMode && selectedVehicles.size > 0 && onBatchUpdateTests && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Add test for selected vehicles:</span>
                        {[1, 2, 3, 4].map(quarter => (
                            <DropdownMenu key={quarter}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Q{quarter}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleBatchTest(quarter, null)}>
                                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                        Mark as Not Tested
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleBatchTest(quarter, true)}>
                                        <Check className="h-4 w-4 mr-2 text-green-500" />
                                        Mark as Pass
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleBatchTest(quarter, false)}>
                                        <X className="h-4 w-4 mr-2 text-red-500" />
                                        Mark as Fail
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ))}
                    </div>
                )}
            </div>

            {officeGroups.map((office) => {
                const stats = getOfficeStats(office.vehicles);
                const isExpanded = expandedOffices.has(office.office_id);

                return (
                    <Card key={office.office_id}>
                        <Collapsible open={isExpanded} onOpenChange={() => toggleOffice(office.office_id)}>
                            <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {isExpanded ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                            <CardTitle className="text-lg">{office.office_name}</CardTitle>
                                            {batchMode && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        selectAllVehiclesInOffice(office.vehicles);
                                                    }}
                                                    className="ml-2"
                                                >
                                                    Select All
                                                </Button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">
                                                {stats.total} vehicles
                                            </Badge>
                                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                {stats.passed} passed
                                            </Badge>
                                            <Badge variant="secondary" className="bg-red-100 text-red-700">
                                                {stats.failed} failed
                                            </Badge>
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                                {stats.untested} untested
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {batchMode && <TableHead className="w-12"></TableHead>}
                                                <TableHead>Plate Number</TableHead>
                                                <TableHead>Driver</TableHead>
                                                <TableHead>Vehicle Type</TableHead>
                                                <TableHead className="text-center">Q1</TableHead>
                                                <TableHead className="text-center">Q2</TableHead>
                                                <TableHead className="text-center">Q3</TableHead>
                                                <TableHead className="text-center">Q4</TableHead>
                                                <TableHead>Remarks ({selectedYear})</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {office.vehicles.map((vehicle) => (
                                                <VehicleRow
                                                    key={vehicle.id}
                                                    vehicle={vehicle}
                                                    selectedYear={selectedYear}
                                                    batchMode={batchMode}
                                                    isSelected={selectedVehicles.has(vehicle.id)}
                                                    onToggleSelection={toggleVehicleSelection}
                                                    onUpdateTest={onUpdateTest}
                                                    onAddRemarks={onAddRemarks}
                                                />
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </CollapsibleContent>
                        </Collapsible>
                    </Card>
                );
            })}
        </div>
    );
});

OfficeVehicleTable.displayName = 'OfficeVehicleTable';

export default OfficeVehicleTable;

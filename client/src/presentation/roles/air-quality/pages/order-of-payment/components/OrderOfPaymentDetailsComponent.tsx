import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Checkbox } from "@/presentation/components/shared/ui/checkbox";
import { Separator } from "@/presentation/components/shared/ui/separator";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/presentation/components/shared/ui/table";
import { CalendarIcon, Receipt, Save, X, Calculator, Ban } from "lucide-react";
import { OrderOfPayment, fetchViolationsByRecordId, searchBelchingRecords, PaymentChecklist } from "@/core/api/belching-api";
import { toast } from "sonner";
import { format, isValid, parseISO } from "date-fns";

// Safe date formatting function
const formatSafeDate = (dateValue: string | Date | null | undefined, formatString: string = "MMM dd, yyyy"): string => {
    if (!dateValue) return "N/A";

    try {
        let date: Date;
        if (typeof dateValue === 'string') {
            // Try to parse ISO string first, then fallback to regular Date constructor
            date = dateValue.includes('T') || dateValue.includes('-') ? parseISO(dateValue) : new Date(dateValue);
        } else {
            date = dateValue;
        }

        if (isValid(date)) {
            return format(date, formatString);
        } else {
            return "Invalid Date";
        }
    } catch (error) {
        console.warn("Date formatting error:", error, dateValue);
        return "Invalid Date";
    }
};

// Safe date comparison function
const safeDateCompare = (dateA: string | Date | null | undefined, dateB: string | Date | null | undefined): number => {
    try {
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        let parsedA: Date, parsedB: Date;

        if (typeof dateA === 'string') {
            parsedA = dateA.includes('T') || dateA.includes('-') ? parseISO(dateA) : new Date(dateA);
        } else {
            parsedA = dateA;
        }

        if (typeof dateB === 'string') {
            parsedB = dateB.includes('T') || dateB.includes('-') ? parseISO(dateB) : new Date(dateB);
        } else {
            parsedB = dateB;
        }

        if (!isValid(parsedA) && !isValid(parsedB)) return 0;
        if (!isValid(parsedA)) return 1;
        if (!isValid(parsedB)) return -1;

        return parsedA.getTime() - parsedB.getTime();
    } catch (error) {
        console.warn("Date comparison error:", error, dateA, dateB);
        return 0;
    }
};

interface OrderOfPaymentDetailsComponentProps {
    selectedOrder: OrderOfPayment | null;
    newOrderData?: any;
    onCreateOrder: (orderData: any) => void;
    onUpdateOrder: (orderId: string, orderData: Partial<OrderOfPayment>) => void;
    onDeleteOrder: (orderId: string) => void;
    showAsFullPage?: boolean;
}

const OrderOfPaymentDetailsComponent: React.FC<OrderOfPaymentDetailsComponentProps> = ({
    selectedOrder,
    newOrderData,
    onCreateOrder,
    onUpdateOrder,
    onDeleteOrder,
    showAsFullPage = false,
}) => {
    const [violations, setViolations] = useState<any[]>([]);
    const [selectedViolations, setSelectedViolations] = useState<string[]>([]);
    const [paymentChecklist, setPaymentChecklist] = useState<PaymentChecklist>({
        apprehension_fee: { checked: false, amount: 0 },
        voluntary_fee: { checked: false, amount: 0 },
        impound_fee: { checked: false, amount: 0 },
        driver_amount: { checked: false, amount: 0 },
        operator_fee: { checked: false, amount: 0 },
    });
    const [testingInfo, setTestingInfo] = useState({
        testing_officer: "",
        test_results: "",
        date_of_testing: "",
    });
    const [dateOfPayment, setDateOfPayment] = useState<string>(new Date().toISOString().split('T')[0]);
    const [paymentDetails, setPaymentDetails] = useState({
        payment_or_number: "",
        payment_date: new Date().toISOString().split('T')[0],
        total_amount: 0,
        discount: 0,
        grand_total_amount: 0,
    });
    const [totals, setTotals] = useState({
        total_undisclosed_amount: 0,
        grand_total_amount: 0,
    });

    // Initialize data when order is selected or new order data is provided
    useEffect(() => {
        if (selectedOrder) {
            setSelectedViolations(selectedOrder.selected_violations || []);
            setPaymentChecklist({
                apprehension_fee: { checked: !!selectedOrder.apprehension_fee, amount: selectedOrder.apprehension_fee || 0 },
                voluntary_fee: { checked: !!selectedOrder.voluntary_fee, amount: selectedOrder.voluntary_fee || 0 },
                impound_fee: { checked: !!selectedOrder.impound_fee, amount: selectedOrder.impound_fee || 0 },
                driver_amount: { checked: !!selectedOrder.driver_amount, amount: selectedOrder.driver_amount || 0 },
                operator_fee: { checked: !!selectedOrder.operator_fee, amount: selectedOrder.operator_fee || 0 },
            });
            setTestingInfo({
                testing_officer: selectedOrder.testing_officer || "",
                test_results: selectedOrder.test_results || "",
                date_of_testing: selectedOrder.date_of_testing || "",
            });
            setDateOfPayment(selectedOrder.date_of_payment || new Date().toISOString().split('T')[0]);
            setTotals({
                total_undisclosed_amount: selectedOrder.total_undisclosed_amount,
                grand_total_amount: selectedOrder.grand_total_amount,
            });
            loadViolations(selectedOrder.plate_number);
        } else if (newOrderData) {
            // Initialize with new order data
            setViolations(newOrderData.violations || []);
            setSelectedViolations(newOrderData.violations?.map((v: any) => v.id) || []);
            setPaymentChecklist({
                apprehension_fee: { checked: false, amount: 0 },
                voluntary_fee: { checked: false, amount: 0 },
                impound_fee: { checked: false, amount: 0 },
                driver_amount: { checked: false, amount: 0 },
                operator_fee: { checked: false, amount: 0 },
            });
            setTestingInfo({
                testing_officer: "",
                test_results: "",
                date_of_testing: "",
            });
            setDateOfPayment(new Date().toISOString().split('T')[0]);
        } else {
            resetForm();
        }
    }, [selectedOrder, newOrderData]);

    // Auto-calculate totals when payment checklist changes
    useEffect(() => {
        let total = 0;

        Object.entries(paymentChecklist).forEach(([key, value]) => {
            if (value.checked) {
                total += value.amount;
            }
        });

        setTotals({
            total_undisclosed_amount: total,
            grand_total_amount: total,
        });
    }, [paymentChecklist]);

    const resetForm = () => {
        setViolations([]);
        setSelectedViolations([]);
        setPaymentChecklist({
            apprehension_fee: { checked: false, amount: 0 },
            voluntary_fee: { checked: false, amount: 0 },
            impound_fee: { checked: false, amount: 0 },
            driver_amount: { checked: false, amount: 0 },
            operator_fee: { checked: false, amount: 0 },
        });
        setTestingInfo({
            testing_officer: "",
            test_results: "",
            date_of_testing: "",
        });
        setDateOfPayment(new Date().toISOString().split('T')[0]);
        setTotals({
            total_undisclosed_amount: 0,
            grand_total_amount: 0,
        });
    };

    const loadViolations = async (plateNumber: string) => {
        try {
            // First search for the record with this plate number
            const records = await searchBelchingRecords({ plateNumber });
            if (records.length > 0) {
                const record = records[0];
                const violationsData = await fetchViolationsByRecordId(record.id);
                setViolations(violationsData);
            }
        } catch (error) {
            console.error("Error loading violations:", error);
            toast.error("Failed to load violations");
        }
    };

    const handleViolationToggle = (violationId: string, isChecked: boolean) => {
        if (isChecked) {
            setSelectedViolations(prev => [...prev, violationId]);
        } else {
            setSelectedViolations(prev => prev.filter(id => id !== violationId));
        }
    };

    const handlePaymentChecklistChange = (
        type: keyof PaymentChecklist,
        field: 'checked' | 'amount',
        value: boolean | number
    ) => {
        let updatedChecklist = { ...paymentChecklist };

        // If checking driver_amount or operator_fee, calculate the penalty amounts
        if (field === 'checked' && value === true) {
            if (type === 'driver_amount') {
                // Calculate total driver penalties from selected violations
                let totalDriverPenalty = 0;
                violations.forEach(violation => {
                    if (violation.paid_driver) {
                        const offenseLevel = getDriverOffenseLevel(violation.id);
                        totalDriverPenalty += getDriverPenalty(offenseLevel);
                    }
                });
                updatedChecklist[type] = { checked: true, amount: totalDriverPenalty };
            } else if (type === 'operator_fee') {
                // Calculate total operator penalties from selected violations
                let totalOperatorPenalty = 0;
                violations.forEach(violation => {
                    if (violation.paid_operator) {
                        const offenseLevel = getOperatorOffenseLevel(violation.id);
                        totalOperatorPenalty += getOperatorPenalty(offenseLevel);
                    }
                });
                updatedChecklist[type] = { checked: true, amount: totalOperatorPenalty };
            } else {
                updatedChecklist[type] = { ...updatedChecklist[type], [field]: value };
            }
        } else {
            updatedChecklist[type] = { ...updatedChecklist[type], [field]: value };
        }

        setPaymentChecklist(updatedChecklist);
    };

    const handleViolationPaymentChange = (violationId: number, field: 'paid_driver' | 'paid_operator', isChecked: boolean) => {
        // Update the violation in the local state first
        const updatedViolations = violations.map(violation =>
            violation.id === violationId
                ? { ...violation, [field]: isChecked }
                : violation
        );
        setViolations(updatedViolations);

        // Calculate amounts based on updated violations
        if (field === 'paid_driver') {
            let totalDriverPenalty = 0;
            updatedViolations.forEach(violation => {
                if (violation.paid_driver) {
                    const offenseLevel = getDriverOffenseLevel(violation.id);
                    totalDriverPenalty += getDriverPenalty(offenseLevel);
                }
            });

            const hasAnyDriverPayment = updatedViolations.some(v => v.paid_driver);

            setPaymentChecklist(prev => ({
                ...prev,
                driver_amount: {
                    checked: hasAnyDriverPayment,
                    amount: totalDriverPenalty
                }
            }));
        } else if (field === 'paid_operator') {
            let totalOperatorPenalty = 0;
            updatedViolations.forEach(violation => {
                if (violation.paid_operator) {
                    const offenseLevel = getOperatorOffenseLevel(violation.id);
                    totalOperatorPenalty += getOperatorPenalty(offenseLevel);
                }
            });

            const hasAnyOperatorPayment = updatedViolations.some(v => v.paid_operator);

            setPaymentChecklist(prev => ({
                ...prev,
                operator_fee: {
                    checked: hasAnyOperatorPayment,
                    amount: totalOperatorPenalty
                }
            }));
        }
    };

    // Helper functions for violation calculations
    const getDriverOffenseLevel = (violationId: number) => {
        const violation = violations.find(v => v.id === violationId);
        if (!violation?.driver_id) return "1st";

        // Count previous violations by the same driver
        const driverViolations = violations
            .filter(v => v.driver_id === violation.driver_id && v.id <= violationId)
            .sort((a, b) => safeDateCompare(a.date_of_apprehension, b.date_of_apprehension));

        const index = driverViolations.findIndex(v => v.id === violationId);
        return getOrdinalNumber(index + 1);
    };

    const getOperatorOffenseLevel = (violationId: number) => {
        if (!selectedOrder) return "1st";

        // Count violations for this operator/plate number
        const operatorViolations = violations
            .filter(v => v.id <= violationId)
            .sort((a, b) => safeDateCompare(a.date_of_apprehension, b.date_of_apprehension));

        const index = operatorViolations.findIndex(v => v.id === violationId);
        return getOrdinalNumber(index + 1);
    };

    const getOrdinalNumber = (num: number): string => {
        const suffixes = ["th", "st", "nd", "rd"];
        const v = num % 100;
        return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
    };

    const getDriverPenalty = (offenseLevel: string): number => {
        const penalties = {
            "1st": 500,
            "2nd": 1000,
            "3rd": 2000,
        };
        return penalties[offenseLevel as keyof typeof penalties] || 5000;
    };

    const getOperatorPenalty = (offenseLevel: string): number => {
        const penalties = {
            "1st": 1000,
            "2nd": 2000,
            "3rd": 5000,
        };
        return penalties[offenseLevel as keyof typeof penalties] || 10000;
    };

    const computePayment = () => {
        let total = 0;

        Object.entries(paymentChecklist).forEach(([key, value]) => {
            if (value.checked) {
                total += value.amount;
            }
        });

        setTotals({
            total_undisclosed_amount: total,
            grand_total_amount: total,
        });

        toast.success("Payment computed successfully");
    };

    // Generate a unique control number
    const generateControlNumber = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        // Format: OOP-YYYYMMDD-HHMMSS
        return `OOP-${year}${month}${day}-${hours}${minutes}${seconds}`;
    };

    const handleSaveOrder = () => {
        // For new orders (when we have newOrderData but no selectedOrder.id)
        if (newOrderData && (!selectedOrder || !selectedOrder.id)) {
            const controlNumber = generateControlNumber();

            const newOrderPayload = {
                oop_control_number: controlNumber,
                control_number: controlNumber, // Also set this for backward compatibility
                plate_number: newOrderData.vehicle.plate_number,
                operator_name: newOrderData.vehicle.operator_name,
                status: 'on_process', // Changed from 'draft' to 'on_process'
                ...testingInfo,
                selected_violations: selectedViolations,
                apprehension_fee: paymentChecklist.apprehension_fee.checked ? paymentChecklist.apprehension_fee.amount : 0,
                voluntary_fee: paymentChecklist.voluntary_fee.checked ? paymentChecklist.voluntary_fee.amount : 0,
                impound_fee: paymentChecklist.impound_fee.checked ? paymentChecklist.impound_fee.amount : 0,
                driver_amount: paymentChecklist.driver_amount.checked ? paymentChecklist.driver_amount.amount : 0,
                operator_fee: paymentChecklist.operator_fee.checked ? paymentChecklist.operator_fee.amount : 0,
                total_undisclosed_amount: totals.total_undisclosed_amount,
                grand_total_amount: totals.grand_total_amount,
                date_of_payment: dateOfPayment,
            };

            onCreateOrder(newOrderPayload);
            toast.success(`Order of payment created successfully with control number: ${controlNumber}`);
            return;
        }

        // For existing orders
        if (!selectedOrder) return;

        const updateData: Partial<OrderOfPayment> = {
            ...testingInfo,
            selected_violations: selectedViolations,
            apprehension_fee: paymentChecklist.apprehension_fee.checked ? paymentChecklist.apprehension_fee.amount : 0,
            voluntary_fee: paymentChecklist.voluntary_fee.checked ? paymentChecklist.voluntary_fee.amount : 0,
            impound_fee: paymentChecklist.impound_fee.checked ? paymentChecklist.impound_fee.amount : 0,
            driver_amount: paymentChecklist.driver_amount.checked ? paymentChecklist.driver_amount.amount : 0,
            operator_fee: paymentChecklist.operator_fee.checked ? paymentChecklist.operator_fee.amount : 0,
            total_undisclosed_amount: totals.total_undisclosed_amount,
            grand_total_amount: totals.grand_total_amount,
            date_of_payment: dateOfPayment,
        };

        onUpdateOrder(selectedOrder.id, updateData);
        toast.success("Order of payment updated successfully");
    };

    const handleCancelOrder = () => {
        // For new orders, just go back to search without creating
        if (newOrderData && (!selectedOrder || !selectedOrder.id)) {
            toast.info("New order creation cancelled");
            // You might want to add a callback to go back to search here
            return;
        }

        // For existing orders, mark as cancelled
        if (!selectedOrder) return;

        const updateData: Partial<OrderOfPayment> = {
            status: 'cancelled',
        };

        onUpdateOrder(selectedOrder.id, updateData);
        toast.success("Order of payment cancelled");
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { label: "Draft", variant: "secondary" as const },
            pending: { label: "Pending", variant: "default" as const },
            paid: { label: "Paid", variant: "green" as const },
            cancelled: { label: "Cancelled", variant: "destructive" as const },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    if (!selectedOrder && !newOrderData) {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Order of Payment Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        <Receipt className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg">Select an order to view details</p>
                        <p className="text-sm">Choose an order from the search results to see payment information</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Use selectedOrder or create a new order structure from newOrderData
    const currentOrder = selectedOrder || {
        id: 'new',
        oop_control_number: '', // Empty for new orders - will be generated on save
        control_number: '', // Empty for new orders - will be generated on save
        plate_number: newOrderData?.vehicle?.plate_number || '',
        operator_name: newOrderData?.vehicle?.operator_name || '',
        driver_name: newOrderData?.vehicle?.driver_name || '',
        status: 'draft',
        created_date: new Date().toISOString().split('T')[0],
        // Add other required fields with defaults
        apprehension_fee: 0,
        voluntary_fee: 0,
        impound_fee: 0,
        driver_amount: 0,
        operator_fee: 0,
        total_undisclosed_amount: 0,
        grand_total_amount: 0,
        selected_violations: newOrderData?.violations?.map((v: any) => v.id) || [],
        testing_officer: '',
        test_results: '',
        date_of_testing: '',
        date_of_payment: new Date().toISOString().split('T')[0],
    };

    // Determine if this is a new order being created vs existing order being viewed/edited
    const isNewOrder = !selectedOrder || selectedOrder.id === 'new' || (newOrderData && (!selectedOrder.oop_control_number || selectedOrder.status === 'draft'));

    // Render function for adding new order (current layout)
    const renderNewOrderView = () => (
        <div className="h-full flex flex-col gap-2">
            {/* Request and Testing Information */}
            <Card>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                        {/* Left Side - Request Information */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-lg border-b pb-2">Request Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm text-muted-foreground">Status</Label>
                                    <p className="font-medium">{currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}</p>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">OOP Control Number</Label>
                                    <p className="font-medium">
                                        {currentOrder.oop_control_number ?
                                            currentOrder.oop_control_number :
                                            <span className="text-amber-600 italic">Will be generated upon saving</span>
                                        }
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">Plate Number</Label>
                                    <p className="font-medium">{currentOrder.plate_number}</p>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">Operator Name</Label>
                                    <p className="font-medium">{currentOrder.operator_name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Testing Information */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-lg border-b pb-2">Testing Information</h4>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="testingOfficer">Testing Officer</Label>
                                    <Input
                                        id="testingOfficer"
                                        value={testingInfo.testing_officer}
                                        onChange={(e) => setTestingInfo(prev => ({ ...prev, testing_officer: e.target.value }))}
                                        placeholder="Officer name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="testResults">Test Results</Label>
                                    <Input
                                        id="testResults"
                                        value={testingInfo.test_results}
                                        onChange={(e) => setTestingInfo(prev => ({ ...prev, test_results: e.target.value }))}
                                        placeholder="Test results"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dateOfTesting">Date of Testing</Label>
                                    <Input
                                        id="dateOfTesting"
                                        type="date"
                                        value={testingInfo.date_of_testing}
                                        onChange={(e) => setTestingInfo(prev => ({ ...prev, date_of_testing: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 flex-1">
                {/* Violations Panel */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Violations of Selected Vehicle</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0">
                        <div className="h-full overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12"></TableHead>
                                        <TableHead>Date of Apprehension</TableHead>
                                        <TableHead>Driver Offense</TableHead>
                                        <TableHead>Driver Penalty</TableHead>
                                        <TableHead>Operator Offense</TableHead>
                                        <TableHead>Operator Penalty</TableHead>
                                        <TableHead>Pay Driver</TableHead>
                                        <TableHead>Pay Operator</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {violations.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center text-muted-foreground py-4">
                                                No violations found for this vehicle
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        violations.map((violation) => {
                                            const driverOffenseLevel = getDriverOffenseLevel(violation.id);
                                            const operatorOffenseLevel = getOperatorOffenseLevel(violation.id);
                                            const driverPenalty = getDriverPenalty(driverOffenseLevel);
                                            const operatorPenalty = getOperatorPenalty(operatorOffenseLevel);

                                            return (
                                                <TableRow key={violation.id}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedViolations.includes(violation.id.toString())}
                                                            onCheckedChange={(checked) =>
                                                                handleViolationToggle(violation.id.toString(), !!checked)
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatSafeDate(violation.date_of_apprehension)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {driverOffenseLevel} offense
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-mono">₱{driverPenalty.toLocaleString()}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {operatorOffenseLevel} offense
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-mono">₱{operatorPenalty.toLocaleString()}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={violation.paid_driver}
                                                            onCheckedChange={(checked) =>
                                                                handleViolationPaymentChange(violation.id, 'paid_driver', !!checked)
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={violation.paid_operator}
                                                            onCheckedChange={(checked) =>
                                                                handleViolationPaymentChange(violation.id, 'paid_operator', !!checked)
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Payments Checklist Panel */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Payments Checklist</CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    // Reset payment checklist
                                    setPaymentChecklist({
                                        apprehension_fee: { checked: false, amount: 0 },
                                        voluntary_fee: { checked: false, amount: 0 },
                                        impound_fee: { checked: false, amount: 0 },
                                        driver_amount: { checked: false, amount: 0 },
                                        operator_fee: { checked: false, amount: 0 }
                                    });

                                    // Reset violations payment status
                                    if (violations.length > 0) {
                                        violations.forEach(violation => {
                                            handleViolationPaymentChange(violation.id, 'paid_driver', false);
                                            handleViolationPaymentChange(violation.id, 'paid_operator', false);
                                        });
                                    }

                                    // Recompute totals
                                    computePayment();

                                    toast.success("Payment checklist reset");
                                }}
                                className="gap-1"
                            >
                                <X className="h-3 w-3" />
                                Reset
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6">
                        {/* Fees Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={paymentChecklist.apprehension_fee.checked}
                                    onCheckedChange={(checked) =>
                                        handlePaymentChecklistChange('apprehension_fee', 'checked', !!checked)
                                    }
                                />
                                <Label className="flex-1">Apprehension Fee</Label>
                                <div className="flex items-center gap-1">
                                    <span>₱</span>
                                    <Input
                                        type="number"
                                        value={paymentChecklist.apprehension_fee.amount}
                                        onChange={(e) =>
                                            handlePaymentChecklistChange('apprehension_fee', 'amount', Number(e.target.value))
                                        }
                                        className="w-24"
                                        disabled={!paymentChecklist.apprehension_fee.checked}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={paymentChecklist.voluntary_fee.checked}
                                    onCheckedChange={(checked) =>
                                        handlePaymentChecklistChange('voluntary_fee', 'checked', !!checked)
                                    }
                                />
                                <Label className="flex-1">Voluntary Fee</Label>
                                <div className="flex items-center gap-1">
                                    <span>₱</span>
                                    <Input
                                        type="number"
                                        value={paymentChecklist.voluntary_fee.amount}
                                        onChange={(e) =>
                                            handlePaymentChecklistChange('voluntary_fee', 'amount', Number(e.target.value))
                                        }
                                        className="w-24"
                                        disabled={!paymentChecklist.voluntary_fee.checked}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={paymentChecklist.impound_fee.checked}
                                    onCheckedChange={(checked) =>
                                        handlePaymentChecklistChange('impound_fee', 'checked', !!checked)
                                    }
                                />
                                <Label className="flex-1">Impound Fee</Label>
                                <div className="flex items-center gap-1">
                                    <span>₱</span>
                                    <Input
                                        type="number"
                                        value={paymentChecklist.impound_fee.amount}
                                        onChange={(e) =>
                                            handlePaymentChecklistChange('impound_fee', 'amount', Number(e.target.value))
                                        }
                                        className="w-24"
                                        disabled={!paymentChecklist.impound_fee.checked}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={paymentChecklist.driver_amount.checked}
                                    onCheckedChange={(checked) =>
                                        handlePaymentChecklistChange('driver_amount', 'checked', !!checked)
                                    }
                                />
                                <Label className="flex-1">Driver Amount</Label>
                                <div className="flex items-center gap-1">
                                    <span>₱</span>
                                    <Input
                                        type="number"
                                        value={paymentChecklist.driver_amount.amount}
                                        onChange={(e) =>
                                            handlePaymentChecklistChange('driver_amount', 'amount', Number(e.target.value))
                                        }
                                        className="w-24"
                                        disabled={!paymentChecklist.driver_amount.checked}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={paymentChecklist.operator_fee.checked}
                                    onCheckedChange={(checked) =>
                                        handlePaymentChecklistChange('operator_fee', 'checked', !!checked)
                                    }
                                />
                                <Label className="flex-1">Operator Fee</Label>
                                <div className="flex items-center gap-1">
                                    <span>₱</span>
                                    <Input
                                        type="number"
                                        value={paymentChecklist.operator_fee.amount}
                                        onChange={(e) =>
                                            handlePaymentChecklistChange('operator_fee', 'amount', Number(e.target.value))
                                        }
                                        className="w-24"
                                        disabled={!paymentChecklist.operator_fee.checked}
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Totals and Actions */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Total Undisclosed Amount:</span>
                                    <span className="font-medium">₱{totals.total_undisclosed_amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Grand Total Amount:</span>
                                    <span>₱{totals.grand_total_amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <Label htmlFor="dateOfPayment">Date of Payment:</Label>
                                    <Input
                                        id="dateOfPayment"
                                        type="date"
                                        value={dateOfPayment}
                                        onChange={(e) => setDateOfPayment(e.target.value)}
                                        className="w-auto text-right border-none bg-transparent p-0 h-auto text-sm focus:ring-0"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={handleCancelOrder} variant="destructive" className="flex-1">
                                    <Ban className="h-4 w-4 mr-2" />
                                    Cancel Order
                                </Button>
                                <Button onClick={handleSaveOrder} className="flex-1">
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Order
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    // Render function for viewing/editing existing order (new layout)
    const renderExistingOrderView = () => (
        <div className="h-full flex flex-col gap-2">
            {/* Request Information Header */}
            <Card>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                        {/* Left Side - Request Information */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-lg border-b pb-2">Request Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm text-muted-foreground">Status</Label>
                                    <Badge variant="outline" className="mt-1">On Process</Badge>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">OOP Control Number</Label>
                                    <p className="font-medium">{currentOrder.oop_control_number}</p>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">Plate Number</Label>
                                    <p className="font-medium">{currentOrder.plate_number}</p>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">Operator Name</Label>
                                    <p className="font-medium">{currentOrder.operator_name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Testing Information */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-lg border-b pb-2">Testing Information</h4>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="testingOfficer">Testing Officer</Label>
                                    <Input
                                        id="testingOfficer"
                                        value={testingInfo.testing_officer}
                                        onChange={(e) => setTestingInfo(prev => ({ ...prev, testing_officer: e.target.value }))}
                                        placeholder="Officer name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="testResults">Test Results</Label>
                                    <Input
                                        id="testResults"
                                        value={testingInfo.test_results}
                                        onChange={(e) => setTestingInfo(prev => ({ ...prev, test_results: e.target.value }))}
                                        placeholder="Test results"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dateOfTesting">Date of Testing</Label>
                                    <Input
                                        id="dateOfTesting"
                                        type="date"
                                        value={testingInfo.date_of_testing}
                                        onChange={(e) => setTestingInfo(prev => ({ ...prev, date_of_testing: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 flex-1">
                {/* Left Side - Payment Details Breakdown */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Payment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0">
                        <div className="h-full overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Offense</TableHead>
                                        <TableHead>Date of Apprehension</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {/* Operator Offense */}
                                    {violations.filter(v => selectedViolations.includes(v.id)).map((violation, index) => (
                                        <TableRow key={`operator-${violation.id}`}>
                                            <TableCell>Operator</TableCell>
                                            <TableCell>{currentOrder.plate_number}</TableCell>
                                            <TableCell>{violation.operator_offense || "N/A"}</TableCell>
                                            <TableCell>{formatSafeDate(violation.date_of_apprehension)}</TableCell>
                                            <TableCell className="text-right">₱{violation.operator_penalty?.toLocaleString() || "0"}</TableCell>
                                        </TableRow>
                                    ))}

                                    {/* Driver Offense */}
                                    {violations.filter(v => selectedViolations.includes(v.id)).map((violation, index) => (
                                        <TableRow key={`driver-${violation.id}`}>
                                            <TableCell>Driver</TableCell>
                                            <TableCell>{currentOrder.driver_name || "N/A"}</TableCell>
                                            <TableCell>{violation.driver_offense || "N/A"}</TableCell>
                                            <TableCell>{formatSafeDate(violation.date_of_apprehension)}</TableCell>
                                            <TableCell className="text-right">₱{violation.driver_penalty?.toLocaleString() || "0"}</TableCell>
                                        </TableRow>
                                    ))}

                                    {/* Misc - Testing Fee */}
                                    <TableRow>
                                        <TableCell>Misc</TableCell>
                                        <TableCell>Testing Fee</TableCell>
                                        <TableCell>Emission Testing</TableCell>
                                        <TableCell>{formatSafeDate(testingInfo.date_of_testing)}</TableCell>
                                        <TableCell className="text-right">₱{paymentChecklist.apprehension_fee.amount.toLocaleString()}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Side - Payment Summary */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Payment Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="paymentORNumber">Payment OR Number</Label>
                                <Input
                                    id="paymentORNumber"
                                    value={paymentDetails.payment_or_number}
                                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, payment_or_number: e.target.value }))}
                                    placeholder="Enter OR number"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="paymentDate">Payment Date</Label>
                                <Input
                                    id="paymentDate"
                                    type="date"
                                    value={paymentDetails.payment_date}
                                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, payment_date: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="totalAmount">Total Amount</Label>
                                <Input
                                    id="totalAmount"
                                    type="number"
                                    value={paymentDetails.total_amount}
                                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, total_amount: parseFloat(e.target.value) || 0 }))}
                                    className="text-right"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="discount">Discount</Label>
                                <Input
                                    id="discount"
                                    type="number"
                                    value={paymentDetails.discount}
                                    onChange={(e) => {
                                        const discount = parseFloat(e.target.value) || 0;
                                        setPaymentDetails(prev => ({
                                            ...prev,
                                            discount,
                                            grand_total_amount: prev.total_amount - discount
                                        }));
                                    }}
                                    className="text-right"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-lg">
                                    <span className="font-bold">Grand Total Amount:</span>
                                    <span className="font-bold text-green-600">₱{paymentDetails.grand_total_amount.toLocaleString()}</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex gap-2 mt-auto">
                                <Button onClick={handleCancelOrder} variant="destructive" className="flex-1">
                                    <Ban className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveOrder} className="flex-1">
                                    <Save className="h-4 w-4 mr-2" />
                                    Save
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    // Return the appropriate view based on order status
    return isNewOrder ? renderNewOrderView() : renderExistingOrderView();
};

export default OrderOfPaymentDetailsComponent;

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Checkbox } from "@/presentation/components/shared/ui/checkbox";
import { Separator } from "@/presentation/components/shared/ui/separator";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/presentation/components/shared/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/shared/ui/select";
import { Calculator, Ban, Save, X, Receipt } from "lucide-react";
import { toast } from "sonner";
import { OrderOfPayment, TestingInfo, PaymentDetails } from "../logic/types";
import { formatSafeDate } from "../logic/utils";
import { useFeeCalculation } from "../logic/useFeeCalculation";

interface OrderOfPaymentNewViewProps {
    currentOrder: OrderOfPayment;
    testingInfo: TestingInfo;
    setTestingInfo: (info: TestingInfo | ((prev: TestingInfo) => TestingInfo)) => void;
    violations: any[];
    getDriverOffenseLevel: (violationId: number) => string;
    getOperatorOffenseLevel: (violationId: number) => string;
    getDriverPenalty: (offenseLevel: string) => number;
    getOperatorPenalty: (offenseLevel: string) => number;
    handleViolationPaymentChange: (violationId: number, field: 'paid_driver' | 'paid_operator', isChecked: boolean) => void;
    paymentChecklist: any;
    handlePaymentChecklistChange: (type: any, field: any, value: any) => void;
    totals: any;
    dateOfPayment: string;
    setDateOfPayment: (date: string) => void;
    handleSaveOrder: () => void;
    handleCancelOrder: () => void;
    calculateFeesFromControl: () => void;
    resetPaymentChecklist: () => void;
    resetViolationsPayment: () => void;
    feesLoading: boolean;
    fees: any[];
    driverPenaltiesTotal: number;
    operatorPenaltiesTotal: number;
}

const OrderOfPaymentNewView: React.FC<OrderOfPaymentNewViewProps> = ({
    currentOrder,
    testingInfo,
    setTestingInfo,
    violations,
    getDriverOffenseLevel,
    getOperatorOffenseLevel,
    getDriverPenalty,
    getOperatorPenalty,
    handleViolationPaymentChange,
    paymentChecklist,
    handlePaymentChecklistChange,
    totals,
    dateOfPayment,
    setDateOfPayment,
    handleSaveOrder,
    handleCancelOrder,
    calculateFeesFromControl,
    resetPaymentChecklist,
    resetViolationsPayment,
    feesLoading,
    fees,
    driverPenaltiesTotal,
    operatorPenaltiesTotal,
}) => {
    const handleReset = () => {
        resetPaymentChecklist();
        resetViolationsPayment();
        toast.success("Payment checklist reset");
    };

    // Check if there are individual penalties selected
    const hasIndividualDriverPenalties = driverPenaltiesTotal > 0;
    const hasIndividualOperatorPenalties = operatorPenaltiesTotal > 0;

    return (
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
                                            <TableCell colSpan={7} className="text-center text-muted-foreground py-4">
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
                            <div className="flex items-center gap-2">
                                <CardTitle>Payments Checklist</CardTitle>
                                {feesLoading && (
                                    <Badge variant="secondary" className="text-xs">
                                        Loading fees...
                                    </Badge>
                                )}
                                {!feesLoading && fees.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                        Fee Control Connected
                                    </Badge>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        calculateFeesFromControl();
                                        toast.success("Fees calculated from fee control");
                                    }}
                                    disabled={feesLoading || !fees.length}
                                    className="gap-1"
                                >
                                    <Calculator className="h-3 w-3" />
                                    Calculate Fees
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleReset}
                                    className="gap-1"
                                >
                                    <X className="h-3 w-3" />
                                    Reset
                                </Button>
                            </div>
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
                                        onChange={(e) => {
                                            const value = e.target.value === '' ? 0 : Number(e.target.value);
                                            handlePaymentChecklistChange('apprehension_fee', 'amount', isNaN(value) ? 0 : value);
                                        }}
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
                                        onChange={(e) => {
                                            const value = e.target.value === '' ? 0 : Number(e.target.value);
                                            handlePaymentChecklistChange('voluntary_fee', 'amount', isNaN(value) ? 0 : value);
                                        }}
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
                                        onChange={(e) => {
                                            const value = e.target.value === '' ? 0 : Number(e.target.value);
                                            handlePaymentChecklistChange('impound_fee', 'amount', isNaN(value) ? 0 : value);
                                        }}
                                        className="w-24"
                                        disabled={!paymentChecklist.impound_fee.checked}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Totals and Summary Panel - Moved below the grid */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Totals and Actions */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            {/* Breakdown of totals */}
                            <div className="text-xs text-muted-foreground space-y-1">
                                <div className="flex justify-between">
                                    <span>Fees Total:</span>
                                    <span>₱{['apprehension_fee', 'voluntary_fee', 'impound_fee'].reduce((sum: number, key: string) => {
                                        const item = paymentChecklist[key];
                                        return sum + (item && item.checked ? Number(item.amount) : 0);
                                    }, 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Driver Penalties Total:</span>
                                    <span>₱{violations.reduce((sum: number, violation: any) => {
                                        if (violation.paid_driver) {
                                            const offenseLevel = getDriverOffenseLevel(violation.id);
                                            const penalty = Number(getDriverPenalty(offenseLevel));
                                            return sum + penalty;
                                        }
                                        return sum;
                                    }, 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Operator Penalties Total:</span>
                                    <span>₱{violations.reduce((sum: number, violation: any) => {
                                        if (violation.paid_operator) {
                                            const offenseLevel = getOperatorOffenseLevel(violation.id);
                                            const penalty = Number(getOperatorPenalty(offenseLevel));
                                            return sum + penalty;
                                        }
                                        return sum;
                                    }, 0).toLocaleString()}</span>
                                </div>
                                <Separator className="my-1" />
                            </div>

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
    );
};

// Wrapper component interface
interface OrderOfPaymentDetailsComponentProps {
    selectedOrder?: OrderOfPayment | null;
    newOrderData?: any;
    onCreateOrder: (orderData: any) => void;
    onUpdateOrder: (orderId: string, orderData: any) => void;
    onDeleteOrder: (orderId: string) => void;
    showAsFullPage?: boolean;
}

// Wrapper component that bridges the props
const OrderOfPaymentDetailsComponent: React.FC<OrderOfPaymentDetailsComponentProps> = ({
    selectedOrder,
    newOrderData,
    onCreateOrder,
    onUpdateOrder,
    onDeleteOrder,
    showAsFullPage = false,
}) => {
    // Use fee calculation hook to get actual fee data
    const {
        fees,
        loading: feesLoading,
        error: feesError,
        getFeeByCategory,
        calculateViolationFees,
        getDriverOffenseLevel: calculateDriverOffenseLevel,
        getOperatorOffenseLevel: calculateOperatorOffenseLevel
    } = useFeeCalculation();

    // Debug: Log fees when they load
    React.useEffect(() => {
        if (fees.length > 0) {
            console.log("Fees loaded in component:", fees);
        }
    }, [fees]);

    // Sync editable status when selectedOrder changes
    React.useEffect(() => {
        if (selectedOrder?.status) {
            setEditableStatus(selectedOrder.status);
        }
    }, [selectedOrder?.status]);

    // Function to format violation IDs into readable descriptions
    const formatViolationDescriptions = (violationIds: string) => {
        if (!violationIds) return 'No violations specified';

        const violationMap: { [key: string]: string } = {
            '1': 'Excessive smoke emission',
            '2': 'Failure to pass emission test',
            '3': 'Operating without valid emission certificate',
            '4': 'Tampering with emission control equipment',
            '5': 'Refusing emission inspection',
            '6': 'Using banned fuel type',
            '7': 'Operating overloaded vehicle',
            '8': 'Violation of route restrictions',
        };

        const ids = violationIds.split(',').map(id => id.trim());
        const descriptions = ids.map(id => violationMap[id] || `Violation ${id}`);

        return descriptions.join(', ');
    };

    // State for the form
    const [testingInfo, setTestingInfo] = React.useState<TestingInfo>({
        testing_officer: '',
        test_results: '',
        date_of_testing: new Date().toISOString().split('T')[0]
    });

    const [paymentChecklist, setPaymentChecklist] = React.useState({
        apprehension_fee: { checked: false, amount: 0 },
        voluntary_fee: { checked: false, amount: 0 },
        impound_fee: { checked: false, amount: 0 }
    });

    const [dateOfPayment, setDateOfPayment] = React.useState(new Date().toISOString().split('T')[0]);

    // State for editable status
    const [editableStatus, setEditableStatus] = React.useState(selectedOrder?.status || 'unpaid');

    // State for violations with payment status
    const [violationsWithPayment, setViolationsWithPayment] = React.useState(() => {
        return (newOrderData?.violations || []).map((violation: any) => ({
            ...violation,
            paid_driver: violation.paid_driver || false,
            paid_operator: violation.paid_operator || false
        }));
    });

    // Create current order from props
    const currentOrder: OrderOfPayment = selectedOrder || {
        id: '',
        oop_control_number: '',
        control_number: '',
        plate_number: newOrderData?.vehicle?.plate_number || '',
        operator_name: newOrderData?.vehicle?.operator_name || '',
        status: 'unpaid',
        selected_violations: [],
        grand_total_amount: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    // Get violations from newOrderData
    const violations = violationsWithPayment;

    // Effect to automatically calculate initial fees when violations and fee data are available
    React.useEffect(() => {
        if (violationsWithPayment.length > 0 && fees.length > 0 && !feesLoading) {
            // Auto-calculate fees when component loads with violation data
            const initialFees = calculateViolationFees(violationsWithPayment);

            setPaymentChecklist({
                apprehension_fee: {
                    checked: initialFees.apprehension_fee > 0, // Auto-check if fee amount > 0
                    amount: initialFees.apprehension_fee
                },
                voluntary_fee: {
                    checked: initialFees.voluntary_fee > 0, // Auto-check if fee amount > 0
                    amount: initialFees.voluntary_fee
                },
                impound_fee: {
                    checked: initialFees.impound_fee > 0, // Auto-check if fee amount > 0
                    amount: initialFees.impound_fee
                }
            });
        }
    }, [violationsWithPayment, fees, feesLoading, calculateViolationFees]);

    // Functions for offense levels and penalties - now using real fee data
    const getDriverOffenseLevel = (violationId: number) => {
        const violation = violations.find(v => v.id === violationId);
        if (!violation) return "First";

        const level = calculateDriverOffenseLevel(violation, violations);
        const levelMap: { [key: number]: string } = { 1: "First", 2: "Second", 3: "Third" };
        return levelMap[level] || "First";
    };

    const getOperatorOffenseLevel = (violationId: number) => {
        const violation = violations.find(v => v.id === violationId);
        if (!violation) return "First";

        const level = calculateOperatorOffenseLevel(violation, violations);
        const levelMap: { [key: number]: string } = { 1: "First", 2: "Second", 3: "Third" };
        return levelMap[level] || "First";
    };

    const getDriverPenalty = (offenseLevel: string) => {
        const levelMap: { [key: string]: number } = {
            "First": 1,
            "Second": 2,
            "Third": 3
        };
        const level = levelMap[offenseLevel] || 1;
        const penalty = getFeeByCategory("driver", level);

        // Fallback values if fee lookup fails
        const fallbackPenalties = {
            1: 500,   // First offense
            2: 1000,  // Second offense
            3: 2000   // Third offense
        };

        const finalPenalty = penalty || fallbackPenalties[level] || 500;
        console.log(`Driver penalty for ${offenseLevel} (level ${level}): ${penalty} -> using: ${finalPenalty}`);
        return finalPenalty;
    };

    const getOperatorPenalty = (offenseLevel: string) => {
        const levelMap: { [key: string]: number } = {
            "First": 1,
            "Second": 2,
            "Third": 3
        };
        const level = levelMap[offenseLevel] || 1;
        const penalty = getFeeByCategory("operator", level);

        // Fallback values if fee lookup fails
        const fallbackPenalties = {
            1: 1000,  // First offense
            2: 2000,  // Second offense
            3: 5000   // Third offense
        };

        const finalPenalty = penalty || fallbackPenalties[level] || 1000;
        console.log(`Operator penalty for ${offenseLevel} (level ${level}): ${penalty} -> using: ${finalPenalty}`);
        return finalPenalty;
    };

    // Calculate penalty totals from actual violation payments (moved after function declarations)
    const driverPenaltiesTotal = React.useMemo(() => {
        return violationsWithPayment.reduce((sum: number, violation: any) => {
            if (violation.paid_driver) {
                const offenseLevel = getDriverOffenseLevel(violation.id);
                const penalty = getDriverPenalty(offenseLevel);
                return sum + Number(penalty || 0);
            }
            return sum;
        }, 0);
    }, [violationsWithPayment]);

    const operatorPenaltiesTotal = React.useMemo(() => {
        return violationsWithPayment.reduce((sum: number, violation: any) => {
            if (violation.paid_operator) {
                const offenseLevel = getOperatorOffenseLevel(violation.id);
                const penalty = getOperatorPenalty(offenseLevel);
                return sum + Number(penalty || 0);
            }
            return sum;
        }, 0);
    }, [violationsWithPayment]);

    // Payment checklist handlers
    const handlePaymentChecklistChange = (type: string, field: string, value: any) => {
        setPaymentChecklist(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value
            }
        }));
    };

    const handleViolationPaymentChange = (violationId: number, field: 'paid_driver' | 'paid_operator', isChecked: boolean) => {
        // Update the violation payment status
        setViolationsWithPayment(prev => {
            const updated = prev.map(violation =>
                violation.id === violationId
                    ? { ...violation, [field]: isChecked }
                    : violation
            );

            console.log('Updated violation payments:', {
                violationId,
                field,
                isChecked,
                updatedViolations: updated
            });

            return updated;
        });
    };

    // Handle status change
    const handleStatusChange = (newStatus: string) => {
        setEditableStatus(newStatus);
        if (selectedOrder && onUpdateOrder) {
            onUpdateOrder(selectedOrder.id, { status: newStatus });
            toast.success(`Status updated to ${newStatus}`);
        }
    };

    // Calculate totals including driver and operator penalties
    const totals = React.useMemo(() => ({
        get total_undisclosed_amount() {
            // Helper function to safely convert to number
            const safeNumber = (value: any): number => {
                const num = Number(value);
                return isNaN(num) || !isFinite(num) ? 0 : num;
            };

            // Calculate basic fees total
            const basicFeesTotal = ['apprehension_fee', 'voluntary_fee', 'impound_fee'].reduce((sum: number, key: string) => {
                const item = paymentChecklist[key];
                if (item && item.checked) {
                    return sum + safeNumber(item.amount);
                }
                return sum;
            }, 0);

            // Use the calculated penalty totals
            const driverTotal = driverPenaltiesTotal || 0;
            const operatorTotal = operatorPenaltiesTotal || 0;

            const total = basicFeesTotal + driverTotal + operatorTotal;

            console.log('Total calculation:', {
                basicFeesTotal,
                driverTotal,
                operatorTotal,
                finalTotal: total
            });

            return total;
        },
        get grand_total_amount() {
            return this.total_undisclosed_amount;
        }
    }), [paymentChecklist, driverPenaltiesTotal, operatorPenaltiesTotal]);

    // Actions
    const handleSaveOrder = () => {
        // Calculate fees that should be included
        const apprehensionAmount = paymentChecklist.apprehension_fee.checked ? paymentChecklist.apprehension_fee.amount : 0;
        const voluntaryAmount = paymentChecklist.voluntary_fee.checked ? paymentChecklist.voluntary_fee.amount : 0;
        const impoundAmount = paymentChecklist.impound_fee.checked ? paymentChecklist.impound_fee.amount : 0;

        const orderData = {
            // Basic order info
            plate_number: currentOrder.plate_number,
            operator_name: currentOrder.operator_name,
            driver_name: currentOrder.driver_name || '',

            // Testing info
            testing_officer: testingInfo.testing_officer,
            test_results: testingInfo.test_results,
            date_of_testing: testingInfo.date_of_testing,

            // Flatten payment checklist to individual fields
            apprehension_fee: apprehensionAmount,
            voluntary_fee: voluntaryAmount,
            impound_fee: impoundAmount,

            // Driver and operator penalty amounts
            driver_amount: driverPenaltiesTotal,
            operator_fee: operatorPenaltiesTotal,

            // Totals
            total_undisclosed_amount: apprehensionAmount + voluntaryAmount + impoundAmount + driverPenaltiesTotal + operatorPenaltiesTotal,
            grand_total_amount: apprehensionAmount + voluntaryAmount + impoundAmount + driverPenaltiesTotal + operatorPenaltiesTotal,

            // Payment info
            date_of_payment: dateOfPayment,
            payment_or_number: `PAY-${Date.now()}`, // Generate a payment OR number

            // Violations (convert to comma-separated string if needed)
            selected_violations: violationsWithPayment.map(v => v.id).join(','),

            // Status
            status: 'unpaid'
        };

        console.log('Saving order with data:', orderData);
        console.log('Payment checklist state:', paymentChecklist);
        console.log('Driver penalties total:', driverPenaltiesTotal);
        console.log('Operator penalties total:', operatorPenaltiesTotal);
        onCreateOrder(orderData);
    };

    const handleCancelOrder = () => {
        // Reset all form data
        setPaymentChecklist({
            apprehension_fee: { checked: false, amount: 0 },
            voluntary_fee: { checked: false, amount: 0 },
            impound_fee: { checked: false, amount: 0 }
        });

        // Reset violations payment status
        setViolationsWithPayment(prev =>
            prev.map(violation => ({
                ...violation,
                paid_driver: false,
                paid_operator: false
            }))
        );

        // Reset testing info
        setTestingInfo({
            testing_officer: '',
            test_results: '',
            date_of_testing: new Date().toISOString().split('T')[0]
        });

        // Navigate back to order list
        window.history.back();

        console.log('Order form reset and navigated back');
    };

    const calculateFeesFromControl = () => {
        if (!violationsWithPayment.length) {
            toast.warning("No violations found to calculate fees");
            return;
        }

        try {
            // Calculate violation-based fees using the fee calculation hook
            const calculatedFees = calculateViolationFees(violationsWithPayment);

            // Update payment checklist with calculated fees
            setPaymentChecklist(prev => ({
                ...prev,
                apprehension_fee: {
                    checked: calculatedFees.apprehension_fee > 0,
                    amount: calculatedFees.apprehension_fee
                },
                voluntary_fee: {
                    checked: calculatedFees.voluntary_fee > 0,
                    amount: calculatedFees.voluntary_fee
                },
                impound_fee: {
                    checked: calculatedFees.impound_fee > 0,
                    amount: calculatedFees.impound_fee
                }
            }));

            toast.success("Fees calculated successfully from fee control system");
        } catch (error) {
            console.error("Error calculating fees:", error);
            toast.error("Failed to calculate fees from fee control");
        }
    };

    const resetPaymentChecklist = () => {
        setPaymentChecklist({
            apprehension_fee: { checked: false, amount: 0 },
            voluntary_fee: { checked: false, amount: 0 },
            impound_fee: { checked: false, amount: 0 }
        });
    };

    const resetViolationsPayment = () => {
        setViolationsWithPayment(prev =>
            prev.map(violation => ({
                ...violation,
                paid_driver: false,
                paid_operator: false
            }))
        );

        console.log('Violations payment status reset');
    };

    // If we have new order data, show the form
    if (newOrderData) {
        return (
            <OrderOfPaymentNewView
                currentOrder={currentOrder}
                testingInfo={testingInfo}
                setTestingInfo={setTestingInfo}
                violations={violationsWithPayment}
                getDriverOffenseLevel={getDriverOffenseLevel}
                getOperatorOffenseLevel={getOperatorOffenseLevel}
                getDriverPenalty={getDriverPenalty}
                getOperatorPenalty={getOperatorPenalty}
                handleViolationPaymentChange={handleViolationPaymentChange}
                paymentChecklist={paymentChecklist}
                handlePaymentChecklistChange={handlePaymentChecklistChange}
                totals={totals}
                dateOfPayment={dateOfPayment}
                setDateOfPayment={setDateOfPayment}
                handleSaveOrder={handleSaveOrder}
                handleCancelOrder={handleCancelOrder}
                calculateFeesFromControl={calculateFeesFromControl}
                resetPaymentChecklist={resetPaymentChecklist}
                resetViolationsPayment={resetViolationsPayment}
                feesLoading={feesLoading}
                fees={fees}
                driverPenaltiesTotal={driverPenaltiesTotal}
                operatorPenaltiesTotal={operatorPenaltiesTotal}
            />
        );
    }

    // For existing orders, show order details
    return (
        <div className="h-full overflow-auto bg-white">
            {/* Order of Payment Document */}
            <div className="max-w-4xl mx-auto p-8 bg-white">
                {/* Header */}
                <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">ORDER OF PAYMENT</h1>
                    <p className="text-gray-600">Environmental Protection and Natural Resources Office</p>
                    <p className="text-sm text-gray-500">Air Quality Management Division</p>
                </div>

                {selectedOrder ? (
                    <>
                        {/* Order Information */}
                        <div className="mb-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Order Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-700">Control Number:</span>
                                            <span className="text-gray-900">{selectedOrder.oop_control_number || selectedOrder.control_number || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-700">Status:</span>
                                            <Select
                                                value={editableStatus}
                                                onValueChange={handleStatusChange}
                                            >
                                                <SelectTrigger className="w-32 h-7">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unpaid">
                                                        <span className="flex items-center">
                                                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                                            Unpaid
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="partially_paid">
                                                        <span className="flex items-center">
                                                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                                            Partially Paid
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="fully_paid">
                                                        <span className="flex items-center">
                                                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                            Fully Paid
                                                        </span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-700">Date Created:</span>
                                            <span className="text-gray-900">{selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-700">Payment OR Number:</span>
                                            <span className="text-gray-900">{selectedOrder.payment_or_number || 'Not yet paid'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Vehicle Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-700">Plate Number:</span>
                                            <span className="text-gray-900 font-mono text-lg">{selectedOrder.plate_number}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-700">Operator Name:</span>
                                            <span className="text-gray-900">{selectedOrder.operator_name}</span>
                                        </div>
                                        {selectedOrder.driver_name && (
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-700">Driver Name:</span>
                                                <span className="text-gray-900">{selectedOrder.driver_name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Testing Information */}
                        {(selectedOrder.testing_officer || selectedOrder.test_results || selectedOrder.date_of_testing) && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900">Testing Information</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {selectedOrder.testing_officer && (
                                            <div>
                                                <span className="font-medium text-gray-700 block">Testing Officer:</span>
                                                <span className="text-gray-900">{selectedOrder.testing_officer}</span>
                                            </div>
                                        )}
                                        {selectedOrder.test_results && (
                                            <div>
                                                <span className="font-medium text-gray-700 block">Test Results:</span>
                                                <span className="text-gray-900">{selectedOrder.test_results}</span>
                                            </div>
                                        )}
                                        {selectedOrder.date_of_testing && (
                                            <div>
                                                <span className="font-medium text-gray-700 block">Date of Testing:</span>
                                                <span className="text-gray-900">{new Date(selectedOrder.date_of_testing).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fees and Charges */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">Fees and Charges Breakdown</h3>
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium text-gray-700">Description</th>
                                            <th className="px-4 py-3 text-right font-medium text-gray-700">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {/* Always show basic fees, even if 0 */}
                                        <tr>
                                            <td className="px-4 py-3 text-gray-900">Apprehension Fee</td>
                                            <td className="px-4 py-3 text-right text-gray-900 font-mono">₱{Number(selectedOrder.apprehension_fee || 0).toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-gray-900">Voluntary Fee</td>
                                            <td className="px-4 py-3 text-right text-gray-900 font-mono">₱{Number(selectedOrder.voluntary_fee || 0).toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-gray-900">Impound Fee</td>
                                            <td className="px-4 py-3 text-right text-gray-900 font-mono">₱{Number(selectedOrder.impound_fee || 0).toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-gray-900">Driver Penalties</td>
                                            <td className="px-4 py-3 text-right text-gray-900 font-mono">₱{Number(selectedOrder.driver_amount || 0).toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-gray-900">Operator Penalties</td>
                                            <td className="px-4 py-3 text-right text-gray-900 font-mono">₱{Number(selectedOrder.operator_fee || 0).toLocaleString()}</td>
                                        </tr>

                                        {/* Subtotal calculation */}
                                        <tr className="bg-gray-100">
                                            <td className="px-4 py-3 text-gray-900 font-medium">Subtotal</td>
                                            <td className="px-4 py-3 text-right text-gray-900 font-mono font-medium">
                                                ₱{(
                                                    Number(selectedOrder.apprehension_fee || 0) +
                                                    Number(selectedOrder.voluntary_fee || 0) +
                                                    Number(selectedOrder.impound_fee || 0) +
                                                    Number(selectedOrder.driver_amount || 0) +
                                                    Number(selectedOrder.operator_fee || 0)
                                                ).toLocaleString()}
                                            </td>
                                        </tr>

                                        {/* Grand Total */}
                                        <tr className="bg-gray-50 font-semibold">
                                            <td className="px-4 py-3 text-gray-900 text-lg">TOTAL AMOUNT DUE</td>
                                            <td className="px-4 py-3 text-right text-gray-900 font-mono text-lg">
                                                ₱{(
                                                    Number(selectedOrder.apprehension_fee || 0) +
                                                    Number(selectedOrder.voluntary_fee || 0) +
                                                    Number(selectedOrder.impound_fee || 0) +
                                                    Number(selectedOrder.driver_amount || 0) +
                                                    Number(selectedOrder.operator_fee || 0)
                                                ).toLocaleString()}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">Payment Information</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="font-medium text-gray-700 block">Date of Payment:</span>
                                        <span className="text-gray-900">
                                            {selectedOrder.date_of_payment ? new Date(selectedOrder.date_of_payment).toLocaleDateString() : 'Not yet paid'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700 block">Payment Status:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${editableStatus === 'fully paid' ? 'bg-green-100 text-green-800' :
                                                editableStatus === 'partially paid' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {editableStatus === 'fully paid' ? 'FULLY PAID' :
                                                editableStatus === 'partially paid' ? 'PARTIALLY PAID' :
                                                    'UNPAID'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-12 pt-8 border-t border-gray-300">
                            <div className="text-center text-sm text-gray-600">
                                <p>This order of payment is valid and must be settled within the prescribed period.</p>
                                <p className="mt-2">For inquiries, please contact the Air Quality Management Division.</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No order selected</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderOfPaymentDetailsComponent;
export { OrderOfPaymentNewView };

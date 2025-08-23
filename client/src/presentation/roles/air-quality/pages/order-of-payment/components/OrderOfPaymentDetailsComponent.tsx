import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Checkbox } from "@/presentation/components/shared/ui/checkbox";
import { Separator } from "@/presentation/components/shared/ui/separator";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/presentation/components/shared/ui/table";
import { Calculator, Ban, Save, X } from "lucide-react";
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
}) => {
    const handleReset = () => {
        resetPaymentChecklist();
        resetViolationsPayment();
        toast.success("Payment checklist reset");
    };

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
                                        value={Number(paymentChecklist.driver_amount.amount) || 0}
                                        onChange={(e) =>
                                            handlePaymentChecklistChange('driver_amount', 'amount', Number(e.target.value))
                                        }
                                        className="w-24"
                                        disabled={!paymentChecklist.driver_amount.checked}
                                        placeholder="0"
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
                                        value={Number(paymentChecklist.operator_fee.amount) || 0}
                                        onChange={(e) =>
                                            handlePaymentChecklistChange('operator_fee', 'amount', Number(e.target.value))
                                        }
                                        className="w-24"
                                        disabled={!paymentChecklist.operator_fee.checked}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Totals and Actions */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                {/* Breakdown of totals */}
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <div className="flex justify-between">
                                        <span>Fees Total:</span>
                                        <span>₱{Object.values(paymentChecklist).reduce((sum: number, item: any) =>
                                            sum + (item.checked ? Number(item.amount) : 0), 0
                                        ).toLocaleString()}</span>
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

    // State for the form
    const [testingInfo, setTestingInfo] = React.useState<TestingInfo>({
        testing_officer: '',
        test_results: '',
        date_of_testing: new Date().toISOString().split('T')[0]
    });

    const [paymentChecklist, setPaymentChecklist] = React.useState({
        apprehension_fee: { checked: false, amount: 0 },
        voluntary_fee: { checked: false, amount: 0 },
        impound_fee: { checked: false, amount: 0 },
        driver_amount: { checked: false, amount: 0 },
        operator_fee: { checked: false, amount: 0 }
    });

    const [dateOfPayment, setDateOfPayment] = React.useState(new Date().toISOString().split('T')[0]);

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
        status: 'pending',
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
                    checked: false,
                    amount: initialFees.apprehension_fee
                },
                voluntary_fee: {
                    checked: false,
                    amount: initialFees.voluntary_fee
                },
                impound_fee: {
                    checked: false,
                    amount: initialFees.impound_fee
                },
                driver_amount: {
                    checked: false,
                    amount: initialFees.driver_penalty
                },
                operator_fee: {
                    checked: false,
                    amount: initialFees.operator_penalty
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
        return getFeeByCategory("driver", levelMap[offenseLevel] || 1);
    };

    const getOperatorPenalty = (offenseLevel: string) => {
        const levelMap: { [key: string]: number } = {
            "First": 1,
            "Second": 2,
            "Third": 3
        };
        return getFeeByCategory("operator", levelMap[offenseLevel] || 1);
    };

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
        setViolationsWithPayment(prev =>
            prev.map(violation =>
                violation.id === violationId
                    ? { ...violation, [field]: isChecked }
                    : violation
            )
        );

        // Automatically update payment checklist amounts
        const violation = violationsWithPayment.find(v => v.id === violationId);
        if (violation) {
            if (field === 'paid_driver') {
                const offenseLevel = getDriverOffenseLevel(violationId);
                const penalty = getDriverPenalty(offenseLevel);

                setPaymentChecklist(prev => {
                    const currentDriverAmount = Number(prev.driver_amount.amount) || 0;
                    const newDriverAmount = isChecked
                        ? currentDriverAmount + penalty
                        : Math.max(0, currentDriverAmount - penalty);

                    return {
                        ...prev,
                        driver_amount: {
                            checked: newDriverAmount > 0,
                            amount: newDriverAmount
                        }
                    };
                });
            } else if (field === 'paid_operator') {
                const offenseLevel = getOperatorOffenseLevel(violationId);
                const penalty = getOperatorPenalty(offenseLevel);

                setPaymentChecklist(prev => {
                    const currentOperatorAmount = Number(prev.operator_fee.amount) || 0;
                    const newOperatorAmount = isChecked
                        ? currentOperatorAmount + penalty
                        : Math.max(0, currentOperatorAmount - penalty);

                    return {
                        ...prev,
                        operator_fee: {
                            checked: newOperatorAmount > 0,
                            amount: newOperatorAmount
                        }
                    };
                });
            }
        }

        console.log('Violation payment updated:', { violationId, field, isChecked });
    };

    // Calculate totals including driver and operator penalties
    const totals = {
        get total_undisclosed_amount() {
            // Calculate payment checklist total
            const checklistTotal = Object.values(paymentChecklist).reduce((sum: number, item: any) =>
                sum + (item.checked ? Number(item.amount) : 0), 0
            );

            // Calculate driver penalties total for checked violations
            const driverPenaltiesTotal = violations.reduce((sum: number, violation: any) => {
                if (violation.paid_driver) {
                    const offenseLevel = getDriverOffenseLevel(violation.id);
                    const penalty = Number(getDriverPenalty(offenseLevel));
                    return sum + penalty;
                }
                return sum;
            }, 0);

            // Calculate operator penalties total for checked violations
            const operatorPenaltiesTotal = violations.reduce((sum: number, violation: any) => {
                if (violation.paid_operator) {
                    const offenseLevel = getOperatorOffenseLevel(violation.id);
                    const penalty = Number(getOperatorPenalty(offenseLevel));
                    return sum + penalty;
                }
                return sum;
            }, 0);

            return checklistTotal + driverPenaltiesTotal + operatorPenaltiesTotal;
        },
        get grand_total_amount() {
            // Calculate payment checklist total
            const checklistTotal = Object.values(paymentChecklist).reduce((sum: number, item: any) =>
                sum + (item.checked ? Number(item.amount) : 0), 0
            );

            // Calculate driver penalties total for checked violations
            const driverPenaltiesTotal = violations.reduce((sum: number, violation: any) => {
                if (violation.paid_driver) {
                    const offenseLevel = getDriverOffenseLevel(violation.id);
                    const penalty = Number(getDriverPenalty(offenseLevel));
                    return sum + penalty;
                }
                return sum;
            }, 0);

            // Calculate operator penalties total for checked violations
            const operatorPenaltiesTotal = violations.reduce((sum: number, violation: any) => {
                if (violation.paid_operator) {
                    const offenseLevel = getOperatorOffenseLevel(violation.id);
                    const penalty = Number(getOperatorPenalty(offenseLevel));
                    return sum + penalty;
                }
                return sum;
            }, 0);

            return checklistTotal + driverPenaltiesTotal + operatorPenaltiesTotal;
        }
    };

    // Actions
    const handleSaveOrder = () => {
        const orderData = {
            ...currentOrder,
            testing_info: testingInfo,
            payment_checklist: paymentChecklist,
            date_of_payment: dateOfPayment,
            violations: violationsWithPayment,
            totals
        };
        onCreateOrder(orderData);
    };

    const handleCancelOrder = () => {
        // Reset form or navigate back
        console.log('Order cancelled');
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
                },
                driver_amount: {
                    checked: calculatedFees.driver_penalty > 0,
                    amount: calculatedFees.driver_penalty
                },
                operator_fee: {
                    checked: calculatedFees.operator_penalty > 0,
                    amount: calculatedFees.operator_penalty
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
            impound_fee: { checked: false, amount: 0 },
            driver_amount: { checked: false, amount: 0 },
            operator_fee: { checked: false, amount: 0 }
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

        // Also reset driver and operator amounts in payment checklist
        setPaymentChecklist(prev => ({
            ...prev,
            driver_amount: { checked: false, amount: 0 },
            operator_fee: { checked: false, amount: 0 }
        }));

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
            />
        );
    }

    // For existing orders, show order details
    return (
        <div className="p-4">
            <div className="text-center">
                <h3 className="text-lg font-semibold">Order Details Component</h3>
                <p className="text-gray-600">Component integration in progress</p>
                {selectedOrder && (
                    <div className="mt-4 p-4 bg-gray-50 rounded">
                        <p><strong>Control Number:</strong> {selectedOrder.oop_control_number || selectedOrder.control_number}</p>
                        <p><strong>Plate Number:</strong> {selectedOrder.plate_number}</p>
                        <p><strong>Operator:</strong> {selectedOrder.operator_name}</p>
                        <p><strong>Status:</strong> {selectedOrder.status}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderOfPaymentDetailsComponent;
export { OrderOfPaymentNewView };

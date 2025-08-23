import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/presentation/components/shared/ui/dialog";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Save, X } from "lucide-react";

interface Fee {
    id: number;
    amount: number;
    category: string;
    level: number;
    effective_date: string;
    created_at: string;
    updated_at: string;
}

interface PenaltyFeeBulkEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: string;
    fees: Fee[];
    onSave: (category: string, feeUpdates: { id: number; level: number; amount: number; effective_date: string }[]) => void;
    isLoading?: boolean;
}

const PenaltyFeeBulkEditModal: React.FC<PenaltyFeeBulkEditModalProps> = ({
    isOpen,
    onClose,
    category,
    fees,
    onSave,
    isLoading = false,
}) => {
    const [feeData, setFeeData] = useState<{
        [level: number]: { amount: string; effective_date: string; id?: number };
    }>({});

    useEffect(() => {
        if (isOpen && fees.length > 0) {
            const initialData: typeof feeData = {};
            fees.forEach(fee => {
                initialData[fee.level] = {
                    amount: fee.amount.toString(),
                    effective_date: fee.effective_date,
                    id: fee.id,
                };
            });
            // Fill missing levels with empty data
            [1, 2, 3].forEach(level => {
                if (!initialData[level]) {
                    initialData[level] = {
                        amount: '',
                        effective_date: new Date().toISOString().split('T')[0],
                    };
                }
            });
            setFeeData(initialData);
        }
    }, [isOpen, fees]);

    const handleAmountChange = (level: number, value: string) => {
        setFeeData(prev => ({
            ...prev,
            [level]: {
                ...prev[level],
                amount: value,
            },
        }));
    };

    const handleDateChange = (level: number, value: string) => {
        setFeeData(prev => ({
            ...prev,
            [level]: {
                ...prev[level],
                effective_date: value,
            },
        }));
    };

    const handleSave = () => {
        const updates = Object.entries(feeData)
            .filter(([_, data]) => data.amount && parseFloat(data.amount) > 0)
            .map(([level, data]) => ({
                id: data.id || 0, // Will be handled by backend for new fees
                level: parseInt(level),
                amount: parseFloat(data.amount),
                effective_date: data.effective_date,
            }));

        onSave(category, updates);
    };

    const getLevelLabel = (level: number) => {
        return level === 1 ? '1st Offense' : level === 2 ? '2nd Offense' : '3rd Offense';
    };

    const getLevelBadgeVariant = (level: number) => {
        return level === 1 ? 'default' : level === 2 ? 'secondary' : 'destructive';
    };

    const categoryLabel = category === 'driver' ? 'Driver Penalties' : 'Operator Penalties';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Edit {categoryLabel}
                        <Badge variant="outline">Bulk Edit</Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Edit penalty fees for {category} violations. You can set amounts for all three offense levels at once.
                    </p>

                    <div className="grid gap-4">
                        {[1, 2, 3].map(level => (
                            <Card key={level}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center justify-between">
                                        <span>{getLevelLabel(level)}</span>
                                        <Badge variant={getLevelBadgeVariant(level)} className="text-xs">
                                            Level {level}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`amount-${level}`}>Amount (₱)</Label>
                                            <Input
                                                id={`amount-${level}`}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="Enter amount"
                                                value={feeData[level]?.amount || ''}
                                                onChange={(e) => handleAmountChange(level, e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`date-${level}`}>Effective Date</Label>
                                            <Input
                                                id={`date-${level}`}
                                                type="date"
                                                value={feeData[level]?.effective_date || ''}
                                                onChange={(e) => handleDateChange(level, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PenaltyFeeBulkEditModal;

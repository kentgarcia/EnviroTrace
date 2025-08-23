import React, { useState, useEffect } from 'react';
import { Button } from '@/presentation/components/shared/ui/button';
import { Input } from '@/presentation/components/shared/ui/input';
import { Label } from '@/presentation/components/shared/ui/label';
import { Badge } from '@/presentation/components/shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/shared/ui/select';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/presentation/components/shared/ui/card';
import { AlertTriangle, Banknote } from 'lucide-react';
import { Fee } from '../logic/useFeeData';

// Category display mapping
const CATEGORY_LABELS: Record<string, string> = {
    'APPREHENSION': 'Apprehension Fee',
    'VOLUNTARY': 'Voluntary Fee',
    'IMPOUND': 'Impound Fee',
    'TESTING': 'Testing Fee',
    'DRIVER': 'Driver Penalty',
    'OPERATOR': 'Operator Penalty'
};

const getCategoryLabel = (category: string): string => {
    return CATEGORY_LABELS[category] || category;
};

const getLevelBadge = (level: number) => {
    if (level === 0) {
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Base Fee</Badge>;
    } else {
        const variant = level === 1 ? "default" : level === 2 ? "secondary" : "destructive";
        return <Badge variant={variant}>Level {level}</Badge>;
    }
};

interface FeeDetailsPanelProps {
    selectedFee: Fee | null;
    onUpdateFee: (feeId: string, updateData: Partial<Fee>) => void;
    loading?: boolean;
    error?: string | null;
}

const FeeDetailsPanel: React.FC<FeeDetailsPanelProps> = ({
    selectedFee,
    onUpdateFee,
    loading = false,
    error = null,
}) => {
    const [editForm, setEditForm] = useState<Partial<Fee>>({});
    const [isUpdating, setIsUpdating] = useState(false);

    // Update form when selected fee changes
    useEffect(() => {
        if (selectedFee) {
            setEditForm({
                category: selectedFee.category,
                amount: selectedFee.amount,
                effective_date: selectedFee.effective_date,
                level: selectedFee.level,
            });
        } else {
            setEditForm({});
        }
    }, [selectedFee]);

    const handleFieldChange = (field: keyof Omit<Fee, 'id'>, value: string | number) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUpdateFee = async () => {
        if (!selectedFee) return;

        setIsUpdating(true);
        try {
            // Always send id as a number and amount as decimal
            const updateData = {
                ...editForm,
                amount: editForm.amount !== undefined ? Number(editForm.amount) : undefined,
            };
            await onUpdateFee(selectedFee.id.toString(), updateData);
        } catch (err) {
            console.error('Failed to update fee:', err);
            console.log('id type:', typeof selectedFee.id, selectedFee.id);
        } finally {
            setIsUpdating(false);
        }
    };

    const hasChanges = selectedFee && (
        editForm.category !== selectedFee.category ||
        editForm.amount !== selectedFee.amount ||
        editForm.effective_date !== selectedFee.effective_date ||
        editForm.level !== selectedFee.level
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Fee Details</CardTitle>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="text-center text-gray-500">
                        Loading...
                    </div>
                )}
                {error && (
                    <div className="text-center text-red-500">{error}</div>
                )}
                {selectedFee ? (
                    <div className="space-y-4">
                        {/* Fee Overview */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Banknote className="h-5 w-5 text-blue-600" />
                                <span className="font-semibold text-blue-900">
                                    {getCategoryLabel(selectedFee.category)}
                                </span>
                                {getLevelBadge(selectedFee.level)}
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                                ₱{selectedFee.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                                Effective: {new Date(selectedFee.effective_date).toLocaleDateString()}
                            </div>
                        </div>

                        <div>
                            <Label>Fee ID</Label>
                            <div className="text-sm font-medium bg-gray-50 p-2 rounded border">
                                {selectedFee.id}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="editCategory">Category *</Label>
                            <Input
                                id="editCategory"
                                value={editForm.category || ''}
                                onChange={(e) => handleFieldChange('category', e.target.value)}
                                placeholder="Enter category"
                                disabled={isUpdating}
                                readOnly
                                className="bg-gray-50"
                            />
                            <p className="text-xs text-gray-500 mt-1">Category cannot be changed after creation</p>
                        </div>

                        <div>
                            <Label htmlFor="editAmount">Amount (₱) *</Label>
                            <Input
                                id="editAmount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={editForm.amount || ''}
                                onChange={(e) => handleFieldChange('amount', Number(e.target.value))}
                                placeholder="Enter amount"
                                disabled={isUpdating}
                            />
                        </div>

                        <div>
                            <Label htmlFor="editDateEffective">Date Effective *</Label>
                            <Input
                                id="editDateEffective"
                                type="date"
                                value={editForm.effective_date || ''}
                                onChange={(e) => handleFieldChange('effective_date', e.target.value)}
                                disabled={isUpdating}
                            />
                        </div>

                        <div>
                            <Label htmlFor="editOffenseLevel">Level *</Label>
                            <Input
                                id="editOffenseLevel"
                                type="number"
                                min="0"
                                value={editForm.level || ''}
                                onChange={(e) => handleFieldChange('level', Number(e.target.value))}
                                placeholder="Enter level"
                                disabled={isUpdating}
                                readOnly
                                className="bg-gray-50"
                            />
                            <p className="text-xs text-gray-500 mt-1">Level cannot be changed after creation</p>
                        </div>

                        <div className="space-y-2 pt-4 border-t">
                            <Button
                                onClick={handleUpdateFee}
                                disabled={isUpdating || !hasChanges}
                                className="w-full"
                            >
                                {isUpdating ? 'Updating...' : 'Update Fee'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        <div className="flex flex-col items-center space-y-3">
                            <AlertTriangle className="h-12 w-12 text-gray-400" />
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">No Fee Selected</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Select a fee from the table to view and edit details
                                </p>
                            </div>
                            <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg max-w-sm">
                                <p className="font-medium mb-1">Fee Categories:</p>
                                <p>• Level 0: Base fees (Apprehension, Voluntary, Impound, Testing)</p>
                                <p>• Level 1-3: Offense penalties (Driver, Operator)</p>
                                <p className="mt-2 text-xs text-gray-500">
                                    You can add one of each base fee type and multiple penalty levels.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default FeeDetailsPanel;

import React, { useState, useEffect } from 'react';
import { Button } from '@/presentation/components/shared/ui/button';
import { Input } from '@/presentation/components/shared/ui/input';
import { Label } from '@/presentation/components/shared/ui/label';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/presentation/components/shared/ui/card';
import { Fee } from '../logic/useFeeData';

interface FeeDetailsPanelProps {
    selectedFee: Fee | null;
    onUpdateFee: (feeId: string, updateData: Partial<Fee>) => void;
    onDeleteFee: (feeId: string) => void;
    loading?: boolean;
    error?: string | null;
}

const FeeDetailsPanel: React.FC<FeeDetailsPanelProps> = ({
    selectedFee,
    onUpdateFee,
    onDeleteFee,
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
                rate: selectedFee.rate,
                date_effective: selectedFee.date_effective,
                level: selectedFee.level,
            });
        } else {
            setEditForm({});
        }
    }, [selectedFee]);

    const handleFieldChange = (field: keyof Omit<Fee, 'fee_id'>, value: string | number) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUpdateFee = async () => {
        if (!selectedFee) return;

        setIsUpdating(true);
        try {
            // Always send fee_id as a number and rate as integer cents
            const updateData = {
                ...editForm,
                rate: editForm.rate !== undefined ? Math.round(Number(editForm.rate) * 100) : undefined,
            };
            await onUpdateFee(selectedFee.fee_id, updateData);
        } catch (err) {
            console.error('Failed to update fee:', err);
            console.log('fee_id type:', typeof selectedFee.fee_id, selectedFee.fee_id);
        } finally {
            setIsUpdating(false);
        }
    };

    const hasChanges = selectedFee && (
        editForm.category !== selectedFee.category ||
        editForm.rate !== selectedFee.rate ||
        editForm.date_effective !== selectedFee.date_effective ||
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
                        <div>
                            <Label>Fee ID</Label>
                            <div className="text-sm font-medium bg-gray-50 p-2 rounded border">
                                {selectedFee.fee_id}
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
                            />
                        </div>

                        <div>
                            <Label htmlFor="editRate">Rate (₱) *</Label>
                            <Input
                                id="editRate"
                                type="number"
                                min="0"
                                step="0.01"
                                value={editForm.rate || ''}
                                onChange={(e) => handleFieldChange('rate', Number(e.target.value))}
                                placeholder="Enter rate"
                                disabled={isUpdating}
                            />
                        </div>

                        <div>
                            <Label htmlFor="editDateEffective">Date Effective *</Label>
                            <Input
                                id="editDateEffective"
                                type="date"
                                value={editForm.date_effective || ''}
                                onChange={(e) => handleFieldChange('date_effective', e.target.value)}
                                disabled={isUpdating}
                            />
                        </div>

                        <div>
                            <Label htmlFor="editOffenseLevel">Offense Level *</Label>
                            <Input
                                id="editOffenseLevel"
                                type="number"
                                min="1"
                                value={editForm.level || ''}
                                onChange={(e) => handleFieldChange('level', Number(e.target.value))}
                                placeholder="Enter offense level"
                                disabled={isUpdating}
                            />
                        </div>

                        <div className="space-y-2 pt-4 border-t">
                            <Button
                                onClick={handleUpdateFee}
                                disabled={isUpdating || !hasChanges}
                                className="w-full"
                            >
                                {isUpdating ? 'Updating...' : 'Update Fee'}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => selectedFee && onDeleteFee(selectedFee.fee_id)}
                                disabled={isUpdating}
                                className="w-full"
                            >
                                Delete Fee
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        Select a fee from the table to view and edit details
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default FeeDetailsPanel;

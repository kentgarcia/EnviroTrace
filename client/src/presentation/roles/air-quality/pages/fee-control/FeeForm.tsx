import React from 'react';
import { Button } from '@/presentation/components/shared/ui/button';
import { Input } from '@/presentation/components/shared/ui/input';
import { Label } from '@/presentation/components/shared/ui/label';
import { FeeCreate } from './logic/useFeeData'; // Ensure FeeCreate includes 'level: string'

interface FeeFormProps {
    formData: FeeCreate & { level: string };
    onSubmit: (feeData: FeeCreate & { level: string }) => void;
    onFieldChange: (field: keyof (FeeCreate & { level: string }), value: string | number) => void;
    isSubmitting?: boolean;
}

const FeeForm: React.FC<FeeFormProps> = ({
    formData,
    onSubmit,
    onFieldChange,
    isSubmitting = false,
}) => {
    // Helper to convert rate to integer cents before submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const feeData = {
            ...formData,
            rate: Math.round(Number(formData.rate) * 100),
            level: formData.level, // keep as string
        };
        // Call parent onSubmit with converted data
        onSubmit(feeData);
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold">Add New Fee</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="category">Category *</Label>
                    <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => onFieldChange('category', e.target.value)}
                        placeholder="Enter fee category"
                        required
                        disabled={isSubmitting}
                    />
                </div>
                <div>
                    <Label htmlFor="rate">Rate (₱) *</Label>
                    <Input
                        id="rate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.rate || ''}
                        onChange={(e) => onFieldChange('rate', Number(e.target.value))}
                        placeholder="Enter fee rate"
                        required
                        disabled={isSubmitting}
                    />
                </div>
                <div>
                    <Label htmlFor="date_effective">Date Effective *</Label>
                    <Input
                        id="date_effective"
                        type="date"
                        value={formData.date_effective}
                        onChange={(e) => onFieldChange('date_effective', e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                </div>
                <div>
                    <Label htmlFor="level">Offense Level *</Label>
                    <Input
                        id="level"
                        type="number"
                        min="1"
                        value={formData.level ? String(formData.level) : ''}
                        onChange={(e) => onFieldChange('level', String(e.target.value))}
                        placeholder="Enter offense level"
                        required
                        disabled={isSubmitting}
                    />
                </div>
            </div>
            <div className="flex justify-end space-x-2">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[100px]"
                >
                    {isSubmitting ? 'Adding...' : 'Add Fee'}
                </Button>
            </div>
        </form>
    );
};

export default FeeForm;

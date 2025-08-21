import React, { useState } from 'react';
import { Button } from '@/presentation/components/shared/ui/button';
import { Input } from '@/presentation/components/shared/ui/input';
import { Label } from '@/presentation/components/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/shared/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/presentation/components/shared/ui/dialog';
import { Plus, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/presentation/components/shared/ui/alert';

// Fee categories with their allowed levels
const FEE_CATEGORIES = {
    LEVEL_0: [
        { value: 'APPREHENSION', label: 'Apprehension Fee', level: 0 },
        { value: 'VOLUNTARY', label: 'Voluntary Fee', level: 0 },
        { value: 'IMPOUND', label: 'Impound Fee', level: 0 },
        { value: 'TESTING', label: 'Testing Fee', level: 0 }
    ],
    LEVEL_1_TO_3: [
        { value: 'DRIVER', label: 'Driver Penalty', levels: [1, 2, 3] },
        { value: 'OPERATOR', label: 'Operator Penalty', levels: [1, 2, 3] }
    ]
};

interface FeeFormModalProps {
    onAddFee: (fee: {
        category: string;
        rate: number;
        date_effective: string;
        level: number;
    }) => void;
    existingFees?: Array<{ category: string; level: number; }>;
}

export const FeeFormModal: React.FC<FeeFormModalProps> = ({ onAddFee, existingFees = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        category: '',
        rate: 0,
        date_effective: new Date().toISOString().split('T')[0], // Default to today
        level: 0,
    });
    const [selectedCategoryType, setSelectedCategoryType] = useState<'LEVEL_0' | 'LEVEL_1_TO_3' | ''>('');

    const handleFieldChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCategoryChange = (category: string) => {
        // Determine if this is a Level 0 or Level 1-3 category
        const isLevel0 = FEE_CATEGORIES.LEVEL_0.find(cat => cat.value === category);
        const isLevel1To3 = FEE_CATEGORIES.LEVEL_1_TO_3.find(cat => cat.value === category);

        if (isLevel0) {
            setSelectedCategoryType('LEVEL_0');
            setFormData(prev => ({
                ...prev,
                category,
                level: 0
            }));
        } else if (isLevel1To3) {
            setSelectedCategoryType('LEVEL_1_TO_3');
            setFormData(prev => ({
                ...prev,
                category,
                level: 1 // Default to level 1
            }));
        }
    };

    const getAvailableLevels = () => {
        if (selectedCategoryType === 'LEVEL_0') return [0];
        if (selectedCategoryType === 'LEVEL_1_TO_3') return [1, 2, 3];
        return [];
    };

    const getValidationErrors = (): string[] => {
        const errors: string[] = [];

        if (!formData.category.trim()) {
            errors.push("Category is required");
        }

        if (formData.rate <= 0) {
            errors.push("Rate must be greater than 0");
        }

        if (!formData.date_effective) {
            errors.push("Effective date is required");
        }

        // Check Level 0 constraint: only one of each specific Level 0 category can exist
        if (selectedCategoryType === 'LEVEL_0') {
            const hasExistingCategory = existingFees.some(fee =>
                fee.category === formData.category && fee.level === 0
            );
            if (hasExistingCategory) {
                errors.push(`${formData.category} fee already exists. Only one of each base fee type is allowed.`);
            }
        }

        // Check Level 1-3 constraint: category + level combination must be unique
        if (selectedCategoryType === 'LEVEL_1_TO_3') {
            const isDuplicate = existingFees.some(fee =>
                fee.category === formData.category && fee.level === formData.level
            );
            if (isDuplicate) {
                errors.push(`${formData.category} Level ${formData.level} already exists`);
            }
        }

        return errors;
    };

    const isFormValid = () => {
        return getValidationErrors().length === 0;
    };

    const resetForm = () => {
        setFormData({
            category: '',
            rate: 0,
            date_effective: new Date().toISOString().split('T')[0],
            level: 0,
        });
        setSelectedCategoryType('');
    };

    const handleSubmit = () => {
        if (isFormValid()) {
            onAddFee(formData);
            resetForm();
            setIsOpen(false);
        }
    };

    const handleCancel = () => {
        resetForm();
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="mb-6">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Fee
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Fee</DialogTitle>
                    <DialogDescription>
                        Configure fee rates for order of payment calculations. You can add one of each base fee type (Apprehension, Voluntary, Impound, Testing) and multiple offense penalty levels.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Category Selection */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                            Category *
                        </Label>
                        <div className="col-span-3">
                            <Select
                                value={formData.category}
                                onValueChange={handleCategoryChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select fee category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                                        Level 0 - Base Fees (One Per Type)
                                    </div>
                                    {FEE_CATEGORIES.LEVEL_0.map((category) => (
                                        <SelectItem key={category.value} value={category.value}>
                                            {category.label}
                                        </SelectItem>
                                    ))}
                                    <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground border-t mt-1 pt-2">
                                        Level 1-3 - Offense Penalties
                                    </div>
                                    {FEE_CATEGORIES.LEVEL_1_TO_3.map((category) => (
                                        <SelectItem key={category.value} value={category.value}>
                                            {category.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Level Selection */}
                    {formData.category && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="level" className="text-right">
                                Level *
                            </Label>
                            <div className="col-span-3">
                                <Select
                                    value={formData.level.toString()}
                                    onValueChange={(value) => handleFieldChange('level', parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getAvailableLevels().map((level) => (
                                            <SelectItem key={level} value={level.toString()}>
                                                {selectedCategoryType === 'LEVEL_0'
                                                    ? 'Base Fee'
                                                    : `Level ${level} Offense`
                                                }
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Rate Input */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="rate" className="text-right">
                            Rate (₱) *
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="rate"
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                value={formData.rate || ''}
                                onChange={(e) => handleFieldChange('rate', parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    {/* Effective Date */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date_effective" className="text-right">
                            Effective Date *
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="date_effective"
                                type="date"
                                value={formData.date_effective}
                                onChange={(e) => handleFieldChange('date_effective', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Validation Errors */}
                    {getValidationErrors().length > 0 && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <ul className="list-disc list-inside space-y-1">
                                    {getValidationErrors().map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isFormValid()}
                    >
                        Add Fee
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

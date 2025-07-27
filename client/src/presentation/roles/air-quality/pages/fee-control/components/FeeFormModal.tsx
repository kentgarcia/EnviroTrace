import React, { useState } from 'react';
import { Button } from '@/presentation/components/shared/ui/button';
import { Input } from '@/presentation/components/shared/ui/input';
import { Label } from '@/presentation/components/shared/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/presentation/components/shared/ui/dialog';
import { Plus } from 'lucide-react';

interface FeeFormModalProps {
    onAddFee: (fee: {
        category: string;
        rate: number;
        date_effective: string;
        offense_level: number;
    }) => void;
}

export const FeeFormModal: React.FC<FeeFormModalProps> = ({ onAddFee }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        category: '',
        rate: 0,
        date_effective: '',
        offense_level: 1,
    });

    const handleFieldChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const isFormValid = () => {
        return (
            formData.category.trim() !== '' &&
            formData.rate > 0 &&
            formData.date_effective !== '' &&
            formData.offense_level > 0
        );
    };

    const resetForm = () => {
        setFormData({
            category: '',
            rate: 0,
            date_effective: '',
            offense_level: 1,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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
                        Enter the details for the new air quality fee.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Input
                                id="category"
                                type="text"
                                value={formData.category}
                                onChange={(e) => handleFieldChange('category', e.target.value)}
                                placeholder="Category"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="rate">Rate (₱)</Label>
                            <Input
                                id="rate"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.rate}
                                onChange={(e) => handleFieldChange('rate', parseFloat(e.target.value) || 0)}
                                placeholder="Rate"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="date_effective">Date Effective</Label>
                            <Input
                                id="date_effective"
                                type="date"
                                value={formData.date_effective}
                                onChange={(e) => handleFieldChange('date_effective', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="offense_level">Offense Level</Label>
                            <Input
                                id="offense_level"
                                type="number"
                                min="1"
                                value={formData.offense_level}
                                onChange={(e) => handleFieldChange('offense_level', parseInt(e.target.value) || 1)}
                                placeholder="Offense Level"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!isFormValid()}>
                            Add Fee
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

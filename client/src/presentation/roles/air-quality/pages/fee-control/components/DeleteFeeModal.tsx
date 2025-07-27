import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/presentation/components/shared/ui/alert-dialog';
import { Button } from '@/presentation/components/shared/ui/button';
import { Trash2 } from 'lucide-react';
import { Fee } from '../logic/useFeeData';

interface DeleteFeeModalProps {
    fee: Fee;
    onDelete: (feeId: number) => void;
    isDeleting?: boolean;
}

export const DeleteFeeModal: React.FC<DeleteFeeModalProps> = ({
    fee,
    onDelete,
    isDeleting = false
}) => {
    const handleDelete = () => {
        onDelete(fee.fee_id);
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={isDeleting}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Fee</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this fee?
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <div className="text-sm">
                                <div><strong>Category:</strong> {fee.category}</div>
                                <div><strong>Rate:</strong> ₱{fee.rate.toFixed(2)}</div>
                                <div><strong>Offense Level:</strong> {fee.offense_level}</div>
                            </div>
                        </div>
                        <div className="mt-2 text-red-600">
                            This action cannot be undone.
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Fee'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

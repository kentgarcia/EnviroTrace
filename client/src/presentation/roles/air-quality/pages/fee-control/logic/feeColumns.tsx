import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Badge } from '@/presentation/components/shared/ui/badge';
import { Fee } from './useFeeData';

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

const getLevelBadge = (level: number, category: string) => {
    if (level === 0) {
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Base Fee</Badge>;
    } else {
        const variant = level === 1 ? "default" : level === 2 ? "secondary" : "destructive";
        return <Badge variant={variant}>Level {level}</Badge>;
    }
};

export const createFeeColumns = (
    onDeleteFee: (feeId: number) => void,
    isDeleting?: number
): ColumnDef<Fee>[] => [
        {
            accessorKey: 'fee_id',
            header: 'Fee ID',
            cell: ({ row }) => (
                <div className="font-medium">
                    {row.getValue('fee_id')}
                </div>
            ),
        },
        {
            accessorKey: 'category',
            header: 'Category',
            cell: ({ row }) => {
                const category = row.getValue('category') as string;
                const level = row.original.level;

                return (
                    <div className="space-y-1">
                        <div className="font-medium">
                            {getCategoryLabel(category)}
                        </div>
                        {getLevelBadge(level, category)}
                    </div>
                );
            },
        },
        {
            accessorKey: 'rate',
            header: 'Rate',
            cell: ({ row }) => {
                const rate = parseFloat(row.getValue('rate'));
                const formatted = new Intl.NumberFormat('en-PH', {
                    style: 'currency',
                    currency: 'PHP',
                }).format(rate);

                return <div className="font-medium">{formatted}</div>;
            },
        },
        {
            accessorKey: 'date_effective',
            header: 'Date Effective',
            cell: ({ row }) => {
                const date = new Date(row.getValue('date_effective'));
                return (
                    <div>
                        {format(date, 'MMM d, yyyy')}
                    </div>
                );
            },
        },
        {
            accessorKey: 'level',
            header: 'Offense Level',
            cell: ({ row }) => (
                <div className="text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Level {row.getValue('level')}
                    </span>
                </div>
            ),
        },
        // ...existing code...
    ];

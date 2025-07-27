import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Fee } from './useFeeData';
import { DeleteFeeModal } from '../components/DeleteFeeModal';

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
            cell: ({ row }) => (
                <div className="font-medium">
                    {row.getValue('category')}
                </div>
            ),
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
            accessorKey: 'offense_level',
            header: 'Offense Level',
            cell: ({ row }) => (
                <div className="text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Level {row.getValue('offense_level')}
                    </span>
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const fee = row.original;

                return (
                    <div className="flex justify-center">
                        <DeleteFeeModal
                            fee={fee}
                            onDelete={onDeleteFee}
                            isDeleting={isDeleting === fee.fee_id}
                        />
                    </div>
                );
            },
        },
    ];

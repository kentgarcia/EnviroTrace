import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/presentation/components/shared/ui/table';
import { Button } from '@/presentation/components/shared/ui/button';
import { Pencil, Trash2, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { EmissionTest, TestSchedule } from '@/core/api/emission-service';

interface ScheduleTableProps {
    schedules: TestSchedule[];
    emissionTests: EmissionTest[];
    isLoading: boolean;
    selectedScheduleId: string | null;
    setSelectedScheduleId: (id: string | null) => void;
    onEditTest: (test: EmissionTest) => void;
    onDeleteTest: (test: EmissionTest) => void;
    onEditSchedule: (schedule: TestSchedule) => void;
    onDeleteSchedule: (schedule: TestSchedule) => void;
}

export function ScheduleTable({
    schedules,
    emissionTests,
    isLoading,
    selectedScheduleId,
    setSelectedScheduleId,
    onEditTest,
    onDeleteTest,
    onEditSchedule,
    onDeleteSchedule,
}: ScheduleTableProps) {
    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Quarter</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Personnel</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Test Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {schedules.map((schedule) => (
                    <TableRow
                        key={schedule.id}
                        className={selectedScheduleId === schedule.id ? 'bg-blue-50' : ''}
                    >
                        <TableCell>Q{schedule.quarter}</TableCell>
                        <TableCell>{schedule.year}</TableCell>
                        <TableCell>{schedule.assigned_personnel}</TableCell>
                        <TableCell>{schedule.location}</TableCell>
                        <TableCell>
                            {format(new Date(schedule.conducted_on), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                            <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(schedule.status)}`}
                            >
                                {schedule.status}
                            </span>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedScheduleId(schedule.id)}
                                >
                                    <FileSpreadsheet className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEditSchedule(schedule)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDeleteSchedule(schedule)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}

                {schedules.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                            No test schedules found
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}

function getStatusStyles(status: string): string {
    switch (status.toLowerCase()) {
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

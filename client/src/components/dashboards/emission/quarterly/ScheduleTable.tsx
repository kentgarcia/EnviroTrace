import React from "react";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ClipboardList, Edit, Trash, Loader2 } from "lucide-react";
import { TestSchedule } from "@/hooks/useQuarterlyTesting";

interface ScheduleTableProps {
    schedules: TestSchedule[];
    isLoading: boolean;
    onViewTests: (schedule: TestSchedule) => void;
    onEditSchedule: (schedule: TestSchedule) => void;
    onDeleteSchedule: (schedule: TestSchedule) => void;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
    schedules,
    isLoading,
    onViewTests,
    onEditSchedule,
    onDeleteSchedule,
}) => {
    // Helper to detect if a schedule is pending sync
    const isPendingSync = (id: string) => {
        return id.startsWith('pending-');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading schedules...</span>
            </div>
        );
    }

    if (schedules.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No test schedules found for the selected filters. Create a new schedule to get started.
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead>Quarter</TableHead>
                        <TableHead>Personnel</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-16 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {schedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                            <TableCell>{schedule.year}</TableCell>
                            <TableCell>Q{schedule.quarter}</TableCell>
                            <TableCell>{schedule.assignedPersonnel}</TableCell>
                            <TableCell>{schedule.location}</TableCell>
                            <TableCell>
                                {format(new Date(schedule.conductedOn), "MMM dd, yyyy")}
                                {isPendingSync(schedule.id) && (
                                    <Badge variant="outline" className="ml-2 text-yellow-600 bg-yellow-50">
                                        Pending Sync
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onViewTests(schedule)}>
                                            <ClipboardList className="mr-2 h-4 w-4" />
                                            <span>View Tests</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onEditSchedule(schedule)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Edit</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onDeleteSchedule(schedule)}
                                            className="text-red-600"
                                        >
                                            <Trash className="mr-2 h-4 w-4" />
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default ScheduleTable;
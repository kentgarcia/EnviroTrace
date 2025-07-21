import React, { useState, useEffect } from "react";
import { CalendarIcon, UserIcon, MapPinIcon, EditIcon } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/presentation/components/shared/ui/dialog";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Separator } from "@/presentation/components/shared/ui/separator";
import {
    TestSchedule,
    TestScheduleCreate,
    testScheduleService
} from "@/core/api/test-schedule-service";

interface QuarterInfoEditorProps {
    selectedYear: number;
}

export const QuarterInfoEditor: React.FC<QuarterInfoEditorProps> = ({ selectedYear }) => {
    const [schedules, setSchedules] = useState<TestSchedule[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingQuarter, setEditingQuarter] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        assigned_personnel: "",
        conducted_on: "",
        location: "",
    });

    useEffect(() => {
        loadSchedules();
    }, [selectedYear]);

    const loadSchedules = async () => {
        if (!selectedYear) return;

        setIsLoading(true);
        try {
            const data = await testScheduleService.getSchedulesByYear(selectedYear);
            setSchedules(data);
        } catch (error) {
            console.error("Failed to load schedules:", error);
            setSchedules([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getScheduleForQuarter = (quarter: number): TestSchedule | null => {
        return schedules.find(s => s.quarter === quarter) || null;
    };

    const handleEdit = (quarter: number) => {
        const schedule = getScheduleForQuarter(quarter);
        if (schedule) {
            setFormData({
                assigned_personnel: schedule.assigned_personnel,
                conducted_on: schedule.conducted_on.split('T')[0], // Extract date part
                location: schedule.location,
            });
        } else {
            setFormData({
                assigned_personnel: "",
                conducted_on: "",
                location: "",
            });
        }
        setEditingQuarter(quarter);
    };

    const handleSubmit = async () => {
        if (!editingQuarter || !selectedYear) return;

        setIsSubmitting(true);
        try {
            const scheduleData: TestScheduleCreate = {
                year: selectedYear,
                quarter: editingQuarter,
                assigned_personnel: formData.assigned_personnel,
                conducted_on: `${formData.conducted_on}T00:00:00.000Z`,
                location: formData.location,
            };

            await testScheduleService.createOrUpdateSchedule(scheduleData);
            await loadSchedules(); // Reload schedules
            setEditingQuarter(null);
        } catch (error) {
            console.error("Failed to save schedule:", error);
            alert("Failed to save schedule. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getQuarterName = (quarter: number): string => {
        const names = { 1: "First", 2: "Second", 3: "Third", 4: "Fourth" };
        return names[quarter as keyof typeof names] || `Q${quarter}`;
    };

    const formatDate = (dateString: string): string => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return "Not set";
        }
    };

    const QuarterCard: React.FC<{ quarter: number }> = ({ quarter }) => {
        const schedule = getScheduleForQuarter(quarter);
        const hasData = !!schedule;

        return (
            <Card className="relative">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                            {getQuarterName(quarter)} Quarter {selectedYear}
                        </CardTitle>
                        <Badge variant={hasData ? "default" : "secondary"}>
                            {hasData ? "Configured" : "Not Set"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                            <UserIcon className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Personnel:</span>
                            <span className={hasData ? "text-gray-900" : "text-gray-500"}>
                                {schedule?.assigned_personnel || "Not assigned"}
                            </span>
                        </div>

                        <div className="flex items-center space-x-2 text-sm">
                            <CalendarIcon className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Test Date:</span>
                            <span className={hasData ? "text-gray-900" : "text-gray-500"}>
                                {schedule ? formatDate(schedule.conducted_on) : "Not scheduled"}
                            </span>
                        </div>

                        <div className="flex items-center space-x-2 text-sm">
                            <MapPinIcon className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Location:</span>
                            <span className={hasData ? "text-gray-900" : "text-gray-500"}>
                                {schedule?.location || "Not specified"}
                            </span>
                        </div>
                    </div>

                    <Separator />

                    <Dialog open={editingQuarter === quarter} onOpenChange={(open) => !open && setEditingQuarter(null)}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => handleEdit(quarter)}
                            >
                                <EditIcon className="h-4 w-4 mr-2" />
                                {hasData ? "Edit" : "Set Up"} Q{quarter}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    {hasData ? "Edit" : "Set Up"} {getQuarterName(quarter)} Quarter {selectedYear}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="personnel">Assigned Personnel</Label>
                                    <Input
                                        id="personnel"
                                        value={formData.assigned_personnel}
                                        onChange={(e) => setFormData(prev => ({ ...prev, assigned_personnel: e.target.value }))}
                                        placeholder="Enter personnel name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date">Test Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.conducted_on}
                                        onChange={(e) => setFormData(prev => ({ ...prev, conducted_on: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                        placeholder="Enter test location"
                                    />
                                </div>

                                <div className="flex justify-end space-x-2 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setEditingQuarter(null)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || !formData.assigned_personnel || !formData.conducted_on || !formData.location}
                                    >
                                        {isSubmitting ? "Saving..." : "Save"}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        );
    };

    if (!selectedYear) {
        return (
            <Card className="border border-gray-200 shadow-none rounded-none bg-white">
                <div className="p-8 text-center">
                    <div className="text-gray-500 text-lg">
                        Please select a year to manage quarter information
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="border border-gray-200 shadow-none rounded-none bg-white">
            <CardHeader>
                <CardTitle className="text-xl">Quarter Information for {selectedYear}</CardTitle>
                <p className="text-gray-600 text-sm">
                    Configure testing schedules, personnel assignments, and locations for each quarter.
                </p>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(quarter => (
                            <div key={quarter} className="h-48 bg-gray-100 animate-pulse rounded-lg"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(quarter => (
                            <QuarterCard key={quarter} quarter={quarter} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

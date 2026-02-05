import React, { useState, useEffect } from "react";
import { CalendarIcon, UserIcon, MapPinIcon, EditIcon } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/presentation/components/shared/ui/dialog";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Separator } from "@/presentation/components/shared/ui/separator";
import { cn } from "@/core/utils/utils";
import {
    TestSchedule,
    TestScheduleCreate,
    testScheduleService
} from "@/core/api/test-schedule-service";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";
import { PERMISSIONS } from "@/core/utils/permissions";

interface QuarterInfoEditorProps {
    selectedYear: number;
}

export const QuarterInfoEditor: React.FC<QuarterInfoEditorProps> = ({ selectedYear }) => {
    const canCreateSchedule = useAuthStore((state) => state.hasPermission(PERMISSIONS.SCHEDULE.CREATE));
    const canUpdateSchedule = useAuthStore((state) => state.hasPermission(PERMISSIONS.SCHEDULE.UPDATE));
    const canEditSchedule = canCreateSchedule || canUpdateSchedule;
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
        if (!canEditSchedule) return;
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
        const existingSchedule = getScheduleForQuarter(editingQuarter);
        if (existingSchedule && !canUpdateSchedule) {
            alert("You do not have permission to update schedules.");
            return;
        }
        if (!existingSchedule && !canCreateSchedule) {
            alert("You do not have permission to create schedules.");
            return;
        }

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
            <Card className="relative overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 pt-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-bold">
                            {getQuarterName(quarter)} Quarter
                        </CardTitle>
                        <Badge 
                            variant={hasData ? "default" : "secondary"}
                            className={cn(
                                "text-[10px] font-bold uppercase tracking-wider",
                                hasData ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"
                            )}
                        >
                            {hasData ? "Configured" : "Not Set"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                <UserIcon className="h-4 w-4 text-slate-400" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Personnel</div>
                                <div className={cn("font-semibold", hasData ? "text-slate-900" : "text-slate-400")}>
                                    {schedule?.assigned_personnel || "Not assigned"}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                <CalendarIcon className="h-4 w-4 text-slate-400" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Test Date</div>
                                <div className={cn("font-semibold", hasData ? "text-slate-900" : "text-slate-400")}>
                                    {schedule ? formatDate(schedule.conducted_on) : "Not scheduled"}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                <MapPinIcon className="h-4 w-4 text-slate-400" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</div>
                                <div className={cn("font-semibold", hasData ? "text-slate-900" : "text-slate-400")}>
                                    {schedule?.location || "Not specified"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {canEditSchedule && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-slate-200 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider"
                            onClick={() => handleEdit(quarter)}
                        >
                            <EditIcon className="h-3.5 w-3.5 mr-2" />
                            {hasData ? "Edit Configuration" : "Set Up Quarter"}
                        </Button>
                    )}
                </CardContent>
            </Card>
        );
    };

    if (!selectedYear) {
        return (
            <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                    <CalendarIcon className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No Year Selected</h3>
                <p className="text-slate-500 max-w-xs mx-auto mt-2">
                    Please select a year from the filter above to manage quarter information.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-slate-900">Quarter Configuration</h2>
                <p className="text-sm text-slate-500">
                    Configure testing schedules, personnel assignments, and locations for {selectedYear}.
                </p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(quarter => (
                        <div key={quarter} className="h-64 bg-slate-50 animate-pulse rounded-xl border border-slate-100"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(quarter => (
                        <QuarterCard key={quarter} quarter={quarter} />
                    ))}
                </div>
            )}

            <Dialog 
                open={editingQuarter !== null} 
                onOpenChange={(open) => {
                    if (!open) setEditingQuarter(null);
                }}
            >
                <DialogContent className="sm:max-w-lg rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="bg-[#0033a0] dark:bg-gray-800 p-6 m-0 border-none">
                        <DialogTitle className="text-xl font-bold text-white">
                            {editingQuarter && getScheduleForQuarter(editingQuarter) ? "Edit" : "Set Up"} {editingQuarter && getQuarterName(editingQuarter)} Quarter {selectedYear}
                        </DialogTitle>
                        <DialogDescription className="text-blue-100/80 dark:text-gray-300">
                            Configure the testing schedule and personnel for this quarter.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 bg-white dark:bg-gray-900 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="personnel" className="text-xs font-bold uppercase tracking-wider text-slate-500">Assigned Personnel</Label>
                            <Input
                                id="personnel"
                                value={formData.assigned_personnel}
                                onChange={(e) => setFormData(prev => ({ ...prev, assigned_personnel: e.target.value }))}
                                placeholder="Enter personnel name"
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date" className="text-xs font-bold uppercase tracking-wider text-slate-500">Test Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.conducted_on}
                                onChange={(e) => setFormData(prev => ({ ...prev, conducted_on: e.target.value }))}
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-slate-500">Location</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                placeholder="Enter test location"
                                className="h-11"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-6">
                            <Button
                                variant="ghost"
                                onClick={() => setEditingQuarter(null)}
                                disabled={isSubmitting}
                                className="font-bold text-xs uppercase tracking-wider"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.assigned_personnel || !formData.conducted_on || !formData.location}
                                className="bg-[#0033a0] hover:bg-[#002a80] font-bold text-xs uppercase tracking-wider px-8"
                            >
                                {isSubmitting ? "Saving..." : "Save Configuration"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

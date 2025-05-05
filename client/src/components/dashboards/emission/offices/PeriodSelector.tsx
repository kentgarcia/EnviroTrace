import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useEmissionStore } from "@/hooks/emissions/useEmissionStore";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";

interface PeriodSelectorProps {
    // Optional props for direct usage
    year?: number;
    quarter?: number;
    onYearChange?: (year: number) => void;
    onQuarterChange?: (quarter: number | undefined) => void;
}

export function PeriodSelector({
    year,
    quarter,
    onYearChange,
    onQuarterChange,
}: PeriodSelectorProps = {}) {
    // Use store if props are not provided
    const store = useEmissionStore();

    // Determine whether to use props or store
    const isPropsMode = year !== undefined && onYearChange !== undefined;

    // Get values from props or store
    const selectedYear = isPropsMode ? year : store.selectedYear;
    const selectedQuarter = isPropsMode ? quarter : store.selectedQuarter;

    const [date, setDate] = useState<Date>(new Date(selectedYear, 0));

    // Get current year for limits
    const currentYear = new Date().getFullYear();

    // Update year when date changes
    useEffect(() => {
        if (date) {
            if (isPropsMode && onYearChange) {
                onYearChange(date.getFullYear());
            } else {
                store.actions.setSelectedYear(date.getFullYear());
            }
        }
    }, [date, isPropsMode, onYearChange, store.actions]);

    // Handle quarter change
    const handleQuarterChange = (value: string) => {
        if (value === "all") {
            if (isPropsMode && onQuarterChange) {
                onQuarterChange(undefined);
            } else {
                store.actions.setSelectedQuarter(undefined);
            }
        } else {
            const quarterValue = parseInt(value);
            if (isPropsMode && onQuarterChange) {
                onQuarterChange(quarterValue);
            } else {
                store.actions.setSelectedQuarter(quarterValue);
            }
        }
    };

    // Custom handler for the Calendar component
    const handleSelectDate = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    return (
        <div className="flex flex-col gap-2 sm:flex-row">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="justify-start text-left font-normal w-[180px]"
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "yyyy") : "Select year"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleSelectDate}
                        captionLayout="dropdown-years"
                        fromYear={currentYear - 10}
                        toYear={currentYear}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>

            <Select
                value={selectedQuarter?.toString() || "all"}
                onValueChange={handleQuarterChange}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select quarter" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Quarter</SelectLabel>
                        <SelectItem value="all">All Quarters</SelectItem>
                        <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                        <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                        <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                        <SelectItem value="4">Q4 (Oct-Dec)</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}
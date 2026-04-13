import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
    startDate: Date;
    endDate: Date;
    onStartDateChange: (date: Date) => void;
    onEndDateChange: (date: Date) => void;
    className?: string;
}

export function DateRangePicker({ startDate, endDate, onStartDateChange, onEndDateChange, className }: DateRangePickerProps) {
    const [startOpen, setStartOpen] = useState(false);
    const [endOpen, setEndOpen] = useState(false);
    const [startError, setStartError] = useState(false);
    const [endError, setEndError] = useState(false);

    useEffect(() => {
        if (startDate && endDate) {
            if (startDate > endDate) {
                setStartError(true);
                setEndError(true);
            } else {
                setStartError(false);
                setEndError(false);
            }
        }
    }, [startDate, endDate]);

    const handleStartDateChange = (date: Date | undefined) => {
        if (date) {
            if (endDate && date > endDate) {
                onEndDateChange(date);
            }
            onStartDateChange(date);
            setStartOpen(false);
        }
    };

    const handleEndDateChange = (date: Date | undefined) => {
        if (date) {
            if (startDate && date < startDate) {
                onStartDateChange(date);
            }
            onEndDateChange(date);
            setEndOpen(false);
        }
    };

    return (
        <div className={cn("flex flex-col sm:flex-row gap-2", className)}>
            <div className="relative">
                <Popover open={startOpen} onOpenChange={setStartOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("justify-start", startError && "border-red-500")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "dd.MM.yyyy") : "Дата начала"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={startDate} onSelect={handleStartDateChange} locale={ru} />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="relative">
                <Popover open={endOpen} onOpenChange={setEndOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("justify-start", endError && "border-red-500")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "dd.MM.yyyy") : "Дата окончания"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={endDate} onSelect={handleEndDateChange} locale={ru} disabled={(date) => (startDate ? date < startDate : false)} />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}

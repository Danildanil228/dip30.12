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

    return (
        <div className={cn("flex flex-col sm:flex-row gap-2", className)}>
            <Popover open={startOpen} onOpenChange={setStartOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd.MM.yyyy") : "Дата начала"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                            if (date) {
                                onStartDateChange(date);
                                setStartOpen(false);
                            }
                        }}
                        locale={ru}
                    />
                </PopoverContent>
            </Popover>

            <Popover open={endOpen} onOpenChange={setEndOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd.MM.yyyy") : "Дата окончания"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => {
                            if (date) {
                                onEndDateChange(date);
                                setEndOpen(false);
                            }
                        }}
                        locale={ru}
                        disabled={(date) => date < startDate}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

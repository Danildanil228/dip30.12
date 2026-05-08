import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SearchSelectFixedProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    emptyText?: string;
    disabled?: boolean;
}

export function SearchSelectFixed({ value, onChange, options, placeholder = "Выберите...", emptyText = "Ничего не найдено", disabled = false }: SearchSelectFixedProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");

    const selectedLabel = options.find((opt) => opt.value === value)?.label || "";

    const filteredOptions = React.useMemo(() => {
        if (!search) return options;
        return options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()));
    }, [options, search]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal" disabled={disabled}>
                    <span className="truncate">{selectedLabel || placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popper-anchor-width] p-0" sideOffset={4} align="start">
                <div className="flex items-center border-b px-3">
                    <Input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
                    {search && <X className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => setSearch("")} />}
                </div>
                <div className="max-h-50 overflow-y-auto py-1">
                    {filteredOptions.length === 0 ? (
                        <div className="px-2 py-4 text-center text-sm text-muted-foreground">{emptyText}</div>
                    ) : (
                        filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                className={cn(
                                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                    value === option.value && "bg-accent text-accent-foreground"
                                )}
                                onClick={() => {
                                    onChange(option.value);
                                    setSearch("");
                                    setOpen(false);
                                }}
                            >
                                <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                                {option.label}
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

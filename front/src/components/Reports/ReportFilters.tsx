import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Search, RotateCcw } from "lucide-react";
import { SearchableSelect } from "../ui/SearchableSelect";

interface FilterOption {
    value: string;
    label: string;
}

interface ReportFiltersProps {
    startDate: Date;
    endDate: Date;
    onStartDateChange: (date: Date) => void;
    onEndDateChange: (date: Date) => void;
    categoryId?: string;
    onCategoryChange?: (value: string) => void;
    categories?: FilterOption[];
    materialId?: string;
    onMaterialChange?: (value: string) => void;
    materials?: FilterOption[];
    type?: string;
    onTypeChange?: (value: string) => void;
    types?: FilterOption[];
    status?: string;
    onStatusChange?: (value: string) => void;
    statuses?: FilterOption[];
    userId?: string;
    onUserChange?: (value: string) => void;
    users?: FilterOption[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    onApply: () => void;
    onReset: () => void;
    loading?: boolean;
}

export function ReportFilters({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    categoryId,
    onCategoryChange,
    categories = [],
    materialId,
    onMaterialChange,
    materials = [],
    type,
    onTypeChange,
    types = [],
    status,
    onStatusChange,
    statuses = [],
    userId,
    onUserChange,
    users = [],
    searchTerm,
    onSearchChange,
    onApply,
    onReset,
    loading = false
}: ReportFiltersProps) {
    return (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <Label className="text-sm mb-2 block">Период</Label>
                    <DateRangePicker startDate={startDate} endDate={endDate} onStartDateChange={onStartDateChange} onEndDateChange={onEndDateChange} />
                </div>

                {categories.length > 0 && onCategoryChange && (
                    <div>
                        <Label className="text-sm mb-2 block">Категория</Label>
                        <SearchableSelect value={categoryId || "all"} onChange={onCategoryChange} options={[{ value: "all", label: "Все категории" }, ...categories]} placeholder="Выберите категорию" disabled={loading} />
                    </div>
                )}

                {materials.length > 0 && onMaterialChange && (
                    <div>
                        <Label className="text-sm mb-2 block">Материал</Label>
                        <SearchableSelect value={materialId || "all"} onChange={onMaterialChange} options={[{ value: "all", label: "Все материалы" }, ...materials]} placeholder="Выберите материал" disabled={loading} />
                    </div>
                )}

                {types.length > 0 && onTypeChange && (
                    <div>
                        <Label className="text-sm mb-2 block">Тип операции</Label>
                        <Select value={type || "all"} onValueChange={onTypeChange} disabled={loading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Все" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все</SelectItem>
                                {types.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {statuses.length > 0 && onStatusChange && (
                    <div>
                        <Label className="text-sm mb-2 block">Статус</Label>
                        <Select value={status || "all"} onValueChange={onStatusChange} disabled={loading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Все" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все</SelectItem>
                                {statuses.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {users.length > 0 && onUserChange && (
                    <div>
                        <Label className="text-sm mb-2 block">Пользователь</Label>
                        <SearchableSelect value={userId || "all"} onChange={onUserChange} options={[{ value: "all", label: "Все пользователи" }, ...users]} placeholder="Выберите пользователя" disabled={loading} />
                    </div>
                )}

                {searchTerm !== undefined && onSearchChange && (
                    <div>
                        <Label className="text-sm mb-2 block">Поиск</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Поиск..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="pl-10" disabled={loading} />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap justify-between gap-2">
                <div className="flex gap-2">
                    <Button onClick={onApply} disabled={loading}>
                        <Search className="mr-2 h-4 w-4" />
                        Применить
                    </Button>
                    <Button variant="outline" onClick={onReset} disabled={loading}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Сбросить
                    </Button>
                </div>
            </div>
        </div>
    );
}

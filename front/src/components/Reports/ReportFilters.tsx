import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Download, Printer, RotateCcw, Search } from "lucide-react";
import ExportButton from "../ExportButton";
import { LoadingSpinner } from "../LoadingSpinner";

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
    onExportPDF?: () => void;
    onExportExcel?: () => void;
    onExportCSV?: () => void;
    onPrint?: () => void;

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
    onExportPDF,
    onExportExcel,
    onExportCSV,
    onPrint,
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
                        <Select value={categoryId} onValueChange={onCategoryChange} disabled={loading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Все категории" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все категории</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {materials.length > 0 && onMaterialChange && (
                    <div>
                        <Label className="text-sm mb-2 block">Материал</Label>
                        <Select value={materialId} onValueChange={onMaterialChange} disabled={loading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Все материалы" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все материалы</SelectItem>
                                {materials.map((mat) => (
                                    <SelectItem key={mat.value} value={mat.value}>
                                        {mat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {types.length > 0 && onTypeChange && (
                    <div>
                        <Label className="text-sm mb-2 block">Тип операции</Label>
                        <Select value={type} onValueChange={onTypeChange} disabled={loading}>
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
                        <Select value={status} onValueChange={onStatusChange} disabled={loading}>
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
                        <Select value={userId} onValueChange={onUserChange} disabled={loading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Все пользователи" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все пользователи</SelectItem>
                                {users.map((u) => (
                                    <SelectItem key={u.value} value={u.value}>
                                        {u.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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

                <div className="flex gap-2">
                    {onExportPDF && (
                        <Button variant="outline" onClick={onExportPDF} disabled={loading}>
                            <Download className="mr-2 h-4 w-4" />
                            PDF
                        </Button>
                    )}
                    {onExportExcel && (
                        <Button variant="outline" onClick={onExportExcel} disabled={loading}>
                            <Download className="mr-2 h-4 w-4" />
                            Excel
                        </Button>
                    )}
                    {onExportCSV && (
                        <Button variant="outline" onClick={onExportCSV} disabled={loading}>
                            <Download className="mr-2 h-4 w-4" />
                            CSV
                        </Button>
                    )}
                    {onPrint && (
                        <Button variant="outline" onClick={onPrint} disabled={loading}>
                            <Printer className="mr-2 h-4 w-4" />
                            Печать
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from "react";
import { ReportFilters } from "./ReportFilters";
import { ReportTable } from "./ReportTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subMonths } from "date-fns";
import { LoadingSpinner } from "../LoadingSpinner";
import { useMaterials } from "@/hooks/useMaterials";
import { useReports } from "@/hooks/useReports";
import type { TurnoverItem } from "@/types/report.types";
import type { ExportColumn } from "@/services/exportService";
import { ExportDropdown } from "../ExportDropdown";

export function TurnoverBalanceReport() {
    const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [categoryId, setCategoryId] = useState<string>("all");
    const [data, setData] = useState<TurnoverItem[]>([]);
    const [summary, setSummary] = useState({
        total_opening: 0,
        total_incoming: 0,
        total_outgoing: 0,
        total_closing: 0,
    });
    const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);

    const { categories: allCategories, fetchCategories } = useMaterials();
    const { getTurnoverBalanceReport, loading } = useReports();

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (allCategories.length > 0) {
            setCategories(
                allCategories.map((c) => ({
                    value: c.id.toString(),
                    label: c.name,
                })),
            );
        }
    }, [allCategories]);

    const fetchData = async () => {
        try {
            const result = await getTurnoverBalanceReport({
                startDate: format(startDate, "yyyy-MM-dd"),
                endDate: format(endDate, "yyyy-MM-dd"),
                categoryId,
            });
            setData(result.data);
            setSummary(result.summary);
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApply = () => {
        fetchData();
    };

    const handleReset = () => {
        setStartDate(subMonths(new Date(), 1));
        setEndDate(new Date());
        setCategoryId("all");
        setTimeout(fetchData, 100);
    };

    const formatNumber = (num: number) => {
        if (num === 0) return "0";
        return num.toLocaleString();
    };

    const getBalanceClass = (balance: number) => {
        if (balance > 0) return "text-green-600";
        if (balance < 0) return "text-red-600";
        return "";
    };

    const columns = [
        { key: "name", header: "Материал", width: "200px" },
        { key: "code", header: "Код", width: "100px" },
        { key: "unit", header: "Ед.", width: "60px" },
        { key: "category_name", header: "Категория", width: "150px" },
        { key: "opening_balance", header: "Нач. остаток", width: "100px", format: (v: number) => formatNumber(v) },
        { key: "incoming", header: "Приход", width: "100px", format: (v: number) => formatNumber(v) },
        { key: "outgoing", header: "Расход", width: "100px", format: (v: number) => formatNumber(v) },
        { key: "closing_balance", header: "Кон. остаток", width: "100px", format: (v: number, _row: any) => <span className={getBalanceClass(v)}>{formatNumber(v)}</span> },
    ];

    const exportColumns: ExportColumn<TurnoverItem>[] = [
        { key: "name", header: "Материал" },
        { key: "code", header: "Код" },
        { key: "unit", header: "Ед." },
        { key: "category_name", header: "Категория" },
        { key: "opening_balance", header: "Нач. остаток", format: (v) => v?.toLocaleString() || "0" },
        { key: "incoming", header: "Приход", format: (v) => v?.toLocaleString() || "0" },
        { key: "outgoing", header: "Расход", format: (v) => v?.toLocaleString() || "0" },
        { key: "closing_balance", header: "Кон. остаток", format: (v) => v?.toLocaleString() || "0" },
    ];

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-4">
            <ReportFilters
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                categoryId={categoryId}
                onCategoryChange={setCategoryId}
                categories={categories}
                onApply={handleApply}
                onReset={handleReset}
                loading={loading}
            />

            <div className="flex justify-end mb-4">
                <ExportDropdown data={data} columns={exportColumns} filename="turnover_balance" title="Оборотно-сальдовая ведомость" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Остаток на начало</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.total_opening.toLocaleString()} ед.</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-green-600">Приход</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">+{summary.total_incoming.toLocaleString()} ед.</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-red-600">Расход</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">-{summary.total_outgoing.toLocaleString()} ед.</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Остаток на конец</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${getBalanceClass(summary.total_closing)}`}>{summary.total_closing.toLocaleString()} ед.</div>
                    </CardContent>
                </Card>
            </div>

            <ReportTable columns={columns} data={data} itemsPerPage={15} />
        </div>
    );
}

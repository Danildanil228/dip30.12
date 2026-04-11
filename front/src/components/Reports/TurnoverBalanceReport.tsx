import { useState, useEffect } from "react";
import { ReportFilters } from "./ReportFilters";
import { ReportTable } from "./ReportTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { format, subMonths } from "date-fns";
import { Loader2 } from "lucide-react";
import ExportButton from "../ExportButton";

interface TurnoverItem {
    id: number;
    name: string;
    code: string;
    unit: string;
    category_name: string;
    opening_balance: number;
    incoming: number;
    outgoing: number;
    closing_balance: number;
}

interface Category {
    id: number;
    name: string;
}

export function TurnoverBalanceReport() {
    const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [categoryId, setCategoryId] = useState<string>("all");
    const [data, setData] = useState<TurnoverItem[]>([]);
    const [summary, setSummary] = useState({
        total_opening: 0,
        total_incoming: 0,
        total_outgoing: 0,
        total_closing: 0
    });
    const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchFilters = async () => {
        try {
            const token = localStorage.getItem("token");
            const categoriesRes = await axios.get(`${API_BASE_URL}/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(
                categoriesRes.data.categories.map((c: Category) => ({
                    value: c.id.toString(),
                    label: c.name
                }))
            );
        } catch (error) {
            console.error("Ошибка загрузки фильтров:", error);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/reports/turnover-balance`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    startDate: format(startDate, "yyyy-MM-dd"),
                    endDate: format(endDate, "yyyy-MM-dd"),
                    categoryId
                }
            });
            setData(response.data.data);
            setSummary(response.data.summary);
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFilters();
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
        {
            key: "opening_balance",
            header: "Нач. остаток",
            width: "100px",
            format: (v: number) => formatNumber(v)
        },
        {
            key: "incoming",
            header: "Приход",
            width: "100px",
            format: (v: number) => formatNumber(v)
        },
        {
            key: "outgoing",
            header: "Расход",
            width: "100px",
            format: (v: number) => formatNumber(v)
        },
        {
            key: "closing_balance",
            header: "Кон. остаток",
            width: "100px",
            format: (v: number, row: any) => <span className={getBalanceClass(v)}>{formatNumber(v)}</span>
        }
    ];

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

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <>
                    <ExportButton
                        data={data}
                        columns={[
                            { accessorKey: "name", header: "Материал" },
                            { accessorKey: "code", header: "Код" },
                            { accessorKey: "unit", header: "Ед." },
                            { accessorKey: "category_name", header: "Категория" },
                            { accessorKey: "opening_balance", header: "Нач. остаток", format: (v) => v?.toLocaleString() },
                            { accessorKey: "incoming", header: "Приход", format: (v) => v?.toLocaleString() },
                            { accessorKey: "outgoing", header: "Расход", format: (v) => v?.toLocaleString() },
                            { accessorKey: "closing_balance", header: "Кон. остаток", format: (v) => v?.toLocaleString() }
                        ]}
                        filename="turnover_balance"
                        title="Оборотно-сальдовая ведомость"
                    />
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
                </>
            )}
        </div>
    );
}

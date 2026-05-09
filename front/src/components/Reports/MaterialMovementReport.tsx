import { useState, useEffect } from "react";
import { ReportFilters } from "./ReportFilters";
import { ReportTable } from "./ReportTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subMonths } from "date-fns";
import { LoadingSpinner } from "../LoadingSpinner";
import { useMaterials } from "@/hooks/useMaterials";
import { useReports } from "@/hooks/useReports";
import { materialService } from "@/services/materialService";
import type { MovementItem } from "@/types/report.types";
import type { ExportColumn } from "@/services/exportService";
import { ExportDropdown } from "../ExportDropdown";

export function MaterialMovementReport() {
    const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [categoryId, setCategoryId] = useState<string>("all");
    const [materialId, setMaterialId] = useState<string>("all");
    const [type, setType] = useState<string>("all");
    const [data, setData] = useState<MovementItem[]>([]);
    const [summary, setSummary] = useState({ incoming: 0, outgoing: 0, turnover: 0 });
    const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
    const [materials, setMaterials] = useState<{ value: string; label: string }[]>([]);
    const [filterLoading, setFilterLoading] = useState(false);

    const { categories: allCategories, fetchCategories } = useMaterials();
    const { getMaterialMovementReport, loading } = useReports();

    const types = [
        { value: "incoming", label: "Приход" },
        { value: "outgoing", label: "Расход" },
    ];

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

    const fetchMaterialsList = async () => {
        try {
            const materialsData = await materialService.getMaterials();
            setMaterials(
                materialsData.materials.map((m) => ({
                    value: m.id.toString(),
                    label: `${m.name} (${m.code})`,
                })),
            );
        } catch (error) {
            console.error("Ошибка загрузки материалов:", error);
        }
    };

    useEffect(() => {
        fetchMaterialsList();
    }, []);

    const fetchData = async () => {
        try {
            const result = await getMaterialMovementReport({
                startDate: format(startDate, "yyyy-MM-dd"),
                endDate: format(endDate, "yyyy-MM-dd"),
                categoryId,
                materialId,
                type,
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
        setMaterialId("all");
        setType("all");
        setFilterLoading(true);
        setTimeout(() => {
            setFilterLoading(false);
            fetchData();
        }, 100);
    };

    const columns = [
        { key: "date", header: "Дата", width: "100px", format: (v: string) => format(new Date(v), "dd.MM.yyyy") },
        { key: "request_title", header: "Заявка", width: "150px" },
        { key: "request_type", header: "Тип", width: "80px", format: (v: string) => (v === "incoming" ? "Приход" : "Расход") },
        { key: "material_name", header: "Материал", width: "150px" },
        { key: "code", header: "Код", width: "100px" },
        { key: "category_name", header: "Категория", width: "120px" },
        { key: "quantity", header: "Кол-во", width: "80px", format: (v: number) => v?.toLocaleString() || "0" },
        { key: "created_by_username", header: "Кто создал", width: "120px" },
    ];

    const exportColumns: ExportColumn<MovementItem>[] = [
        { key: "date", header: "Дата", format: (v) => format(new Date(v), "dd.MM.yyyy") },
        { key: "request_title", header: "Заявка" },
        { key: "request_type", header: "Тип", format: (v) => (v === "incoming" ? "Приход" : "Расход") },
        { key: "material_name", header: "Материал" },
        { key: "code", header: "Код" },
        { key: "category_name", header: "Категория" },
        { key: "quantity", header: "Кол-во", format: (v) => v?.toLocaleString() || "0" },
        { key: "created_by_username", header: "Кто создал", format: (v) => v || "-" },
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
                materialId={materialId}
                onMaterialChange={setMaterialId}
                materials={materials}
                type={type}
                onTypeChange={setType}
                types={types}
                onApply={handleApply}
                onReset={handleReset}
                loading={loading || filterLoading}
            />

            <div className="flex justify-end mb-4">
                <ExportDropdown data={data} columns={exportColumns} filename="material_movement" title="Отчет по движению материалов" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="z-10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-green-600">Приход</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.incoming.toLocaleString()} ед.</div>
                    </CardContent>
                </Card>
                <Card className="z-10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-red-600">Расход</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.outgoing.toLocaleString()} ед.</div>
                    </CardContent>
                </Card>
                <Card className="z-10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Оборот</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.turnover.toLocaleString()} ед.</div>
                    </CardContent>
                </Card>
            </div>

            <ReportTable columns={columns} data={data} />
        </div>
    );
}

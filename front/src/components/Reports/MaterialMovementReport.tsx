import { useState, useEffect } from "react";
import { ReportFilters } from "./ReportFilters";
import { ReportTable } from "./ReportTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { format, subMonths } from "date-fns";
import { Loader2 } from "lucide-react";

interface MovementItem {
    date: string;
    request_title: string;
    request_type: string;
    material_name: string;
    code: string;
    category_name: string;
    quantity: number;
    created_by_username: string;
}

interface Category {
    id: number;
    name: string;
}

interface Material {
    id: number;
    name: string;
    code: string;
}

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
    const [loading, setLoading] = useState(false);
    const [filterLoading, setFilterLoading] = useState(false);

    const types = [
        { value: "incoming", label: "Приход" },
        { value: "outgoing", label: "Расход" }
    ];

    const fetchFilters = async () => {
        try {
            const token = localStorage.getItem("token");

            // Загрузка категорий
            const categoriesRes = await axios.get(`${API_BASE_URL}/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(
                categoriesRes.data.categories.map((c: Category) => ({
                    value: c.id.toString(),
                    label: c.name
                }))
            );

            // Загрузка материалов
            const materialsRes = await axios.get(`${API_BASE_URL}/reports/materials-list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaterials(
                materialsRes.data.materials.map((m: Material) => ({
                    value: m.id.toString(),
                    label: `${m.name} (${m.code})`
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
            const response = await axios.get(`${API_BASE_URL}/reports/material-movement`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    startDate: format(startDate, "yyyy-MM-dd"),
                    endDate: format(endDate, "yyyy-MM-dd"),
                    categoryId,
                    materialId,
                    type
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
        { key: "request_type", header: "Тип", width: "80px", format: (v: string) => (v === "incoming" ? "➕ Приход" : "➖ Расход") },
        { key: "material_name", header: "Материал", width: "150px" },
        { key: "code", header: "Код", width: "100px" },
        { key: "category_name", header: "Категория", width: "120px" },
        { key: "quantity", header: "Кол-во", width: "80px", format: (v: number) => v.toLocaleString() },
        { key: "created_by_username", header: "Кто создал", width: "120px" }
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

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-green-600">Приход</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.incoming.toLocaleString()} ед.</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-red-600">Расход</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.outgoing.toLocaleString()} ед.</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Оборот</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.turnover.toLocaleString()} ед.</div>
                            </CardContent>
                        </Card>
                    </div>

                    <ReportTable columns={columns} data={data} />
                </>
            )}
        </div>
    );
}

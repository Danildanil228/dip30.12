import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/DateRangePicker";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { format, subMonths } from "date-fns";
import { Loader2 } from "lucide-react";

interface StatusData {
    name: string;
    count: number;
    color: string;
}

type EntityType = "inventories" | "requests";

export function StatusChart() {
    const [entityType, setEntityType] = useState<EntityType>("inventories");
    const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [data, setData] = useState<StatusData[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem("token");
            const endpoint = entityType === "inventories" ? `${API_BASE_URL}/dashboard/inventory-status` : `${API_BASE_URL}/dashboard/requests-status`;

            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    startDate: format(startDate, "yyyy-MM-dd"),
                    endDate: format(endDate, "yyyy-MM-dd")
                }
            });
            setData(response.data.data);
            setTotal(response.data.total);
        } catch (error: any) {
            console.error("Ошибка загрузки статусов:", error);
            setError(error.response?.data?.error || "Ошибка загрузки");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [entityType, startDate, endDate]);

    const getEntityLabel = () => {
        return entityType === "inventories" ? "инвентаризаций" : "заявок";
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold">{payload[0].name}</p>
                    <p className="text-sm">Количество: {payload[0].value}</p>
                    <p className="text-sm text-muted-foreground">{((payload[0].value / total) * 100).toFixed(1)}%</p>
                </div>
            );
        }
        return null;
    };

    const renderLegend = (props: any) => {
        const { payload } = props;
        return (
            <ul className="flex flex-wrap justify-center gap-4 mt-4">
                {payload.map((entry: any, index: number) => (
                    <li key={`item-${index}`} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm">
                            {entry.value}: {entry.payload?.count || 0}
                        </span>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <CardTitle>Статус {getEntityLabel()}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                        <Select value={entityType} onValueChange={(v) => setEntityType(v as EntityType)}>
                            <SelectTrigger className="w-50">
                                <SelectValue placeholder="Выберите тип" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="inventories">Инвентаризации</SelectItem>
                                <SelectItem value="requests">Заявки</SelectItem>
                            </SelectContent>
                        </Select>
                        <DateRangePicker startDate={startDate} endDate={endDate} onStartDateChange={setStartDate} onEndDateChange={setEndDate} />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="">
                {loading ? (
                    <div className="flex justify-center items-center h-80">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-80 text-red-500">{error}</div>
                ) : data.length === 0 ? (
                    <div className="flex justify-center items-center h-80 text-muted-foreground">Нет данных за выбранный период</div>
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="count" labelLine={false}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend content={renderLegend} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="text-center mt-4 text-muted-foreground">
                            Всего {getEntityLabel()}: {total}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

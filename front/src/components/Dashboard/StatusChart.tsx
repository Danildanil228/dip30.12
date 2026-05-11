import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/DateRangePicker";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { format, subMonths } from "date-fns";
import { ChartPie, Loader2 } from "lucide-react";
import { reportService } from "@/services/reportService";

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

            const params = {
                startDate: format(startDate, "yyyy-MM-dd"),
                endDate: format(endDate, "yyyy-MM-dd"),
            };

            let response;
            if (entityType === "inventories") {
                response = await reportService.getInventoryStatus(params);
            } else {
                response = await reportService.getRequestsStatus(params);
            }

            setData(response.data);
            setTotal(response.total);
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

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Статус {getEntityLabel()}</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-80">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Статус {getEntityLabel()}</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-80 text-red-500">{error}</CardContent>
            </Card>
        );
    }

    return (
        <Card className="z-10 border-0">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <CardTitle className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <ChartPie className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <span className="text-lg">Статус {getEntityLabel()}</span>
                        </div>
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                        <Select value={entityType} onValueChange={(v) => setEntityType(v as EntityType)}>
                            <SelectTrigger className="w-50 bg-background!">
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
            <CardContent>
                {data.length === 0 ? (
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

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/DateRangePicker";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { format, subDays, subMonths } from "date-fns";
import { Loader2 } from "lucide-react";

interface MovementData {
    date: string;
    incoming: number;
    outgoing: number;
}

const quickRanges = [
    { label: "7д", days: 7 },
    { label: "14д", days: 14 },
    { label: "30д", days: 30 },
    { label: "90д", days: 90 }
];

export function MovementChart() {
    const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [data, setData] = useState<MovementData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/dashboard/movement`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    startDate: format(startDate, "yyyy-MM-dd"),
                    endDate: format(endDate, "yyyy-MM-dd")
                }
            });
            setData(response.data.data);
        } catch (error: any) {
            console.error("Ошибка загрузки данных движения:", error);
            setError(error.response?.data?.error || "Ошибка загрузки");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const handleQuickRange = (days: number) => {
        setEndDate(new Date());
        setStartDate(subDays(new Date(), days));
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return format(date, "dd.MM");
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold mb-2">{label}</p>
                    {payload.map((p: any, idx: number) => (
                        <p key={idx} className="text-sm" style={{ color: p.color }}>
                            {p.name}: {p.value} ед.
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="col-span-2">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <CardTitle>Движение товаров</CardTitle>
                    <div className="flex flex-wrap gap-2">
                        {quickRanges.map((range) => (
                            <Button key={range.days} variant="outline" size="sm" onClick={() => handleQuickRange(range.days)}>
                                {range.label}
                            </Button>
                        ))}
                        <DateRangePicker startDate={startDate} endDate={endDate} onStartDateChange={setStartDate} onEndDateChange={setEndDate} />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center h-80">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-80 text-red-500">{error}</div>
                ) : data.length === 0 ? (
                    <div className="flex justify-center items-center h-80 text-muted-foreground">Нет данных за выбранный период</div>
                ) : (
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} label={{ value: "Количество", angle: -90, position: "insideLeft", fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="incoming" name="Приход" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="outgoing" name="Расход" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

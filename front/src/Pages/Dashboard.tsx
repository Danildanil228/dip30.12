import { useState, useEffect } from "react";
import { MetricCard } from "@/components/Dashboard/MetricCard";
import { MovementChart } from "@/components/Dashboard/MovementChart";
import { StatusChart } from "@/components/Dashboard/StatusChart";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Boxes, Clock, CheckCircle, RefreshCw } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { format, subMonths } from "date-fns";
import { ScrollToTop } from "@/components/ScrollToTop";

interface MetricsData {
    total_materials: number;
    total_quantity: number;
    pending_requests: {
        total: number;
        incoming: number;
        outgoing: number;
    };
    completed_requests: number;
    completed_change: number;
}

export default function Dashboard() {
    const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [metrics, setMetrics] = useState<MetricsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/dashboard/metrics`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    startDate: format(startDate, "yyyy-MM-dd"),
                    endDate: format(endDate, "yyyy-MM-dd")
                }
            });
            setMetrics(response.data);
        } catch (error: any) {
            console.error("Ошибка загрузки метрик:", error);
            setError(error.response?.data?.error || "Ошибка загрузки");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, [startDate, endDate]);

    const handleRefresh = () => {
        fetchMetrics();
    };

    if (loading && !metrics) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ScrollToTop />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold">Дашборд</h1>
                <div className="flex flex-wrap gap-2">
                    <DateRangePicker startDate={startDate} endDate={endDate} onStartDateChange={setStartDate} onEndDateChange={setEndDate} />
                    <Button variant="outline" size="icon" onClick={handleRefresh}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-lg">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Всего материалов" value={metrics?.total_materials || 0} icon={<Package className="h-4 w-4" />} />
                <MetricCard title="Остатки на складе" value={`${(metrics?.total_quantity || 0).toLocaleString()} ед.`} icon={<Boxes className="h-4 w-4" />} />
                <MetricCard
                    title="Активные заявки"
                    value={metrics?.pending_requests.total || 0}
                    description={`${metrics?.pending_requests.incoming || 0} приход / ${metrics?.pending_requests.outgoing || 0} расход`}
                    icon={<Clock className="h-4 w-4" />}
                />
                <MetricCard title="Завершено за период" value={metrics?.completed_requests || 0} change={metrics?.completed_change} changeText="к прошлому периоду" icon={<CheckCircle className="h-4 w-4" />} />
            </div>

            <MovementChart />
            <StatusChart />
        </div>
    );
}

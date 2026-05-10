import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MetricCard } from "@/components/Dashboard/MetricCard";
import { MovementChart } from "@/components/Dashboard/MovementChart";
import { StatusChart } from "@/components/Dashboard/StatusChart";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Button } from "@/components/ui/button";
import { Package, Boxes, Clock, CheckCircle, RefreshCw, TrendingUp } from "lucide-react";
import { format, subMonths } from "date-fns";
import { ScrollToTop } from "@/components/ScrollToTop";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useReports } from "@/hooks/useReports";

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
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

export default function Dashboard() {
    const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [metrics, setMetrics] = useState<MetricsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { getDashboardMetrics } = useReports();

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getDashboardMetrics({
                startDate: format(startDate, "yyyy-MM-dd"),
                endDate: format(endDate, "yyyy-MM-dd"),
            });
            setMetrics(data);
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
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-8">
            <ScrollToTop />

            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Дашборд</h1>
                    <p className="text-muted-foreground mt-1">Ключевые показатели и аналитика</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <DateRangePicker startDate={startDate} endDate={endDate} onStartDateChange={setStartDate} onEndDateChange={setEndDate} />
                    <Button variant="outline" size="icon" onClick={handleRefresh} title="Обновить">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </motion.div>

            {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">
                    {error}
                </motion.div>
            )}

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div variants={itemVariants}>
                    <MetricCard title="Всего материалов" value={metrics?.total_materials || 0} icon={<Package className="h-5 w-5 text-blue-500" />} />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <MetricCard title="Остатки на складе" value={`${(metrics?.total_quantity || 0).toLocaleString()} ед.`} icon={<Boxes className="h-5 w-5 text-green-500" />} />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <MetricCard
                        title="Активные заявки"
                        value={metrics?.pending_requests.total || 0}
                        description={`${metrics?.pending_requests.incoming || 0} приход / ${metrics?.pending_requests.outgoing || 0} расход`}
                        icon={<Clock className="h-5 w-5 text-yellow-500" />}
                    />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <MetricCard
                        title="Завершено за период"
                        value={metrics?.completed_requests || 0}
                        change={metrics?.completed_change}
                        changeText="к прошлому периоду"
                        icon={<CheckCircle className="h-5 w-5 text-purple-500" />}
                    />
                </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
                <div className="rounded-xl border bg-card shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-lg font-semibold">Движение товаров</h2>
                    </div>
                    <MovementChart />
                </div>

                <div className="rounded-xl border bg-card shadow-sm p-6">
                    <StatusChart />
                </div>
            </motion.div>
        </div>
    );
}

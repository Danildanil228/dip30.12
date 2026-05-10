import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaterialMovementReport } from "@/components/Reports/MaterialMovementReport";
import { RequestsReport } from "@/components/Reports/RequestsReport";
import { TurnoverBalanceReport } from "@/components/Reports/TurnoverBalanceReport";
import { UserActivityReport } from "@/components/Reports/UserActivityReport";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useUser } from "@/hooks/useUser";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Navigate } from "react-router-dom";
import { BarChart3, FileText, FileSpreadsheet, Users } from "lucide-react";

export default function Reports() {
    const [activeTab, setActiveTab] = useState("movement");
    const { user, loading } = useUser();

    if (loading) {
        return <LoadingSpinner />;
    }
    if (user?.role === "storekeeper") {
        return <Navigate to="/main" replace />;
    }

    const tabs = [
        { value: "movement", label: "Движение материалов", icon: BarChart3 },
        { value: "requests", label: "Заявки", icon: FileText },
        { value: "turnover", label: "Оборотно-сальдовая ведомость", icon: FileSpreadsheet },
        { value: "activity", label: "Пользователи", icon: Users },
    ];

    return (
        <div className="space-y-6">
            <ScrollToTop />

            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Аналитика и отчёты</h1>
                    <p className="text-muted-foreground mt-1">Формирование отчётов и экспорт данных</p>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card shadow-sm p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="flex flex-wrap gap-2 bg-transparent p-0 mb-8">
                        {tabs.map((tab) => (
                            <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2 transition-all">
                                <tab.icon className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">
                                    {tab.value === "movement" && "Движение"}
                                    {tab.value === "requests" && "Заявки"}
                                    {tab.value === "turnover" && "ОСВ"}
                                    {tab.value === "activity" && "Пользователи"}
                                </span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                            <TabsContent value="movement" forceMount className="mt-0 data-[state=inactive]:hidden">
                                <MaterialMovementReport />
                            </TabsContent>
                            <TabsContent value="requests" forceMount className="mt-0 data-[state=inactive]:hidden">
                                <RequestsReport />
                            </TabsContent>
                            <TabsContent value="turnover" forceMount className="mt-0 data-[state=inactive]:hidden">
                                <TurnoverBalanceReport />
                            </TabsContent>
                            <TabsContent value="activity" forceMount className="mt-0 data-[state=inactive]:hidden">
                                <UserActivityReport />
                            </TabsContent>
                        </motion.div>
                    </AnimatePresence>
                </Tabs>
            </motion.div>
        </div>
    );
}

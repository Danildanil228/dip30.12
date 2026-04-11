import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaterialMovementReport } from "@/components/Reports/MaterialMovementReport";
import { RequestsReport } from "@/components/Reports/RequestsReport";
import { TurnoverBalanceReport } from "@/components/Reports/TurnoverBalanceReport";
import { UserActivityReport } from "@/components/Reports/UserActivityReport";
import { ScrollToTop } from "@/components/ScrollToTop";

export default function Reports() {
    const [activeTab, setActiveTab] = useState("movement");

    return (
        <div className="space-y-6">
            <ScrollToTop />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold">Аналитика и отчеты</h1>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex!">
                <div className="sm:flex grid gap-2 text-center! sm:justify-between text-wrap">
                    <TabsList className="flex w-full">
                        <TabsTrigger value="movement" className="py-2">
                            Движение материалов
                        </TabsTrigger>
                    </TabsList>
                    <TabsList className="w-full">
                        <TabsTrigger value="requests" className="py-2">
                            Заявки
                        </TabsTrigger>
                    </TabsList>
                    <TabsList className="flex w-full">
                        <TabsTrigger value="turnover" className="py-2">
                            Оборотно-сальдовая ведомость
                        </TabsTrigger>
                    </TabsList>
                    <TabsList className="w-full">
                        <TabsTrigger value="activity" className="py-2">
                            Активность пользователей
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="movement" className="mt-6">
                    <MaterialMovementReport />
                </TabsContent>

                <TabsContent value="requests" className="mt-6">
                    <RequestsReport />
                </TabsContent>

                <TabsContent value="turnover" className="mt-6">
                    <TurnoverBalanceReport />
                </TabsContent>

                <TabsContent value="activity" className="mt-6">
                    <UserActivityReport />
                </TabsContent>
            </Tabs>
        </div>
    );
}

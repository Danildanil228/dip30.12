import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, User, Calendar, FileText, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useInventories } from "@/hooks/useInventories";
import { useUser } from "@/hooks/useUser";
import type { InventoryItem } from "@/types/inventory.types";

export default function InventoryDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useUser();
    const { currentInventory, inventoryResults, loading, fetchInventoryById } = useInventories();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [notesExpanded, _setNotesExpanded] = useState(false);

    const isAdminOrAccountant = user?.role === "admin" || user?.role === "accountant";
    const canReview = isAdminOrAccountant && currentInventory?.status === "completed";

    useEffect(() => {
        if (id) fetchInventoryById(parseInt(id));
    }, [id]);
    useEffect(() => {
        if (inventoryResults.length > 0) setItems(inventoryResults);
    }, [inventoryResults]);

    const getStatusBadge = (status: string) => {
        const map: Record<string, { label: string; className: string }> = {
            draft: { label: "Черновик", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
            in_progress: { label: "В процессе", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
            completed: { label: "Завершена, ожидает проверки", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
            approved: { label: "Утверждена", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
            cancelled: { label: "Отменена", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
        };
        const info = map[status] || { label: status, className: "" };
        return <Badge className={`${info.className} border-0`}>{info.label}</Badge>;
    };

    if (loading) return <LoadingSpinner />;

    if (!currentInventory) {
        return (
            <div className="text-center py-20">
                <p className="text-muted-foreground">Инвентаризация не найдена</p>
                <Button onClick={() => navigate("/inventories")} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => navigate("/inventories")} className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" /> Назад к списку
            </Button>

            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Card className="shadow-sm">
                    <CardHeader>
                        <div className="flex flex-wrap justify-between items-start gap-4">
                            <div>
                                <CardTitle className="text-2xl mb-2">{currentInventory.title}</CardTitle>
                                {getStatusBadge(currentInventory.status)}
                            </div>
                            {canReview && (
                                <Button onClick={() => navigate(`/inventories/${id}/review`)} className="gap-2">
                                    <CheckCircle className="h-4 w-4" /> Проверить
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {format(new Date(currentInventory.start_date), "dd.MM.yyyy")} – {format(new Date(currentInventory.end_date), "dd.MM.yyyy")}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span>Ответственный: {currentInventory.responsible_username}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span>Создал: {currentInventory.created_by_username}</span>
                            </div>
                            {currentInventory.approved_by_username && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span>Утвердил: {currentInventory.approved_by_username}</span>
                                </div>
                            )}
                        </div>

                        {currentInventory.description && (
                            <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div className={`text-sm ${!notesExpanded ? "line-clamp-2" : ""}`}>{currentInventory.description}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

           
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Результаты инвентаризации
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {items.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">Нет данных</div>
                            ) : (
                                items.map((item) => {
                                    const diff = item.actual_quantity !== null ? (item.actual_quantity || 0) - item.system_quantity : null;
                                    return (
                                        <div key={item.id} className="border rounded-xl p-4">
                                            <div className="flex flex-wrap justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-semibold">{item.name}</h3>
                                                    <p className="text-sm text-muted-foreground">Код: {item.code}</p>
                                                </div>
                                                {item.actual_quantity === null ? (
                                                    <Badge variant="outline" className="text-muted-foreground">
                                                        Не проверено
                                                    </Badge>
                                                ) : diff === 0 ? (
                                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">Совпадает</Badge>
                                                ) : (
                                                    <Badge variant={diff! > 0 ? "default" : "destructive"} className={diff! > 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0" : ""}>
                                                        {diff! > 0 ? `+${diff}` : diff} {item.unit}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">В системе:</span> <span className="font-medium">{item.system_quantity}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Фактически:</span> <span className="font-medium">{item.actual_quantity !== null ? item.actual_quantity : "—"}</span>
                                                </div>
                                                {item.reason && (
                                                    <div className="col-span-full mt-2 p-2 bg-muted/50 rounded-lg text-sm">
                                                        <span className="text-muted-foreground">Причина: </span>
                                                        {item.reason}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

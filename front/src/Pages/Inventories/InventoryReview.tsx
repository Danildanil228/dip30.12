import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, CheckCircle, XCircle, Package, User, Calendar, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useInventories } from "@/hooks/useInventories";
import { useUser } from "@/hooks/useUser";
import type { InventoryItem } from "@/types/inventory.types";

export default function InventoryReview() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useUser();
    const { currentInventory, inventoryResults, loading, fetchInventoryById, approveInventory, cancelInventory } = useInventories();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");
    const [notesExpanded, _setNotesExpanded] = useState(false);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    const isAdminOrAccountant = user?.role === "admin" || user?.role === "accountant";

    useEffect(() => {
        if (id) fetchInventoryById(parseInt(id));
    }, [id]);
    useEffect(() => {
        if (inventoryResults.length > 0) setItems(inventoryResults);
    }, [inventoryResults]);

    useEffect(() => {
        if (currentInventory && !isAdminOrAccountant) {
            setError("Недостаточно прав для проверки инвентаризации");
            return;
        }
        if (currentInventory && currentInventory.status !== "completed") {
            setError(`Инвентаризация не ожидает проверки. Статус: ${currentInventory.status}`);
            return;
        }
    }, [currentInventory, user]);

    const handleApprove = async () => {
        setShowApproveDialog(false);
        setProcessing(true);
        try {
            await approveInventory(parseInt(id!));
            navigate("/inventories");
        } catch (error: any) {
            setError(error.response?.data?.error || "Ошибка");
        } finally {
            setProcessing(false);
        }
    };

    const handleCancel = async () => {
        setShowCancelDialog(false);
        setProcessing(true);
        try {
            await cancelInventory(parseInt(id!));
            navigate("/inventories");
        } catch (error: any) {
            setError(error.response?.data?.error || "Ошибка");
        } finally {
            setProcessing(false);
        }
    };

    const getStats = () => {
        const total = items.length;
        const withDifference = items.filter((i) => i.actual_quantity !== null && i.actual_quantity !== i.system_quantity).length;
        const surplus = items.filter((i) => i.actual_quantity !== null && (i.actual_quantity || 0) > i.system_quantity).length;
        const shortage = items.filter((i) => i.actual_quantity !== null && (i.actual_quantity || 0) < i.system_quantity).length;
        return { total, withDifference, surplus, shortage };
    };

    if (loading) return <LoadingSpinner />;

    if (error || !currentInventory) {
        return (
            <div className="text-center py-20">
                <p className="text-red-500 mb-4">{error || "Инвентаризация не найдена"}</p>
                <Button onClick={() => navigate("/inventories")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                </Button>
            </div>
        );
    }

    const stats = getStats();

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => navigate("/inventories")} className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" /> Назад к списку
            </Button>

          
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Card className="shadow-sm">
                    <CardHeader>
                        <div className="flex flex-wrap justify-between items-start gap-2">
                            <CardTitle className="text-xl">{currentInventory.title}</CardTitle>
                            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">Завершена, ожидает проверки</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                        </div>

                        {currentInventory.description && (
                            <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div className={`text-sm ${!notesExpanded ? "line-clamp-2" : ""}`}>{currentInventory.description}</div>
                            </div>
                        )}

                     
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: "Всего", value: stats.total, icon: Package, color: "" },
                                { label: "Расходятся", value: stats.withDifference, icon: TrendingDown, color: "text-orange-600" },
                                { label: "Излишек", value: `+${stats.surplus}`, icon: TrendingUp, color: "text-green-600" },
                                { label: "Недостача", value: `-${stats.shortage}`, icon: TrendingDown, color: "text-red-600" },
                            ].map((s) => (
                                <div key={s.label} className="text-center p-3 rounded-xl bg-muted/50">
                                    <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                                    <div className="text-xs text-muted-foreground">{s.label}</div>
                                </div>
                            ))}
                        </div>

                     
                        <div className="flex flex-wrap gap-3 justify-end">
                            <Button onClick={() => setShowApproveDialog(true)} disabled={processing} className="gap-2">
                                <CheckCircle className="h-4 w-4" /> Подтвердить
                            </Button>
                            <Button onClick={() => setShowCancelDialog(true)} disabled={processing} variant="outline" className="gap-2">
                                <XCircle className="h-4 w-4" /> Отменить
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

         
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Товары с расхождениями
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {items.filter((i) => i.actual_quantity !== null && i.actual_quantity !== i.system_quantity).length === 0 ? (
                            <div className="text-center py-10">
                                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                                <p className="font-medium">Расхождений не обнаружено!</p>
                                <p className="text-sm text-muted-foreground mt-1">Все товары сошлись с системными данными</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items
                                    .filter((i) => i.actual_quantity !== null && i.actual_quantity !== i.system_quantity)
                                    .map((item) => {
                                        const diff = (item.actual_quantity || 0) - item.system_quantity;
                                        return (
                                            <div key={item.id} className="border rounded-xl p-4">
                                                <div className="flex flex-wrap justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="font-semibold">{item.name}</h3>
                                                        <p className="text-sm text-muted-foreground">Код: {item.code}</p>
                                                    </div>
                                                    <Badge variant={diff > 0 ? "default" : "destructive"} className={diff > 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0" : ""}>
                                                        {diff > 0 ? `+${diff}` : diff} {item.unit}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Система:</span> {item.system_quantity}
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Факт:</span> {item.actual_quantity}
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Разница:</span>{" "}
                                                        <span className={diff > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                                            {diff > 0 ? "+" : ""}
                                                            {diff}
                                                        </span>
                                                    </div>
                                                </div>
                                                {item.reason && (
                                                    <div className="mt-3 p-2 bg-muted/50 rounded-lg text-sm">
                                                        <span className="text-muted-foreground">Причина: </span>
                                                        {item.reason}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

 
            <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Подтвердить инвентаризацию?</AlertDialogTitle>
                        <AlertDialogDescription>Остатки на складе будут обновлены согласно результатам.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={handleApprove}>Подтвердить</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Отменить инвентаризацию?</AlertDialogTitle>
                        <AlertDialogDescription>Все результаты будут отклонены.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancel} className="bg-destructive hover:bg-destructive/90">
                            Отменить
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

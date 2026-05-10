import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, Save, Send, Package, User, Calendar, AlertCircle, FileText } from "lucide-react";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useInventories } from "@/hooks/useInventories";
import { useUser } from "@/hooks/useUser";
import { ScrollToTop } from "@/components/ScrollToTop";
import type { InventoryItem } from "@/types/inventory.types";

export default function InventoryConduct() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useUser();
    const { currentInventory, inventoryResults, loading, fetchInventoryById, saveResults, completeInventory } = useInventories();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notesExpanded, setNotesExpanded] = useState(false);
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);
    const [uncheckedCount, setUncheckedCount] = useState(0);
    const [successMessage, setSuccessMessage] = useState("");

    const isResponsible = () => {
        if (!currentInventory || !user) return false;
        return currentInventory.responsible_person === user.id;
    };

    useEffect(() => {
        if (id) fetchInventoryById(parseInt(id));
    }, [id]);

    useEffect(() => {
        if (inventoryResults.length > 0) setItems(inventoryResults);
    }, [inventoryResults]);

    useEffect(() => {
        if (currentInventory && currentInventory.responsible_person !== user?.id) {
            setError(`Вы не являетесь ответственным за эту инвентаризацию. Ответственный: ${currentInventory.responsible_username}`);
            return;
        }
        if (currentInventory && currentInventory.status !== "in_progress") {
            setError(`Инвентаризация не в процессе. Текущий статус: ${currentInventory.status}`);
            return;
        }
    }, [currentInventory, user]);

    const handleQuantityChange = (materialId: number, value: string) => {
        const numValue = value === "" ? null : parseInt(value);
        setItems((prev) => prev.map((item) => (item.material_id === materialId ? { ...item, actual_quantity: numValue } : item)));
    };

    const handleReasonChange = (materialId: number, value: string) => {
        setItems((prev) => prev.map((item) => (item.material_id === materialId ? { ...item, reason: value || null } : item)));
    };

    const handleSave = async () => {
        if (!isResponsible()) {
            setError("Вы не являетесь ответственным");
            return;
        }
        setSaving(true);
        setError("");
        setSuccessMessage("");
        try {
            const results = items.map((item) => ({
                material_id: item.material_id,
                actual_quantity: item.actual_quantity,
                reason: item.reason,
            }));
            await saveResults(parseInt(id!), results);
            setSuccessMessage("Результаты сохранены");
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (error: any) {
            setError(error.response?.data?.error || "Ошибка сохранения");
        } finally {
            setSaving(false);
        }
    };

    const handleCompleteClick = () => {
        const unchecked = items.filter((item) => item.actual_quantity === null).length;
        setUncheckedCount(unchecked);
        setShowCompleteDialog(true);
    };

    const handleComplete = async () => {
        setShowCompleteDialog(false);
        setSaving(true);
        setError("");
        try {
            const results = items.map((item) => ({
                material_id: item.material_id,
                actual_quantity: item.actual_quantity,
                reason: item.reason,
            }));
            await saveResults(parseInt(id!), results);
            await completeInventory(parseInt(id!));
            navigate("/inventories");
        } catch (error: any) {
            setError(error.response?.data?.error || "Ошибка завершения");
        } finally {
            setSaving(false);
        }
    };

    const getProgress = () => {
        const checked = items.filter((item) => item.actual_quantity !== null).length;
        const total = items.length;
        return { checked, total, percent: total === 0 ? 0 : Math.round((checked / total) * 100) };
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

    const progress = getProgress();

    return (
        <div className="space-y-6">
            <ScrollToTop />

            <Button variant="ghost" onClick={() => navigate("/inventories")} className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" /> Назад к списку
            </Button>

            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Card className="shadow-sm">
                    <CardHeader>
                        <div className="flex flex-wrap justify-between items-start gap-2">
                            <CardTitle className="text-xl">{currentInventory.title}</CardTitle>
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">В процессе</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {format(new Date(currentInventory.start_date), "dd.MM.yyyy")} – {format(new Date(currentInventory.end_date), "dd.MM.yyyy")}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className={isResponsible() ? "h-4 w-4 text-primary" : "h-4 w-4 text-muted-foreground"} />
                                <span className={isResponsible() ? "font-medium text-primary" : "text-muted-foreground"}>
                                    {currentInventory.responsible_username}
                                    {isResponsible() && " (Вы)"}
                                </span>
                            </div>
                        </div>

                        {currentInventory.description && (
                            <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div>
                                    <div className={`text-sm ${!notesExpanded ? "line-clamp-2" : ""}`}>{currentInventory.description}</div>
                                    {currentInventory.description.length > 100 && (
                                        <button onClick={() => setNotesExpanded(!notesExpanded)} className="text-xs text-primary hover:underline mt-1">
                                            {notesExpanded ? "Свернуть" : "Развернуть"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {successMessage && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                <Save className="h-4 w-4" />
                                <span className="text-sm">{successMessage}</span>
                            </motion.div>
                        )}

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Прогресс</span>
                                <span className="font-medium">
                                    {progress.percent}% ({progress.checked}/{progress.total})
                                </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                                <motion.div className="bg-primary h-2.5 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress.percent}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 justify-end">
                            <Button onClick={handleSave} disabled={saving || currentInventory.status !== "in_progress" || !isResponsible()} variant="outline" className="gap-2">
                                <Save className="h-4 w-4" /> Сохранить
                            </Button>
                            <Button onClick={handleCompleteClick} disabled={saving || currentInventory.status !== "in_progress" || !isResponsible()} className="gap-2">
                                <Send className="h-4 w-4" /> Завершить
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
                            Товары для проверки ({items.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {items.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">Нет товаров для проверки</div>
                            ) : (
                                items.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="border rounded-xl p-4 hover:shadow-sm transition-shadow"
                                    >
                                        <div className="flex flex-wrap justify-between items-start mb-3 gap-2">
                                            <div>
                                                <h3 className="font-semibold">{item.name}</h3>
                                                <p className="text-sm text-muted-foreground">Код: {item.code}</p>
                                            </div>
                                            <Badge variant="outline" className="shrink-0">
                                                {item.system_quantity} {item.unit} в системе
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm mb-1.5 block">Фактическое количество</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="Введите количество"
                                                    value={item.actual_quantity === null ? "" : item.actual_quantity}
                                                    onChange={(e) => handleQuantityChange(item.material_id, e.target.value)}
                                                    disabled={currentInventory.status !== "in_progress" || !isResponsible()}
                                                />
                                                {item.actual_quantity !== null && item.actual_quantity !== item.system_quantity && (
                                                    <p className={`text-sm mt-1 font-medium ${item.actual_quantity > item.system_quantity ? "text-green-600" : "text-red-600"}`}>
                                                        {item.actual_quantity > item.system_quantity
                                                            ? `+${item.actual_quantity - item.system_quantity} излишек`
                                                            : `${item.actual_quantity - item.system_quantity} недостача`}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <Label className="text-sm mb-1.5 block">Причина расхождения</Label>
                                                <Input
                                                    placeholder="Укажите причину"
                                                    value={item.reason || ""}
                                                    onChange={(e) => handleReasonChange(item.material_id, e.target.value)}
                                                    disabled={currentInventory.status !== "in_progress" || !isResponsible() || item.actual_quantity === item.system_quantity}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Завершить инвентаризацию?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {uncheckedCount > 0 ? `Осталось не проверенных товаров: ${uncheckedCount}. Продолжить?` : "Вы уверены, что хотите завершить инвентаризацию? После этого нельзя будет редактировать результаты."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={handleComplete}>Завершить</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

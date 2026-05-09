import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

    const isResponsible = () => {
        if (!currentInventory || !user) return false;
        return currentInventory.responsible_person === user.id;
    };

    useEffect(() => {
        if (id) {
            fetchInventoryById(parseInt(id));
        }
    }, [id]);

    useEffect(() => {
        if (inventoryResults.length > 0) {
            setItems(inventoryResults);
        }
    }, [inventoryResults]);

    useEffect(() => {
        if (currentInventory && currentInventory.responsible_person !== user?.id) {
            setError(`Вы не являетесь ответственным за эту инвентаризацию. 
Ответственный: ${currentInventory.responsible_username} (ID: ${currentInventory.responsible_person})`);
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

        try {
            const results = items.map((item) => ({
                material_id: item.material_id,
                actual_quantity: item.actual_quantity,
                reason: item.reason,
            }));
            await saveResults(parseInt(id!), results);
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
            console.error("Ошибка завершения:", error);
            setError(error.response?.data?.error || "Ошибка завершения");
        } finally {
            setSaving(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "in_progress":
                return <Badge variant="outline">В процессе</Badge>;
            case "completed":
                return <Badge variant="outline">Завершена</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getProgress = () => {
        const checked = items.filter((item) => item.actual_quantity !== null).length;
        const total = items.length;
        return { checked, total, percent: total === 0 ? 0 : Math.round((checked / total) * 100) };
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error && !currentInventory) {
        return (
            <div className="text-center py-20">
                <p className="text-red-500 mb-4 whitespace-pre-line">{error}</p>
                <Button onClick={() => navigate("/inventories")} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Назад к списку
                </Button>
            </div>
        );
    }

    if (!currentInventory) {
        return (
            <div className="text-center py-20">
                <p className="text-muted-foreground">Инвентаризация не найдена</p>
                <Button onClick={() => navigate("/inventories")} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Назад
                </Button>
            </div>
        );
    }

    const progress = getProgress();

    return (
        <div>
            <ScrollToTop />
            <Button variant="ghost" onClick={() => navigate("/inventories")} className="mb-4 bg-background! z-10">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад к списку
            </Button>

            <Card className="mb-6 z-10">
                <CardHeader>
                    <div className="flex justify-between items-center flex-wrap">
                        <p className="text-lg">{currentInventory.title}</p>
                        {getStatusBadge(currentInventory.status)}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-base">
                            <Calendar className="h-4 w-4" />
                            <span>
                                {format(new Date(currentInventory.start_date), "dd.MM.yyyy")} - {format(new Date(currentInventory.end_date), "dd.MM.yyyy")}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-base">
                            <User className={isResponsible() ? "h-4 w-4" : "w-4 h-4 text-muted-foreground"} />
                            <span className={isResponsible() ? "underline" : "text-muted-foreground"}>
                                Ответственный: {currentInventory.responsible_username}
                                {isResponsible() && " (Вы)"}
                            </span>
                        </div>
                    </div>

                    {currentInventory.description && (
                        <div className="mt-4 flex items-start gap-2">
                            <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <div className="text-sm text-muted-foreground">Примечания</div>
                                <div className="mt-1">
                                    <div className={`text-sm rounded ${!notesExpanded ? "line-clamp-2" : ""}`}>{currentInventory.description}</div>
                                    {currentInventory.description.length > 100 && (
                                        <button onClick={() => setNotesExpanded(!notesExpanded)} className="text-sm mt-1 underline">
                                            {notesExpanded ? "Свернуть" : "Развернуть"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm whitespace-pre-line">{error}</span>
                        </div>
                    )}

                    {currentInventory.status === "in_progress" && (
                        <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span>Прогресс</span>
                                <span>
                                    {progress.percent}% ({progress.checked}/{progress.total})
                                </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-foreground h-2 rounded-full transition-all" style={{ width: `${progress.percent}%` }} />
                            </div>
                        </div>
                    )}

                    <div className="sm:flex gap-3 mt-4 grid sm:justify-end">
                        <Button onClick={handleSave} disabled={saving || currentInventory.status !== "in_progress" || !isResponsible()} variant="outline">
                            <Save className="mr-2 h-4 w-4" />
                            Сохранить
                        </Button>
                        <Button onClick={handleCompleteClick} disabled={saving || currentInventory.status !== "in_progress" || !isResponsible()}>
                            <Send className="mr-2 h-4 w-4" />
                            Завершить
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="z-10">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Товары для проверки
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="border rounded-lg p-4">
                                <div className="flex flex-wrap justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <p className="text-sm text-muted-foreground">Код: {item.code}</p>
                                    </div>
                                    <Badge variant="outline">
                                        {item.system_quantity} {item.unit} в системе
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Фактическое количество</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="Введите количество"
                                            value={item.actual_quantity === null ? "" : item.actual_quantity}
                                            onChange={(e) => handleQuantityChange(item.material_id, e.target.value)}
                                            disabled={currentInventory.status !== "in_progress" || !isResponsible()}
                                            className="mt-1"
                                        />
                                        {item.actual_quantity !== null && item.actual_quantity !== item.system_quantity && (
                                            <p className={`text-sm mt-1 ${item.actual_quantity > item.system_quantity ? "text-green-600" : "text-red-600"}`}>
                                                {item.actual_quantity > item.system_quantity
                                                    ? `+${item.actual_quantity - item.system_quantity} излишек`
                                                    : `${item.actual_quantity - item.system_quantity} недостача`}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Причина расхождения (если есть)</Label>
                                        <Input
                                            placeholder="Укажите причину"
                                            value={item.reason || ""}
                                            onChange={(e) => handleReasonChange(item.material_id, e.target.value)}
                                            disabled={currentInventory.status !== "in_progress" || !isResponsible() || item.actual_quantity === item.system_quantity}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {items.length === 0 && <div className="text-center py-10 text-muted-foreground">Нет товаров для проверки</div>}
                </CardContent>
            </Card>

            <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Завершить инвентаризацию?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {uncheckedCount > 0 ? (
                                <>
                                    Осталось не проверенных товаров: {uncheckedCount}.<br />
                                    Вы уверены, что хотите завершить?
                                </>
                            ) : (
                                "Вы уверены, что хотите завершить инвентаризацию и отправить на проверку? После этого нельзя будет редактировать результаты."
                            )}
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

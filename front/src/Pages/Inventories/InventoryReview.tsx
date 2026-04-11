import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, CheckCircle, XCircle, Package, User, Calendar, AlertCircle, FileText } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { format } from "date-fns";

interface InventoryItem {
    id: number;
    inventory_id: number;
    material_id: number;
    name: string;
    code: string;
    unit: string;
    system_quantity: number;
    actual_quantity: number | null;
    difference: number | null;
    reason: string | null;
}

interface Inventory {
    id: number;
    title: string;
    status: string;
    created_by: number;
    created_by_username: string;
    responsible_person: number;
    responsible_username: string;
    start_date: string;
    end_date: string;
    description: string | null;
    created_at: string;
    completed_at: string | null;
}

export default function InventoryReview() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [inventory, setInventory] = useState<Inventory | null>(null);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");
    const [notesExpanded, setNotesExpanded] = useState(false);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setCurrentUser(JSON.parse(userData));
        }
    }, []);

    const isResponsible = () => {
        if (!inventory || !currentUser) return false;
        return inventory.responsible_person === currentUser.id;
    };

    const isAdminOrAccountant = () => {
        if (!currentUser) return false;
        return currentUser.role === "admin" || currentUser.role === "accountant";
    };

    useEffect(() => {
        if (currentUser !== null) {
            fetchInventory();
        }
    }, [id, currentUser]);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/inventories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setInventory(response.data.inventory);
            setItems(response.data.results || []);

            if (!isAdminOrAccountant()) {
                setError(`Недостаточно прав для проверки инвентаризации. Ваша роль: ${currentUser?.role}`);
                return;
            }

            if (response.data.inventory.status !== "completed") {
                setError(`Эта инвентаризация не ожидает проверки. Текущий статус: ${response.data.inventory.status}`);
                return;
            }
        } catch (error: any) {
            console.error("Ошибка загрузки:", error);
            setError(error.response?.data?.error || "Ошибка загрузки");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        setShowApproveDialog(false);
        setProcessing(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `${API_BASE_URL}/inventories/${id}/approve`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            alert("Инвентаризация подтверждена, остатки обновлены");
            navigate("/inventories");
        } catch (error: any) {
            console.error("Ошибка подтверждения:", error);
            setError(error.response?.data?.error || "Ошибка подтверждения");
        } finally {
            setProcessing(false);
        }
    };

    const handleCancel = async () => {
        setShowCancelDialog(false);
        setProcessing(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `${API_BASE_URL}/inventories/${id}/cancel`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            alert("Инвентаризация отменена");
            navigate("/inventories");
        } catch (error: any) {
            console.error("Ошибка отмены:", error);
            setError(error.response?.data?.error || "Ошибка отмены");
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return <Badge variant="outline">Завершена, ожидает проверки</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getStats = () => {
        const total = items.length;
        const withDifference = items.filter((item) => item.actual_quantity !== null && item.actual_quantity !== item.system_quantity).length;
        const surplus = items.filter((item) => item.actual_quantity !== null && item.actual_quantity > item.system_quantity).length;
        const shortage = items.filter((item) => item.actual_quantity !== null && item.actual_quantity < item.system_quantity).length;
        return { total, withDifference, surplus, shortage };
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2"></div>
            </div>
        );
    }

    if (error || !inventory) {
        return (
            <div className="text-center py-20">
                <p className="text-red-500 mb-4 whitespace-pre-line">{error || "Инвентаризация не найдена"}</p>
                <Button onClick={() => navigate("/inventories")} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Назад к списку
                </Button>
            </div>
        );
    }

    const stats = getStats();

    return (
        <div>
            <Button variant="ghost" onClick={() => navigate("/inventories")} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад к списку
            </Button>

            <Card className="mb-6">
                <CardHeader>
                    <div className="sm:flex sm:justify-between grid gap-2 flex-wrap items-center">
                        <p className="text-lg">{inventory.title}</p>
                        {getStatusBadge(inventory.status)}
                    </div>
                </CardHeader>
                <CardContent className="text-base">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                                {format(new Date(inventory.start_date), "dd.MM.yyyy")} - {format(new Date(inventory.end_date), "dd.MM.yyyy")}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-base">
                            <User className={isResponsible() ? "h-4 w-4" : "text-muted-foreground h-4 w-4"} />
                            <span className={isResponsible() ? "underline" : "text-muted-foreground"}>
                                Ответственный: {inventory.responsible_username}
                                {isResponsible() && " (Вы)"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>Создал: {inventory.created_by_username}</span>
                        </div>
                        {inventory.completed_at && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Завершена: {format(new Date(inventory.completed_at), "dd.MM.yyyy HH:mm")}</span>
                            </div>
                        )}
                    </div>

                    {inventory.description && (
                        <div className="mt-4 flex items-start gap-2">
                            <FileText className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <div className="text-sm text-muted-foreground">Примечания</div>
                                <div className="mt-1">
                                    <div
                                        className={`text-sm rounded ${!notesExpanded ? 'line-clamp-2' : ''
                                            }`}
                                    >
                                        {inventory.description}
                                    </div>
                                    {inventory.description.length > 100 && (
                                        <button
                                            onClick={() => setNotesExpanded(!notesExpanded)}
                                            className="text-sm mt-1 underline"
                                        >
                                            {notesExpanded ? 'Свернуть' : 'Развернуть'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 ">
                        <div className="text-center p-3 border rounded">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <div className="text-sm text-muted-foreground">Всего</div>
                        </div>
                        <div className="text-center p-3 border rounded">
                            <div className="text-2xl font-bold">{stats.withDifference}</div>
                            <div className="text-sm text-muted-foreground">Расходятся</div>
                        </div>
                        <div className="text-center p-3 border rounded">
                            <div className="text-2xl font-bold">+{stats.surplus}</div>
                            <div className="text-sm text-muted-foreground">Излишек</div>
                        </div>
                        <div className="text-center p-3 border rounded">
                            <div className="text-2xl font-bold">-{stats.shortage}</div>
                            <div className="text-sm text-muted-foreground">Недостача</div>
                        </div>
                    </div>
                    <div className="grid gap-3 mt-3 sm:flex sm:justify-end">
                        <Button onClick={() => setShowApproveDialog(true)} disabled={processing}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Подтвердить
                        </Button>
                        <Button onClick={() => setShowCancelDialog(true)} disabled={processing} variant="outline">
                            <XCircle className="mr-2 h-4 w-4" />
                            Отменить
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Товары с расхождениями
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {items.filter((item) => item.actual_quantity !== null && item.actual_quantity !== item.system_quantity).length === 0 ? (
                        <div className="text-center py-10">
                            <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                            <p>Расхождений не обнаружено!</p>
                            <p className="text-sm text-muted-foreground mt-1">Все товары сошлись с системными данными</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items
                                .filter((item) => item.actual_quantity !== null && item.actual_quantity !== item.system_quantity)
                                .map((item) => (
                                    <div key={item.id} className="border rounded-lg p-4">
                                        <div className="flex flex-wrap justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold">{item.name}</h3>
                                                <p className="text-sm text-muted-foreground">Код: {item.code}</p>
                                            </div>
                                            <Badge variant="outline">
                                                {item.difference && item.difference > 0 ? `+${item.difference}` : item.difference} {item.unit}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                            <div>
                                                <div className="text-sm text-muted-foreground">В системе</div>
                                                <div className="font-medium">
                                                    {item.system_quantity} {item.unit}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Фактически</div>
                                                <div className="font-medium">
                                                    {item.actual_quantity} {item.unit}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Разница</div>
                                                <div className="font-medium">
                                                    {item.difference && item.difference > 0 ? `+${item.difference}` : item.difference} {item.unit}
                                                </div>
                                            </div>
                                        </div>

                                        {item.reason && (
                                            <div className="mt-2 p-2 rounded">
                                                <div className="text-sm text-muted-foreground">Причина расхождения</div>
                                                <div className="text-sm">{item.reason}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Подтвердить инвентаризацию?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите подтвердить инвентаризацию "{inventory.title}"?<br />
                            Остатки на складе будут обновлены согласно результатам.
                        </AlertDialogDescription>
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
                        <AlertDialogDescription>
                            Вы уверены, что хотите отменить инвентаризацию "{inventory.title}"?<br />
                            Все результаты будут отклонены.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancel}>Отменить</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
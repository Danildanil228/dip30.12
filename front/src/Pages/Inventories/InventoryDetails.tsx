import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, User, Calendar, FileText, CheckCircle } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/LoadingSpinner";


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
    approved_at: string | null;
    approved_by_username: string | null;
}

export default function InventoryDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [inventory, setInventory] = useState<Inventory | null>(null);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notesExpanded, setNotesExpanded] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setCurrentUser(JSON.parse(userData));
        }
    }, []);

    const isAdminOrAccountant = () => {
        if (!currentUser) return false;
        return currentUser.role === "admin" || currentUser.role === "accountant";
    };

    const isResponsible = () => {
        if (!inventory || !currentUser) return false;
        return inventory.responsible_person === currentUser.id;
    };

    const canReview = () => {
        return isAdminOrAccountant() && inventory?.status === "completed";
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
        } catch (error: any) {
            console.error("Ошибка загрузки:", error);
            setError(error.response?.data?.error || "Ошибка загрузки");
        } finally {
            setLoading(false);
        }
    };

    const handleReview = () => {
        navigate(`/inventories/${id}/review`);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "draft":
                return (
                    <Badge variant="outline" className="text-gray-500">
                        Черновик
                    </Badge>
                );
            case "in_progress":
                return <Badge>В процессе</Badge>;
            case "completed":
                return <Badge>Завершена, ожидает проверки</Badge>;
            case "approved":
                return <Badge>Утверждена</Badge>;
            case "cancelled":
                return <Badge>Отменена</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

        if (loading) {
        return <LoadingSpinner />;
    }

    if (!inventory || error) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500">{error || "Инвентаризация не найдена"}</p>
                <Button onClick={() => navigate("/inventories")} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Назад
                </Button>
            </div>
        );
    }

    return (
        <div>
            <Button variant="ghost" onClick={() => navigate("/inventories")} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад к списку
            </Button>

            <Card className="mb-6">
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-start gap-4">
                        <div>
                            <CardTitle className="text-2xl mb-2">{inventory.title}</CardTitle>
                            <div className="flex flex-wrap gap-2">{getStatusBadge(inventory.status)}</div>
                        </div>
                        {canReview() && (
                            <Button onClick={handleReview}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Проверить
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-base">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span className="text-base">
                                {format(new Date(inventory.start_date), "dd.MM.yyyy")} - {format(new Date(inventory.end_date), "dd.MM.yyyy")}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-base">
                            <User className={isResponsible() ? "h-4 w-4" : "text-gray-600 h-4 w-4"} />
                            <span className={isResponsible() ? "underline" : "text-gray-600"}>
                                Ответственный: {inventory.responsible_username}
                                {isResponsible() && " (Вы)"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-base">
                            <User className="h-4 w-4 " />
                            <span>Создал: {inventory.created_by_username}</span>
                        </div>
                        {inventory.approved_by_username && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <User className="h-4 w-4" />
                                <span>Утвердил: {inventory.approved_by_username}</span>
                            </div>
                        )}
                        {inventory.completed_at && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>Завершена: {format(new Date(inventory.completed_at), "dd.MM.yyyy HH:mm")}</span>
                            </div>
                        )}
                        {inventory.approved_at && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>Утверждена: {format(new Date(inventory.approved_at), "dd.MM.yyyy HH:mm")}</span>
                            </div>
                        )}
                    </div>

                    {inventory.description && (
                        <div className="mt-4 flex items-start gap-2">
                            <FileText className="h-5 w-5 text-gray-600 mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <div className="text-sm text-gray-600">Примечания</div>
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
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Результаты инвентаризации
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="border rounded-lg p-4">
                                <div className="flex flex-wrap justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <p className="text-sm text-gray-500">Код: {item.code}</p>
                                    </div>
                                    {item.actual_quantity !== null && item.actual_quantity !== item.system_quantity && (
                                        <Badge variant={item.difference && item.difference > 0 ? "default" : "destructive"}>
                                            {item.difference && item.difference > 0 ? `+${item.difference}` : item.difference} {item.unit}
                                        </Badge>
                                    )}
                                    {item.actual_quantity !== null && item.actual_quantity === item.system_quantity && (
                                        <Badge variant="outline" className="text-green-600">
                                            Совпадает
                                        </Badge>
                                    )}
                                    {item.actual_quantity === null && (
                                        <Badge variant="outline" className="text-gray-500">
                                            Не проверено
                                        </Badge>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-500">В системе</div>
                                        <div className="font-medium">
                                            {item.system_quantity} {item.unit}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Фактически</div>
                                        <div className="font-medium">{item.actual_quantity !== null ? `${item.actual_quantity} ${item.unit}` : "—"}</div>
                                    </div>
                                    {item.reason && (
                                        <div className="col-span-1 md:col-span-3 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                            <div className="text-sm text-gray-500">Причина расхождения</div>
                                            <div className="text-sm">{item.reason}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {items.length === 0 && <div className="text-center py-10 text-gray-500">Нет данных</div>}
                </CardContent>
            </Card>
        </div>
    );
}

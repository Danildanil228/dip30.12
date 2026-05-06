import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    const [error, setError] = useState("");
    const [notesExpanded, setNotesExpanded] = useState(false);

    const isAdminOrAccountant = () => {
        if (!user) return false;
        return user.role === "admin" || user.role === "accountant";
    };

    const isResponsible = () => {
        if (!currentInventory || !user) return false;
        return currentInventory.responsible_person === user.id;
    };

    const canReview = () => {
        return isAdminOrAccountant() && currentInventory?.status === "completed";
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

    if (!currentInventory || error) {
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
                            <CardTitle className="text-2xl mb-2">{currentInventory.title}</CardTitle>
                            <div className="flex flex-wrap gap-2">{getStatusBadge(currentInventory.status)}</div>
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
                                {format(new Date(currentInventory.start_date), "dd.MM.yyyy")} - {format(new Date(currentInventory.end_date), "dd.MM.yyyy")}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-base">
                            <User className={isResponsible() ? "h-4 w-4" : "text-gray-600 h-4 w-4"} />
                            <span className={isResponsible() ? "underline" : "text-gray-600"}>
                                Ответственный: {currentInventory.responsible_username}
                                {isResponsible() && " (Вы)"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-base">
                            <User className="h-4 w-4" />
                            <span>Создал: {currentInventory.created_by_username}</span>
                        </div>
                        {currentInventory.approved_by_username && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <User className="h-4 w-4" />
                                <span>Утвердил: {currentInventory.approved_by_username}</span>
                            </div>
                        )}
                        {currentInventory.completed_at && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>Завершена: {format(new Date(currentInventory.completed_at), "dd.MM.yyyy HH:mm")}</span>
                            </div>
                        )}
                        {currentInventory.approved_at && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>Утверждена: {format(new Date(currentInventory.approved_at), "dd.MM.yyyy HH:mm")}</span>
                            </div>
                        )}
                    </div>

                    {currentInventory.description && (
                        <div className="mt-4 flex items-start gap-2">
                            <FileText className="h-5 w-5 text-gray-600 mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <div className="text-sm text-gray-600">Примечания</div>
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

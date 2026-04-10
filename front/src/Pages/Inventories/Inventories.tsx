import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Search,
    Plus,
    Calendar,
    User,
    FileText,
    Eye,
    Play,
    Send,
    MoreHorizontal,
    Package
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { useUser } from "@/hooks/useUser";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateInventoryDialog from "@/components/Dialog/CreateInventoryDialog";

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
    total_items: number;
    checked_items: number;
}

export default function Inventories() {
    const navigate = useNavigate();
    const { user, isAdmin } = useUser();
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    const isAdminOrAccountant = isAdmin || user?.role === 'accountant';
    const isResponsible = (inventory: Inventory) => inventory.responsible_person === user?.id;

    useEffect(() => {
        fetchInventories();
    }, []);

    const fetchInventories = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/inventories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInventories(response.data.inventories || []);
        } catch (error) {
            console.error("Ошибка загрузки инвентаризаций:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStart = async (id: number) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`${API_BASE_URL}/inventories/${id}/start`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchInventories();
        } catch (error: any) {
            console.error("Ошибка начала инвентаризации:", error);
            alert(error.response?.data?.error || "Ошибка");
        }
    };

    const handleComplete = async (id: number) => {
        if (!confirm("Вы уверены, что хотите завершить инвентаризацию? После этого нельзя будет редактировать результаты.")) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.put(`${API_BASE_URL}/inventories/${id}/complete`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchInventories();
        } catch (error: any) {
            console.error("Ошибка завершения инвентаризации:", error);
            alert(error.response?.data?.error || "Ошибка");
        }
    };

    const handleCancel = async (id: number, title: string) => {
        if (!confirm(`Отменить инвентаризацию "${title}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.put(`${API_BASE_URL}/inventories/${id}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchInventories();
        } catch (error: any) {
            console.error("Ошибка отмены инвентаризации:", error);
            alert(error.response?.data?.error || "Ошибка");
        }
    };

    const handleDelete = async (id: number, title: string) => {
        if (!confirm(`Удалить инвентаризацию "${title}"? Это действие нельзя отменить.`)) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_BASE_URL}/inventories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchInventories();
        } catch (error: any) {
            console.error("Ошибка удаления инвентаризации:", error);
            alert(error.response?.data?.error || "Ошибка");
        }
    };

    // === НАВИГАЦИЯ ПО СТРАНИЦАМ ===

    // Просмотр деталей (для всех)
    const handleView = (id: number) => {
        navigate(`/inventories/${id}`);
    };

    // Проведение инвентаризации (для ответственного, статус in_progress)

    const handleConduct = (id: number) => {
        navigate(`/inventories/${id}/conduct`);
    };

    // Проверка инвентаризации (для админа/бухгалтера, статус completed)
    const handleReview = (id: number) => {
        navigate(`/inventories/${id}/review`);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <Badge variant="outline" className="text-gray-500">Черновик</Badge>;
            case 'in_progress':
                return <Badge>В процессе</Badge>;
            case 'completed':
                return <Badge>Завершена</Badge>;
            case 'approved':
                return <Badge>Утверждена</Badge>;
            case 'cancelled':
                return <Badge >Отменена</Badge>;
            case 'expired':
                return <Badge>Просрочена</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getProgress = (inventory: Inventory) => {
        if (inventory.total_items === 0) return 0;
        return Math.round((inventory.checked_items / inventory.total_items) * 100);
    };

    const filteredInventories = inventories.filter(inv =>
        inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.responsible_username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Заголовок */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold">Инвентаризация</h1>
                {isAdminOrAccountant && (
                    <Button onClick={() => setShowCreateDialog(true)}>
                        Создать
                    </Button>
                )}
            </div>

            {/* Поиск */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    placeholder="Поиск по названию или ответственному..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Список инвентаризаций */}
            <div className="space-y-4">
                {filteredInventories.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        Инвентаризаций не найдено
                    </div>
                ) : (
                    filteredInventories.map((inventory) => (
                        <Card key={inventory.id} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-4">
                                    {/* Заголовок и статус */}
                                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-lg font-semibold">{inventory.title}</h3>
                                            {getStatusBadge(inventory.status)}
                                        </div>

                                        {/* Действия - меню с тремя точками */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {/* Просмотр (всегда доступен) */}
                                                <DropdownMenuItem onClick={() => handleView(inventory.id)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Просмотр
                                                </DropdownMenuItem>

                                                {/* Проведение - для ответственного, статус in_progress */}
                                                {isResponsible(inventory) && inventory.status === 'in_progress' && (
                                                    <DropdownMenuItem onClick={() => handleConduct(inventory.id)}>
                                                        <Package className="mr-2 h-4 w-4" />
                                                        Провести
                                                    </DropdownMenuItem>
                                                )}

                                                {/* Начать - для ответственного, статус draft */}
                                                {isResponsible(inventory) && inventory.status === 'draft' && (
                                                    <DropdownMenuItem onClick={() => handleStart(inventory.id)}>
                                                        <Play className="mr-2 h-4 w-4" />
                                                        Начать
                                                    </DropdownMenuItem>
                                                )}

                                                {/* Завершить - для ответственного, статус in_progress (альтернатива) */}
                                                {isResponsible(inventory) && inventory.status === 'in_progress' && (
                                                    <DropdownMenuItem onClick={() => handleComplete(inventory.id)}>
                                                        <Send className="mr-2 h-4 w-4" />
                                                        Завершить
                                                    </DropdownMenuItem>
                                                )}

                                                

                                                {/* Отменить - только admin, для draft/in_progress */}
                                                {isAdmin && (inventory.status === 'draft' || inventory.status === 'in_progress') && (
                                                    <DropdownMenuItem onClick={() => handleCancel(inventory.id, inventory.title)}>

                                                        Отменить
                                                    </DropdownMenuItem>
                                                )}

                                                {/* Удалить - только admin, для cancelled */}
                                                {isAdmin && inventory.status === 'cancelled' && (
                                                    <DropdownMenuItem onClick={() => handleDelete(inventory.id, inventory.title)}>

                                                        Удалить
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Информация */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                {format(new Date(inventory.start_date), "dd.MM.yyyy")} - {format(new Date(inventory.end_date), "dd.MM.yyyy")}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-600" />
                                            <span className={isResponsible(inventory) ? "text-red-500 font-semibold" : "text-gray-600"}>
                                                Ответственный: {inventory.responsible_username || '-'}
                                                {isResponsible(inventory) && " (Вы)"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <FileText className="h-4 w-4" />
                                            <span>Создал: {inventory.created_by_username || '-'}</span>
                                        </div>
                                    </div>

                                    {/* Прогресс (для in_progress) */}
                                    {inventory.status === 'in_progress' && (
                                        <div className="mt-3">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Прогресс</span>
                                                <span>{getProgress(inventory)}% ({inventory.checked_items}/{inventory.total_items})</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-yellow-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${getProgress(inventory)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Даты завершения/подтверждения */}
                                    {inventory.completed_at && (
                                        <div className="text-xs text-gray-500 mt-2">
                                            Завершена: {format(new Date(inventory.completed_at), "dd.MM.yyyy HH:mm")}
                                        </div>
                                    )}
                                    {inventory.approved_at && (
                                        <div className="text-xs text-gray-500">
                                            Утверждена: {format(new Date(inventory.approved_at), "dd.MM.yyyy HH:mm")}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Диалог создания */}
            <CreateInventoryDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onInventoryCreated={fetchInventories}
            />
        </div>
    );
}
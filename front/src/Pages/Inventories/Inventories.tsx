import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Calendar, User, FileText, Eye, Play, Send, MoreHorizontal, Package, Edit } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { useUser } from "@/hooks/useUser";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CreateInventoryDialog from "@/components/Dialog/CreateInventoryDialog";
import EditInventoryDialog from "@/components/Dialog/EditInventoryDialog";

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
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);

    // Dialog states
    const [completeDialog, setCompleteDialog] = useState<{ open: boolean; id: number | null; title: string }>({ open: false, id: null, title: "" });
    const [cancelDialog, setCancelDialog] = useState<{ open: boolean; id: number | null; title: string }>({ open: false, id: null, title: "" });
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null; title: string }>({ open: false, id: null, title: "" });

    const isAdminOrAccountant = isAdmin || user?.role === "accountant";
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
            await axios.put(
                `${API_BASE_URL}/inventories/${id}/start`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            fetchInventories();
        } catch (error: any) {
            console.error("Ошибка начала инвентаризации:", error);
            alert(error.response?.data?.error || "Ошибка");
        }
    };

    const handleComplete = async () => {
        if (!completeDialog.id) return;
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `${API_BASE_URL}/inventories/${completeDialog.id}/complete`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setCompleteDialog({ open: false, id: null, title: "" });
            fetchInventories();
        } catch (error: any) {
            console.error("Ошибка завершения инвентаризации:", error);
            alert(error.response?.data?.error || "Ошибка");
        }
    };

    const handleCancel = async () => {
        if (!cancelDialog.id) return;
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `${API_BASE_URL}/inventories/${cancelDialog.id}/cancel`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setCancelDialog({ open: false, id: null, title: "" });
            fetchInventories();
        } catch (error: any) {
            console.error("Ошибка отмены инвентаризации:", error);
            alert(error.response?.data?.error || "Ошибка");
        }
    };

    const handleDelete = async () => {
        if (!deleteDialog.id) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_BASE_URL}/inventories/${deleteDialog.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeleteDialog({ open: false, id: null, title: "" });
            fetchInventories();
        } catch (error: any) {
            console.error("Ошибка удаления инвентаризации:", error);
            alert(error.response?.data?.error || "Ошибка");
        }
    };

    const handleView = (id: number) => {
        navigate(`/inventories/${id}`);
    };

    const handleConduct = (id: number) => {
        navigate(`/inventories/${id}/conduct`);
    };

    const handleReview = (id: number) => {
        navigate(`/inventories/${id}/review`);
    };

    const handleEdit = (inventory: Inventory) => {
        setEditingInventory(inventory);
    };

    const handleEditSuccess = () => {
        setEditingInventory(null);
        fetchInventories();
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "draft":
                return "Черновик";
            case "in_progress":
                return "В процессе";
            case "completed":
                return "Завершена";
            case "approved":
                return "Утверждена";
            case "cancelled":
                return "Отменена";
            case "expired":
                return "Просрочена";
            default:
                return status;
        }
    };

    const getProgress = (inventory: Inventory) => {
        if (inventory.total_items === 0) return 0;
        return Math.round((inventory.checked_items / inventory.total_items) * 100);
    };

    const filteredInventories = inventories.filter((inv) => {
        const matchesSearch = inv.title.toLowerCase().includes(searchTerm.toLowerCase()) || inv.responsible_username?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold">Инвентаризация</h1>
                {isAdminOrAccountant && <Button onClick={() => setShowCreateDialog(true)}>Создать</Button>}
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
                    <Input placeholder="Поиск по названию или ответственному..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")}>
                        Все
                    </Button>
                    <Button variant={statusFilter === "draft" ? "default" : "outline"} onClick={() => setStatusFilter("draft")}>
                        Черновики
                    </Button>
                    <Button variant={statusFilter === "in_progress" ? "default" : "outline"} onClick={() => setStatusFilter("in_progress")}>
                        В процессе
                    </Button>
                    <Button variant={statusFilter === "completed" ? "default" : "outline"} onClick={() => setStatusFilter("completed")}>
                        Завершены
                    </Button>
                    <Button variant={statusFilter === "approved" ? "default" : "outline"} onClick={() => setStatusFilter("approved")}>
                        Утверждены
                    </Button>
                    <Button variant={statusFilter === "cancelled" ? "default" : "outline"} onClick={() => setStatusFilter("cancelled")}>
                        Отменены
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {filteredInventories.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">Инвентаризаций не найдено</div>
                ) : (
                    filteredInventories.map((inventory) => (
                        <Card key={inventory.id} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-4">
                                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-lg font-semibold">{inventory.title}</h3>
                                            <Badge variant="outline">{getStatusText(inventory.status)}</Badge>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleView(inventory.id)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Просмотр
                                                </DropdownMenuItem>

                                                {/* Кнопка изменения - только для администраторов */}
                                                {isAdmin && (
                                                    <DropdownMenuItem onClick={() => handleEdit(inventory)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Изменить
                                                    </DropdownMenuItem>
                                                )}

                                                {isResponsible(inventory) && inventory.status === "in_progress" && (
                                                    <DropdownMenuItem onClick={() => handleConduct(inventory.id)}>
                                                        <Package className="mr-2 h-4 w-4" />
                                                        Провести
                                                    </DropdownMenuItem>
                                                )}

                                                {isResponsible(inventory) && inventory.status === "draft" && (
                                                    <DropdownMenuItem onClick={() => handleStart(inventory.id)}>
                                                        <Play className="mr-2 h-4 w-4" />
                                                        Начать
                                                    </DropdownMenuItem>
                                                )}

                                                {isResponsible(inventory) && inventory.status === "in_progress" && (
                                                    <DropdownMenuItem onClick={() => setCompleteDialog({ open: true, id: inventory.id, title: inventory.title })}>
                                                        <Send className="mr-2 h-4 w-4" />
                                                        Завершить
                                                    </DropdownMenuItem>
                                                )}

                                                {isAdmin && (inventory.status === "draft" || inventory.status === "in_progress") && (
                                                    <DropdownMenuItem onClick={() => setCancelDialog({ open: true, id: inventory.id, title: inventory.title })}>Отменить</DropdownMenuItem>
                                                )}

                                                {isAdmin && inventory.status === "cancelled" && <DropdownMenuItem onClick={() => setDeleteDialog({ open: true, id: inventory.id, title: inventory.title })}>Удалить</DropdownMenuItem>}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                {format(new Date(inventory.start_date), "dd.MM.yyyy")} - {format(new Date(inventory.end_date), "dd.MM.yyyy")}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className={isResponsible(inventory) ? "h-4 w-4" : "h-4 w-4 text-muted-foreground"} />
                                            <span className={isResponsible(inventory) ? "underline" : "text-muted-foreground"}>
                                                Ответственный: {inventory.responsible_username || "-"}
                                                {isResponsible(inventory) && " (Вы)"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <FileText className="h-4 w-4" />
                                            <span>Создал: {inventory.created_by_username || "-"}</span>
                                        </div>
                                    </div>

                                    {inventory.status === "in_progress" && (
                                        <div className="mt-3">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Прогресс</span>
                                                <span>
                                                    {getProgress(inventory)}% ({inventory.checked_items}/{inventory.total_items})
                                                </span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2">
                                                <div className="bg-foreground h-2 rounded-full transition-all" style={{ width: `${getProgress(inventory)}%` }} />
                                            </div>
                                        </div>
                                    )}

                                    {inventory.completed_at && <div className="text-xs text-muted-foreground mt-2">Завершена: {format(new Date(inventory.completed_at), "dd.MM.yyyy HH:mm")}</div>}
                                    {inventory.approved_at && <div className="text-xs text-muted-foreground">Утверждена: {format(new Date(inventory.approved_at), "dd.MM.yyyy HH:mm")}</div>}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <CreateInventoryDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onInventoryCreated={fetchInventories} />

            <EditInventoryDialog inventory={editingInventory} open={!!editingInventory} onOpenChange={(open) => !open && setEditingInventory(null)} onInventoryUpdated={handleEditSuccess} />

            {/* Dialog для завершения */}
            <AlertDialog open={completeDialog.open} onOpenChange={(open) => setCompleteDialog((prev) => ({ ...prev, open }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Завершить инвентаризацию?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите завершить инвентаризацию "{completeDialog.title}"?
                            <br />
                            После этого нельзя будет редактировать результаты.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={handleComplete}>Завершить</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog для отмены */}
            <AlertDialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog((prev) => ({ ...prev, open }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Отменить инвентаризацию?</AlertDialogTitle>
                        <AlertDialogDescription>Вы уверены, что хотите отменить инвентаризацию "{cancelDialog.title}"?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancel}>Отменить</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog для удаления */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить инвентаризацию?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить инвентаризацию "{deleteDialog.title}"?
                            <br />
                            Это действие нельзя отменить.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

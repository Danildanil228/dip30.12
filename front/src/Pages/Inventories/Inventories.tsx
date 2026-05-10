import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Calendar, User, FileText, Eye, Play, Send, MoreHorizontal, Package, Edit } from "lucide-react";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CreateInventoryDialog from "@/components/Dialog/CreateInventoryDialog";
import EditInventoryDialog from "@/components/Dialog/EditInventoryDialog";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useInventories } from "@/hooks/useInventories";
import { useUser } from "@/hooks/useUser";
import type { Inventory } from "@/types/inventory.types";

export default function Inventories() {
    const navigate = useNavigate();
    const { user, isAdmin } = useUser();
    const { inventories, loading, startInventory, completeInventory, cancelInventory, deleteInventory, fetchInventories } = useInventories();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(10);
    const [showAll, setShowAll] = useState(false);
    const [completeDialog, setCompleteDialog] = useState<{ open: boolean; id: number | null; title: string }>({ open: false, id: null, title: "" });
    const [cancelDialog, setCancelDialog] = useState<{ open: boolean; id: number | null; title: string }>({ open: false, id: null, title: "" });
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null; title: string }>({ open: false, id: null, title: "" });

    const isAdminOrAccountant = isAdmin || user?.role === "accountant";
    const isResponsible = (inventory: Inventory) => inventory.responsible_person === user?.id;

    const draftCount = inventories.filter((i) => i.status === "draft").length;
    const inProgressCount = inventories.filter((i) => i.status === "in_progress").length;
    const completedCount = inventories.filter((i) => i.status === "completed").length;
    const approvedCount = inventories.filter((i) => i.status === "approved").length;

    useEffect(() => {
        fetchInventories();
    }, []);

    const handleStart = async (id: number) => {
        try {
            await startInventory(id);
        } catch (error: any) {
            alert(error.response?.data?.error || "Ошибка");
        }
    };

    const handleComplete = async () => {
        if (!completeDialog.id) return;
        try {
            await completeInventory(completeDialog.id);
            setCompleteDialog({ open: false, id: null, title: "" });
        } catch (error: any) {
            alert(error.response?.data?.error || "Ошибка");
        }
    };

    const handleCancel = async () => {
        if (!cancelDialog.id) return;
        try {
            await cancelInventory(cancelDialog.id);
            setCancelDialog({ open: false, id: null, title: "" });
        } catch (error: any) {
            alert(error.response?.data?.error || "Ошибка");
        }
    };

    const handleDelete = async () => {
        if (!deleteDialog.id) return;
        try {
            await deleteInventory(deleteDialog.id);
            setDeleteDialog({ open: false, id: null, title: "" });
        } catch (error: any) {
            alert(error.response?.data?.error || "Ошибка");
        }
    };

    const handleView = (id: number) => navigate(`/inventories/${id}`);
    const handleConduct = (id: number) => navigate(`/inventories/${id}/conduct`);

    const handleEdit = (inventory: Inventory) => setEditingInventory(inventory);
    const handleEditSuccess = () => {
        setEditingInventory(null);
        fetchInventories();
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, { label: string; className: string }> = {
            draft: { label: "Черновик", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
            in_progress: { label: "В процессе", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
            completed: { label: "Завершена", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
            approved: { label: "Утверждена", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
            cancelled: { label: "Отменена", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
            expired: { label: "Просрочена", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
        };
        const info = map[status] || { label: status, className: "" };
        return <Badge className={`${info.className} border-0`}>{info.label}</Badge>;
    };

    const getProgress = (inventory: Inventory) => {
        const total = inventory.total_items ?? 0;
        const checked = inventory.checked_items ?? 0;
        if (total === 0) return 0;
        return Math.round((checked / total) * 100);
    };

    const filteredInventories = inventories.filter((inv) => {
        const matchesSearch = inv.title.toLowerCase().includes(searchTerm.toLowerCase()) || inv.responsible_username?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredInventories.length / itemsPerPage);
    const paginatedInventories = showAll ? filteredInventories : filteredInventories.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <ScrollToTop />

            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Инвентаризация</h1>
                    <p className="text-muted-foreground mt-1">Управление проверками склада</p>
                </div>
                {isAdminOrAccountant && (
                    <Button onClick={() => setShowCreateDialog(true)}>
                        <Package className="h-4 w-4 mr-2" /> Создать
                    </Button>
                )}
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Черновики", count: draftCount, color: "text-gray-600" },
                    { label: "В процессе", count: inProgressCount, color: "text-blue-600" },
                    { label: "Завершены", count: completedCount, color: "text-purple-600" },
                    { label: "Утверждены", count: approvedCount, color: "text-green-600" },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                        <div className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.count}</div>
                    </motion.div>
                ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Поиск по названию или ответственному..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(0);
                        }}
                        className="pl-10 bg-background!"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {["all", "draft", "in_progress", "completed", "approved", "cancelled"].map((s) => (
                        <Button className="dark:bg-"
                            key={s}
                            variant={statusFilter === s ? "default" : "outline"}
                            onClick={() => {
                                setStatusFilter(s);
                                setCurrentPage(0);
                            }}
                            size="sm"
                        >
                            {s === "all" ? "Все" : s === "draft" ? "Черновики" : s === "in_progress" ? "В процессе" : s === "completed" ? "Завершены" : s === "approved" ? "Утверждены" : "Отменены"}
                        </Button>
                    ))}
                </div>
            </div>

            {filteredInventories.length > itemsPerPage && (
                <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">Найдено: {filteredInventories.length}</div>
                    <div className="flex items-center gap-2">
                        <Button className="dark:bg-"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setShowAll(!showAll);
                                if (!showAll) setCurrentPage(0);
                            }}
                        >
                            {showAll ? "Свернуть" : "Развернуть"}
                        </Button>
                        {!showAll && totalPages > 1 && (
                            <>
                                <Button variant="outline" className="dark:bg-" size="sm" onClick={() => setCurrentPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0}>
                                    &lt;
                                </Button>
                                <span className="text-sm">
                                    Стр. {currentPage + 1} из {totalPages}
                                </span>
                                <Button variant="outline" className="dark:bg-" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1}>
                                    &gt;
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <AnimatePresence>
                    {paginatedInventories.length === 0 ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 rounded-xl border bg-card shadow-sm">
                            <div className="text-4xl mb-3">📋</div>
                            <p className="text-lg font-medium">Инвентаризаций не найдено</p>
                        </motion.div>
                    ) : (
                        paginatedInventories.map((inventory, index) => (
                            <motion.div key={inventory.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                                    <CardContent className="p-5">
                                        <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-lg font-semibold">{inventory.title}</h3>
                                                {getStatusBadge(inventory.status)}
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleView(inventory.id)}>
                                                        <Eye className="mr-2 h-4 w-4" /> Просмотр
                                                    </DropdownMenuItem>
                                                    {isAdmin && (
                                                        <DropdownMenuItem onClick={() => handleEdit(inventory)}>
                                                            <Edit className="mr-2 h-4 w-4" /> Изменить
                                                        </DropdownMenuItem>
                                                    )}
                                                    {isResponsible(inventory) && inventory.status === "in_progress" && (
                                                        <DropdownMenuItem onClick={() => handleConduct(inventory.id)}>
                                                            <Package className="mr-2 h-4 w-4" /> Провести
                                                        </DropdownMenuItem>
                                                    )}
                                                    {isResponsible(inventory) && inventory.status === "draft" && (
                                                        <DropdownMenuItem onClick={() => handleStart(inventory.id)}>
                                                            <Play className="mr-2 h-4 w-4" /> Начать
                                                        </DropdownMenuItem>
                                                    )}
                                                    {isResponsible(inventory) && inventory.status === "in_progress" && (
                                                        <DropdownMenuItem onClick={() => setCompleteDialog({ open: true, id: inventory.id, title: inventory.title })}>
                                                            <Send className="mr-2 h-4 w-4" /> Завершить
                                                        </DropdownMenuItem>
                                                    )}
                                                    {isAdmin && (inventory.status === "draft" || inventory.status === "in_progress") && (
                                                        <DropdownMenuItem onClick={() => setCancelDialog({ open: true, id: inventory.id, title: inventory.title })}>Отменить</DropdownMenuItem>
                                                    )}
                                                    {isAdmin && inventory.status === "cancelled" && (
                                                        <DropdownMenuItem onClick={() => setDeleteDialog({ open: true, id: inventory.id, title: inventory.title })}>Удалить</DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mb-3">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    {format(new Date(inventory.start_date), "dd.MM.yyyy")} – {format(new Date(inventory.end_date), "dd.MM.yyyy")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User className={isResponsible(inventory) ? "h-4 w-4 text-primary" : "h-4 w-4 text-muted-foreground"} />
                                                <span className={isResponsible(inventory) ? "font-medium text-primary" : "text-muted-foreground"}>
                                                    {inventory.responsible_username || "—"}
                                                    {isResponsible(inventory) && " (Вы)"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <FileText className="h-4 w-4" />
                                                <span>{inventory.created_by_username || "—"}</span>
                                            </div>
                                        </div>

                                        {inventory.status === "in_progress" && (
                                            <div className="mt-3">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-muted-foreground">Прогресс</span>
                                                    <span className="font-medium">{getProgress(inventory)}%</span>
                                                </div>
                                                <div className="w-full bg-muted rounded-full h-2 border">
                                                    <div className="bg-primary h-2 rounded-full transition-all " style={{ width: `${getProgress(inventory)}%` }} />
                                                </div>
                                            </div>
                                        )}

                                        {inventory.completed_at && <div className="text-xs text-muted-foreground mt-2">Завершена: {format(new Date(inventory.completed_at), "dd.MM.yyyy HH:mm")}</div>}
                                        {inventory.approved_at && <div className="text-xs text-muted-foreground">Утверждена: {format(new Date(inventory.approved_at), "dd.MM.yyyy HH:mm")}</div>}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <CreateInventoryDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onInventoryCreated={fetchInventories} />
            <EditInventoryDialog inventory={editingInventory} open={!!editingInventory} onOpenChange={(open) => !open && setEditingInventory(null)} onInventoryUpdated={handleEditSuccess} />

            <AlertDialog open={completeDialog.open} onOpenChange={(open) => setCompleteDialog((prev) => ({ ...prev, open }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Завершить инвентаризацию?</AlertDialogTitle>
                        <AlertDialogDescription>Вы уверены, что хотите завершить «{completeDialog.title}»? После этого нельзя будет редактировать результаты.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={handleComplete}>Завершить</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog((prev) => ({ ...prev, open }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Отменить инвентаризацию?</AlertDialogTitle>
                        <AlertDialogDescription>Вы уверены, что хотите отменить «{cancelDialog.title}»?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancel} className="bg-destructive hover:bg-destructive/90">
                            Отменить
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить инвентаризацию?</AlertDialogTitle>
                        <AlertDialogDescription>Вы уверены, что хотите удалить «{deleteDialog.title}»? Это действие нельзя отменить.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Удалить
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

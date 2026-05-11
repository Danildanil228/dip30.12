import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2, RotateCcw, AlertTriangle, Loader2 } from "lucide-react";
import apiClient from "@/services/api";
import { useUser } from "@/hooks/useUser";
import { ScrollToTop } from "@/components/ScrollToTop";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface TrashItem {
    id: number;
    name: string;
    deleted_at: string;
    deleted_by: number;
    deleted_by_username: string;
}

export default function Trash() {
    const { isAdmin, loading: authLoading } = useUser();
    const [activeTab, setActiveTab] = useState<"users" | "categories" | "materials" | "backups">("users");
    const [items, setItems] = useState<TrashItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [confirmOpen, setConfirmOpen] = useState<{ id: number; action: "restore" | "permanent"; name: string } | null>(null);

    const fetchTrash = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/trash/${activeTab}`);
            setItems(response.data.data);
        } catch (error) {
            console.error("Ошибка загрузки корзины:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) fetchTrash();
    }, [activeTab, isAdmin]);

    const handleRestore = async (id: number) => {
        setActionLoading(id);
        try {
            await apiClient.put(`/trash/${activeTab}/${id}/restore`);
            await fetchTrash();
        } catch (error) {
            console.error("Ошибка восстановления:", error);
        } finally {
            setActionLoading(null);
            setConfirmOpen(null);
        }
    };

    const handlePermanentDelete = async (id: number) => {
        setActionLoading(id);
        try {
            await apiClient.delete(`/trash/${activeTab}/${id}/permanent`);
            await fetchTrash();
        } catch (error) {
            console.error("Ошибка полного удаления:", error);
        } finally {
            setActionLoading(null);
            setConfirmOpen(null);
        }
    };

    if (authLoading) return <LoadingSpinner />;
    if (!isAdmin) return null;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString("ru-RU");
    };

    const getEntityLabel = () => {
        switch (activeTab) {
            case "users":
                return "Пользователи";
            case "categories":
                return "Категории";
            case "materials":
                return "Материалы";
            case "backups":
                return "Бэкапы";
        }
    };

    return (
        <div className="space-y-6">
            <ScrollToTop />
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Корзина</h1>
                <p className="text-muted-foreground mt-1">Восстановление или полное удаление записей</p>
            </motion.div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid grid-cols-4 w-full max-w-md">
                    <TabsTrigger value="users">Пользователи</TabsTrigger>
                    <TabsTrigger value="categories">Категории</TabsTrigger>
                    <TabsTrigger value="materials">Материалы</TabsTrigger>
                    <TabsTrigger value="backups">Бэкапы</TabsTrigger>
                </TabsList>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <TabsContent value={activeTab} className="mt-6">
                        {items.length === 0 ? (
                            <div className="text-center py-16 rounded-xl border bg-card">
                                <Trash2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                                <p className="text-lg font-medium">Корзина пуста</p>
                                <p className="text-sm text-muted-foreground">Нет удалённых {getEntityLabel().toLowerCase()}</p>
                            </div>
                        ) : (
                            <div className="border rounded-xl overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16">ID</TableHead>
                                            <TableHead>Название</TableHead>
                                            <TableHead className="w-48">Дата удаления</TableHead>
                                            <TableHead className="w-40">Кто удалил</TableHead>
                                            <TableHead className="w-64 text-right">Действия</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.id}</TableCell>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{formatDate(item.deleted_at)}</TableCell>
                                                <TableCell>{item.deleted_by_username || "—"}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button size="sm" variant="outline" onClick={() => setConfirmOpen({ id: item.id, action: "restore", name: item.name })} disabled={actionLoading === item.id}>
                                                        {actionLoading === item.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RotateCcw className="h-4 w-4 mr-1" />}
                                                        Восстановить
                                                    </Button>
                                                    <Button size="sm" variant="destructive" onClick={() => setConfirmOpen({ id: item.id, action: "permanent", name: item.name })} disabled={actionLoading === item.id}>
                                                        {actionLoading === item.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
                                                        Удалить навсегда
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </TabsContent>
                )}
            </Tabs>

            <AlertDialog open={!!confirmOpen} onOpenChange={() => setConfirmOpen(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmOpen?.action === "restore" ? "Восстановить запись?" : "Удалить навсегда?"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmOpen?.action === "restore" ? (
                                <>Вы уверены, что хотите восстановить "{confirmOpen?.name}"?</>
                            ) : (
                                <div className="space-y-2">
                                    <p>Вы уверены, что хотите навсегда удалить "{confirmOpen?.name}"?</p>
                                    <p className="text-destructive flex items-center gap-1">
                                        <AlertTriangle className="h-4 w-4" /> Это действие нельзя отменить.
                                    </p>
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (confirmOpen?.action === "restore") handleRestore(confirmOpen.id);
                                else if (confirmOpen?.action === "permanent") handlePermanentDelete(confirmOpen.id);
                            }}
                            className={confirmOpen?.action === "permanent" ? "bg-destructive hover:bg-destructive/90" : ""}
                        >
                            {confirmOpen?.action === "restore" ? "Восстановить" : "Удалить навсегда"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

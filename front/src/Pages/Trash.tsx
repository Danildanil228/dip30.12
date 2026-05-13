import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2, RotateCcw, Loader2, Users, Package, FolderOpen, Database, ChevronLeft, ChevronRight, Check } from "lucide-react";
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

const tabsConfig = [
    { value: "users", label: "Пользователи", icon: Users },
    { value: "categories", label: "Категории", icon: FolderOpen },
    { value: "materials", label: "Материалы", icon: Package },
    { value: "backups", label: "Бэкапы", icon: Database },
];

const ITEMS_PER_PAGE = 4;

export default function Trash() {
    const { isAdmin, loading: authLoading } = useUser();
    const [activeTab, setActiveTab] = useState<"users" | "categories" | "materials" | "backups">("users");
    const [items, setItems] = useState<TrashItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [restoreDialog, setRestoreDialog] = useState<{ id: number; name: string } | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ id: number; name: string } | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [showAll, setShowAll] = useState(false);

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

    const handleRestoreConfirm = async () => {
        if (!restoreDialog) return;
        setActionLoading(restoreDialog.id);
        try {
            await apiClient.put(`/trash/${activeTab}/${restoreDialog.id}/restore`);
            await fetchTrash();
        } catch (error) {
            console.error("Ошибка восстановления:", error);
        } finally {
            setActionLoading(null);
            setRestoreDialog(null);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog) return;
        setActionLoading(deleteDialog.id);
        try {
            await apiClient.delete(`/trash/${activeTab}/${deleteDialog.id}/permanent`);
            await fetchTrash();
        } catch (error) {
            console.error("Ошибка полного удаления:", error);
        } finally {
            setActionLoading(null);
            setDeleteDialog(null);
        }
    };

    if (authLoading) return <LoadingSpinner />;
    if (!isAdmin) return null;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString("ru-RU");
    };

    const currentLabel = tabsConfig.find((t) => t.value === activeTab)?.label || "";

    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    const paginatedItems = showAll ? items : items.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

    const handleToggleShowAll = () => {
        setShowAll(!showAll);
        if (!showAll) setCurrentPage(0);
    };

    return (
        <div className="space-y-6">
            <ScrollToTop />

            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Корзина</h1>
                </div>
                <p className="text-muted-foreground mt-1 ml-13">Восстановление или полное удаление удалённых записей</p>
            </motion.div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                    <div className="border-0 sm:border-b px-4 py-2 mb-4 sm:mb-0">
                        <TabsList className="flex flex-wrap gap-2 bg-transparent h-auto p-0 justify-between w-full">
                            {tabsConfig.map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-primary-foreground rounded-lg px-4 py-2 transition-all dark:data-[state=active]:bg-{#3b82f6} border! text-[11px] sm:text-sm"
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : (
                            <TabsContent value={activeTab} className="mt-0">
                                {items.length === 0 ? (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
                                        <div className="w-10 h-10 rounded-full bg-muted dark:bg-[#3b82f6] flex items-center justify-center mx-auto mb-4"><Check/></div>
                                        <p className="text-lg font-medium">Корзина пуста</p>
                                        <p className="text-sm text-muted-foreground mt-1">Нет удалённых {currentLabel.toLowerCase()}</p>
                                    </motion.div>
                                ) : (
                                    <>
                                        <div className="space-y-3">
                                            {paginatedItems.map((item, index) => (
                                                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                                                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                                                        <CardContent className="p-4 sm:p-5">
                                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                                                        <h3 className="font-semibold text-base wrap-break-word">{item.name}</h3>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                                        <div>ID: {item.id}</div>
                                                                        <div>Дата удаления: {formatDate(item.deleted_at)}</div>
                                                                        <div>Кто удалил: {item.deleted_by_username || "—"}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="sm:flex gap-2 shrink-0 sm:self-center grid">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="dark:bg-background! dark:border"
                                                                        onClick={() => setDeleteDialog({ id: item.id, name: item.name })}
                                                                        disabled={actionLoading === item.id}
                                                                    >
                                                                        {actionLoading === item.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
                                                                        Удалить
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="default"
                                                                        className="py-2!"
                                                                        onClick={() => setRestoreDialog({ id: item.id, name: item.name })}
                                                                        disabled={actionLoading === item.id}
                                                                    >
                                                                        {actionLoading === item.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RotateCcw className="h-4 w-4 mr-1" />}
                                                                        Восстановить
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {items.length > ITEMS_PER_PAGE && (
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
                                                <div className="text-sm text-muted-foreground">Всего: {items.length} записей</div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="default" size="sm" onClick={handleToggleShowAll}>
                                                        {showAll ? "Свернуть" : "Развернуть"}
                                                    </Button>
                                                    {!showAll && totalPages > 1 && (
                                                        <>
                                                            <Button variant="default" size="sm" onClick={() => setCurrentPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0}>
                                                                <ChevronLeft className="h-4 w-4" />
                                                            </Button>
                                                            <span className="text-sm">
                                                                {currentPage + 1} из {totalPages}
                                                            </span>
                                                            <Button variant="default" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1}>
                                                                <ChevronRight className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </TabsContent>
                        )}
                    </div>
                </Tabs>
            </div>

            <AlertDialog open={!!restoreDialog} onOpenChange={() => setRestoreDialog(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Восстановить запись?</AlertDialogTitle>
                        <AlertDialogDescription>Вы уверены, что хотите восстановить "{restoreDialog?.name}"?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRestoreConfirm}>Восстановить</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить навсегда?</AlertDialogTitle>
                        <AlertDialogDescription>
                            <div className="space-y-2">
                                <p>Вы уверены, что хотите навсегда удалить "{deleteDialog?.name}"?</p>
                                <p> Это действие нельзя отменить.</p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>
                            Удалить навсегда
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

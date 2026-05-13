import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

const ITEMS_PER_PAGE = 10;

export default function Trash() {
    const { isAdmin, loading: authLoading } = useUser();
    const [activeTab, setActiveTab] = useState<"users" | "categories" | "materials" | "backups">("users");
    const [items, setItems] = useState<TrashItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const [restoreDialog, setRestoreDialog] = useState<{ ids: number[]; isMultiple: boolean } | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ ids: number[]; isMultiple: boolean } | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [showAll, setShowAll] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const currentLabel = tabsConfig.find((t) => t.value === activeTab)?.label || "";

    const fetchTrash = async () => {
        setLoading(true);
        setErrorMessage(null);
        setSelectedIds(new Set());
        try {
            const response = await apiClient.get(`/trash/${activeTab}`);
            setItems(response.data.data);
        } catch (error) {
            console.error("Ошибка загрузки корзины:", error);
            setErrorMessage("Ошибка загрузки данных");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) fetchTrash();
    }, [activeTab, isAdmin]);

    const handleSelectAll = () => {
        const currentIds = getCurrentPageItems().map((item) => item.id);
        const allSelected = currentIds.every((id) => selectedIds.has(id));

        const newSelected = new Set(selectedIds);
        if (allSelected) {
            currentIds.forEach((id) => newSelected.delete(id));
        } else {
            currentIds.forEach((id) => newSelected.add(id));
        }
        setSelectedIds(newSelected);
    };

    const handleToggleItem = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleBulkRestore = async () => {
        if (selectedIds.size === 0) return;
        setRestoreDialog({ ids: Array.from(selectedIds), isMultiple: selectedIds.size > 1 });
    };

    const confirmBulkRestore = async () => {
        if (!restoreDialog) return;
        setActionLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            for (const id of restoreDialog.ids) {
                await apiClient.put(`/trash/${activeTab}/${id}/restore`);
            }
            setSuccessMessage(`Восстановлено записей: ${restoreDialog.ids.length}`);
            setSelectedIds(new Set());
            await fetchTrash();
        } catch (error) {
            console.error("Ошибка восстановления:", error);
            setErrorMessage("Ошибка при восстановлении");
        } finally {
            setActionLoading(false);
            setRestoreDialog(null);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        setDeleteDialog({ ids: Array.from(selectedIds), isMultiple: selectedIds.size > 1 });
    };

    const confirmBulkDelete = async () => {
        if (!deleteDialog) return;
        setActionLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            for (const id of deleteDialog.ids) {
                await apiClient.delete(`/trash/${activeTab}/${id}/permanent`);
            }
            setSuccessMessage(`Удалено записей: ${deleteDialog.ids.length}`);
            setSelectedIds(new Set());
            await fetchTrash();
        } catch (error) {
            console.error("Ошибка удаления:", error);
            setErrorMessage("Ошибка при удалении");
        } finally {
            setActionLoading(false);
            setDeleteDialog(null);
        }
    };

    const handleSingleRestore = async (item: TrashItem) => {
        setRestoreDialog({ ids: [item.id], isMultiple: false });
    };

    const confirmSingleRestore = async () => {
        if (!restoreDialog) return;
        setActionLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            await apiClient.put(`/trash/${activeTab}/${restoreDialog.ids[0]}/restore`);
            setSuccessMessage("Запись восстановлена");
            setSelectedIds(new Set());
            await fetchTrash();
        } catch (error) {
            console.error("Ошибка восстановления:", error);
            setErrorMessage("Ошибка при восстановлении");
        } finally {
            setActionLoading(false);
            setRestoreDialog(null);
        }
    };

    const handleSingleDelete = async (item: TrashItem) => {
        setDeleteDialog({ ids: [item.id], isMultiple: false });
    };

    const confirmSingleDelete = async () => {
        if (!deleteDialog) return;
        setActionLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            await apiClient.delete(`/trash/${activeTab}/${deleteDialog.ids[0]}/permanent`);
            setSuccessMessage("Запись удалена навсегда");
            setSelectedIds(new Set());
            await fetchTrash();
        } catch (error) {
            console.error("Ошибка удаления:", error);
            setErrorMessage("Ошибка при удалении");
        } finally {
            setActionLoading(false);
            setDeleteDialog(null);
        }
    };

    if (authLoading) return <LoadingSpinner />;
    if (!isAdmin) return null;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString("ru-RU");
    };

    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

    const getCurrentPageItems = () => {
        return showAll ? items : items.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);
    };

    const paginatedItems = getCurrentPageItems();
    const allCurrentPageSelected = paginatedItems.length > 0 && paginatedItems.every((item) => selectedIds.has(item.id));

    const handleToggleShowAll = () => {
        setShowAll(!showAll);
        if (!showAll) setCurrentPage(0);
    };

    const handleDismissMessages = () => {
        setErrorMessage(null);
        setSuccessMessage(null);
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

            <AnimatePresence>
                {(errorMessage || successMessage) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 rounded-xl border ${
                            errorMessage ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span>{errorMessage || successMessage}</span>
                            <Button variant="ghost" size="sm" onClick={handleDismissMessages}>
                                ✕
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                    <div className="border-0 sm:border-b px-4 py-2 mb-4 sm:mb-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <TabsList className="flex flex-wrap gap-2 bg-transparent h-auto p-0">
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

                            {selectedIds.size > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Выбрано: {selectedIds.size}</span>
                                    <Button size="sm" variant="default" onClick={handleBulkRestore} disabled={actionLoading}>
                                        <RotateCcw className="h-4 w-4 mr-1" />
                                        Восстановить
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={handleBulkDelete} disabled={actionLoading}>
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Удалить
                                    </Button>
                                </div>
                            )}
                        </div>
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
                                        <div className="w-10 h-10 rounded-full bg-muted dark:bg-[#3b82f6] flex items-center justify-center mx-auto mb-4">
                                            <Check />
                                        </div>
                                        <p className="text-lg font-medium">Корзина пуста</p>
                                        <p className="text-sm text-muted-foreground mt-1">Нет удалённых {currentLabel.toLowerCase()}</p>
                                    </motion.div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-4 mb-4 pb-2 border-b">
                                            <Checkbox checked={allCurrentPageSelected} onCheckedChange={handleSelectAll} aria-label="Выбрать все" />
                                            <span className="text-sm text-muted-foreground">{allCurrentPageSelected ? "Снять все" : "Выбрать все на странице"}</span>
                                        </div>

                                        <div className="space-y-3">
                                            {paginatedItems.map((item, index) => (
                                                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                                                    <Card className={`overflow-hidden transition-all ${selectedIds.has(item.id) ? "border-primary shadow-md ring-1 ring-primary/20" : "hover:shadow-md"}`}>
                                                        <CardContent className="p-4 sm:p-5">
                                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                                    <Checkbox checked={selectedIds.has(item.id)} onCheckedChange={() => handleToggleItem(item.id)} className="mt-1" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                                                            <h3 className="font-semibold text-base break-words">{item.name}</h3>
                                                                        </div>
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                                            <div>ID: {item.id}</div>
                                                                            <div>Дата удаления: {formatDate(item.deleted_at)}</div>
                                                                            <div>Кто удалил: {item.deleted_by_username || "—"}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="sm:flex gap-2 shrink-0 sm:self-center grid">
                                                                    <Button size="sm" variant="outline" className="dark:bg-background! dark:border" onClick={() => handleSingleDelete(item)} disabled={actionLoading}>
                                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                                        Удалить
                                                                    </Button>
                                                                    <Button size="sm" variant="default" className="py-2!" onClick={() => handleSingleRestore(item)} disabled={actionLoading}>
                                                                        <RotateCcw className="h-4 w-4 mr-1" />
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
                        <AlertDialogTitle>{restoreDialog?.isMultiple ? `Восстановить ${restoreDialog.ids.length} записей?` : "Восстановить запись?"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {restoreDialog?.isMultiple ? "Выбранные записи будут восстановлены и снова появятся в системе." : "Запись будет восстановлена и снова появится в системе."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={restoreDialog?.isMultiple ? confirmBulkRestore : confirmSingleRestore} disabled={actionLoading}>
                            {actionLoading ? "Восстановление..." : "Восстановить"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{deleteDialog?.isMultiple ? `Удалить ${deleteDialog.ids.length} записей навсегда?` : "Удалить запись навсегда?"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            <div className="space-y-2">
                                <p>{deleteDialog?.isMultiple ? "Выбранные записи будут безвозвратно удалены." : "Запись будет безвозвратно удалена."}</p>
                                <p className="text-destructive font-medium">Это действие нельзя отменить.</p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteDialog?.isMultiple ? confirmBulkDelete : confirmSingleDelete} disabled={actionLoading} className="bg-destructive hover:bg-destructive/90">
                            {actionLoading ? "Удаление..." : "Удалить навсегда"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

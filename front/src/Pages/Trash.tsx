import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2, RotateCcw, AlertTriangle, Loader2, Users, Package, FolderOpen, Database } from "lucide-react";
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

    const currentIcon = tabsConfig.find((t) => t.value === activeTab)?.icon || Trash2;
    const currentLabel = tabsConfig.find((t) => t.value === activeTab)?.label || "";

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
                    <div className="border-b px-4 pt-4">
                        <TabsList className="flex flex-wrap gap-2 bg-transparent h-auto p-0">
                            {tabsConfig.map((tab) => (
                                <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2 transition-all">
                                    <tab.icon className="h-4 w-4 mr-2" />
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
                                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4"></div>
                                        <p className="text-lg font-medium">Корзина пуста</p>
                                        <p className="text-sm text-muted-foreground mt-1">Нет удалённых {currentLabel.toLowerCase()}</p>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-3">
                                        {items.map((item, index) => (
                                            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                                                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                                                    <CardContent className="p-5">
                                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                                                    <h3 className="font-semibold text-base">{item.name}</h3>
                                                                    <Badge variant="destructive" className="text-xs">
                                                                        Удалён
                                                                    </Badge>
                                                                </div>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                                    <div>ID: {item.id}</div>
                                                                    <div>Дата удаления: {formatDate(item.deleted_at)}</div>
                                                                    <div>Кто удалил: {item.deleted_by_username || "—"}</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2 shrink-0">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => setConfirmOpen({ id: item.id, action: "restore", name: item.name })}
                                                                    disabled={actionLoading === item.id}
                                                                >
                                                                    {actionLoading === item.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RotateCcw className="h-4 w-4 mr-1" />}
                                                                    Восстановить
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => setConfirmOpen({ id: item.id, action: "permanent", name: item.name })}
                                                                    disabled={actionLoading === item.id}
                                                                >
                                                                    {actionLoading === item.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
                                                                    Удалить навсегда
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        )}
                    </div>
                </Tabs>
            </div>

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

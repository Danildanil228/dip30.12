import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";
import CreateRequestDialog from "@/components/Dialog/CreateRequestDialog";
import { ScrollToTop } from "@/components/ScrollToTop";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useRequests } from "@/hooks/useRequests";
import { useUser } from "@/hooks/useUser";

export default function Requests() {
    const { isAdmin } = useUser();
    const { requests, loading, fetchRequests } = useRequests();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(10);
    const [showAll, setShowAll] = useState(false);

    const pendingCount = requests.filter((r) => r.status === "pending").length;
    const approvedCount = requests.filter((r) => r.status === "approved").length;
    const rejectedCount = requests.filter((r) => r.status === "rejected").length;

    useEffect(() => {
        fetchRequests(statusFilter !== "all" ? statusFilter : undefined);
    }, [statusFilter, fetchRequests]);

    const filteredRequests = requests.filter((request) => request.title.toLowerCase().includes(searchTerm.toLowerCase()) || request.created_by_username?.toLowerCase().includes(searchTerm.toLowerCase()));

    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const paginatedRequests = showAll ? filteredRequests : filteredRequests.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const handleToggleShowAll = () => {
        if (showAll) {
            setShowAll(false);
            setCurrentPage(0);
        } else {
            setShowAll(true);
        }
    };

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">На рассмотрении</Badge>;
            case "approved":
                return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">Подтверждена</Badge>;
            case "rejected":
                return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">Отклонена</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        return type === "incoming" ? (
            <Badge variant="outline" className="border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400">
                Приход
            </Badge>
        ) : (
            <Badge variant="outline" className="border-orange-300 text-orange-600 dark:border-orange-700 dark:text-orange-400">
                Расход
            </Badge>
        );
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            <ScrollToTop />

            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Заявки</h1>
                    <p className="text-muted-foreground mt-1">Приход и расход материалов</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Создать заявку
                </Button>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="text-sm text-muted-foreground">Всего</div>
                    <div className="text-2xl font-bold mt-1">{requests.length}</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 text-yellow-500" /> На рассмотрении
                    </div>
                    <div className="text-2xl font-bold mt-1 text-yellow-600 dark:text-yellow-400">{pendingCount}</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500" /> Подтверждены
                    </div>
                    <div className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{approvedCount}</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <XCircle className="h-4 w-4 text-red-500" /> Отклонены
                    </div>
                    <div className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">{rejectedCount}</div>
                </motion.div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Поиск по названию или создателю..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(0);
                        }}
                        className="pl-10 bg-background!"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {["all", "pending", "approved", "rejected"].map((status) => (
                        <Button className="dark:bg-"
                            key={status}
                            variant={statusFilter === status ? "default" : "outline"}
                            onClick={() => {
                                setStatusFilter(status);
                                setCurrentPage(0);
                            }}
                        >
                            {status === "all" ? "Все" : status === "pending" ? "На рассмотрении" : status === "approved" ? "Подтверждены" : "Отклонены"}
                        </Button>
                    ))}
                </div>
            </div>

            {filteredRequests.length > itemsPerPage && (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="text-sm text-muted-foreground">Найдено: {filteredRequests.length}</div>
                    <div className="flex items-center gap-2">
                        <Button className="dark:bg-" variant="outline" size="sm" onClick={handleToggleShowAll}>
                            {showAll ? "Свернуть" : "Развернуть"}
                        </Button>
                        {!showAll && (
                            <>
                                <Button variant="outline" className="dark:bg-" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0}>
                                    &lt;
                                </Button>
                                <span className="text-sm">
                                    {currentPage + 1} из {totalPages}
                                </span>
                                <Button variant="outline" className="dark:bg-" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages - 1}>
                                    &gt;
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {paginatedRequests.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 rounded-xl border bg-card shadow-sm">
                        <div className="text-4xl mb-3">📋</div>
                        <p className="text-lg font-medium">Заявок нет</p>
                        <p className="text-sm text-muted-foreground mt-1">{statusFilter !== "all" ? "Нет заявок с выбранным статусом" : "Создайте первую заявку"}</p>
                    </motion.div>
                ) : (
                    paginatedRequests.map((request, index) => (
                        <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * index }}
                            className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => (window.location.href = `/requests/${request.id}`)}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-semibold text-base">{request.title}</h3>
                                    {getStatusBadge(request.status)}
                                    {getTypeBadge(request.request_type)}
                                    {!request.is_public && isAdmin && (
                                        <Badge variant="outline" className="text-xs">
                                            Приватная
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="text-sm text-muted-foreground mb-3">
                                Создал: <span className="font-medium text-foreground">{request.created_by_username}</span> • {format(new Date(request.created_at), "dd MMM yyyy, HH:mm", { locale: ru })}
                            </div>
                            {request.items_preview && request.items_preview.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {request.items_preview.map((item, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                                            {item.name} <span className="font-medium">×{item.quantity}</span>
                                        </span>
                                    ))}
                                    {(request.items_preview?.length ?? 0) >= 3 && <span className="text-xs text-muted-foreground self-center">+ ещё</span>}
                                </div>
                            )}
                            {request.rejection_reason && request.status === "rejected" && (
                                <div className="mt-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">Причина: {request.rejection_reason}</div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>

            <CreateRequestDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onRequestCreated={() => fetchRequests(statusFilter !== "all" ? statusFilter : undefined)} />
        </div>
    );
}

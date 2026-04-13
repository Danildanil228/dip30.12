import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { useUser } from "@/hooks/useUser";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";
import { Badge } from "@/components/ui/badge";
import CreateRequestDialog from "@/components/Dialog/CreateRequestDialog";
import { ScrollToTop } from "@/components/ScrollToTop";

interface RequestItem {
    id: number;
    name: string;
    quantity: number;
}

interface Request {
    id: number;
    title: string;
    request_type: "incoming" | "outgoing";
    status: "pending" | "approved" | "rejected" | "draft";
    created_by: number;
    created_by_username: string;
    created_at: string;
    is_public: boolean;
    items_preview: RequestItem[];
    rejection_reason?: string;
}

export default function Requests() {
    const { user, isAdmin } = useUser();
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    // Пагинация
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showAll, setShowAll] = useState(false);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/requests`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { status: statusFilter !== "all" ? statusFilter : undefined },
            });
            setRequests(response.data.requests);
            setCurrentPage(0);
        } catch (error) {
            console.error("Ошибка загрузки заявок:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [statusFilter]);

    const filteredRequests = requests.filter(
        (request) => request.title.toLowerCase().includes(searchTerm.toLowerCase()) || request.created_by_username?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

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

    const getStatusText = (status: string) => {
        switch (status) {
            case "pending":
                return "На рассмотрении";
            case "approved":
                return "Подтверждена";
            case "rejected":
                return "Отклонена";
            case "draft":
                return "Черновик";
            default:
                return status;
        }
    };

    const getTypeText = (type: string) => {
        return type === "incoming" ? "Приход" : "Расход";
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2"></div>
            </div>
        );
    }

    return (
        <div className="">
            <ScrollToTop />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Заявки</h1>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Создать
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
                <div className="flex-1 relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
                    <Input
                        placeholder="Поиск по названию..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(0);
                        }}
                        className="pl-10"
                    />
                </div>
                <div className="flex-wrap flex gap-2">
                    <Button
                        variant={statusFilter === "all" ? "default" : "outline"}
                        onClick={() => {
                            setStatusFilter("all");
                            setCurrentPage(0);
                        }}
                    >
                        Все
                    </Button>
                    <Button
                        variant={statusFilter === "pending" ? "default" : "outline"}
                        onClick={() => {
                            setStatusFilter("pending");
                            setCurrentPage(0);
                        }}
                    >
                        На рассмотрении
                    </Button>
                    <Button
                        variant={statusFilter === "approved" ? "default" : "outline"}
                        onClick={() => {
                            setStatusFilter("approved");
                            setCurrentPage(0);
                        }}
                    >
                        Подтверждены
                    </Button>
                    <Button
                        variant={statusFilter === "rejected" ? "default" : "outline"}
                        onClick={() => {
                            setStatusFilter("rejected");
                            setCurrentPage(0);
                        }}
                    >
                        Отклонены
                    </Button>
                </div>
            </div>
            {filteredRequests.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pt-4">
                    <div className="text-sm text-muted-foreground">Всего заявок: {filteredRequests.length}</div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleToggleShowAll}>
                            {showAll ? "Свернуть" : "Развернуть"}
                        </Button>
                        {!showAll && (
                            <>
                                <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0}>
                                    {"<"}
                                </Button>
                                <span className="text-sm">
                                    Стр. {currentPage + 1} из {totalPages}
                                </span>
                                <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages - 1}>
                                    {">"}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {paginatedRequests.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">Заявок не найдено</div>
                ) : (
                    paginatedRequests.map((request) => (
                        <div key={request.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => (window.location.href = `/requests/${request.id}`)}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <h3 className="text-lg font-semibold">{request.title}</h3>
                                        <Badge variant="outline">{getStatusText(request.status)}</Badge>
                                        <Badge variant="outline">{getTypeText(request.request_type)}</Badge>
                                        {!request.is_public && isAdmin && <Badge variant="outline">Приватная</Badge>}
                                    </div>
                                    <div className="text-sm mb-2 text-muted-foreground">
                                        Создал: {request.created_by_username} • {format(new Date(request.created_at), "dd MMM yyyy, HH:mm", { locale: ru })}
                                    </div>
                                    {request.items_preview && request.items_preview.length > 0 && (
                                        <div className="text-sm">
                                            <span className="font-medium">Товары:</span>{" "}
                                            {request.items_preview.map((item, idx) => (
                                                <span key={idx}>
                                                    {item.name} ({item.quantity}){idx < request.items_preview.length - 1 && ", "}
                                                </span>
                                            ))}
                                            {request.items_preview.length >= 3 && " ..."}
                                        </div>
                                    )}
                                    {request.rejection_reason && request.status === "rejected" && <div className="text-sm text-red-500 mt-2">Причина отклонения: {request.rejection_reason}</div>}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <CreateRequestDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onRequestCreated={fetchRequests} />
        </div>
    );
}

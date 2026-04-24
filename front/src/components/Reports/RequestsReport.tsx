import { useState, useEffect } from "react";
import { ReportFilters } from "./ReportFilters";
import { ReportTable } from "./ReportTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { format, subMonths } from "date-fns";
import { useNavigate } from "react-router-dom";
import ExportButton from "../ExportButton";
import { LoadingSpinner } from "../LoadingSpinner";

interface RequestItem {
    id: number;
    title: string;
    request_type: string;
    status: string;
    created_at: string;
    reviewed_at: string | null;
    rejection_reason: string | null;
    created_by_username: string;
    reviewed_by_username: string | null;
    items_preview: Array<{ name: string; quantity: number }> | null;
}

interface User {
    id: number;
    username: string;
    name: string;
    secondname: string;
}

export function RequestsReport() {
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [status, setStatus] = useState<string>("all");
    const [type, setType] = useState<string>("all");
    const [userId, setUserId] = useState<string>("all");
    const [data, setData] = useState<RequestItem[]>([]);
    const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
    const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const statuses = [
        { value: "pending", label: "На рассмотрении" },
        { value: "approved", label: "Подтверждены" },
        { value: "rejected", label: "Отклонены" }
    ];

    const types = [
        { value: "incoming", label: "Приход" },
        { value: "outgoing", label: "Расход" }
    ];

    const fetchFilters = async () => {
        try {
            const token = localStorage.getItem("token");
            const usersRes = await axios.get(`${API_BASE_URL}/reports/users-list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(
                usersRes.data.users.map((u: User) => ({
                    value: u.id.toString(),
                    label: `${u.name} ${u.secondname} (${u.username})`
                }))
            );
        } catch (error) {
            console.error("Ошибка загрузки фильтров:", error);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/reports/requests`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    startDate: format(startDate, "yyyy-MM-dd"),
                    endDate: format(endDate, "yyyy-MM-dd"),
                    status,
                    type,
                    userId
                }
            });
            setData(response.data.data);
            setSummary(response.data.summary);
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFilters();
        fetchData();
    }, []);

    const handleApply = () => {
        fetchData();
    };

    const handleReset = () => {
        setStartDate(subMonths(new Date(), 1));
        setEndDate(new Date());
        setStatus("all");
        setType("all");
        setUserId("all");
        setTimeout(fetchData, 100);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge>На рассмотрении</Badge>;
            case "approved":
                return <Badge className="bg-green-500">Подтверждена</Badge>;
            case "rejected":
                return <Badge variant="destructive">Отклонена</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const columns = [
        { key: "id", header: "№", width: "60px" },
        { key: "title", header: "Название", width: "200px" },
        { key: "request_type", header: "Тип", width: "80px", format: (v: string) => (v === "incoming" ? "Приход" : "Расход") },
        { key: "status", header: "Статус", width: "120px", format: (v: string) => getStatusBadge(v) },
        { key: "created_by_username", header: "Создал", width: "120px" },
        { key: "reviewed_by_username", header: "Рассмотрел", width: "120px", format: (v: string) => v || "-" },
        { key: "created_at", header: "Дата создания", width: "120px", format: (v: string) => format(new Date(v), "dd.MM.yyyy") },
        { key: "items_preview", header: "Товары", width: "150px", format: (v: any) => (v ? v.map((i: any) => `${i.name} (${i.quantity})`).join(", ") : "-") }
    ];

    return (
        <div className="space-y-4">
            <ReportFilters
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                status={status}
                onStatusChange={setStatus}
                statuses={statuses}
                type={type}
                onTypeChange={setType}
                types={types}
                userId={userId}
                onUserChange={setUserId}
                users={users}
                onApply={handleApply}
                onReset={handleReset}
                loading={loading}
            />

            {loading ? (
                <LoadingSpinner />
            ) : (
                <>
                    <ExportButton
                        data={data}
                        columns={[
                            { accessorKey: "id", header: "№" },
                            { accessorKey: "title", header: "Название" },
                            { accessorKey: "request_type", header: "Тип", format: (v) => (v === "incoming" ? "Приход" : "Расход") },
                            {
                                accessorKey: "status",
                                header: "Статус",
                                format: (v) => {
                                    switch (v) {
                                        case "pending":
                                            return "На рассмотрении";
                                        case "approved":
                                            return "Подтверждена";
                                        case "rejected":
                                            return "Отклонена";
                                        default:
                                            return v;
                                    }
                                }
                            },
                            { accessorKey: "created_by_username", header: "Создал" },
                            { accessorKey: "reviewed_by_username", header: "Рассмотрел", format: (v) => v || "-" },
                            { accessorKey: "created_at", header: "Дата создания", format: (v) => format(new Date(v), "dd.MM.yyyy") },
                            { accessorKey: "items_preview", header: "Товары", format: (v) => (v ? v.map((i: any) => `${i.name} (${i.quantity})`).join(", ") : "-") }
                        ]}
                        filename="requests"
                        title="Отчет по заявкам"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">На рассмотрении</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.pending}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-green-600">Подтверждены</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.approved}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-red-600">Отклонены</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.rejected}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Всего</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.total}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <ReportTable columns={columns} data={data} onRowClick={(row) => navigate(`/requests/${row.id}`)} />
                </>
            )}
        </div>
    );
}

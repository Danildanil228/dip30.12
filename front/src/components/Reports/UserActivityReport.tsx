import { useState, useEffect } from "react";
import { ReportFilters } from "./ReportFilters";
import { ReportTable } from "./ReportTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { format, subMonths } from "date-fns";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ExportButton from "../ExportButton";

interface UserActivity {
    id: number;
    username: string;
    name: string;
    secondname: string;
    role: string;
    requests_created: number;
    requests_approved: number;
    requests_rejected: number;
    inventories_completed: number;
}

export function UserActivityReport() {
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [data, setData] = useState<UserActivity[]>([]);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState({
        total_requests: 0,
        total_approved: 0,
        total_rejected: 0,
        total_inventories: 0,
        active_users: 0
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/reports/user-activity`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    startDate: format(startDate, "yyyy-MM-dd"),
                    endDate: format(endDate, "yyyy-MM-dd")
                }
            });

            const userData = response.data.data || [];
            setData(userData);

            const totalRequests = userData.reduce((sum: number, u: UserActivity) => sum + (Number(u.requests_created) || 0), 0);
            const totalApproved = userData.reduce((sum: number, u: UserActivity) => sum + (Number(u.requests_approved) || 0), 0);
            const totalRejected = userData.reduce((sum: number, u: UserActivity) => sum + (Number(u.requests_rejected) || 0), 0);
            const totalInventories = userData.reduce((sum: number, u: UserActivity) => sum + (Number(u.inventories_completed) || 0), 0);
            const activeUsers = userData.filter((u: UserActivity) => (Number(u.requests_created) || 0) > 0 || (Number(u.requests_approved) || 0) > 0 || (Number(u.inventories_completed) || 0) > 0).length;

            setSummary({
                total_requests: totalRequests,
                total_approved: totalApproved,
                total_rejected: totalRejected,
                total_inventories: totalInventories,
                active_users: activeUsers
            });
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const handleApply = () => {
        fetchData();
    };

    const handleReset = () => {
        setStartDate(subMonths(new Date(), 1));
        setEndDate(new Date());
        setTimeout(fetchData, 100);
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "admin":
                return <Badge>Администратор</Badge>;
            case "accountant":
                return <Badge>Бухгалтер</Badge>;
            case "storekeeper":
                return <Badge>Кладовщик</Badge>;
            default:
                return <Badge>{role}</Badge>;
        }
    };

    const formatNumber = (value: number) => {
        const num = Number(value) || 0;
        return num.toLocaleString();
    };

    const columns = [
        {
            key: "name",
            header: "Пользователь",
            width: "180px",
            format: (v: string, row: any) => (
                <div>
                    <div className="font-medium">
                        {row.name} {row.secondname}
                    </div>
                    <div className="text-xs text-muted-foreground">{row.username}</div>
                </div>
            )
        },
        {
            key: "role",
            header: "Роль",
            width: "120px",
            format: (v: string) => getRoleBadge(v)
        },
        {
            key: "requests_created",
            header: "Создано заявок",
            width: "120px",
            format: (v: number) => formatNumber(v)
        },
        {
            key: "requests_approved",
            header: "Подтверждено",
            width: "100px",
            format: (v: number) => <span className="text-green-600">{formatNumber(v)}</span>
        },
        {
            key: "requests_rejected",
            header: "Отклонено",
            width: "100px",
            format: (v: number) => <span className="text-red-600">{formatNumber(v)}</span>
        },
        {
            key: "inventories_completed",
            header: "Инвентаризаций проведено",
            width: "160px",
            format: (v: number) => <span>{formatNumber(v)}</span>
        }
    ];

    const handleRowClick = (row: UserActivity) => {
        navigate(`/profile/${row.id}`);
    };

    const activeData = data.filter((u) => (Number(u.requests_created) || 0) > 0 || (Number(u.requests_approved) || 0) > 0 || (Number(u.inventories_completed) || 0) > 0);

    return (
        <div className="space-y-4">
            <ReportFilters startDate={startDate} endDate={endDate} onStartDateChange={setStartDate} onEndDateChange={setEndDate} onApply={handleApply} onReset={handleReset} loading={loading} />

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <>
                    <ExportButton
                        data={activeData}
                        columns={[
                            {
                                accessorKey: "name",
                                header: "Пользователь",
                                format: (v: any) => {
                                    return v || "-";
                                }
                            },
                            {
                                accessorKey: "role",
                                header: "Роль",
                                format: (v: string) => {
                                    switch (v) {
                                        case "admin": return "Администратор";
                                        case "accountant": return "Бухгалтер";
                                        case "storekeeper": return "Кладовщик";
                                        default: return v;
                                    }
                                }
                            },
                            {
                                accessorKey: "requests_created",
                                header: "Создано заявок",
                                format: (v: number) => (Number(v) || 0).toLocaleString()
                            },
                            {
                                accessorKey: "requests_approved",
                                header: "Подтверждено",
                                format: (v: number) => (Number(v) || 0).toLocaleString()
                            },
                            {
                                accessorKey: "requests_rejected",
                                header: "Отклонено",
                                format: (v: number) => (Number(v) || 0).toLocaleString()
                            },
                            {
                                accessorKey: "inventories_completed",
                                header: "Инвентаризаций проведено",
                                format: (v: number) => (Number(v) || 0).toLocaleString()
                            }
                        ]}
                        filename="user_activity"
                        title="Активность пользователей"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Активных пользователей</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.active_users}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Всего заявок</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.total_requests.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-green-600">Подтверждено</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{summary.total_approved.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-red-600">Отклонено</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{summary.total_rejected.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Инвентаризаций</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.total_inventories.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <ReportTable columns={columns} data={activeData} onRowClick={handleRowClick} itemsPerPage={15} />
                </>
            )}
        </div>
    );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, XCircle, Package, User, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useRequests } from "@/hooks/useRequests";
import { useUser } from "@/hooks/useUser";

export default function RequestDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAdmin } = useUser();
    const { currentRequest, currentRequestItems, loading, fetchRequestById, approveRequest, rejectRequest } = useRequests();
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [processing, setProcessing] = useState(false);
    const isAccountant = user?.role === "accountant";
    const canApprove = (isAdmin || isAccountant) && currentRequest?.status === "pending";
    const [notesExpanded, setNotesExpanded] = useState(false);

    const { loading: userLoading } = useUser();

    useEffect(() => {
        
        if (!userLoading && id) {
            fetchRequestById(parseInt(id));
        }
    }, [id, fetchRequestById, userLoading]);

    const handleApprove = async () => {
        setProcessing(true);
        try {
            await approveRequest(parseInt(id!));
        } catch (error) {
            alert("Ошибка подтверждения заявки");
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert("Укажите причину отклонения");
            return;
        }

        setProcessing(true);
        try {
            await rejectRequest(parseInt(id!), rejectionReason.trim());
            setShowRejectDialog(false);
            setRejectionReason("");
        } catch (error) {
            alert("Ошибка отклонения заявки");
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge>На рассмотрении</Badge>;
            case "approved":
                return <Badge>Подтверждена</Badge>;
            case "rejected":
                return <Badge>Отклонена</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case "incoming":
                return <Badge variant="outline">Приход</Badge>;
            case "outgoing":
                return <Badge variant="outline">Расход</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!currentRequest) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">Заявка не найдена</p>
                <Button onClick={() => navigate("/requests")} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Вернуться к списку
                </Button>
            </div>
        );
    }

    return (
        <div>
            <Button variant="ghost" onClick={() => navigate("/requests")} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад к заявкам
            </Button>

            <Card className="mb-6">
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-start gap-4">
                        <div>
                            <CardTitle className="text-2xl mb-2">{currentRequest.title}</CardTitle>
                            <div className="flex flex-wrap gap-2">
                                {getStatusBadge(currentRequest.status)}
                                {getTypeBadge(currentRequest.request_type)}
                                {!currentRequest.is_public && <Badge variant="secondary">Приватная</Badge>}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-2">
                            <User className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <div className="text-sm text-gray-500">Создал</div>
                                <div className="text-base">
                                    {currentRequest.created_by_name} {currentRequest.created_by_secondname} ({currentRequest.created_by_username})
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <div className="text-sm text-gray-500">Дата создания</div>
                                <div className="text-base">{format(new Date(currentRequest.created_at), "dd MMMM yyyy, HH:mm", { locale: ru })}</div>
                            </div>
                        </div>
                        {currentRequest.reviewed_by_username && (
                            <div className="flex items-start gap-2">
                                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <div className="text-sm text-gray-500">Рассмотрел</div>
                                    <div className="text-base">{currentRequest.reviewed_by_username}</div>
                                </div>
                            </div>
                        )}
                        {currentRequest.reviewed_at && (
                            <div className="flex items-start gap-2">
                                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <div className="text-sm text-gray-500">Дата рассмотрения</div>
                                    <div className="text-base">{format(new Date(currentRequest.reviewed_at), "dd MMMM yyyy, HH:mm", { locale: ru })}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {currentRequest.notes && (
                        <div className="mt-4 flex items-start gap-2">
                            <FileText className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <div className="text-sm text-gray-500">Примечания</div>
                                <div className="mt-1">
                                    <div className={`text-sm rounded ${!notesExpanded ? "line-clamp-2" : ""}`}>{currentRequest.notes}</div>
                                    {currentRequest.notes.length > 100 && (
                                        <button onClick={() => setNotesExpanded(!notesExpanded)} className="text-sm mt-1 underline">
                                            {notesExpanded ? "Свернуть" : "Развернуть"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentRequest.rejection_reason && (
                        <div className="mt-4 flex items-start gap-2">
                            <XCircle className="h-5 w-5 mt-0.5 text-gray-400" />
                            <div>
                                <div className="text-sm text-gray-500">Причина отклонения</div>
                                <div className="mt-1 text-base rounded">{currentRequest.rejection_reason}</div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Товары в заявке
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Код</TableHead>
                                        <TableHead>Название</TableHead>
                                        <TableHead className="text-center">Ед.</TableHead>
                                        <TableHead className="text-center">Остаток</TableHead>
                                        <TableHead className="text-center">Запрошено</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentRequestItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
                                                Нет товаров
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        currentRequestItems.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-mono">{item.code}</TableCell>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell className="text-center">{item.unit}</TableCell>
                                                <TableCell className="text-center">{item.current_quantity_at_request}</TableCell>
                                                <TableCell className="text-center">{item.quantity}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {canApprove && (
                            <div className="sm:flex gap-2 grid sm:justify-end">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button disabled={processing}>Подтвердить</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Подтвердить заявку?</AlertDialogTitle>
                                            <div className="py-2">
                                                <p>{currentRequest.title}</p>
                                                {currentRequest.request_type === "incoming" && <p className="text-sm mt-2">После подтверждения товары будут добавлены на склад.</p>}
                                                {currentRequest.request_type === "outgoing" && <p className="text-sm mt-2">После подтверждения товары будут списаны со склада.</p>}
                                            </div>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleApprove}>Подтвердить</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <Button onClick={() => setShowRejectDialog(true)} disabled={processing} variant="destructive">
                                    Отклонить
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Отклонить заявку</AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label htmlFor="rejection-reason">Причина отклонения *</Label>
                        <Textarea id="rejection-reason" placeholder="Укажите причину отклонения заявки..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={4} className="mt-2" />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReject} disabled={processing || !rejectionReason.trim()} className="bg-red-500 hover:bg-red-600">
                            {processing ? "Отклонение..." : "Отклонить"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

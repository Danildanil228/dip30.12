import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, XCircle, Package, User, Calendar, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useRequests } from "@/hooks/useRequests";
import { useUser } from "@/hooks/useUser";
import { useMaterials } from "@/hooks/useMaterials";

export default function RequestDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAdmin } = useUser();
    const { currentRequest, currentRequestItems, loading, fetchRequestById, approveRequest, rejectRequest } = useRequests();
    const { fetchMaterials } = useMaterials();
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
           
            await fetchMaterials();
        } catch (error: any) {
            const message = error.response?.data?.error || "Ошибка подтверждения заявки";
            alert(message);
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
        } catch (error: any) {
            const message = error.response?.data?.error || "Ошибка отклонения заявки";
            alert(message);
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">На рассмотрении</Badge>;
            case "approved":
                return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">Подтверждена</Badge>;
            case "rejected":
                return (
                    <Badge variant="destructive" className="border-0">
                        Отклонена
                    </Badge>
                );
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

    if (!currentRequest) {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-lg font-medium">Заявка не найдена</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">Возможно, она была удалена или у вас нет к ней доступа</p>
                <Button onClick={() => navigate("/requests")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к списку
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => navigate("/requests")} className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" /> Назад к заявкам
            </Button>

            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Card className="shadow-sm">
                    <CardHeader>
                        <div className="flex flex-wrap justify-between items-start gap-4">
                            <div className="space-y-2">
                                <CardTitle className="text-2xl">{currentRequest.title}</CardTitle>
                                <div className="flex flex-wrap gap-2">
                                    {getStatusBadge(currentRequest.status)}
                                    {getTypeBadge(currentRequest.request_type)}
                                    {!currentRequest.is_public && (
                                        <Badge variant="secondary" className="border-0">
                                            Приватная
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Создал</div>
                                    <div className="font-medium">
                                        {currentRequest.created_by_name} {currentRequest.created_by_secondname}
                                        <span className="text-muted-foreground font-normal ml-1">(@{currentRequest.created_by_username})</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Дата создания</div>
                                    <div className="font-medium">{format(new Date(currentRequest.created_at), "dd MMMM yyyy, HH:mm", { locale: ru })}</div>
                                </div>
                            </div>
                            {currentRequest.reviewed_by_username && (
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Рассмотрел</div>
                                        <div className="font-medium">{currentRequest.reviewed_by_username}</div>
                                    </div>
                                </div>
                            )}
                            {currentRequest.reviewed_at && (
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Дата рассмотрения</div>
                                        <div className="font-medium">{format(new Date(currentRequest.reviewed_at), "dd MMMM yyyy, HH:mm", { locale: ru })}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {currentRequest.notes && (
                            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
                                <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-muted-foreground mb-1">Примечания</div>
                                    <div className={`text-sm ${!notesExpanded ? "line-clamp-2" : ""}`}>{currentRequest.notes}</div>
                                    {currentRequest.notes.length > 100 && (
                                        <button onClick={() => setNotesExpanded(!notesExpanded)} className="text-xs text-primary hover:underline mt-1">
                                            {notesExpanded ? "Свернуть" : "Развернуть"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {currentRequest.rejection_reason && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                                <div>
                                    <div className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Причина отклонения</div>
                                    <div className="text-sm text-red-700 dark:text-red-300">{currentRequest.rejection_reason}</div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Товары в заявке ({currentRequestItems.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {currentRequestItems.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                <p>Нет товаров в заявке</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-25">Код</TableHead>
                                            <TableHead>Название</TableHead>
                                            <TableHead className="text-center w-20">Ед.</TableHead>
                                            <TableHead className="text-center w-25">Остаток на момент</TableHead>
                                            <TableHead className="text-center w-25">{currentRequest.request_type === "incoming" ? "Поступит" : "Спишется"}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentRequestItems.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-mono text-sm">{item.code}</TableCell>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell className="text-center text-muted-foreground">{item.unit}</TableCell>
                                                <TableCell className="text-center">{item.current_quantity_at_request.toLocaleString()}</TableCell>
                                                <TableCell className="text-center">
                                                    <span className={`font-semibold ${currentRequest.request_type === "incoming" ? "text-green-600" : "text-red-600"}`}>
                                                        {currentRequest.request_type === "incoming" ? "+" : "−"}
                                                        {item.quantity.toLocaleString()}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        {canApprove && (
                            <div className="flex flex-wrap gap-3 justify-end mt-6 pt-6 border-t">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button disabled={processing} className="gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            Подтвердить
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Подтвердить заявку?</AlertDialogTitle>
                                            <div className="py-2 text-sm text-muted-foreground">
                                                <p className="font-medium text-foreground mb-1">{currentRequest.title}</p>
                                                {currentRequest.request_type === "incoming" ? (
                                                    <p>После подтверждения товары будут добавлены на склад.</p>
                                                ) : (
                                                    <div className="flex items-start gap-2 mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                                                        <p className="text-yellow-700 dark:text-yellow-300">После подтверждения товары будут списаны со склада.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleApprove}>Подтвердить</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>

                                <Button onClick={() => setShowRejectDialog(true)} disabled={processing} variant="destructive" className="gap-2">
                                    <XCircle className="h-4 w-4" />
                                    Отклонить
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Отклонить заявку</AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label htmlFor="rejection-reason" className="mb-2 block">
                            Причина отклонения *
                        </Label>
                        <Textarea id="rejection-reason" placeholder="Укажите причину отклонения заявки..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={4} />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReject} disabled={processing || !rejectionReason.trim()} className="bg-destructive hover:bg-destructive/90">
                            {processing ? "Отклонение..." : "Отклонить"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

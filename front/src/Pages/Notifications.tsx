import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FunnelPlus, FunnelX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationsProps {
    onVisited?: () => void;
}

const formatDateTime = (value: unknown): string => {
    if (!value) return "";
    try {
        const date = new Date(value as string);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleDateString("ru-RU") + " " + date.toLocaleTimeString("ru-RU");
    } catch {
        return "";
    }
};

const LOG_TYPES = [
    { value: "user_created", label: "Создание пользователя", category: "users" },
    { value: "user_deleted", label: "Удаление пользователя", category: "users" },
    { value: "profile_updated", label: "Изменение профиля", category: "profile" },
    { value: "password_changed", label: "Смена пароля", category: "profile" },
    { value: "admin_user_updated", label: "Админ изменил пользователя", category: "profile" },
    { value: "admin_password_changed", label: "Админ сменил пароль", category: "profile" },
    { value: "login", label: "Вход в систему", category: "auth" },
    { value: "logout", label: "Выход из системы", category: "auth" },
    { value: "backup_created", label: "Создание бэкапа", category: "backups" },
    { value: "backup_downloaded", label: "Скачивание бэкапа", category: "backups" },
    { value: "backup_deleted", label: "Удаление бэкапа", category: "backups" },
    { value: "material_created", label: "Создание материала", category: "materials" },
    { value: "material_updated", label: "Изменение материала", category: "materials" },
    { value: "material_deleted", label: "Удаление материала", category: "materials" },
    { value: "category_created", label: "Создание категории", category: "categories" },
    { value: "category_updated", label: "Изменение категории", category: "categories" },
    { value: "category_deleted", label: "Удаление категории", category: "categories" },
    { value: "request_created", label: "Создание заявки", category: "requests" },
    { value: "request_approved", label: "Подтверждение заявки", category: "requests" },
    { value: "request_rejected", label: "Отклонение заявки", category: "requests" },
    { value: "inventory_created", label: "Создание инвентаризации", category: "inventories" },
    { value: "inventory_started", label: "Начало инвентаризации", category: "inventories" },
    { value: "inventory_saved", label: "Сохранение результатов", category: "inventories" },
    { value: "inventory_completed", label: "Завершение инвентаризации", category: "inventories" },
    { value: "inventory_approved", label: "Подтверждение инвентаризации", category: "inventories" },
    { value: "inventory_cancelled", label: "Отмена инвентаризации", category: "inventories" },
    { value: "inventory_updated", label: "Изменение инвентаризации", category: "inventories" },
    { value: "inventory_deleted", label: "Удаление инвентаризации", category: "inventories" },
];

const filterGroups = [
    { title: "Пользователи", types: LOG_TYPES.filter((t) => t.category === "users") },
    { title: "Профиль", types: LOG_TYPES.filter((t) => t.category === "profile") },
    { title: "Авторизация", types: LOG_TYPES.filter((t) => t.category === "auth") },
    { title: "Бэкапы", types: LOG_TYPES.filter((t) => t.category === "backups") },
    { title: "Материалы", types: LOG_TYPES.filter((t) => t.category === "materials") },
    { title: "Категории", types: LOG_TYPES.filter((t) => t.category === "categories") },
    { title: "Заявки", types: LOG_TYPES.filter((t) => t.category === "requests") },
    { title: "Инвентаризации", types: LOG_TYPES.filter((t) => t.category === "inventories") },
];

export default function Notifications({ onVisited }: NotificationsProps) {
    const { logs, loading, deleteLog, deleteAllLogs, fetchLogs } = useNotifications();
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(10);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        if (onVisited && logs.length > 0) {
            onVisited();
        }
    }, [logs, onVisited]);

    const filteredLogs = selectedTypes.length > 0 ? logs.filter((log) => selectedTypes.includes(log.type)) : logs;
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = showAll ? filteredLogs : filteredLogs.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const handleResetFilters = () => {
        setSelectedTypes([]);
        setCurrentPage(0);
    };

    const handleTypeChange = (type: string, checked: boolean) => {
        if (checked) {
            setSelectedTypes([...selectedTypes, type]);
        } else {
            setSelectedTypes(selectedTypes.filter((t) => t !== type));
        }
        setCurrentPage(0);
    };

    const parseMessageWithLinks = (message: string) => {
        const regex = /(\[user:\d+:\w+\])|(\[request:\d+\])|(\[inventory:\d+\])/g;
        const parts: Array<{ type: "text" | "user" | "request" | "inventory"; content: string; id?: number; username?: string }> = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(message)) !== null) {
            if (match.index > lastIndex) {
                parts.push({ type: "text", content: message.substring(lastIndex, match.index) });
            }

            const userMatch = match[0].match(/\[user:(\d+):(\w+)\]/);
            if (userMatch) {
                parts.push({ type: "user", content: userMatch[2], id: parseInt(userMatch[1]), username: userMatch[2] });
            }
            const requestMatch = match[0].match(/\[request:(\d+)\]/);
            if (requestMatch) {
                parts.push({ type: "request", content: "заявку", id: parseInt(requestMatch[1]) });
            }
            const inventoryMatch = match[0].match(/\[inventory:(\d+)\]/);
            if (inventoryMatch) {
                parts.push({ type: "inventory", content: "инвентаризацию", id: parseInt(inventoryMatch[1]) });
            }
            lastIndex = match.index + match[0].length;
        }
        if (lastIndex < message.length) {
            parts.push({ type: "text", content: message.substring(lastIndex) });
        }
        return parts;
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            <ScrollToTop />

            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="sm:flex grid items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Журнал действий</h1>
                        {logs.length !== filteredLogs.length && (
                            <p className="text-sm text-muted-foreground">
                                Показано {filteredLogs.length} из {logs.length} записей
                            </p>
                        )}
                    </div>

                    <div className="sm:flex grid gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <FunnelPlus className="h-4 w-4" />
                                    Фильтры{" "}
                                    {selectedTypes.length > 0 && (
                                        <Badge variant="secondary" className="ml-1 text-xs">
                                            {selectedTypes.length}
                                        </Badge>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4 max-h-96 overflow-y-auto">
                                <div className="space-y-4">
                                    {filterGroups.map((group) => (
                                        <div key={group.title}>
                                            <h3 className="font-semibold text-sm mb-2 text-muted-foreground">{group.title}</h3>
                                            <div className="grid gap-2 pl-2">
                                                {group.types.map((type) => (
                                                    <div key={type.value} className="flex items-center gap-2">
                                                        <Checkbox id={`type-${type.value}`} checked={selectedTypes.includes(type.value)} onCheckedChange={(checked) => handleTypeChange(type.value, checked as boolean)} />
                                                        <label htmlFor={`type-${type.value}`} className="text-sm leading-none cursor-pointer">
                                                            {type.label}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>

                        {selectedTypes.length > 0 && (
                            <Button variant="outline" size="icon" onClick={handleResetFilters} title="Сбросить фильтры">
                                <FunnelX className="h-4 w-4" />
                            </Button>
                        )}

                        {logs.length > 1 && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        <Trash2 className="h-4 w-4" />
                                        Удалить все ({logs.length})
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Удалить все записи из журнала?</AlertDialogTitle>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                                        <AlertDialogAction onClick={deleteAllLogs} className="bg-destructive hover:bg-destructive/90">
                                            Удалить
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>
            </motion.div>

            {filteredLogs.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">Всего записей: {filteredLogs.length}</div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setShowAll(!showAll);
                                if (!showAll) setCurrentPage(0);
                            }}
                        >
                            {showAll ? "Свернуть" : "Развернуть"}
                        </Button>
                        {!showAll && totalPages > 1 && (
                            <>
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))} disabled={currentPage === 0}>
                                    &lt;
                                </Button>
                                <span className="text-sm">
                                    Стр. {currentPage + 1} из {totalPages}
                                </span>
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))} disabled={currentPage === totalPages - 1}>
                                    &gt;
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {paginatedLogs.map((log, index) => (
                    <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="rounded-xl border bg-card shadow-sm p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="sm:flex grid items-center sm:justify-between gap-2 mb-2">
                                    <Badge variant="outline" className="text-xs font-normal shrink-0">
                                        {log.title}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground shrink-0">{formatDateTime(log.created_at)}</span>
                                </div>
                                <div className="text-base">
                                    {parseMessageWithLinks(log.message).map((part, i) => {
                                        if (part.type === "user") {
                                            return (
                                                <Link key={i} to={`/profile/${part.id}`} className="text-primary hover:underline font-medium">
                                                    {part.username}
                                                </Link>
                                            );
                                        }
                                        if (part.type === "request") {
                                            return (
                                                <Link key={i} to={`/requests/${part.id}`} className="text-primary hover:underline">
                                                    {part.content}
                                                </Link>
                                            );
                                        }
                                        if (part.type === "inventory") {
                                            return (
                                                <Link key={i} to={`/inventories/${part.id}`} className="text-primary hover:underline">
                                                    {part.content}
                                                </Link>
                                            );
                                        }
                                        return <span key={i}>{part.content}</span>;
                                    })}
                                </div>
                                {log.user_name && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Пользователь: {log.name} {log.secondname} ({log.user_name})
                                    </p>
                                )}
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-60 hover:opacity-100" onClick={() => deleteLog(log.id)}>
                                <img src="/trash.png" className="icon w-4" alt="" />
                            </Button>
                        </div>
                    </motion.div>
                ))}
                {paginatedLogs.length === 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 rounded-xl border bg-card shadow-sm">
                        <div className="text-4xl mb-3">📭</div>
                        <p className="text-lg font-medium">Журнал пуст</p>
                        <p className="text-sm text-muted-foreground mt-1">{selectedTypes.length > 0 ? "Нет записей по выбранным фильтрам" : "Нет записей в журнале"}</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

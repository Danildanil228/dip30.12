import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "react-router-dom";
import ExportButton from "@/components/ExportButton";
import { ScrollToTop } from "@/components/ScrollToTop";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Log {
    id: number;
    user_id: number;
    type: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
    user_name: string;
    name: string;
    secondname: string;
}

interface LogsProps { onVisited?: () => void; }

export default function Notifications({ onVisited }: LogsProps) {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

    const LOG_TYPES = [
        // Пользователи
        { value: "user_created", label: "Создание пользователя", category: "users" },
        { value: "user_deleted", label: "Удаление пользователя", category: "users" },
        // Профиль
        { value: "profile_updated", label: "Изменение профиля", category: "profile" },
        { value: "password_changed", label: "Смена пароля", category: "profile" },
        { value: "admin_user_updated", label: "Админ изменил данные пользователя", category: "profile" },
        { value: "admin_password_changed", label: "Админ сменил пароль пользователя", category: "profile" },
        // Авторизация
        { value: "login", label: "Вход в систему", category: "auth" },
        { value: "logout", label: "Выход из системы", category: "auth" },
        // Бэкапы
        { value: "backup_created", label: "Создание бэкапа", category: "backups" },
        { value: "backup_downloaded", label: "Скачивание бэкапа", category: "backups" },
        { value: "backup_deleted", label: "Удаление бэкапа", category: "backups" },
        // Материалы
        { value: "material_created", label: "Создание материала", category: "materials" },
        { value: "material_updated", label: "Изменение материала", category: "materials" },
        { value: "material_deleted", label: "Удаление материала", category: "materials" },
        // Категории
        { value: "category_created", label: "Создание категории", category: "categories" },
        { value: "category_updated", label: "Изменение категории", category: "categories" },
        { value: "category_deleted", label: "Удаление категории", category: "categories" },
        // Заявки
        { value: "request_created", label: "Создание заявки", category: "requests" },
        { value: "request_approved", label: "Подтверждение заявки", category: "requests" },
        { value: "request_rejected", label: "Отклонение заявки", category: "requests" },
        // Инвентаризации
        { value: "inventory_created", label: "Создание инвентаризации", category: "inventories" },
        { value: "inventory_started", label: "Начало инвентаризации", category: "inventories" },
        { value: "inventory_saved", label: "Сохранение результатов", category: "inventories" },
        { value: "inventory_completed", label: "Завершение инвентаризации", category: "inventories" },
        { value: "inventory_approved", label: "Подтверждение инвентаризации", category: "inventories" },
        { value: "inventory_cancelled", label: "Отмена инвентаризации", category: "inventories" },
        { value: "inventory_updated", label: "Изменение инвентаризации", category: "inventories" },
        { value: "inventory_deleted", label: "Удаление инвентаризации", category: "inventories" },
    ];

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/logs`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLogs(response.data.logs);
            if (onVisited) {
                onVisited();
            }
        } catch (error) {
            console.error("Ошибка загрузки логов:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleDeleteLog = async (id: number) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_BASE_URL}/logs/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLogs(logs.filter((log) => log.id !== id));
        } catch (error) {
            console.error("Ошибка удаления лога:", error);
        }
    };

    const handleDeleteAllLogs = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_BASE_URL}/logs`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLogs([]);
        } catch (error) {
            console.error("Ошибка удаления логов:", error);
        }
    };

    const filteredLogs =
        selectedTypes.length > 0
            ? logs.filter((log) => selectedTypes.includes(log.type))
            : logs;

    const handleTypeChange = (type: string, checked: boolean) => {
        if (checked) {
            setSelectedTypes([...selectedTypes, type]);
        } else {
            setSelectedTypes(selectedTypes.filter((t) => t !== type));
        }
    };

    const parseMessageWithLinks = (message: string) => {
        const regex = /(\[user:\d+:\w+\])|(\[request:\d+\])|(\[inventory:\d+\])/g;
        const parts: Array<{ type: 'text' | 'user' | 'request' | 'inventory'; content: string; id?: number; username?: string }> = [];

        let lastIndex = 0;
        let match;

        while ((match = regex.exec(message)) !== null) {
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: message.substring(lastIndex, match.index)
                });
            }

            const userMatch = match[0].match(/\[user:(\d+):(\w+)\]/);
            if (userMatch) {
                parts.push({
                    type: 'user',
                    content: userMatch[2],
                    id: parseInt(userMatch[1]),
                    username: userMatch[2]
                });
            }

            const requestMatch = match[0].match(/\[request:(\d+)\]/);
            if (requestMatch) {
                parts.push({
                    type: 'request',
                    content: `заявку`,
                    id: parseInt(requestMatch[1])
                });
            }

            const inventoryMatch = match[0].match(/\[inventory:(\d+)\]/);
            if (inventoryMatch) {
                parts.push({
                    type: 'inventory',
                    content: `инвентаризация #${inventoryMatch[1]}`,
                    id: parseInt(inventoryMatch[1])
                });
            }

            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < message.length) {
            parts.push({
                type: 'text',
                content: message.substring(lastIndex)
            });
        }

        return parts.map((part, index) => {
            if (part.type === 'text') {
                return <span key={index}>{part.content}</span>;
            }
            if (part.type === 'user') {
                return (
                    <Link
                        key={index}
                        to={`/profile/${part.id}`}
                        className="underline mx-1"
                    >
                        {part.username}
                    </Link>
                );
            }
            if (part.type === 'request') {
                return (
                    <Link
                        key={index}
                        to={`/requests/${part.id}`}
                        className="underline mx-1"
                    >
                        {part.content}
                    </Link>
                );
            }
            if (part.type === 'inventory') {
                return (
                    <Link
                        key={index}
                        to={`/inventories/${part.id}`}
                        className="underline mx-1"
                    >
                        {part.content}
                    </Link>
                );
            }
            return null;
        });
    };

        if (loading) {
        return <LoadingSpinner />;
    }

    const logColumnsForExport = [
        { accessorKey: "id", header: "ID" },
        {
            accessorKey: "type",
            header: "Тип",
            format: (value: string) => {
                const typeMap: Record<string, string> = {
                    "user_created": "Создание пользователя",
                    "user_deleted": "Удаление пользователя",
                    "profile_updated": "Изменение профиля",
                    "password_changed": "Смена пароля",
                    "admin_user_updated": "Админ изменил данные пользователя",
                    "admin_password_changed": "Админ сменил пароль пользователя",
                    "login": "Вход в систему",
                    "logout": "Выход из системы",
                    "backup_created": "Создание бэкапа",
                    "backup_downloaded": "Скачивание бэкапа",
                    "backup_deleted": "Удаление бэкапа",
                    "material_created": "Создание материала",
                    "material_updated": "Изменение материала",
                    "material_deleted": "Удаление материала",
                    "category_created": "Создание категории",
                    "category_updated": "Изменение категории",
                    "category_deleted": "Удаление категории",
                    "request_created": "Создание заявки",
                    "request_approved": "Подтверждение заявки",
                    "request_rejected": "Отклонение заявки",
                    "inventory_created": "Создание инвентаризации",
                    "inventory_started": "Начало инвентаризации",
                    "inventory_saved": "Сохранение результатов",
                    "inventory_completed": "Завершение инвентаризации",
                    "inventory_approved": "Подтверждение инвентаризации",
                    "inventory_cancelled": "Отмена инвентаризации",
                    "inventory_updated": "Изменение инвентаризации",
                    "inventory_deleted": "Удаление инвентаризации",
                };
                return typeMap[value] || value;
            },
        },
        { accessorKey: "title", header: "Заголовок" },
        { accessorKey: "message", header: "Сообщение" },
        { accessorKey: "user_name", header: "Пользователь" },
        {
            accessorKey: "created_at",
            header: "Дата",
            format: (value: string) => new Date(value).toLocaleString(),
        },
        {
            accessorKey: "read",
            header: "Статус",
            format: (value: boolean) => (value ? "Прочитано" : "Новое"),
        },
    ];

    // Группировка фильтров для удобства
    const filterGroups = [
        {
            title: "Пользователи",
            types: LOG_TYPES.filter(t => t.category === "users")
        },
        {
            title: "Профиль",
            types: LOG_TYPES.filter(t => t.category === "profile")
        },
        {
            title: "Авторизация",
            types: LOG_TYPES.filter(t => t.category === "auth")
        },
        {
            title: "Бэкапы",
            types: LOG_TYPES.filter(t => t.category === "backups")
        },
        {
            title: "Материалы",
            types: LOG_TYPES.filter(t => t.category === "materials")
        },
        {
            title: "Категории",
            types: LOG_TYPES.filter(t => t.category === "categories")
        },
        {
            title: "Заявки",
            types: LOG_TYPES.filter(t => t.category === "requests")
        },
        {
            title: "Инвентаризации",
            types: LOG_TYPES.filter(t => t.category === "inventories")
        }
    ];

    return (
        <div className="lg:my-0 my-10">
            <ScrollToTop />
            <div className="sm:flex grid items-start sm:justify-between mb-4">
                <h1 className="text-2xl mb-4">
                    Журнал действий{" "}
                    {logs.length !== filteredLogs.length &&
                        `(${filteredLogs.length}/${logs.length})`}
                </h1>

                <div className="sm:flex gap-3 grid">
                    <ExportButton
                        data={filteredLogs}
                        columns={logColumnsForExport}
                        filename="logs"
                        title="Журнал действий"
                    />
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">
                                Фильтры{" "}
                                {selectedTypes.length > 0 && `(${selectedTypes.length})`}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4 max-h-96 overflow-y-auto">
                            <div className="space-y-4">
                                {filterGroups.map((group) => (
                                    <div key={group.title}>
                                        <h3 className="font-semibold text-sm mb-2 text-muted-foreground">
                                            {group.title}
                                        </h3>
                                        <div className="grid gap-2 pl-2">
                                            {group.types.map((type) => (
                                                <div key={type.value} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`type-${type.value}`}
                                                        checked={selectedTypes.includes(type.value)}
                                                        onCheckedChange={(checked) =>
                                                            handleTypeChange(type.value, checked as boolean)
                                                        }
                                                    />
                                                    <label
                                                        htmlFor={`type-${type.value}`}
                                                        className="text-sm leading-none cursor-pointer"
                                                    >
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

                    {logs.length > 1 && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline">Удалить все ({logs.length})</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Удалить все записи из журнала?
                                    </AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteAllLogs}>
                                        Удалить
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                {filteredLogs.map((log) => (
                    <div key={log.id} className={`p-4 border rounded-lg`}>
                        <div className="flex justify-between items-center">
                            <div className="flex">
                                <h3 className="text-xs">{log.title}</h3>
                            </div>
                            <div className="flex items-center gap-10">
                                <span className="text-sm">
                                    {new Date(log.created_at).toLocaleString()}
                                </span>
                                <button onClick={() => handleDeleteLog(log.id)}>
                                    <img
                                        src="/trash.png"
                                        className="icon w-5 items-center"
                                        alt=""
                                    />
                                </button>
                            </div>
                        </div>
                        <div className="mt-2 text-xl flex flex-wrap items-center">
                            {parseMessageWithLinks(log.message)}
                        </div>
                        {log.user_name && (
                            <p className="text-sm mt-1">
                                Пользователь: {log.name} {log.secondname} ({log.user_name})
                            </p>
                        )}
                    </div>
                ))}

                {filteredLogs.length === 0 && (
                    <p className="text-center py-10 text-muted-foreground">
                        {selectedTypes.length > 0
                            ? "Нет записей по выбранным фильтрам"
                            : "Нет записей в журнале"}
                    </p>
                )}
            </div>
        </div>
    );
}
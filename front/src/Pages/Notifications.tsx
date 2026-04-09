import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Link } from "react-router-dom";
import ExportButton from "@/components/ExportButton";
import { ScrollToTop } from "@/components/ScrollToTop";

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
        { value: "user_created", label: "Создание пользователя" },
        { value: "user_deleted", label: "Удаление пользователя" },
        { value: "profile_updated", label: "Изменение профиля" },
        { value: "password_changed", label: "Смена пароля" },
        { value: "admin_user_updated", label: "Админ изменил данные пользователя" },
        { value: "admin_password_changed", label: "Админ сменил пароль пользователя" },
        { value: "login", label: "Вход в систему" },
        { value: "logout", label: "Выход из системы" },
        { value: "backup_created", label: "Создание бэкапа" },
        { value: "backup_downloaded", label: "Скачивание бэкапа" },
        { value: "backup_deleted", label: "Удаление бэкапа" },
        { value: "material_created", label: "Создание материала" },
        { value: "material_updated", label: "Изменение материала" },
        { value: "material_deleted", label: "Удаление материала" },
        { value: "category_created", label: "Создание категории" },
        { value: "category_updated", label: "Изменение категории" },
        { value: "category_deleted", label: "Удаление категории" },
        { value: "request_created", label: "Создание заявки" },
        { value: "request_approved", label: "Подтверждение заявки" },
        { value: "request_rejected", label: "Отклонение заявки" },
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
    // Регулярное выражение для поиска всех ссылок
    const regex = /(\[user:\d+:\w+\])|(\[request:\d+\])|(\[inventory:\d+\])/g;
    const parts: Array<{ type: 'text' | 'user' | 'request' | 'inventory'; content: string; id?: number; username?: string }> = [];
    
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(message)) !== null) {
        // Добавляем текст перед ссылкой
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: message.substring(lastIndex, match.index)
            });
        }
        
        // Обрабатываем ссылку
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
                content: `заявка #${requestMatch[1]}`,
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
    
    // Добавляем остаток текста
    if (lastIndex < message.length) {
        parts.push({
            type: 'text',
            content: message.substring(lastIndex)
        });
    }
    
    // Рендерим части
    return parts.map((part, index) => {
        if (part.type === 'text') {
            return <span key={index}>{part.content}</span>;
        }
        if (part.type === 'user') {
            return (
                <Link
                    key={index}
                    to={`/profile/${part.id}`}
                    className="text-blue-500 hover:underline mx-1"
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
                    className="text-green-500 hover:underline mx-1 font-semibold"
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
                    className="text-purple-500 hover:underline mx-1 font-semibold"
                >
                    {part.content}
                </Link>
            );
        }
        return null;
    });
};

    if (loading) {
        return (
            <section className="mx-auto">
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2"></div>
                </div>
            </section>
        );
    }

    const logColumnsForExport = [
        { accessorKey: "id", header: "ID" },
        {
            accessorKey: "type",
            header: "Тип",
            format: (value: string) => {
                switch (value) {
                    // Пользователи
                    case "user_created":
                        return "Создание пользователя";
                    case "user_deleted":
                        return "Удаление пользователя";
                    // Профиль
                    case "profile_updated":
                        return "Изменение профиля";
                    case "password_changed":
                        return "Смена пароля";
                    case "admin_user_updated":
                        return "Админ изменил данные пользователя";
                    case "admin_password_changed":
                        return "Админ сменил пароль пользователя";
                    // Авторизация
                    case "login":
                        return "Вход в систему";
                    case "logout":
                        return "Выход из системы";
                    // Бэкапы
                    case "backup_created":
                        return "Создание бэкапа";
                    case "backup_downloaded":
                        return "Скачивание бэкапа";
                    case "backup_deleted":
                        return "Удаление бэкапа";
                    // Материалы
                    case "material_created":
                        return "Создание материала";
                    case "material_updated":
                        return "Изменение материала";
                    case "material_deleted":
                        return "Удаление материала";
                    // Категории
                    case "category_created":
                        return "Создание категории";
                    case "category_updated":
                        return "Изменение категории";
                    case "category_deleted":
                        return "Удаление категории";
                    // Заявки
                    case "request_created":
                        return "Создание заявки";
                    case "request_approved":
                        return "Подтверждение заявки";
                    case "request_rejected":
                        return "Отклонение заявки";
                    default:
                        return value;
                }
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
            types: LOG_TYPES.filter(t => ["user_created", "user_deleted"].includes(t.value))
        },
        {
            title: "Профиль",
            types: LOG_TYPES.filter(t => ["profile_updated", "password_changed", "admin_user_updated", "admin_password_changed"].includes(t.value))
        },
        {
            title: "Авторизация",
            types: LOG_TYPES.filter(t => ["login", "logout"].includes(t.value))
        },
        {
            title: "Бэкапы",
            types: LOG_TYPES.filter(t => ["backup_created", "backup_downloaded", "backup_deleted"].includes(t.value))
        },
        {
            title: "Материалы",
            types: LOG_TYPES.filter(t => ["material_created", "material_updated", "material_deleted"].includes(t.value))
        },
        {
            title: "Категории",
            types: LOG_TYPES.filter(t => ["category_created", "category_updated", "category_deleted"].includes(t.value))
        },
        {
            title: "Заявки",
            types: LOG_TYPES.filter(t => ["request_created", "request_approved", "request_rejected"].includes(t.value))
        }
    ];

    return (
        <div className="lg:my-0 my-10">
            <ScrollToTop />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl mb-4">
                    Журнал действий{" "}
                    {logs.length !== filteredLogs.length &&
                        `(${filteredLogs.length}/${logs.length})`}
                </h1>

                <div className="grid sm:flex text-center items-center gap-4">
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
                                        <h3 className="font-semibold text-sm mb-2 text-gray-600 dark:text-gray-400">
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
                    <p className="text-center py-10 text-gray-500">
                        {selectedTypes.length > 0
                            ? "Нет записей по выбранным фильтрам"
                            : "Нет записей в журнале"}
                    </p>
                )}
            </div>
        </div>
    );
}
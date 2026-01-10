// src/Pages/Backup.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { useUser } from "@/hooks/useUser";

interface Backup {
    id: number;
    filename: string;
    filepath: string;
    filesize: number;
    created_by: number | null;
    created_by_username: string | null;
    created_at: string;
    restored_at: string | null;
    restored_by: number | null;
    restored_by_username: string | null;
    comment: string | null;
}

interface BackupStats {
    total_backups: string;
    total_size: string;
    total_size_formatted: string;
    restored_count: string;
    first_backup: string;
    last_backup: string;
}

export default function Backup() {
    const { isAdmin } = useUser();
    const [backups, setBackups] = useState<Backup[]>([]);
    const [stats, setStats] = useState<BackupStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [comment, setComment] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchBackups = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const [backupsResponse, statsResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/backup/list`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${API_BASE_URL}/api/backup/stats`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            ]);

            setBackups(backupsResponse.data.backups);
            setStats(statsResponse.data.stats);
        } catch (error) {
            console.error("Ошибка загрузки бэкапов:", error);
            setError("Не удалось загрузить список бэкапов");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    const handleCreateBackup = async () => {
        try {
            setCreating(true);
            setError(null);
            setSuccess(null);

            const token = localStorage.getItem("token");

            const response = await axios.post(
                `${API_BASE_URL}/api/backup/create`,
                { comment: comment || "Ручное создание" },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setSuccess(response.data.message);
            setComment("");
            fetchBackups();

        } catch (error: any) {
            console.error("Ошибка создания бэкапа:", error);
            setError(error.response?.data?.error || "Ошибка создания бэкапа");
        } finally {
            setCreating(false);
        }
    };

    const handleDownloadBackup = async (id: number, filename: string) => {
        try {
            const token = localStorage.getItem("token");

            // Создаем скрытую ссылку для скачивания
            const response = await axios.get(
                `${API_BASE_URL}/api/backup/download/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            // Создаем ссылку для скачивания
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (error: any) {
            console.error("Ошибка скачивания бэкапа:", error);
            alert(error.response?.data?.error || "Ошибка скачивания бэкапа");
        }
    };

    const handleRestoreBackup = async (id: number, filename: string) => {
        if (!confirm(`ВНИМАНИЕ: Вы собираетесь восстановить базу данных из бэкапа "${filename}".\n\nТекущие данные будут заменены. Продолжить?`)) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await axios.post(
                `${API_BASE_URL}/api/backup/restore/${id}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            alert(response.data.message);
            fetchBackups();

        } catch (error: any) {
            console.error("Ошибка восстановления бэкапа:", error);
            alert(error.response?.data?.error || "Ошибка восстановления бэкапа");
        }
    };

    const handleDeleteBackup = async (id: number, filename: string) => {
        if (!confirm(`Удалить бэкап "${filename}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await axios.delete(
                `${API_BASE_URL}/api/backup/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            alert(response.data.message);
            fetchBackups();

        } catch (error: any) {
            console.error("Ошибка удаления бэкапа:", error);
            alert(error.response?.data?.error || "Ошибка удаления бэкапа");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ru-RU');
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2"></div>
            </div>
        );
    }

    return (
        <section className="mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Управление бэкапами базы данных</h1>
                {isAdmin && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button>Создать бэкап</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Создать новый бэкап</AlertDialogTitle>
                            </AlertDialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Комментарий (необязательно)</label>
                                    <Textarea
                                        placeholder="Например: Бэкап перед обновлением системы"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                {error && <div className="text-red-500 text-sm">{error}</div>}
                                {success && <div className="text-green-500 text-sm">{success}</div>}
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <Button onClick={handleCreateBackup} disabled={creating}>
                                    {creating ? "Создание..." : "Создать бэкап"}
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            {/* Статистика */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="border rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-500">Всего бэкапов</h3>
                        <p className="text-2xl font-bold">{stats.total_backups}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-500">Общий размер</h3>
                        <p className="text-2xl font-bold">{stats.total_size_formatted}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-500">Восстановлено</h3>
                        <p className="text-2xl font-bold">{stats.restored_count}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-500">Последний бэкап</h3>
                        <p className="text-lg font-bold">
                            {stats.last_backup ? formatDate(stats.last_backup) : "Нет данных"}
                        </p>
                    </div>
                </div>
            )}

            {/* Список бэкапов */}
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Файл</TableHead>
                            <TableHead>Размер</TableHead>
                            <TableHead>Создан</TableHead>
                            <TableHead>Комментарий</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {backups.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    Бэкапы не найдены
                                </TableCell>
                            </TableRow>
                        ) : (
                            backups.map((backup) => (
                                <TableRow key={backup.id}>
                                    <TableCell className="font-medium">{backup.filename}</TableCell>
                                    <TableCell>{formatSize(backup.filesize)}</TableCell>
                                    <TableCell>
                                        <div>{formatDate(backup.created_at)}</div>
                                        <div className="text-sm text-gray-500">
                                            {backup.created_by_username || "Система"}
                                        </div>
                                    </TableCell>
                                    <TableCell>{backup.comment || "-"}</TableCell>
                                    <TableCell>
                                        {backup.restored_at ? (
                                            <div className="text-green-600">
                                                <div>Восстановлен</div>
                                                <div className="text-sm">{formatDate(backup.restored_at)}</div>
                                                <div className="text-sm">{backup.restored_by_username}</div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">Не восстановлен</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownloadBackup(backup.id, backup.filename)}
                                            >
                                                Скачать
                                            </Button>

                                            {isAdmin && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRestoreBackup(backup.id, backup.filename)}
                                                    >
                                                        Восстановить
                                                    </Button>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm">
                                                                Удалить
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Удалить бэкап?</AlertDialogTitle>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteBackup(backup.id, backup.filename)}>
                                                                    Удалить
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </section>
    );
}
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, RefreshCw } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useUser } from "@/hooks/useUser";
import CreateBackupDialog from "@/components/Dialog/CreateBackupDialog";
import { ScrollToTop } from "@/components/ScrollToTop";
import { DataTable } from "@/components/ui/DataTable";
import type { Backup } from "@/types/backup.types";
import type { ColumnDef } from "@tanstack/react-table";

export default function Backups() {
    const { isAdmin } = useUser();
    const [backups, setBackups] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [downloading, setDownloading] = useState<number | null>(null);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const fetchBackups = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/backups`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBackups(response.data.backups || []);
        } catch (error: unknown) {
            console.error("Ошибка загрузки бэкапов:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    const handleDeleteBackup = async (id: number) => {
        try {
            setDeleting(id);
            const token = localStorage.getItem("token");
            await axios.delete(`${API_BASE_URL}/backups/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBackups(backups.filter((backup) => backup.id !== id));
        } catch (error: unknown) {
            console.error("Ошибка удаления бэкапа:", error);
            alert("Не удалось удалить бэкап");
        } finally {
            setDeleting(null);
        }
    };

    const handleDownloadBackup = async (id: number, filename: string) => {
        try {
            setDownloading(id);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/backups/${id}/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob"
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error: unknown) {
            console.error("Ошибка скачивания бэкапа:", error);
            alert("Не удалось скачать бэкап");
        } finally {
            setDownloading(null);
        }
    };

    const handleDeleteSelected = async (selectedIds: number[]) => {
        if (!confirm(`Вы уверены, что хотите удалить ${selectedIds.length} бэкап(ов)?`)) {
            return;
        }
        try {
            const token = localStorage.getItem("token");
            for (const id of selectedIds) {
                await axios.delete(`${API_BASE_URL}/backups/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setBackups(backups.filter((backup) => !selectedIds.includes(backup.id)));
        } catch (error: unknown) {
            console.error("Ошибка удаления бэкапов:", error);
            alert("Не удалось удалить бэкапы");
        }
    };

    const columns = useMemo<ColumnDef<Backup>[]>(
        () => [
            {
                id: "select",
                header: ({ table }) => (
                    <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />
                ),
                cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
                enableSorting: false,
                enableHiding: false
            },
            {
                accessorKey: "id",
                header: "ID"
            },
            {
                accessorKey: "filename",
                header: "Имя файла"
            },
            {
                accessorKey: "description",
                header: "Описание",
                cell: ({ row }) => <div>{row.original.description || "-"}</div>
            },
            {
                accessorKey: "file_size",
                header: "Размер",
                cell: ({ row }) => <div>{formatFileSize(row.original.file_size)}</div>
            },
            {
                accessorKey: "created_by_username",
                header: "Создал",
                cell: ({ row }) => {
                    const username = row.original.created_by_username;
                    const createdById = row.original.created_by;
                    if (!username || !createdById) return <div>-</div>;
                    return (
                        <Link to={`/profile/${createdById}`} className="text-blue-500">
                            {username}
                        </Link>
                    );
                }
            },
            {
                accessorKey: "created_at",
                header: "Дата создания",
                cell: ({ row }) => <div>{new Date(row.original.created_at).toLocaleString("ru-RU")}</div>
            },
            {
                accessorKey: "actions",
                header: "Функции",
                cell: ({ row }) => {
                    const backup = row.original;
                    const isDownloading = downloading === backup.id;
                    const isDeleting = deleting === backup.id;
                    return (
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => handleDownloadBackup(backup.id, backup.filename)} disabled={isDownloading || !backup.file_exists} title="Скачать бэкап">
                                <Download className={`h-4 w-4 ${isDownloading ? "animate-pulse" : ""}`} />
                            </Button>
                            {isAdmin && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" disabled={isDeleting} title="Удалить бэкап">
                                            <img src="/trash.png" className={`icon w-5 ${isDeleting ? "animate-pulse" : ""}`} alt="Удалить" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Удалить бэкап "{backup.filename}"?</AlertDialogTitle>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteBackup(backup.id)} className="bg-red-600 hover:bg-red-700">
                                                Удалить
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    );
                }
            }
        ],
        [isAdmin, downloading, deleting]
    );

    const totalSize = backups.reduce((sum, b) => sum + b.file_size, 0);

    return (
        <section className="mx-auto">
            <ScrollToTop />
            <div className="flex justify-between items-center mb-6 gap-1">
                <h1 className="text-2xl font-bold text-wrap">Бэкапы базы данных</h1>
                {isAdmin && <CreateBackupDialog onBackupCreated={fetchBackups} />}
            </div>

            <DataTable
                columns={columns}
                data={backups}
                loading={loading}
                searchPlaceholder="Поиск по имени файла..."
                onDeleteSelected={isAdmin ? handleDeleteSelected : undefined}
                showCheckboxes={isAdmin}
                exportFilename="backups"
                exportTitle="Бэкапы базы данных"
                exportColumns={[
                    { accessorKey: "id", header: "ID" },
                    { accessorKey: "filename", header: "Имя файла" },
                    { accessorKey: "description", header: "Описание" },
                    {
                        accessorKey: "file_size",
                        header: "Размер",
                        format: (value) => formatFileSize(value as number)
                    },
                    { accessorKey: "created_by_username", header: "Создал" },
                    {
                        accessorKey: "created_at",
                        header: "Дата создания",
                        format: (value) => new Date(value as string).toLocaleString()
                    }
                ]}
            />
            {backups.length > 0 && <div className="text-right text-sm text-muted-foreground mt-2">Общий размер: {formatFileSize(totalSize)}</div>}
        </section>
    );
}

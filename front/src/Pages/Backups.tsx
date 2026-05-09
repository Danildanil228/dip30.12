import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useUser } from "@/hooks/useUser";
import { useBackups } from "@/hooks/useBackups";
import CreateBackupDialog from "@/components/Dialog/CreateBackupDialog";
import { ScrollToTop } from "@/components/ScrollToTop";
import { DataTable } from "@/components/ui/DataTable";
import { ExportDropdown } from "@/components/ExportDropdown";
import type { Backup } from "@/types/backup.types";
import type { ColumnDef } from "@tanstack/react-table";
import type { ExportColumn } from "@/services/exportService";

const formatDate = (value: unknown): string => {
    if (!value) return "";
    try {
        const date = new Date(value as string);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleDateString("ru-RU") + " " + date.toLocaleTimeString("ru-RU");
    } catch {
        return "";
    }
};

const formatFileSize = (bytes: unknown): string => {
    if (!bytes) return "0 B";
    const numBytes = typeof bytes === "number" ? bytes : parseInt(String(bytes));
    if (isNaN(numBytes) || numBytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function Backups() {
    const { isAdmin } = useUser();
    const { backups, loading, downloading, deleteBackup, downloadBackup, fetchBackups } = useBackups();

    const handleDeleteBackup = async (id: number) => {
        try {
            await deleteBackup(id);
        } catch (error) {
            alert("Не удалось удалить бэкап");
        }
    };

    const handleDownloadBackup = async (id: number, filename: string) => {
        try {
            await downloadBackup(id, filename);
        } catch (error) {
            alert("Не удалось скачать бэкап");
        }
    };

    const handleDeleteSelected = async (selectedIds: number[]) => {
        if (!confirm(`Вы уверены, что хотите удалить ${selectedIds.length} бэкап(ов)?`)) {
            return;
        }
        try {
            for (const id of selectedIds) {
                await deleteBackup(id);
            }
        } catch (error) {
            alert("Не удалось удалить бэкапы");
        }
    };

    const exportColumns: ExportColumn<Backup>[] = [
        { key: "id", header: "ID" },
        { key: "filename", header: "Имя файла" },
        { key: "description", header: "Описание", format: (v) => v || "-" },
        { key: "file_size", header: "Размер", format: (v) => formatFileSize(v) },
        { key: "created_by_username", header: "Создал", format: (v) => v || "-" },
        { key: "created_at", header: "Дата создания", format: (v) => formatDate(v) },
    ];

    const columns: ColumnDef<Backup>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "filename",
            header: "Имя файла",
        },
        {
            accessorKey: "description",
            header: "Описание",
            cell: ({ row }) => <div>{row.original.description || "-"}</div>,
        },
        {
            accessorKey: "file_size",
            header: "Размер",
            cell: ({ row }) => {
                const size = row.original.file_size;
                return <div>{formatFileSize(size)}</div>;
            },
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
            },
        },
        {
            accessorKey: "created_at",
            header: "Дата создания",
            cell: ({ row }) => <div>{formatDate(row.original.created_at)}</div>,
        },
        {
            id: "actions",
            header: "Функции",
            cell: ({ row }) => {
                const backup = row.original;
                const isDownloading = downloading === backup.id;
                return (
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => handleDownloadBackup(backup.id, backup.filename)} disabled={isDownloading || !backup.file_exists} title="Скачать бэкап">
                            <Download className={`h-4 w-4 ${isDownloading ? "animate-pulse" : ""}`} />
                        </Button>
                        {isAdmin && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" title="Удалить бэкап">
                                        <img src="/trash.png" className="icon w-5" alt="Удалить" />
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
            },
        },
    ];

    const customToolbar = <ExportDropdown data={backups} columns={exportColumns} filename="backups" title="Бэкапы базы данных" />;

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
                customToolbar={customToolbar}
                showCheckboxes={isAdmin}
            />
        </section>
    );
}

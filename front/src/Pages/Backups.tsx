import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
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
    let num: number;
    if (typeof bytes === "bigint") {
        num = Number(bytes);
    } else if (typeof bytes === "string") {
        num = parseInt(bytes, 10);
    } else if (typeof bytes === "number") {
        num = bytes;
    } else {
        return "0 B";
    }

    if (isNaN(num) || num === 0) return "0 B";

    const units = ["B", "KB", "MB", "GB", "TB"];
    let unitIndex = 0;
    let size = num;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
};

export default function Backups() {
    const { isAdmin } = useUser();
    const { backups, loading, downloading, deleteBackup, downloadBackup, fetchBackups } = useBackups();

    // const totalSize = backups.reduce((sum, b) => {
    //     const size = typeof b.file_size === "bigint" ? Number(b.file_size) : typeof b.file_size === "string" ? parseInt(b.file_size, 10) : b.file_size || 0;
    //     return sum + size;
    // }, 0);

    const handleDeleteBackup = async (id: number) => {
        try {
            await deleteBackup(id);
        } catch (error) {
            alert("Не удалось удалить бэкап");
        }
    };

    const handleDeleteSelected = async (selectedIds: number[]) => {
        if (!confirm(`Удалить ${selectedIds.length} бэкап(ов)?`)) return;
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
        { key: "description", header: "Описание", format: (v) => v || "—" },
        { key: "file_size", header: "Размер", format: (v) => formatFileSize(v) },
        { key: "created_by_username", header: "Создал", format: (v) => v || "—" },
        { key: "created_at", header: "Создан", format: (v) => formatDate(v) },
    ];

    const columns: ColumnDef<Backup>[] = [
        { accessorKey: "id", header: "ID" },
        {
            accessorKey: "filename",
            header: "Имя файла",
            cell: ({ row }) => <span className="font-medium font-mono text-sm">{row.original.filename}</span>,
        },
        {
            accessorKey: "description",
            header: "Описание",
            cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.description || "—"}</span>,
        },
        {
            accessorKey: "file_size",
            header: "Размер",
            cell: ({ row }) => <span className="text-sm tabular-nums">{formatFileSize(row.original.file_size)}</span>,
        },
        {
            accessorKey: "created_by_username",
            header: "Создал",
            cell: ({ row }) => {
                const username = row.original.created_by_username;
                const createdById = row.original.created_by;
                return username && createdById ? (
                    <Link to={`/profile/${createdById}`} className="text-primary hover:underline text-sm">
                        {username}
                    </Link>
                ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: "Создан",
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.created_at)}</span>,
        },
        {
            id: "actions",
            header: "Действия",
            cell: ({ row }) => {
                const backup = row.original;
                const isDownloading = downloading === backup.id;
                return (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => downloadBackup(backup.id, backup.filename)} disabled={isDownloading || !backup.file_exists} title="Скачать">
                            <Download className={`h-4 w-4 ${isDownloading ? "animate-pulse" : ""}`} />
                        </Button>
                        {isAdmin && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <img src="/trash.png" className="icon w-4" alt="Удалить" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Удалить бэкап «{backup.filename}»?</AlertDialogTitle>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteBackup(backup.id)} className="bg-destructive hover:bg-destructive/90">
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

    const customToolbar = (
        <div className="flex items-center gap-2">
            <ExportDropdown data={backups} columns={exportColumns} filename="backups" title="Бэкапы" />
        </div>
    );

    const existingBackups = backups.filter((b) => b.file_exists);
    const totalSizeOnDisk = existingBackups.reduce((sum, b) => {
        const size = typeof b.file_size === "bigint" ? Number(b.file_size) : typeof b.file_size === "string" ? parseInt(b.file_size, 10) : b.file_size || 0;
        return sum + size;
    }, 0);
    const missingCount = backups.length - existingBackups.length;

    return (
        <div className="space-y-6">
            <ScrollToTop />

            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Бэкапы базы данных</h1>
                    <p className="text-muted-foreground mt-1">Резервное копирование и восстановление</p>
                </div>
                {isAdmin && (
                    <CreateBackupDialog
                        onBackupCreated={fetchBackups}
                        triggerButton={
                            <Button>
                                <Plus className="h-4 w-4 mr-1" /> Создать
                            </Button>
                        }
                    />
                )}
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="text-sm text-muted-foreground">Всего записей</div>
                    <div className="text-2xl font-bold mt-1">{backups.length}</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="text-sm text-muted-foreground">Файлов на диске</div>
                    <div className="text-2xl font-bold mt-1">
                        {existingBackups.length}
                        {missingCount > 0 && <span className="text-sm font-normal text-destructive ml-1">(-{missingCount})</span>}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="text-sm text-muted-foreground">Размер на диске</div>
                    <div className="text-2xl font-bold mt-1 tabular-nums">{formatFileSize(totalSizeOnDisk)}</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="text-sm text-muted-foreground">Макс. бэкапов</div>
                    <div className="text-2xl font-bold mt-1">10</div>
                </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <DataTable
                    columns={columns}
                    data={backups}
                    loading={loading}
                    searchPlaceholder="Поиск по имени файла..."
                    onDeleteSelected={isAdmin ? handleDeleteSelected : undefined}
                    customToolbar={customToolbar}
                    showCheckboxes={isAdmin}
                />
            </motion.div>
        </div>
    );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Plus, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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

    const [deleteSingleOpen, setDeleteSingleOpen] = useState(false);
    const [deleteSingleBackup, setDeleteSingleBackup] = useState<Backup | null>(null);

    const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
    const [deleteMultipleIds, setDeleteMultipleIds] = useState<number[]>([]);

    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const existingBackups = backups.filter((b) => b.file_exists);
    const totalSizeOnDisk = existingBackups.reduce((sum, b) => {
        const size = typeof b.file_size === "bigint" ? Number(b.file_size) : typeof b.file_size === "string" ? parseInt(b.file_size, 10) : b.file_size || 0;
        return sum + size;
    }, 0);
    const missingCount = backups.length - existingBackups.length;

    const handleSingleDelete = (backup: Backup) => {
        setDeleteSingleBackup(backup);
        setDeleteSingleOpen(true);
    };

    const confirmSingleDelete = async () => {
        if (!deleteSingleBackup) return;
        try {
            await deleteBackup(deleteSingleBackup.id);
            setDeleteSingleOpen(false);
            setDeleteSingleBackup(null);
        } catch {
            setErrorMessage("Не удалось удалить бэкап");
            setErrorOpen(true);
            setDeleteSingleOpen(false);
            setDeleteSingleBackup(null);
        }
    };

    const handleMultipleDelete = (selectedIds: number[]) => {
        setDeleteMultipleIds(selectedIds);
        setDeleteMultipleOpen(true);
    };

    const confirmMultipleDelete = async () => {
        try {
            for (const id of deleteMultipleIds) {
                await deleteBackup(id);
            }
            setDeleteMultipleOpen(false);
            setDeleteMultipleIds([]);
        } catch {
            setErrorMessage("Не удалось удалить бэкапы");
            setErrorOpen(true);
            setDeleteMultipleOpen(false);
            setDeleteMultipleIds([]);
        }
    };

    const exportColumns: ExportColumn<Backup>[] = [
        { key: "id", header: "ID" },
        { key: "filename", header: "Имя файла" },
        { key: "description", header: "Описание", format: (v) => v || "" },
        { key: "file_size", header: "Размер", format: (v) => formatFileSize(v) },
        { key: "created_by_username", header: "Создал", format: (v) => v || "" },
        { key: "created_at", header: "Создан", format: (v) => formatDate(v) },
    ];

    const columns: ColumnDef<Backup>[] = [
        { accessorKey: "id", header: "ID" },
        {
            accessorKey: "filename",
            header: "Имя файла",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className={`font-medium font-mono text-sm ${!row.original.file_exists ? "text-muted-foreground/50 line-through" : ""}`}>{row.original.filename}</span>
                </div>
            ),
        },
        {
            accessorKey: "description",
            header: "Описание",
            cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.description || ""}</span>,
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
                    <span className="text-muted-foreground text-sm"></span>
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
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSingleDelete(backup)}>
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
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
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="text-sm text-muted-foreground">Всего записей</div>
                    <div className="text-2xl font-bold mt-1">{backups.length}</div>
                </div>
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="text-sm text-muted-foreground">Файлов на диске</div>
                    <div className="text-2xl font-bold mt-1">
                        {existingBackups.length}
                        {missingCount > 0 && <span className="text-sm font-normal text-destructive ml-1">(-{missingCount})</span>}
                    </div>
                </div>
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="text-sm text-muted-foreground">Размер на диске</div>
                    <div className="text-2xl font-bold mt-1 tabular-nums">{formatFileSize(totalSizeOnDisk)}</div>
                </div>
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="text-sm text-muted-foreground">Макс. бэкапов</div>
                    <div className="text-2xl font-bold mt-1">10</div>
                </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <DataTable
                    columns={columns}
                    data={backups}
                    loading={loading}
                    searchPlaceholder="Поиск по имени файла..."
                    onDeleteSelected={isAdmin ? handleMultipleDelete : undefined}
                    customToolbar={customToolbar}
                    showCheckboxes={isAdmin}
                />
            </div>

            <AlertDialog open={deleteSingleOpen} onOpenChange={setDeleteSingleOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удаление бэкапа</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить бэкап <span>{deleteSingleBackup?.filename}</span>
                            ?
                            <br />
                            <span>Бэкап будет перемещен в корзину для дальнейшего удаления.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmSingleDelete}>Удалить</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={deleteMultipleOpen} onOpenChange={setDeleteMultipleOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить выбранные бекапы?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить <span>{deleteMultipleIds.length}</span>{" "}
                            {deleteMultipleIds.length === 1 ? "бэкап" : deleteMultipleIds.length >= 2 && deleteMultipleIds.length <= 4 ? "бэкапа" : "бэкапов"}
                            ?
                            <br />
                            <span>Выбранные бюкапы будут перемещны в корзину для дальнейшего удаления.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmMultipleDelete}>Удалить</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={errorOpen} onOpenChange={setErrorOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ошибка</AlertDialogTitle>
                        <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Закрыть</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type ColumnFiltersState, type SortingState, type VisibilityState, } from "@tanstack/react-table";
import { ArrowUpDown, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog";
import { useUser } from "@/hooks/useUser";
import CreateBackupDialog from "@/components/CreateBackupDialog";
import { Link } from "react-router-dom";
import ExportButton from "@/components/ExportButton";

interface Backup {
    id: number;
    filename: string;
    filepath: string;
    file_size: number;
    created_by: number | null;
    created_at: string;
    description: string | null;
    created_by_username: string | null;
    name: string | null;
    secondname: string | null;
    file_exists: boolean;
}

export default function Backups() {
    const { isAdmin } = useUser();
    const [backups, setBackups] = useState<Backup[]>([]);
    const [showAll, setShowAll] = useState(false);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    });
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [downloading, setDownloading] = useState<number | null>(null);

    const handleToggleShowAll = () => {
        if (showAll) {
            setPagination({ pageIndex: 0, pageSize: 10 });
        } else {
            setPagination({ pageIndex: 0, pageSize: backups.length });
        }
        setShowAll(!showAll);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleDeleteBackup = async (id: number) => {
        try {
            setDeleting(id);
            const token = localStorage.getItem("token");
            await axios.delete(`${API_BASE_URL}/backups/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBackups(backups.filter((backup) => backup.id !== id));
        } catch (error: any) {
            console.error("Ошибка удаления бэкапа:", error);
            alert(error.response?.data?.error || "Не удалось удалить бэкап");
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
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (error: any) {
            console.error("Ошибка скачивания бэкапа:", error);
            alert(error.response?.data?.error || "Не удалось скачать бэкап");
        } finally {
            setDownloading(null);
        }
    };

    const columns: ColumnDef<Backup>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    className="scale-100"
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    className="scale-100"
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false
        },
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => <div>{row.getValue("id")}</div>
        },
        {
            accessorKey: "filename",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Имя файла
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => <div>{row.getValue("filename")}</div>
        },
        {
            accessorKey: "description",
            header: "Описание",
            cell: ({ row }) => <div>{row.getValue("description") || "-"}</div>
        },
        {
            accessorKey: "file_size",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Размер
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const size = row.getValue("file_size") as number;
                return <div>{formatFileSize(size)}</div>;
            }
        },
        {
            accessorKey: "created_by_username",
            header: "Создал",
            cell: ({ row }) => {
                const username = row.getValue("created_by_username") as string;
                const createdById = row.original.created_by;

                if (!username || !createdById) {
                    return <div>-</div>;
                }

                return (
                    <Link
                        to={`/profile/${createdById}`}
                        className="text-blue-500"
                    >
                        {username}
                    </Link>
                );
            }
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Дата создания
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const date = new Date(row.getValue("created_at"));
                return <div>{date.toLocaleString("ru-RU")}</div>;
            }
        },
        {
            accessorKey: "actions",
            header: 'Функции',
            cell: ({ row }) => {
                const backup = row.original;
                const isDownloading = downloading === backup.id;
                const isDeleting = deleting === backup.id;

                return (
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadBackup(backup.id, backup.filename)}
                            disabled={isDownloading || !backup.file_exists}
                            title="Скачать бэкап"
                        >
                            <Download className={`h-4 w-4 ${isDownloading ? 'animate-pulse' : ''}`} />
                        </Button>

                        {isAdmin && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={isDeleting}
                                        title="Удалить бэкап"
                                    >
                                        <img
                                            src="/trash.png"
                                            className={`icon w-5 ${isDeleting ? 'animate-pulse' : ''}`}
                                            alt="Удалить"
                                        />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Удалить бэкап "{backup.filename}"?
                                        </AlertDialogTitle>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleDeleteBackup(backup.id)}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
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
    ];

    const fetchBackups = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/backups`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBackups(response.data.backups || []);
        } catch (error: any) {
            console.error("Ошибка загрузки бэкапов:", error);
            if (error.response?.status === 403) {
                alert("Недостаточно прав для просмотра бэкапов");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    const handleDeleteSelected = async () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows;
        const selectedIds = selectedRows.map((row) => row.original.id);

        if (selectedIds.length === 0) {
            alert("Выберите бэкапы для удаления");
            return;
        }

        if (!confirm(`Вы уверены, что хотите удалить ${selectedIds.length} бэкап(ов)?`)) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            for (const id of selectedIds) {
                await axios.delete(`${API_BASE_URL}/backups/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            setBackups(backups.filter((backup) => !selectedIds.includes(backup.id)));
            setRowSelection({});
        } catch (error: any) {
            console.error("Ошибка удаления бэкапов:", error);
            alert(error.response?.data?.error || "Не удалось удалить бэкапы");
        }
    };

    const table = useReactTable({
        data: backups,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
    });

    const selectedCount = table.getFilteredSelectedRowModel().rows.length;

    if (loading) {
        return (
            <section className="mx-auto">
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2"></div>
                </div>
            </section>
        );
    }

    const backupColumnsForExport = [
        { accessorKey: "id", header: "ID" },
        { accessorKey: "filename", header: "Имя файла" },
        { accessorKey: "description", header: "Описание" },
        {
            accessorKey: "file_size",
            header: "Размер",
            format: (value: number) => {
                if (value === 0) return '0 B';
                const k = 1024;
                const sizes = ['B', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(value) / Math.log(k));
                return parseFloat((value / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            }
        },
        { accessorKey: "created_by_username", header: "Создал" },
        {
            accessorKey: "created_at",
            header: "Дата создания",
            format: (value: string) => new Date(value).toLocaleString()
        }
    ];

    return (
        <section className="mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Бэкапы базы данных</h1>
                {isAdmin && (
                    <div className="flex gap-2">
                        <CreateBackupDialog onBackupCreated={fetchBackups} />
                    </div>
                )}
            </div>

            <div className="w-full">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 py-4">
                    <Input
                        placeholder="Поиск по имени файла..."
                        value={(table.getColumn("filename")?.getFilterValue() as string) ?? ""}
                        onChange={(event) => table.getColumn("filename")?.setFilterValue(event.target.value)}
                        className="max-w-sm"
                    />

                    {selectedCount > 0 && (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                Выбрано: {selectedCount}
                            </span>
                            {isAdmin && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">Удалить выбранные</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Будет удалено {selectedCount} бэкап(ов). Это действие нельзя отменить.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeleteSelected}>
                                                Удалить
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    )}

                    <div className="ml-auto flex gap-2">
                        <ExportButton
                            data={backups}
                            columns={backupColumnsForExport}
                            filename="backups"
                            title="Бэкапы базы данных"
                        />
                        <Button variant="outline" onClick={fetchBackups}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Обновить
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        Нет бэкапов. Создайте первый бэкап.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 py-4">
                    <div className="text-sm text-gray-600">
                        Бэкапов: {table.getFilteredRowModel().rows.length}
                        {backups.length > 0 && (
                            <span className="ml-2">
                                (Общий размер: {formatFileSize(backups.reduce((sum, b) => sum + b.file_size, 0))})
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        {backups.length > 10 && (
                            <Button
                                variant="outline"
                                onClick={handleToggleShowAll}
                                className="ml-2"
                            >
                                {showAll ? 'Свернуть' : 'Развернуть'}
                            </Button>
                        )}

                        {!showAll && table.getPageCount() > 1 && (
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    {'<'}
                                </Button>
                                <span className="text-sm">
                                    Стр. {table.getState().pagination.pageIndex + 1} из{" "}
                                    {table.getPageCount()}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    {'>'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
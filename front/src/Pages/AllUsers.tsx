import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Plus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import AddUserDialog from "@/components/Dialog/AddUserDialog";
import { ScrollToTop } from "@/components/ScrollToTop";
import { DataTable } from "@/components/ui/DataTable";
import { ExportDropdown } from "@/components/ExportDropdown";
import { useUsers } from "@/hooks/useUsers";
import { useUser } from "@/hooks/useUser";
import type { User } from "@/types/user.types";
import type { ColumnDef } from "@tanstack/react-table";
import type { ExportColumn } from "@/services/exportService";

const formatDate = (value: unknown): string => {
    if (!value) return "";
    try {
        const date = new Date(value as string);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleDateString("ru-RU");
    } catch {
        return "";
    }
};

export default function AllUsers() {
    const { users, loading, deleteUser } = useUsers();
    const { user: currentUser } = useUser();

    const adminCount = users.filter((u) => u.role === "admin").length;
    const accountantCount = users.filter((u) => u.role === "accountant").length;
    const storekeeperCount = users.filter((u) => u.role === "storekeeper").length;

    const handleDeleteUser = async (id: number) => {
        if (currentUser?.id === id) {
            alert("Вы не можете удалить свой собственный аккаунт!");
            return;
        }
        try {
            await deleteUser(id);
        } catch (error) {
            alert("Не удалось удалить пользователя");
        }
    };

    const handleDeleteSelected = async (selectedIds: number[]) => {
        if (currentUser && selectedIds.includes(currentUser.id)) {
            alert("Вы не можете удалить свой собственный аккаунт!");
            return;
        }
        try {
            for (const id of selectedIds) {
                await deleteUser(id);
            }
        } catch (error) {
            alert("Не удалось удалить пользователей");
        }
    };

    const exportColumns: ExportColumn<User>[] = [
        { key: "id", header: "ID" },
        { key: "username", header: "Логин" },
        { key: "name", header: "Имя" },
        { key: "secondname", header: "Фамилия" },
        {
            key: "role",
            header: "Роль",
            format: (v) => (v === "admin" ? "Администратор" : v === "accountant" ? "Бухгалтер" : "Кладовщик"),
        },
        { key: "created_at", header: "Дата создания", format: (v) => formatDate(v) },
    ];

    const columns = useMemo<ColumnDef<User>[]>(
        () => [
            {
                accessorKey: "id",
                header: "ID",
            },
            {
                accessorKey: "username",
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Логин
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => <span className="font-medium">{row.original.username}</span>,
            },
            {
                accessorKey: "name",
                header: "Имя",
                cell: ({ row }) => (
                    <span>
                        {row.original.name} {row.original.secondname}
                    </span>
                ),
            },
            {
                accessorKey: "role",
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Роль
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const role = row.original.role;
                    const roleName = role === "admin" ? "Администратор" : role === "accountant" ? "Бухгалтер" : "Кладовщик";
                    const colorClass = role === "admin" ? "text-blue-600 dark:text-blue-400" : role === "accountant" ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400";
                    return <span className={`font-medium text-sm ${colorClass}`}>{roleName}</span>;
                },
            },
            {
                accessorKey: "created_at",
                header: "Дата создания",
                cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.created_at)}</span>,
            },
            {
                id: "actions",
                header: "Действия",
                cell: ({ row }) => {
                    const user = row.original;
                    if (user.id === currentUser?.id) {
                        return <span className="text-xs text-muted-foreground">Это вы</span>;
                    }
                    return (
                        <div className="flex items-center gap-2">
                            <Link to={`/profile/${user.id}`} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent">
                                <img src="/profile.png" className="icon w-4" alt="Профиль" title="Перейти в профиль" />
                            </Link>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <img src="/trash.png" className="w-4 icon" alt="Удалить" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Удалить пользователя {user.username}?</AlertDialogTitle>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Удалить</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    );
                },
            },
        ],
        [currentUser],
    );

    const customToolbar = (
        <div className="flex items-center gap-2">
            <ExportDropdown data={users} columns={exportColumns} filename="users" title="Пользователи" />
        </div>
    );

    return (
        <div className="space-y-6">
            <ScrollToTop />

            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Пользователи</h1>
                    <p className="text-muted-foreground mt-1">Управление учётными записями</p>
                </div>
                <AddUserDialog
                    onUserCreated={() => window.location.reload()}
                    triggerButton={
                        <Button>
                            <Plus className="h-4 w-4 mr-1" /> Добавить
                        </Button>
                    }
                />
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="text-sm text-muted-foreground">Всего</div>
                    <div className="text-2xl font-bold mt-1">{users.length}</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="text-sm text-muted-foreground">Админы</div>
                    <div className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{adminCount}</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="text-sm text-muted-foreground">Бухгалтеры</div>
                    <div className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{accountantCount}</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="text-sm text-muted-foreground">Кладовщики</div>
                    <div className="text-2xl font-bold mt-1 text-orange-600 dark:text-orange-400">{storekeeperCount}</div>
                </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <DataTable columns={columns} data={users} loading={loading} searchPlaceholder="Поиск по логину или имени..." onDeleteSelected={handleDeleteSelected} customToolbar={customToolbar} showCheckboxes={true} />
            </motion.div>
        </div>
    );
}

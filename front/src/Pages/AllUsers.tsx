import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Plus, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import AddUserDialog from "@/components/Dialog/AddUserDialog";
import { ScrollToTop } from "@/components/ScrollToTop";
import { DataTable } from "@/components/ui/DataTable";
import { ExportDropdown } from "@/components/ExportDropdown";
import { useUsers } from "@/hooks/useUsers";
import { useUser } from "@/hooks/useUser";
import type { User } from "@/types/user.types";
import type { ColumnDef } from "@tanstack/react-table";
import type { ExportColumn } from "@/services/exportService";
import OnboardingTour from "@/components/OnboardingTour";

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
    const { users, loading, deleteUser, fetchUsers } = useUsers();
    const { user, user: currentUser } = useUser();
    const [deleteSingleOpen, setDeleteSingleOpen] = useState(false);
    const [deleteSingleUser, setDeleteSingleUser] = useState<User | null>(null);

    const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
    const [deleteMultipleIds, setDeleteMultipleIds] = useState<number[]>([]);

    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const adminCount = users.filter((u) => u.role === "admin").length;
    const accountantCount = users.filter((u) => u.role === "accountant").length;
    const storekeeperCount = users.filter((u) => u.role === "storekeeper").length;

    const handleDeleteClick = (user: User) => {
        if (user.id === currentUser?.id) {
            setErrorMessage("Вы не можете удалить свой собственный аккаунт");
            setErrorOpen(true);
            return;
        }
        setDeleteSingleUser(user);
        setDeleteSingleOpen(true);
    };

    const confirmSingleDelete = async () => {
        if (!deleteSingleUser) return;
        try {
            await deleteUser(deleteSingleUser.id);
            setDeleteSingleOpen(false);
            setDeleteSingleUser(null);
        } catch {
            setErrorMessage("Не удалось удалить пользователя");
            setErrorOpen(true);
            setDeleteSingleOpen(false);
            setDeleteSingleUser(null);
        }
    };

    const handleDeleteSelected = (selectedIds: number[]) => {
        if (currentUser && selectedIds.includes(currentUser.id)) {
            setErrorMessage("Вы не можете удалить свой собственный аккаунт");
            setErrorOpen(true);
            return;
        }
        setDeleteMultipleIds(selectedIds);
        setDeleteMultipleOpen(true);
    };

    const confirmMultipleDelete = async () => {
        try {
            for (const id of deleteMultipleIds) {
                await deleteUser(id);
            }
            setDeleteMultipleOpen(false);
            setDeleteMultipleIds([]);
        } catch {
            setErrorMessage("Не удалось удалить пользователей");
            setErrorOpen(true);
            setDeleteMultipleOpen(false);
            setDeleteMultipleIds([]);
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
            // {
            //     accessorKey: "id",
            //     header: "ID",
            // },
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
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Дата создания
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
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
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteClick(user)}>
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
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
                    onUserCreated={fetchUsers}
                    triggerButton={
                        <Button data-tour="users-add-btn">
                            <Plus className="h-4 w-4 mr-1" /> Добавить
                        </Button>
                    }
                />
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="text-sm text-muted-foreground">Всего</div>
                    <div className="text-2xl font-bold mt-1">{users.length}</div>
                </div>
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="text-sm text-muted-foreground">Админы</div>
                    <div className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{adminCount}</div>
                </div>
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="text-sm text-muted-foreground">Бухгалтеры</div>
                    <div className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{accountantCount}</div>
                </div>
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="text-sm text-muted-foreground">Кладовщики</div>
                    <div className="text-2xl font-bold mt-1 text-orange-600 dark:text-orange-400">{storekeeperCount}</div>
                </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <DataTable columns={columns} data={users} loading={loading} searchPlaceholder="Поиск по логину или имени..." onDeleteSelected={handleDeleteSelected} customToolbar={customToolbar} showCheckboxes={true} />
            </div>

            <AlertDialog open={deleteSingleOpen} onOpenChange={setDeleteSingleOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удаление пользователя</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить пользователя {deleteSingleUser?.username}?
                            <br />
                            <span>Пользователи будет перемещен в корзину для дальнейшего удаления.</span>
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
                        <AlertDialogTitle>Удалить выбранных пользователей?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить {deleteMultipleIds.length}{" "}
                            {deleteMultipleIds.length === 1 ? "пользователя" : deleteMultipleIds.length >= 2 && deleteMultipleIds.length <= 4 ? "пользователей" : "пользователей"}
                            ?
                            <br />
                            <span>Выбранные пользователи будут перемещены в корзину.</span>
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
            <OnboardingTour
                pageKey="users"
                steps={[
                    {
                        targetSelector: "[data-tour='users-add-btn']",
                        title: "Добавить пользователя",
                        description: "Создайте учётную запись для сотрудника с нужной ролью.",
                        placement: "bottom",
                    },
                ]}
                user={user}
            />
        </div>
    );
}

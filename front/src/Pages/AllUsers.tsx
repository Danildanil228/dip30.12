import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
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
            },
            {
                accessorKey: "name",
                header: "Имя",
            },
            {
                accessorKey: "secondname",
                header: "Фамилия",
            },
            {
                accessorKey: "role",
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Роль
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => <div className="capitalize">{row.original.role === "admin" ? "Администратор" : row.original.role === "accountant" ? "Бухгалтер" : "Кладовщик"}</div>,
            },
            {
                accessorKey: "created_at",
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Дата создания
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => <div>{formatDate(row.original.created_at)}</div>,
            },
            {
                id: "actions",
                header: "Функции",
                cell: ({ row }) => {
                    const user = row.original;
                    if (user.id === currentUser?.id) {
                        return <span className="text-gray-400">Вы</span>;
                    }
                    return (
                        <div className="flex gap-5">
                            <Link to={`/profile/${user.id}`} className="text-blue-500 hover:text-blue-700">
                                <img src="/profile.png" className="icon w-5" alt="Профиль" title="Перейти в профиль" />
                            </Link>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <img src="/trash.png" className="w-5 icon cursor-pointer" alt="Удалить" />
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

    const customToolbar = <ExportDropdown data={users} columns={exportColumns} filename="users" title="Пользователи" />;

    return (
        <section className="mx-auto">
            <ScrollToTop />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold bg-background z-10">Все пользователи</h1>
                <AddUserDialog onUserCreated={() => window.location.reload()} />
            </div>

            <DataTable columns={columns} data={users} loading={loading} searchPlaceholder="Поиск по логину или имени..." onDeleteSelected={handleDeleteSelected} customToolbar={customToolbar} showCheckboxes={true} />
        </section>
    );
}

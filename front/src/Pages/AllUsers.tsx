import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import AddUserDialog from "@/components/Dialog/AddUserDialog";
import { ScrollToTop } from "@/components/ScrollToTop";
import { DataTable } from "@/components/ui/DataTable";
import type { User } from "@/types/user.types";
import type { ColumnDef } from "@tanstack/react-table";

export default function AllUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data.users);
        } catch (error: unknown) {
            console.error("Ошибка загрузки пользователей:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (id: number) => {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (currentUser.id === id) {
            alert("Вы не можете удалить свой собственный аккаунт!");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_BASE_URL}/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter((user) => user.id !== id));
        } catch (error: unknown) {
            console.error("Ошибка удаления пользователя:", error);
            alert("Не удалось удалить пользователя");
        }
    };

    const handleDeleteSelected = async (selectedIds: number[]) => {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (selectedIds.includes(currentUser.id)) {
            alert("Вы не можете удалить свой собственный аккаунт!");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            for (const id of selectedIds) {
                await axios.delete(`${API_BASE_URL}/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setUsers(users.filter((user) => !selectedIds.includes(user.id)));
        } catch (error: unknown) {
            console.error("Ошибка удаления пользователей:", error);
            alert("Не удалось удалить пользователей");
        }
    };

    const columns = useMemo<ColumnDef<User>[]>(
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
                accessorKey: "username",
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Логин
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            {
                accessorKey: "name",
                header: "Имя"
            },
            {
                accessorKey: "secondname",
                header: "Фамилия"
            },
            {
                accessorKey: "role",
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Роль
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => <div className="capitalize">{row.original.role === "admin" ? "Администратор" : row.original.role === "accountant" ? "Бухгалтер" : "Кладовщик"}</div>
            },
            {
                accessorKey: "created_at",
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Дата создания
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => <div>{new Date(row.original.created_at || "").toLocaleString("ru-RU")}</div>
            },
            {
                accessorKey: "actions",
                header: "Функции",
                cell: ({ row }) => {
                    const user = row.original;
                    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                    if (user.id === currentUser.id) {
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
                }
            }
        ],
        []
    );

    return (
        <section className="mx-auto">
            <ScrollToTop />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Все пользователи</h1>
                <AddUserDialog onUserCreated={fetchUsers} />
            </div>

            <DataTable
                columns={columns}
                data={users}
                loading={loading}
                searchPlaceholder="Поиск по логину или имени..."
                onDeleteSelected={handleDeleteSelected}
                exportFilename="users"
                exportTitle="Пользователи"
                exportColumns={[
                    { accessorKey: "id", header: "ID" },
                    { accessorKey: "username", header: "Логин" },
                    { accessorKey: "name", header: "Имя" },
                    { accessorKey: "secondname", header: "Фамилия" },
                    {
                        accessorKey: "role",
                        header: "Роль",
                        format: (value) => (value === "admin" ? "Администратор" : value === "accountant" ? "Бухгалтер" : "Кладовщик")
                    },
                    {
                        accessorKey: "created_at",
                        header: "Дата создания",
                        format: (value) => new Date(value as string).toLocaleDateString()
                    }
                ]}
            />
        </section>
    );
}

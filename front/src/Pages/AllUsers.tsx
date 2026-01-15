import { useState, useEffect } from "react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type ColumnFiltersState, type SortingState, type VisibilityState, } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import AddUserDialog from "@/components/AddUserDialog";
import ExportButton from "@/components/ExportButton";

interface User {
    id: number;
    username: string;
    role: string;
    name: string;
    secondname: string;
    created_at: string;
}

export default function AllUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [showAll, setShowAll] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    });

    const handleToggleShowAll = () => {
        if (showAll) {
            setPagination({ pageIndex: 0, pageSize: 10 });
        } else {
            setPagination({ pageIndex: 0, pageSize: users.length });
        }
        setShowAll(!showAll);
    };


    const columns: ColumnDef<User>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    className="scale-100 sm:scale-100"
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    className="scale-100 sm:scale-100"
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => <div>{row.getValue("id")}</div>,
        },
        {
            accessorKey: "username",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Логин
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => <div>{row.getValue("username")}</div>,
        },
        {
            accessorKey: "name",
            header: "Имя",
            cell: ({ row }) => <div>{row.getValue("name") || "-"}</div>,
        },
        {
            accessorKey: "secondname",
            header: "Фамилия",
            cell: ({ row }) => <div>{row.getValue("secondname") || "-"}</div>,
        },
        {
            accessorKey: "role",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Роль
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="capitalize">
                    {row.getValue("role") === "admin"
                        ? "Администратор"
                        : row.getValue("role") === "accountant"
                            ? "Бухгалтер"
                            : "Кладовщик"}
                </div>
            ),
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
            },
        },
        {
            accessorKey: "actions",
            header: 'Функции',
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
                                <img
                                    src="/trash.png"
                                    className="w-5 icon cursor-pointer"
                                    alt="Удалить"
                                />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Удалить пользователя {user.username}?
                                    </AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                        Удалить
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                );
            },
        },
    ];

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(response.data.users);
        } catch (error: any) {
            console.error("Ошибка загрузки пользователей:", error);
            if (error.response?.status === 403) {
                alert("Недостаточно прав для просмотра пользователей");
            }
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
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(users.filter((user) => user.id !== id));
        } catch (error: any) {
            console.error("Ошибка удаления пользователя:", error);
            alert(error.response?.data?.error || "Не удалось удалить пользователя");
        }
    };

    const handleDeleteSelected = async () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows;
        const selectedIds = selectedRows.map((row) => row.original.id);
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

        if (selectedIds.includes(currentUser.id)) {
            alert("Вы не можете удалить свой собственный аккаунт!");
            return;
        }

        if (selectedIds.length === 0) {
            alert("Выберите пользователей для удаления");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            for (const id of selectedIds) {
                await axios.delete(`${API_BASE_URL}/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            setUsers(users.filter((user) => !selectedIds.includes(user.id)));
            setRowSelection({});
        } catch (error: any) {
            console.error("Ошибка удаления пользователей:", error);
            alert("Не удалось удалить пользователей");
        }
    };

    const table = useReactTable({
        data: users,
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

    if (loading) {
        return <section className="mx-auto">
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2"></div>
            </div>
        </section>;
    }

    const userColumnsForExport = [
        { accessorKey: "id", header: "ID" },
        { accessorKey: "username", header: "Логин" },
        { accessorKey: "name", header: "Имя" },
        { accessorKey: "secondname", header: "Фамилия" },
        {
            accessorKey: "role",
            header: "Роль",
            format: (value: string) => {
                switch (value) {
                    case 'admin': return 'Администратор';
                    case 'accountant': return 'Бухгалтер';
                    case 'storekeeper': return 'Кладовщик';
                    default: return value;
                }
            }
        },
        {
            accessorKey: "created_at",
            header: "Дата регистрации",
            format: (value: string) => new Date(value).toLocaleDateString()
        }
    ];

    const selectedCount = table.getFilteredSelectedRowModel().rows.length;

    return (
        <section className="mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Все пользователи</h1>
                <AddUserDialog onUserCreated={fetchUsers} />

            </div>

            <div className="w-full">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 py-4">
                    <Input
                        placeholder="Поиск по фамилии..."
                        value={
                            (table.getColumn("secondname")?.getFilterValue() as string) ?? ""
                        }
                        onChange={(event) =>
                            table.getColumn("secondname")?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />

                    {selectedCount > 0 && (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                Выбрано: {selectedCount}
                            </span>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">Удалить пользователей</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteSelected}>
                                            Удалить
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}

                    <div className="ml-auto flex gap-2">
                        <ExportButton
                            data={users}
                            columns={userColumnsForExport}
                            filename="users"
                            title="Пользователи"
                        />
                        <Button variant="outline" onClick={fetchUsers}>
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
                                        Нет пользователей.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 py-4">
                    <div className="text-sm text-gray-600">
                        Пользователей: {table.getFilteredRowModel().rows.length}
                    </div>
                    <div className="flex items-center space-x-2">
                        {users.length > 10 && (

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
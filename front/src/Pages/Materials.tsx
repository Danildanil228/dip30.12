import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type ColumnFiltersState, type SortingState, type VisibilityState, } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import Categories from "./Categories";
import CreateMaterialDialog from "@/components/CreateMaterialDialog";

interface Material {
    id: number;
    name: string;
    code: string;
    description: string | null;
    unit: string;
    quantity: number;
    category_id: number | null;
    category_name: string | null;
    created_by: number | null;
    updated_by: number | null;
    created_by_username: string | null;
    updated_by_username: string | null;
    created_at: string;
    updated_at: string;
}

export default function Materials() {
    const { isAdmin } = useUser();
    const [materials, setMaterials] = useState<Material[]>([])
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

    const handleToggleShowAll = () => {
        if (showAll) {
            setPagination({ pageIndex: 0, pageSize: 10 });
        } else {
            setPagination({ pageIndex: 0, pageSize: materials.length });
        }
        setShowAll(!showAll);
    };

    const handleDeleteMaterial = async (id: number) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_BASE_URL}/materials/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMaterials(materials.filter((material) => material.id !== id));
        } catch (error: any) {
            console.error("Ошибка удаления материала:", error);
            alert(error.response?.data?.error || "Не удалось удалить материал");
        }
    };

    const columns: ColumnDef<Material>[] = [
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
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Название
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => <div>{row.getValue("name")}</div>
        },
        {
            accessorKey: "code",
            header: "Код",
            cell: ({ row }) => <div>{row.getValue("code")}</div>
        },
        {
            accessorKey: "quantity",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Количество
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => <div>{row.getValue("quantity")}</div>
        },
        {
            accessorKey: "category_name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Категория
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => <div>{row.getValue("category_name") || "Без категории"}</div>
        },
        {
            accessorKey: "unit",
            header: "Ед. измерения",
            cell: ({ row }) => <div>{row.getValue("unit")}</div>
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
        ...(() => {
            const hasModifiedMaterials = materials.some(material => {
                const createdDate = new Date(material.created_at);
                const updatedDate = new Date(material.updated_at);
                return createdDate.getTime() !== updatedDate.getTime();
            });

            if (!hasModifiedMaterials) return [];

            return [
                {
                    accessorKey: "updated_at",
                    header: "Дата изменения",
                    cell: ({ row }) => {
                        const updatedDate = new Date(row.original.updated_at);
                        return <div>{updatedDate.toLocaleString("ru-RU")}</div>;
                    }
                },
                {
                    accessorKey: "updated_by_username",
                    header: "Кем изменено",
                    cell: ({ row }) => {
                        const username = row.original.updated_by_username;
                        const userId = row.original.updated_by;

                        if (!username || !userId) {
                            return <div>-</div>;
                        }

                        return (
                            <Link
                                to={`/profile/${userId}`}
                                className="text-blue-500 hover:underline"
                            >
                                {username}
                            </Link>
                        );
                    }
                }
            ];
        })(),

        {
            accessorKey: "actions",
            header: 'Функции',
            cell: ({ row }) => {
                const material = row.original;
                return (
                    <div className="flex items-center gap-5">
                        {/* Ссылка на редактирование */}
                        {isAdmin && (
                            <>
                                <Link to={`/materials/edit/${material.id}`}>
                                    <img src="/edit.png" className="icon w-5" alt="Редактировать" title="Редактировать" />
                                </Link>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <img
                                            src="/trash.png"
                                            className=" lg:w-5 w-5 icon cursor-pointer"
                                            alt="Удалить"
                                            title="Удалить материал"
                                        />
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Удалить материал {material.name}?
                                            </AlertDialogTitle>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteMaterial(material.id)}>
                                                Удалить
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        )}
                    </div>
                );
            }
        }
    ];

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/materials`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMaterials(response.data.materials);
        } catch (error: any) {
            console.error("Ошибка загрузки материалов:", error);
            if (error.response?.status === 403) {
                alert("Недостаточно прав для просмотра материалов");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    const handleDeleteSelected = async () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows;
        const selectedIds = selectedRows.map((row) => row.original.id);

        if (selectedIds.length === 0) {
            alert("Выберите материалы для удаления");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            for (const id of selectedIds) {
                await axios.delete(`${API_BASE_URL}/materials/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            setMaterials(materials.filter((material) => !selectedIds.includes(material.id)));
            setRowSelection({});
        } catch (error: any) {
            console.error("Ошибка удаления материалов:", error);
            alert(error.response?.data?.error || "Не удалось удалить материалы");
        }
    };

    const table = useReactTable({
        data: materials,
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
        )
    }

    return (
        <section className="mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Материалы</h1>
                {isAdmin && (
                    <CreateMaterialDialog onMaterialCreated={() => { fetchMaterials() }} />
                )} 
            </div>

            <div className="w-full">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 py-4">
                    <Input
                        placeholder="Поиск по названию..."
                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                        onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
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
                                        <Button variant="destructive">Удалить материалы</Button>
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
                            )}
                        </div>
                    )}

                    <div className="ml-auto flex gap-2">
                        <Button variant="outline" onClick={fetchMaterials}>
                            Обновить
                        </Button>
                        <Button variant="outline">
                            <Link to='/categories'>Перейти к категориям</Link>
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
                                        Нет материалов.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 py-4">
                    <div className="text-sm text-gray-600">
                        Материалов: {table.getFilteredRowModel().rows.length}
                    </div>
                    <div className="flex items-center space-x-2">
                        {materials.length > 10 && (
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
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useUser } from "@/hooks/useUser";
import EditCategoryDialog from "@/components/Dialog/EditCategoryDialog";
import CreateCategoryDialog from "@/components/Dialog/CreateCategoryDialog";
import { ScrollToTop } from "@/components/ScrollToTop";
import { DataTable } from "@/components/ui/DataTable";
import type { Category } from "@/types/material.types";
import type { ColumnDef } from "@tanstack/react-table";

export default function Categories() {
    const { isAdmin } = useUser();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data.categories);
        } catch (error: unknown) {
            console.error("Ошибка загрузки категорий:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDeleteCategory = async (id: number) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete(`${API_BASE_URL}/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.materialCount > 0) {
                alert(`В категории находится ${response.data.materialCount} материалов. Сначала удалите или переместите их.`);
                return;
            }
            setCategories(categories.filter((category) => category.id !== id));
        } catch (error: unknown) {
            console.error("Ошибка удаления категории:", error);
            alert("Не удалось удалить категорию");
        }
    };

    const handleDeleteSelected = async (selectedIds: number[]) => {
        try {
            const token = localStorage.getItem("token");
            for (const id of selectedIds) {
                const response = await axios.delete(`${API_BASE_URL}/categories/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.materialCount > 0) {
                    alert(`В категории ${id} находится ${response.data.materialCount} материалов. Удаление отменено.`);
                    return;
                }
            }
            setCategories(categories.filter((category) => !selectedIds.includes(category.id)));
        } catch (error: unknown) {
            console.error("Ошибка удаления категорий:", error);
            alert("Не удалось удалить категории");
        }
    };

    const columns = useMemo<ColumnDef<Category>[]>(
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
                accessorKey: "name",
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Название
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            {
                accessorKey: "description",
                header: "Описание",
                cell: ({ row }) => <div className="max-w-50 truncate">{row.original.description || "-"}</div>
            },
            {
                accessorKey: "created_by_username",
                header: "Создал",
                cell: ({ row }) => {
                    const username = row.original.created_by_username;
                    const createdById = row.original.created_by;
                    if (!username || !createdById) return <div>-</div>;
                    return isAdmin ? (
                        <Link to={`/profile/${createdById}`} className="underline">
                            {username}
                        </Link>
                    ) : (
                        <p>{username}</p>
                    );
                }
            },
            {
                accessorKey: "created_at",
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Дата создания
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => <div>{new Date(row.original.created_at).toLocaleString("ru-RU")}</div>
            },
            ...(categories.some((c) => new Date(c.created_at).getTime() !== new Date(c.updated_at).getTime())
                ? [
                      {
                          accessorKey: "updated_at",
                          header: "Дата изменения",
                          cell: ({ row }: { row: { original: Category } }) => <div>{new Date(row.original.updated_at).toLocaleString("ru-RU")}</div>
                      },
                      {
                          accessorKey: "updated_by_username",
                          header: "Кем изменено",
                          cell: ({ row }: { row: { original: Category } }) => {
                              const username = row.original.updated_by_username;
                              const userId = row.original.updated_by;
                              if (!username || !userId) return <div>-</div>;
                              return isAdmin ? (
                                  <Link to={`/profile/${userId}`} className="underline">
                                      {username}
                                  </Link>
                              ) : (
                                  <p>{username}</p>
                              );
                          }
                      }
                  ]
                : []),
            {
                accessorKey: "actions",
                header: "Функции",
                cell: ({ row }) => {
                    const category = row.original;
                    if (!isAdmin) return null;
                    return (
                        <div className="flex items-center gap-5">
                            <EditCategoryDialog categoryId={category.id} onCategoryUpdated={fetchCategories} triggerButton={<img src="/edit.png" className="icon w-5 cursor-pointer" alt="Редактировать" />} />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <img src="/trash.png" className="w-5 icon cursor-pointer" alt="Удалить" title="Удалить категорию" />
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Удалить категорию "{category.name}"?</AlertDialogTitle>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>Удалить</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    );
                }
            }
        ],
        [isAdmin, categories]
    );

    return (
        <section className="mx-auto">
            <ScrollToTop />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Категории материалов</h1>
                {isAdmin && <CreateCategoryDialog onCategoryCreated={fetchCategories} />}
            </div>

            <DataTable
                columns={columns}
                data={categories}
                loading={loading}
                searchPlaceholder="Поиск по названию..."
                onDeleteSelected={isAdmin ? handleDeleteSelected : undefined}
                showCheckboxes={isAdmin}
                exportFilename="categories"
                exportTitle="Категории материалов"
                exportColumns={[
                    { accessorKey: "id", header: "ID" },
                    { accessorKey: "name", header: "Название" },
                    { accessorKey: "description", header: "Описание" },
                    { accessorKey: "created_by_username", header: "Создал" },
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

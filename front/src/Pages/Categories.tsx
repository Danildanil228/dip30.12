import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useUser } from "@/hooks/useUser";
import { useMaterials } from "@/hooks/useMaterials";
import EditCategoryDialog from "@/components/Dialog/EditCategoryDialog";
import CreateCategoryDialog from "@/components/Dialog/CreateCategoryDialog";
import { ScrollToTop } from "@/components/ScrollToTop";
import { DataTable } from "@/components/ui/DataTable";
import type { Category } from "@/types/material.types";
import type { ColumnDef } from "@tanstack/react-table";

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

export default function Categories() {
    const { isAdmin } = useUser();
    const { categories, loading, deleteCategory, fetchCategories } = useMaterials();

    const handleDeleteCategory = async (id: number) => {
        try {
            await deleteCategory(id);
        } catch (error: any) {
            if (error.response?.data?.materialCount) {
                alert(`В категории находится ${error.response.data.materialCount} материалов. Сначала удалите или переместите их.`);
            } else {
                alert("Не удалось удалить категорию");
            }
        }
    };

    const handleDeleteSelected = async (selectedIds: number[]) => {
        try {
            for (const id of selectedIds) {
                await deleteCategory(id);
            }
        } catch (error: any) {
            if (error.response?.data?.materialCount) {
                alert(`В одной из категорий находится ${error.response.data.materialCount} материалов. Удаление отменено.`);
            } else {
                alert("Не удалось удалить категории");
            }
        }
    };

    const columns = (): ColumnDef<Category>[] => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Название
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: "description",
            header: "Описание",
            cell: ({ row }) => <div className="max-w-50 truncate">{row.original.description || "-"}</div>,
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
            cell: ({ row }) => <div>{formatDate(row.original.created_at)}</div>,
        },
        {
            accessorKey: "actions",
            header: "Функции",
            cell: ({ row }) => {
                const category = row.original;
                if (!isAdmin) return null;
                return (
                    <div className="flex items-center gap-5">
                        <EditCategoryDialog
                            categoryId={category.id}
                            onCategoryUpdated={fetchCategories}
                            triggerButton={<img src="/edit.png" className="icon w-5 cursor-pointer" alt="Редактировать" />}
                        />
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
            },
        },
    ];

    return (
        <section className="mx-auto">
            <ScrollToTop />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Категории материалов</h1>
                {isAdmin && <CreateCategoryDialog onCategoryCreated={fetchCategories} />}
            </div>

            <DataTable
                columns={columns()}
                data={categories}
                loading={loading}
                searchPlaceholder="Поиск по названию..."
                onDeleteSelected={isAdmin ? handleDeleteSelected : undefined}
                showCheckboxes={isAdmin}
                exportFilename="categories"
                exportTitle="Категории материалов"
                skipExportColumns={["actions"]}
            />
        </section>
    );
}

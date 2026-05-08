import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useUser } from "@/hooks/useUser";
import { useMaterials } from "@/hooks/useMaterials";
import EditCategoryDialog from "@/components/Dialog/EditCategoryDialog";
import CreateCategoryDialog from "@/components/Dialog/CreateCategoryDialog";
import { ScrollToTop } from "@/components/ScrollToTop";
import { DataTable } from "@/components/ui/DataTable";
import type { Category } from "@/types/material.types";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

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

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [_categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    const checkAndDelete = async (category: Category) => {
        setIsChecking(true);
        try {
            await deleteCategory(category.id);
            fetchCategories();
        } catch (error: any) {
            const materialCount = error.response?.data?.materialCount;
            if (materialCount) {
                setDeleteError(`В категории "${category.name}" находится ${materialCount} материалов. Сначала удалите или переместите их.`);
                setDeleteDialogOpen(true);
            } else {
                setDeleteError(error.response?.data?.error || "Не удалось удалить категорию");
                setDeleteDialogOpen(true);
            }
        } finally {
            setIsChecking(false);
        }
    };

    const handleDeleteClick = (category: Category) => {
        setCategoryToDelete(category);
        setDeleteError(null);
        setDeleteDialogOpen(false);
        checkAndDelete(category);
    };

    const handleDeleteSelected = async (selectedIds: number[]) => {
        setIsChecking(true);
        let hasError = false;
        let errorMessage = "";
        // let errorCategory = "";

        for (const id of selectedIds) {
            try {
                await deleteCategory(id);
            } catch (error: any) {
                hasError = true;
                const materialCount = error.response?.data?.materialCount;
                const category = categories.find((c) => c.id === id);
                if (materialCount) {
                    errorMessage = `В категории "${category?.name}" находится ${materialCount} материалов. Сначала удалите или переместите их.`;
                    // errorCategory = category?.name || `ID ${id}`;
                } else {
                    errorMessage = error.response?.data?.error || "Не удалось удалить категорию";
                }
                break;
            }
        }

        if (hasError) {
            setDeleteError(errorMessage);
            setDeleteDialogOpen(true);
        } else {
            fetchCategories();
        }
        setIsChecking(false);
    };

    const closeDialog = () => {
        setDeleteDialogOpen(false);
        setDeleteError(null);
    };

    const columns = (): ColumnDef<Category>[] => [
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
            header: "Название"
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
            header: "Дата создания",
            cell: ({ row }) => <div>{formatDate(row.original.created_at)}</div>
        },
        {
            accessorKey: "actions",
            header: "Функции",
            cell: ({ row }) => {
                const category = row.original;
                if (!isAdmin) return null;
                return (
                    <div className="flex items-center gap-5">
                        <EditCategoryDialog categoryId={category.id} onCategoryUpdated={fetchCategories} triggerButton={<img src="/edit.png" className="icon w-5 cursor-pointer" alt="Редактировать" />} />
                        <img src="/trash.png" className="w-5 icon cursor-pointer" alt="Удалить" title="Удалить категорию" onClick={() => handleDeleteClick(category)} />
                    </div>
                );
            }
        }
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
                loading={loading || isChecking}
                searchPlaceholder="Поиск по названию..."
                onDeleteSelected={isAdmin ? handleDeleteSelected : undefined}
                showCheckboxes={isAdmin}
                exportFilename="categories"
                exportTitle="Категории материалов"
                skipExportColumns={["actions"]}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={closeDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Невозможно удалить</AlertDialogTitle>
                        <AlertDialogDescription>
                            <span className="">{deleteError}</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeDialog}>Закрыть</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}

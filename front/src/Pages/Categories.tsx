import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useUser } from "@/hooks/useUser";
import { useMaterials } from "@/hooks/useMaterials";
import EditCategoryDialog from "@/components/Dialog/EditCategoryDialog";
import CreateCategoryDialog from "@/components/Dialog/CreateCategoryDialog";
import { ScrollToTop } from "@/components/ScrollToTop";
import { DataTable } from "@/components/ui/DataTable";
import { ExportDropdown } from "@/components/ExportDropdown";
import type { Category } from "@/types/material.types";
import type { ColumnDef } from "@tanstack/react-table";
import type { ExportColumn } from "@/services/exportService";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Plus } from "lucide-react";

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

        for (const id of selectedIds) {
            try {
                await deleteCategory(id);
            } catch (error: any) {
                hasError = true;
                const materialCount = error.response?.data?.materialCount;
                const category = categories.find((c) => c.id === id);
                if (materialCount) {
                    errorMessage = `В категории "${category?.name}" находится ${materialCount} материалов. Сначала удалите или переместите их.`;
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

    const exportColumns: ExportColumn<Category>[] = [
        { key: "id", header: "ID" },
        { key: "name", header: "Название" },
        { key: "description", header: "Описание", format: (v) => v || "—" },
        { key: "created_by_username", header: "Создал", format: (v) => v || "—" },
        { key: "created_at", header: "Дата создания", format: (v) => formatDate(v) },
    ];

    const columns: ColumnDef<Category>[] = [
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
            cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
        },
        {
            accessorKey: "description",
            header: "Описание",
            cell: ({ row }) => <span className="text-muted-foreground text-sm max-w-75 truncate block">{row.original.description || "—"}</span>,
        },
        {
            accessorKey: "created_by_username",
            header: "Создал",
            cell: ({ row }) => {
                const username = row.original.created_by_username;
                const createdById = row.original.created_by;
                if (!username || !createdById) return <span className="text-muted-foreground">—</span>;
                return isAdmin ? (
                    <Link to={`/profile/${createdById}`} className="text-primary hover:underline">
                        {username}
                    </Link>
                ) : (
                    <span>{username}</span>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: "Создана",
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.created_at)}</span>,
        },
        {
            id: "actions",
            header: "Действия",
            cell: ({ row }) => {
                const category = row.original;
                if (!isAdmin) return null;
                return (
                    <div className="flex items-center gap-2">
                        <EditCategoryDialog
                            categoryId={category.id}
                            onCategoryUpdated={fetchCategories}
                            triggerButton={
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <img src="/edit.png" className="icon w-4" alt="Ред." />
                                </Button>
                            }
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteClick(category)}>
                            <img src="/trash.png" className="icon w-4" alt="Удалить" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    const customToolbar = (
        <div className="flex items-center gap-2">
            <ExportDropdown data={categories} columns={exportColumns} filename="categories" title="Категории" />
        </div>
    );

    return (
        <div className="space-y-6">
            <ScrollToTop />

            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Категории</h1>
                    <p className="text-muted-foreground mt-1">Группировка материалов по категориям</p>
                </div>
                {isAdmin && (
                    <CreateCategoryDialog
                        onCategoryCreated={fetchCategories}
                        triggerButton={
                            <Button>
                                <Plus className="h-4 w-4 mr-1" /> Добавить
                            </Button>
                        }
                    />
                )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <DataTable
                    columns={columns}
                    data={categories}
                    loading={loading || isChecking}
                    searchPlaceholder="Поиск по названию категории..."
                    onDeleteSelected={isAdmin ? handleDeleteSelected : undefined}
                    customToolbar={customToolbar}
                    showCheckboxes={isAdmin}
                />
            </motion.div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={closeDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Невозможно удалить</AlertDialogTitle>
                        <AlertDialogDescription>
                            <span>{deleteError}</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeDialog}>Закрыть</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
    const {isAdmin } = useUser();
    const { categories, loading, deleteCategory, fetchCategories } = useMaterials();

    const [singleDeleteTarget, setSingleDeleteTarget] = useState<Category | null>(null);
    const [multiDeleteIds, setMultiDeleteIds] = useState<number[]>([]);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    const checkCategories = async (ids: number[]): Promise<{ blocked: Category[]; allowed: Category[] }> => {
        const blocked: Category[] = [];
        const allowed: Category[] = [];

        for (const id of ids) {
            const category = categories.find((c) => c.id === id);
            if (!category) continue;

            try {
                const response = await fetch(`/api/categories/${id}/check`, { method: "HEAD" });
                if (!response.ok) {
                    blocked.push(category);
                } else {
                    allowed.push(category);
                }
            } catch {
                allowed.push(category);
            }
        }

        return { blocked, allowed };
    };

    const executeSingleDelete = async () => {
        if (!singleDeleteTarget) return;
        setIsChecking(true);
        setDeleteError(null);

        try {
            await deleteCategory(singleDeleteTarget.id);
            fetchCategories();
            setSingleDeleteTarget(null);
        } catch (error: any) {
            const materialCount = error.response?.data?.materialCount;
            if (materialCount) {
                setDeleteError(`В категории "${singleDeleteTarget.name}" находится ${materialCount} материалов. Сначала удалите или переместите их.`);
            } else {
                setDeleteError(error.response?.data?.error || "Не удалось удалить категорию");
            }
            setSingleDeleteTarget(null);
        } finally {
            setIsChecking(false);
        }
    };

    const executeMultiDelete = async () => {
        setIsChecking(true);
        setDeleteError(null);

        const { blocked } = await checkCategories(multiDeleteIds);

        if (blocked.length > 0) {
            const blockedNames = blocked.map((c) => `"${c.name}"`).join(", ");
            setDeleteError(`Невозможно удалить категории, в которых есть материалы: ${blockedNames}. Сначала удалите или переместите материалы из этих категорий.`);
            setMultiDeleteIds([]);
            setIsChecking(false);
            return;
        }

        for (const id of multiDeleteIds) {
            try {
                await deleteCategory(id);
            } catch (error: any) {
                const materialCount = error.response?.data?.materialCount;
                const category = categories.find((c) => c.id === id);
                if (materialCount) {
                    setDeleteError(`В категории "${category?.name}" находится ${materialCount} материалов. Сначала удалите или переместите их.`);
                } else {
                    setDeleteError(error.response?.data?.error || "Не удалось удалить категорию");
                }
                setMultiDeleteIds([]);
                setIsChecking(false);
                return;
            }
        }

        setMultiDeleteIds([]);
        fetchCategories();
        setIsChecking(false);
    };

    const handleSingleDeleteClick = (category: Category) => {
        setDeleteError(null);
        setSingleDeleteTarget(category);
    };

    const handleDeleteSelected = (selectedIds: number[]) => {
        setDeleteError(null);
        setMultiDeleteIds(selectedIds);
    };

    const closeErrorDialog = () => {
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
        // {
        //     accessorKey: "id",
        //     header: "ID",
        // },
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
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSingleDeleteClick(category)}>
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
                            <Button data-tour="categories-add-btn">
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

            <AlertDialog
                open={singleDeleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open) setSingleDeleteTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить категорию?</AlertDialogTitle>
                        <AlertDialogDescription>Вы уверены, что хотите удалить категорию "{singleDeleteTarget?.name}"? Категории будут перемещены в корзину для дальнейшего удаления.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isChecking}>Отмена</AlertDialogCancel>
                        <AlertDialogAction disabled={isChecking} onClick={executeSingleDelete}>
                            {isChecking ? "Удаление..." : "Удалить"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={multiDeleteIds.length > 0}
                onOpenChange={(open) => {
                    if (!open) setMultiDeleteIds([]);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить выбранные категории?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить {multiDeleteIds.length} выбранных категорий? Выбранные категории будут перемещены в козину. Категории, содержащие материалы, перемещены не будут.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isChecking}>Отмена</AlertDialogCancel>
                        <AlertDialogAction disabled={isChecking} onClick={executeMultiDelete}>
                            {isChecking ? "Удаление..." : "Удалить"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={deleteError !== null} onOpenChange={closeErrorDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Невозможно удалить</AlertDialogTitle>
                        <AlertDialogDescription>
                            <span>{deleteError}</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeErrorDialog}>Закрыть</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
        </div>
    );
}

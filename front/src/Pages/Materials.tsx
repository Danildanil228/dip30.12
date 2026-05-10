import { motion } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useUser } from "@/hooks/useUser";
import { useMaterials } from "@/hooks/useMaterials";
import EditMaterialDialog from "@/components/Dialog/EditMaterialDialog";
import CreateMaterialDialog from "@/components/Dialog/CreateMaterialDialog";
import { ScrollToTop } from "@/components/ScrollToTop";
import { DataTable } from "@/components/ui/DataTable";
import { ExportDropdown } from "@/components/ExportDropdown";
import type { Material } from "@/types/material.types";
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

export default function Materials() {
    const { isAdmin } = useUser();
    const { materials, loading, deleteMaterial, fetchMaterials } = useMaterials();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
    const [multipleDeleteIds, setMultipleDeleteIds] = useState<number[]>([]);
    const [isMultipleDelete, setIsMultipleDelete] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

    const totalMaterials = materials.length;
    const totalQuantity = materials.reduce((sum, m) => sum + m.quantity, 0);
    const lowStockCount = materials.filter((m) => m.quantity > 0 && m.quantity < 10).length;

    const handleDeleteClick = (material: Material) => {
        if (material.quantity > 0) {
            setDeleteErrorMessage(`Материал "${material.name}" имеет остаток ${material.quantity} ${material.unit}. Сначала оформите расход.`);
            setDeleteDialogOpen(true);
            return;
        }
        setMaterialToDelete(material);
        setIsMultipleDelete(false);
        setDeleteError(null);
        setDeleteErrorMessage(null);
        setDeleteDialogOpen(true);
    };

    const handleDeleteSelected = (selectedIds: number[]) => {
        const selectedMaterials = materials.filter((m) => selectedIds.includes(m.id));
        const materialsWithStock = selectedMaterials.filter((m) => m.quantity > 0);
        if (materialsWithStock.length > 0) {
            const stockList = materialsWithStock.map((m) => `${m.name} (${m.quantity} ${m.unit})`).join(", ");
            setDeleteErrorMessage(`Некоторые материалы имеют остаток: ${stockList}. Сначала оформите расход.`);
            setDeleteDialogOpen(true);
            return;
        }
        setMultipleDeleteIds(selectedIds);
        setIsMultipleDelete(true);
        setDeleteError(null);
        setDeleteErrorMessage(null);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        setDeleteError(null);
        try {
            if (isMultipleDelete) {
                for (const id of multipleDeleteIds) {
                    await deleteMaterial(id);
                }
                fetchMaterials();
                setDeleteDialogOpen(false);
                setMultipleDeleteIds([]);
                setIsMultipleDelete(false);
            } else if (materialToDelete) {
                await deleteMaterial(materialToDelete.id);
                fetchMaterials();
                setDeleteDialogOpen(false);
                setMaterialToDelete(null);
            }
        } catch (error: any) {
            setDeleteError(error.response?.data?.error || "Не удалось удалить материал");
        }
    };

    const exportColumns: ExportColumn<Material>[] = [
        { key: "id", header: "ID" },
        { key: "name", header: "Название" },
        { key: "code", header: "Код" },
        { key: "quantity", header: "Количество", format: (v) => v?.toLocaleString() || "0" },
        { key: "unit", header: "Ед. измерения" },
        { key: "category_name", header: "Категория", format: (v) => v || "Без категории" },
        { key: "created_by_username", header: "Создал", format: (v) => v || "-" },
        { key: "created_at", header: "Дата создания", format: (v) => formatDate(v) },
    ];

    const columns: ColumnDef<Material>[] = [
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
            accessorKey: "code",
            header: "Код",
        },
        {
            accessorKey: "quantity",
            header: "Остаток",
            cell: ({ row }) => {
                const qty = row.original.quantity;
                let colorClass = "";
                if (qty === 0) colorClass = "text-destructive";
                else if (qty < 10) colorClass = "text-yellow-600 dark:text-yellow-400";
                return <span className={`font-medium ${colorClass}`}>{qty.toLocaleString()}</span>;
            },
        },
        {
            accessorKey: "unit",
            header: "Ед.",
        },
        {
            accessorKey: "category_name",
            header: "Категория",
            cell: ({ row }) => <span>{row.original.category_name || <span className="text-muted-foreground">—</span>}</span>,
        },
        {
            accessorKey: "created_at",
            header: "Создан",
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.created_at)}</span>,
        },
        {
            id: "actions",
            header: "Действия",
            cell: ({ row }) => {
                const material = row.original;
                if (!isAdmin) return null;
                return (
                    <div className="flex items-center gap-2">
                        <EditMaterialDialog
                            materialId={material.id}
                            onMaterialUpdated={fetchMaterials}
                            triggerButton={
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <img src="/edit.png" className="icon w-4" alt="Ред." />
                                </Button>
                            }
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteClick(material)}>
                            <img src="/trash.png" className="icon w-4" alt="Удалить" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    const customToolbar = (
        <div className="flex items-center gap-2">
            <ExportDropdown data={materials} columns={exportColumns} filename="materials" title="Материалы" />
        </div>
    );

    return (
        <div className="space-y-6">
            <ScrollToTop />

            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Материалы</h1>
                    <p className="text-muted-foreground mt-1">Управление складскими запасами</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {isAdmin && (
                        <CreateMaterialDialog
                            onMaterialCreated={fetchMaterials}
                            triggerButton={
                                <Button>
                                    <Plus className="h-4 w-4 mr-1" /> Добавить
                                </Button>
                            }
                        />
                    )}
                </div>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="text-sm text-muted-foreground">Всего позиций</div>
                    <div className="text-2xl font-bold mt-1">{totalMaterials}</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="text-sm text-muted-foreground">Общий остаток</div>
                    <div className="text-2xl font-bold mt-1">{totalQuantity.toLocaleString()}</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="text-sm text-muted-foreground">Мало (менее 10 ед.)</div>
                    <div className="text-2xl font-bold mt-1 text-yellow-600 dark:text-yellow-400">{lowStockCount}</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="text-sm text-muted-foreground">Нулевой остаток</div>
                    <div className="text-2xl font-bold mt-1 text-destructive">{materials.filter((m) => m.quantity === 0).length}</div>
                </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <DataTable
                    columns={columns}
                    data={materials}
                    loading={loading}
                    searchPlaceholder="Поиск по названию или коду..."
                    onDeleteSelected={isAdmin ? handleDeleteSelected : undefined}
                    customToolbar={customToolbar}
                    showCheckboxes={isAdmin}
                />
            </motion.div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{deleteErrorMessage ? "Невозможно удалить" : deleteError ? "Ошибка" : "Удалить материал?"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteErrorMessage ? (
                                <span>{deleteErrorMessage}</span>
                            ) : deleteError ? (
                                <span>{deleteError}</span>
                            ) : isMultipleDelete ? (
                                `Вы уверены, что хотите удалить ${multipleDeleteIds.length} материалов?`
                            ) : (
                                materialToDelete && `Материал «${materialToDelete.name}» будет удалён безвозвратно.`
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        {!deleteErrorMessage && !deleteError && <AlertDialogAction onClick={confirmDelete}>Удалить</AlertDialogAction>}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

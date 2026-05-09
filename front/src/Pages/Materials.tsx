import { Link } from "react-router-dom";
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
import { ArrowUpDown } from "lucide-react";

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

    const handleDeleteClick = (material: Material) => {
        if (material.quantity > 0) {
            setDeleteErrorMessage(`Материал "${material.name}" имеет остаток ${material.quantity} ${material.unit}. Оформите заявку на расход, а после совершите удаление.`);
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
            setDeleteErrorMessage(`Некоторые материалы имеют остаток на складе: ${stockList}. Оформите заявку на расход, а после совершите удаление.`);
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
            header: "Количество",
            cell: ({ row }) => <div className="text-center">{row.original.quantity}</div>,
        },
        {
            accessorKey: "unit",
            header: "Ед. измерения",
        },
        {
            accessorKey: "category_name",
            header: "Категория",
            cell: ({ row }) => <div>{row.original.category_name || "Без категории"}</div>,
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
            header: "Дата создания",
            cell: ({ row }) => <div>{formatDate(row.original.created_at)}</div>,
        },
        {
            id: "actions",
            header: "Функции",
            cell: ({ row }) => {
                const material = row.original;
                if (!isAdmin) return null;
                return (
                    <div className="flex items-center gap-5">
                        <EditMaterialDialog materialId={material.id} onMaterialUpdated={fetchMaterials} triggerButton={<img src="/edit.png" className="icon w-5 cursor-pointer" alt="Редактировать" />} />
                        <img src="/trash.png" className="w-5 icon cursor-pointer" alt="Удалить" title="Удалить материал" onClick={() => handleDeleteClick(material)} />
                    </div>
                );
            },
        },
    ];

    const customToolbar = <ExportDropdown data={materials} columns={exportColumns} filename="materials" title="Материалы" />;

    return (
        <section className="mx-auto">
            <ScrollToTop />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Материалы</h1>
                {isAdmin && <CreateMaterialDialog onMaterialCreated={fetchMaterials} />}
            </div>

            <DataTable
                columns={columns}
                data={materials}
                loading={loading}
                searchPlaceholder="Поиск по названию, коду..."
                onDeleteSelected={isAdmin ? handleDeleteSelected : undefined}
                customToolbar={customToolbar}
                showCheckboxes={isAdmin}
            />

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
                                `Вы уверены, что хотите удалить ${multipleDeleteIds.length} выбранных материалов? Это действие нельзя отменить.`
                            ) : (
                                materialToDelete && `Вы уверены, что хотите удалить материал "${materialToDelete.name}"? Это действие нельзя отменить.`
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        {!deleteErrorMessage && !deleteError && <AlertDialogAction onClick={confirmDelete}>Удалить</AlertDialogAction>}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}

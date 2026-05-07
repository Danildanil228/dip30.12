import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useUser } from "@/hooks/useUser";
import { useMaterials } from "@/hooks/useMaterials";
import EditMaterialDialog from "@/components/Dialog/EditMaterialDialog";
import CreateMaterialDialog from "@/components/Dialog/CreateMaterialDialog";
import { ScrollToTop } from "@/components/ScrollToTop";
import { DataTable } from "@/components/ui/DataTable";
import type { Material } from "@/types/material.types";
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

export default function Materials() {
    const { isAdmin } = useUser();
    const { materials, loading, deleteMaterial, fetchMaterials } = useMaterials();

    const handleDeleteMaterial = async (id: number) => {
        try {
            await deleteMaterial(id);
        } catch (error) {
            alert("Не удалось удалить материал");
        }
    };

    const handleDeleteSelected = async (selectedIds: number[]) => {
        try {
            for (const id of selectedIds) {
                await deleteMaterial(id);
            }
        } catch (error) {
            alert("Не удалось удалить материалы");
        }
    };

    const columns = (): ColumnDef<Material>[] => [
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
            header: "Название",
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
            accessorKey: "actions",
            header: "Функции",
            cell: ({ row }) => {
                const material = row.original;
                if (!isAdmin) return null;
                return (
                    <div className="flex items-center gap-5">
                        <EditMaterialDialog
                            materialId={material.id}
                            onMaterialUpdated={fetchMaterials}
                            triggerButton={<img src="/edit.png" className="icon w-5 cursor-pointer" alt="Редактировать" />}
                        />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <img src="/trash.png" className="w-5 icon cursor-pointer" alt="Удалить" title="Удалить материал" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Удалить материал {material.name}?</AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteMaterial(material.id)}>Удалить</AlertDialogAction>
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
                <h1 className="text-2xl font-bold">Материалы</h1>
                {isAdmin && <CreateMaterialDialog onMaterialCreated={fetchMaterials} />}
            </div>

            <DataTable
                columns={columns()}
                data={materials}
                loading={loading}
                searchPlaceholder="Поиск по названию, коду..."
                onDeleteSelected={isAdmin ? handleDeleteSelected : undefined}
                showCheckboxes={isAdmin}
                exportFilename="materials"
                exportTitle="Материалы"
                skipExportColumns={["actions"]}
            />
        </section>
    );
}

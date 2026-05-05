import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useUser } from "@/hooks/useUser";
import EditMaterialDialog from "@/components/Dialog/EditMaterialDialog";
import CreateMaterialDialog from "@/components/Dialog/CreateMaterialDialog";
import { ScrollToTop } from "@/components/ScrollToTop";
import { DataTable } from "@/components/ui/DataTable";
import type { Material } from "@/types/material.types";
import type { ColumnDef } from "@tanstack/react-table";

export default function Materials() {
    const { isAdmin } = useUser();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/materials`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaterials(response.data.materials);
        } catch (error: unknown) {
            console.error("Ошибка загрузки материалов:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    const handleDeleteMaterial = async (id: number) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_BASE_URL}/materials/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaterials(materials.filter((material) => material.id !== id));
        } catch (error: unknown) {
            console.error("Ошибка удаления материала:", error);
            alert("Не удалось удалить материал");
        }
    };

    const handleDeleteSelected = async (selectedIds: number[]) => {
        try {
            const token = localStorage.getItem("token");
            for (const id of selectedIds) {
                await axios.delete(`${API_BASE_URL}/materials/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setMaterials(materials.filter((material) => !selectedIds.includes(material.id)));
        } catch (error: unknown) {
            console.error("Ошибка удаления материалов:", error);
            alert("Не удалось удалить материалы");
        }
    };

    const columns = useMemo<ColumnDef<Material>[]>(
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
                accessorKey: "code",
                header: "Код"
            },
            {
                accessorKey: "quantity",
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Количество
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => <div className="text-center">{row.original.quantity}</div>
            },
            {
                accessorKey: "category_name",
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Категория
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => <div>{row.original.category_name || "Без категории"}</div>
            },
            {
                accessorKey: "unit",
                header: "Ед. измерения"
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
            ...(materials.some((m) => new Date(m.created_at).getTime() !== new Date(m.updated_at).getTime())
                ? [
                      {
                          accessorKey: "updated_at",
                          header: "Дата изменения",
                          cell: ({ row }: { row: { original: Material } }) => <div>{new Date(row.original.updated_at).toLocaleString("ru-RU")}</div>
                      },
                      {
                          accessorKey: "updated_by_username",
                          header: "Кем изменено",
                          cell: ({ row }: { row: { original: Material } }) => {
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
                    const material = row.original;
                    if (!isAdmin) return null;
                    return (
                        <div className="flex items-center gap-5">
                            <EditMaterialDialog materialId={material.id} onMaterialUpdated={fetchMaterials} triggerButton={<img src="/edit.png" className="icon w-5 cursor-pointer" alt="Редактировать" />} />
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
                }
            }
        ],
        [isAdmin, materials]
    );

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
                showCheckboxes={isAdmin}
                exportFilename="materials"
                exportTitle="Материалы"
                exportColumns={[
                    { accessorKey: "id", header: "ID" },
                    { accessorKey: "name", header: "Название" },
                    { accessorKey: "code", header: "Код" },
                    { accessorKey: "quantity", header: "Количество" },
                    { accessorKey: "unit", header: "Ед. измерения" },
                    { accessorKey: "category_name", header: "Категория" },
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

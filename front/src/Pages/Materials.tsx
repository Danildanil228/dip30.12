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

interface MaterialCategory {
    id: number;
    name: string;
    description: string | null;
    created_by: number | null;
    updated_by: number | null;
    created_by_username: string | null;
    updated_by_username: string | null;
    created_at: string;
    updated_at: string;
}
interface Materials {
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
    const [materials, setMaterials] = useState<Materials[]>([])
    const [showAll, setShowAll] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    });

    const handleToggleShowAll = () => {
        if (showAll) {
            setPagination({ pageIndex: 0, pageSize: 10 });
        } else {
            setPagination({ pageIndex: 0, pageSize: materials.length });
        }
        setShowAll(!showAll);
    };

    const columns: ColumnDef<Materials>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    className="scale-100" onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />
            ),
            cell: ({ row }) => (
                <Checkbox checked={row.getIsSelected()}
                    className="scale-100"
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row" />
            ),
            enableSorting: false, enableHiding: false
        },
        {
            accessorKey: "id", header: "ID", cell: ({ row }) => <div>{row.getValue("id")}</div>
        },
        {
            accessorKey: "name", header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Название
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            }, cell: ({ row }) => <div>{row.getValue("name")}</div>
        },
        {
            accessorKey: "code" , header: "Код", cell: ({row}) => <div>{row.getValue("code")}</div>
        },
        {
            accessorKey: "quantity", header: "Количество", cell: ({row}) => <div>{row.getValue("quantity")}</div>
        },
        

    ]
    return (
        <section>
            <p>Материалы</p>
        </section>
    )
}
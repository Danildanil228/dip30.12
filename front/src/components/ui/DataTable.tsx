import { useState } from "react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type ColumnFiltersState, type SortingState, type VisibilityState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ExportButton from "@/components/ExportButton";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface DataTableProps<TData> {
    columns: ColumnDef<TData>[];
    data: TData[];
    loading?: boolean;
    searchPlaceholder?: string;
    onRowClick?: (row: TData) => void;
    onDeleteSelected?: (selectedIds: number[]) => void;
    getId?: (row: TData) => number;
    showCheckboxes?: boolean;
    showExport?: boolean;
    exportFilename?: string;
    exportTitle?: string;
    exportColumns?: Array<{ accessorKey: string; header: string; format?: (value: unknown) => string }>;
    showPagination?: boolean;
}

export function DataTable<TData extends { id: number }>({
    columns,
    data,
    loading = false,
    searchPlaceholder = "Поиск...",
    onRowClick,
    onDeleteSelected,
    getId = (row) => row.id,
    showCheckboxes = true,
    showExport = true,
    exportFilename = "export",
    exportTitle = "Данные",
    exportColumns,
    showPagination = true
}: DataTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [showAll, setShowAll] = useState(false);

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
            globalFilter
        }
    });

    const handleToggleShowAll = () => {
        if (showAll) {
            setPagination({ pageIndex: 0, pageSize: 10 });
        } else {
            setPagination({ pageIndex: 0, pageSize: data.length });
        }
        setShowAll(!showAll);
    };

    const handleDeleteSelected = () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows;
        const selectedIds = selectedRows.map((row) => getId(row.original));
        if (selectedIds.length > 0 && onDeleteSelected) {
            onDeleteSelected(selectedIds);
            setRowSelection({});
        }
    };

    const selectedCount = table.getFilteredSelectedRowModel().rows.length;

    const getExportData = () => {
        if (exportColumns) {
            return data.map((item) => {
                const row: Record<string, unknown> = {};
                exportColumns.forEach((col) => {
                    let value = (item as Record<string, unknown>)[col.accessorKey];
                    if (col.format) {
                        value = col.format(value);
                    }
                    row[col.header] = value;
                });
                return row;
            });
        }
        return data;
    };

    const getExportColumns = () => {
        if (exportColumns) {
            return exportColumns;
        }
        return columns
            .filter((col) => {
                if (col.id === "select" || col.id === "actions") return false;
                return "accessorKey" in col && typeof col.accessorKey === "string";
            })
            .map((col) => {
                const colDef = col as { accessorKey: string; header: unknown };
                return {
                    accessorKey: colDef.accessorKey,
                    header: typeof colDef.header === "string" ? colDef.header : ""
                };
            });
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="w-full">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 py-4">
                <Input placeholder={searchPlaceholder} value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} className="max-w-sm" />

                {showCheckboxes && selectedCount > 0 && onDeleteSelected && (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">Выбрано: {selectedCount}</span>
                        <Button variant="destructive" onClick={handleDeleteSelected}>
                            Удалить выбранные
                        </Button>
                    </div>
                )}

                <div className="ml-auto flex gap-2">
                    {showExport && <ExportButton data={getExportData()} columns={getExportColumns()} filename={exportFilename} title={exportTitle} />}
                    <Button variant="outline" onClick={() => table.setGlobalFilter("")}>
                        Обновить
                    </Button>
                </div>
            </div>

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""} onClick={() => onRowClick?.(row.original)}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Нет данных.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {showPagination && (
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 py-4">
                    <div className="text-sm text-muted-foreground">Всего: {table.getFilteredRowModel().rows.length}</div>
                    <div className="flex items-center space-x-2">
                        {data.length > 10 && (
                            <Button variant="outline" onClick={handleToggleShowAll} className="ml-2">
                                {showAll ? "Свернуть" : "Развернуть"}
                            </Button>
                        )}

                        {!showAll && table.getPageCount() > 1 && (
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                                    {"<"}
                                </Button>
                                <span className="text-sm">
                                    Стр. {table.getState().pagination.pageIndex + 1} из {table.getPageCount()}
                                </span>
                                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                                    {">"}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
